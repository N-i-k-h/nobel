require('dotenv').config();
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000/api';

// Automatically inject x-test-bypass header for local API calls to avoid rate limiting during tests
const originalFetch = global.fetch;
global.fetch = async (url, options = {}) => {
  options.headers = options.headers || {};
  if (url.startsWith(BASE_URL) && process.env.JWT_SECRET) {
    if (options.headers instanceof Headers) {
      options.headers.set('x-test-bypass', process.env.JWT_SECRET);
    } else {
      options.headers['x-test-bypass'] = process.env.JWT_SECRET;
    }
  }
  return originalFetch(url, options);
};

async function runSecurityTests() {
  console.log('=== SECURITY VERIFICATION TESTS ===\n');
  let passed = 0;
  let failed = 0;

  const test = (name, condition) => {
    if (condition) {
      console.log(`  ✅ ${name}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${name}`);
      failed++;
    }
  };

  // 1. Unauthenticated access to GET /api/auth/users should be BLOCKED
  console.log('1. Testing unauthenticated route protection...');
  const usersRes = await fetch(`${BASE_URL}/auth/users`);
  test('GET /api/auth/users without token → 401', usersRes.status === 401);

  // 2. Unauthenticated DELETE should be BLOCKED
  const delRes = await fetch(`${BASE_URL}/auth/users/fakeId123`, { method: 'DELETE' });
  test('DELETE /api/auth/users/:id without token → 401', delRes.status === 401);

  // 3. Unauthenticated PUT should be BLOCKED
  const putRes = await fetch(`${BASE_URL}/auth/users/fakeId123`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'admin' })
  });
  test('PUT /api/auth/users/:id without token → 401', putRes.status === 401);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nobel.com';
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';

  // 4. Login with wrong password should fail
  console.log('\n2. Testing login security...');
  const badLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: 'wrongpassword' })
  });
  test('Login with wrong password → 401', badLogin.status === 401);

  // 5. Login without email/password should fail
  const emptyLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  test('Login with empty body → 400', emptyLogin.status === 400);

  // 6. Valid login should work and return token
  const goodLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword })
  });
  const loginData = await goodLogin.json();
  test('Valid login → 200 with token', goodLogin.status === 200 && !!loginData.token);

  const adminHeader = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${loginData.token}`
  };

  // 7. Authenticated admin access should work
  console.log('\n3. Testing authenticated access...');
  const authUsersRes = await fetch(`${BASE_URL}/auth/users`, { headers: adminHeader });
  test('GET /api/auth/users with admin token → 200', authUsersRes.status === 200);

  // 8. Registration with weak password should be rejected
  console.log('\n4. Testing input validation...');
  const weakPwdRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: adminHeader,
    body: JSON.stringify({ name: 'Test', email: 'test@test.com', password: '123' })
  });
  const weakPwdData = await weakPwdRes.json();
  test('Register with 3-char password → 400', weakPwdRes.status === 400);
  test('Error message mentions 8 characters', weakPwdData.message.includes('8 characters'));

  // 9. Registration with bad email should be rejected
  const badEmailRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: adminHeader,
    body: JSON.stringify({ name: 'Test', email: 'notanemail', password: 'password123' })
  });
  test('Register with invalid email → 400', badEmailRes.status === 400);

  // 10. Check security headers (Helmet)
  console.log('\n5. Testing security headers...');
  const headersRes = await fetch('http://localhost:5000/');
  const headers = headersRes.headers;
  test('X-Content-Type-Options header present', headers.has('x-content-type-options'));
  test('X-Frame-Options / CSP header present', headers.has('x-frame-options') || headers.has('content-security-policy'));
  test('Strict-Transport-Security header present', headers.has('strict-transport-security'));
  test('X-Powered-By header removed', !headers.has('x-powered-by'));

  // 11. Verify token with fake JWT should fail
  console.log('\n6. Testing JWT security...');
  const fakeTokenRes = await fetch(`${BASE_URL}/auth/users`, {
    headers: { 'Authorization': 'Bearer faketoken12345' }
  });
  test('Fake JWT token → 401', fakeTokenRes.status === 401);

  // 12. Body size limit test
  console.log('\n7. Testing payload size limit...');
  const bigPayload = 'x'.repeat(50000);
  const bigRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: bigPayload, password: bigPayload })
  });
  test('Oversized payload → 413 (entity too large)', bigRes.status === 413);

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed === 0) {
    console.log('✅ ALL SECURITY TESTS PASSED!');
  } else {
    console.log('❌ SOME TESTS FAILED — review above');
  }
  process.exit(failed > 0 ? 1 : 0);
}

runSecurityTests();
