const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Create a new PDF document
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 50, bottom: 50, left: 50, right: 50 },
  bufferPages: true // Enable page numbering at the end
});

const outputPath = path.join(__dirname, '../Nobel_Alloy_User_Guide.pdf');
doc.pipe(fs.createWriteStream(outputPath));

// Define Color Palette
const COLORS = {
  primary: '#1e293b',    // Slate 800
  secondary: '#3b82f6',  // Blue 500
  accent: '#10b981',     // Emerald 500
  text: '#334155',       // Slate 700
  darkText: '#0f172a',   // Slate 900
  lightBg: '#f8fafc',    // Slate 50
  danger: '#ef4444',     // Red 500
  border: '#cbd5e1'      // Slate 300
};

// ==========================================
// 1. COVER PAGE
// ==========================================

// Decorative Sidebar Banner
doc.rect(0, 0, 15, doc.page.height).fill(COLORS.secondary);

// Header / Brand
doc.fillColor(COLORS.secondary)
   .font('Helvetica-Bold')
   .fontSize(16)
   .text('NOBEL ALLOY', 60, 60);

doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(10)
   .text('Workflow Management System', 60, 78);

// Divider line
doc.moveTo(60, 95)
   .lineTo(doc.page.width - 50, 95)
   .strokeColor(COLORS.border)
   .lineWidth(1)
   .stroke();

// Title Block
doc.fillColor(COLORS.primary)
   .font('Helvetica-Bold')
   .fontSize(32)
   .text('System User Guide &\nAdministrator Reference', 60, 220, { lineGap: 10 });

doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(14)
   .text('Deploying, operating, and securing the manufacturing workflow pipeline.', 60, 310);

// Info Card at the bottom
const cardY = 500;
doc.rect(60, cardY, doc.page.width - 110, 160)
   .fillAndStroke(COLORS.lightBg, COLORS.border);

doc.fillColor(COLORS.darkText)
   .font('Helvetica-Bold')
   .fontSize(12)
   .text('SYSTEM INFORMATION', 80, cardY + 20);

// Key/Value details in Info Card
const details = [
  { label: 'Document Type', val: 'Administrator & User Reference Manual' },
  { label: 'System Version', val: 'v1.0.0 (Production Hardened)' },
  { label: 'Security Standard', val: 'OWASP Top 10 Compliant' },
  { label: 'Release Date', val: 'May 2026' }
];

let textY = cardY + 45;
details.forEach(item => {
  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(item.label + ':', 80, textY);
  
  doc.fillColor(COLORS.darkText)
     .font('Helvetica')
     .fontSize(10)
     .text(item.val, 220, textY);
  textY += 22;
});

// ==========================================
// 2. PAGE 2: CREDENTIALS & ACCESS CONTROLS
// ==========================================
doc.addPage();

// Decorative top bar
doc.rect(0, 0, doc.page.width, 15).fill(COLORS.primary);

doc.fillColor(COLORS.primary)
   .font('Helvetica-Bold')
   .fontSize(20)
   .text('1. Initial Credentials & Authentication', 50, 45);

doc.moveTo(50, 75)
   .lineTo(doc.page.width - 50, 75)
   .strokeColor(COLORS.border)
   .lineWidth(1)
   .stroke();

doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(11)
   .text('The Nobel Alloy system uses role-based access control (RBAC) to enforce security partitions between factory operators and system administrators. Below are the default credentials configured for deployment verification.', 50, 95, { lineGap: 4 });

// Credentials Callout Box
const credY = 160;
doc.rect(50, credY, doc.page.width - 100, 130)
   .fillAndStroke('#eff6ff', '#bfdbfe'); // Soft blue callout

doc.fillColor('#1e40af')
   .font('Helvetica-Bold')
   .fontSize(13)
   .text('🔑 SUPER ADMINISTRATOR INITIAL CREDENTIALS', 70, credY + 15);

doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(10)
   .text('This account has full database authority, system-wide settings capabilities, operator creation rights, and audit trace viewership.', 70, credY + 35, { width: doc.page.width - 140, lineGap: 2 });

// Email Row
doc.fillColor(COLORS.text)
   .font('Helvetica-Bold')
   .fontSize(11)
   .text('Email Address:', 70, credY + 75);

doc.fillColor(COLORS.darkText)
   .font('Courier-Bold')
   .fontSize(11)
   .text('admin@nobel.com', 180, credY + 75);

// Password Row
doc.fillColor(COLORS.text)
   .font('Helvetica-Bold')
   .fontSize(11)
   .text('Initial Password:', 70, credY + 98);

doc.fillColor(COLORS.darkText)
   .font('Courier-Bold')
   .fontSize(11)
   .text('admin123', 180, credY + 98);

// Warning Box
const warnY = 310;
doc.rect(50, warnY, doc.page.width - 100, 85)
   .fillAndStroke('#fffbeb', '#fef3c7'); // Soft yellow warning

doc.fillColor('#92400e')
   .font('Helvetica-Bold')
   .fontSize(10)
   .text('⚠️ SECURITY WARNING FOR PRODUCTION DEPLOYMENT', 70, warnY + 12);

doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(9.5)
   .text('For maximum production security, change the administrator password immediately after initial login. The system supports custom seed environment parameters (ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD) inside the backend .env file to generate unique initial admin credentials during database seeding.', 70, warnY + 30, { width: doc.page.width - 140, lineGap: 3 });

// Role Breakdown Table Header
doc.fillColor(COLORS.primary)
   .font('Helvetica-Bold')
   .fontSize(14)
   .text('Role-Based Access Control Structure', 50, 425);

// Draw table
const tableY = 455;
doc.rect(50, tableY, doc.page.width - 100, 30).fill(COLORS.primary);

doc.fillColor('#ffffff')
   .font('Helvetica-Bold')
   .fontSize(10)
   .text('Role', 65, tableY + 10)
   .text('System Authorization Level', 160, tableY + 10)
   .text('Core Responsibility', 380, tableY + 10);

// Table Rows
const rows = [
  {
    role: 'Admin',
    auth: 'Full access to CRUD on users, products, assignments, cards, bags, and system audit logs.',
    resp: 'Factory floor oversight, analytics review, and setup.'
  },
  {
    role: 'Operator',
    auth: 'Read-only assignments list. Write-only work log submission for target targets.',
    resp: 'Fulfilling physical work and logging counters.'
  }
];

let rowY = tableY + 30;
rows.forEach((r, idx) => {
  // Background coloring for alternate rows
  if (idx % 2 === 1) {
    doc.rect(50, rowY, doc.page.width - 100, 55).fill(COLORS.lightBg);
  }
  doc.rect(50, rowY, doc.page.width - 100, 55).stroke(COLORS.border);
  
  doc.fillColor(COLORS.darkText)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(r.role, 65, rowY + 12);
  
  doc.fillColor(COLORS.text)
     .font('Helvetica')
     .fontSize(9)
     .text(r.auth, 160, rowY + 12, { width: 200, lineGap: 2 });
  
  doc.fillColor(COLORS.text)
     .font('Helvetica')
     .fontSize(9)
     .text(r.resp, 380, rowY + 12, { width: 150, lineGap: 2 });

  rowY += 55;
});

// ==========================================
// 3. PAGE 3: MANUFACTURING WORKFLOWS
// ==========================================
doc.addPage();

// Decorative top bar
doc.rect(0, 0, doc.page.width, 15).fill(COLORS.secondary);

doc.fillColor(COLORS.primary)
   .font('Helvetica-Bold')
   .fontSize(20)
   .text('2. Core Operational Workflows', 50, 45);

doc.moveTo(50, 75)
   .lineTo(doc.page.width - 50, 75)
   .strokeColor(COLORS.border)
   .lineWidth(1)
   .stroke();

// Workflow steps
const workflows = [
  {
    title: '1. Product Definition & Process Maps',
    desc: 'Administrators define alloy products (e.g., specific alloy grades) and establish the sequential manufacturing process steps (e.g., Melting, Extrusion, QA, Packing) required to complete them.'
  },
  {
    title: '2. Operator Assignments',
    desc: 'Target tasks are assigned to specific operators on specific shifts. Operators login to view their personalized assignment boards, complete operations, and log yields, counters, and reject details.'
  },
  {
    title: '3. Route Card Generation',
    desc: 'Batches are grouped under Route Cards. Cards support selecting multiple calendar dates (interactive calendar pickers) to aggregate process operations from Master Data logs dynamically across multiple working days.'
  },
  {
    title: '4. Bag Bundling & Operator Traceability',
    desc: 'Multiple Route Cards are packed into shipping Bags. The system dynamically runs aggregation functions to fetch contributing operators, process operations, and quantity yields, producing live operator traceability reports.'
  }
];

let wfY = 95;
workflows.forEach(wf => {
  doc.rect(50, wfY, 8, 8).fill(COLORS.secondary);
  
  doc.fillColor(COLORS.darkText)
     .font('Helvetica-Bold')
     .fontSize(12)
     .text(wf.title, 70, wfY - 2);

  doc.fillColor(COLORS.text)
     .font('Helvetica')
     .fontSize(10)
     .text(wf.desc, 70, wfY + 18, { width: doc.page.width - 120, lineGap: 3 });

  wfyLine = wfY + 65;
  doc.moveTo(70, wfyLine)
     .lineTo(doc.page.width - 50, wfyLine)
     .strokeColor('#f1f5f9')
     .stroke();

  wfY += 80;
});

// Reports section
doc.fillColor(COLORS.primary)
   .font('Helvetica-Bold')
   .fontSize(14)
   .text('Analytical Reporting Engine', 50, 430);

doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(10)
   .text('The system features real-time analytical reporting. Administrators can run calculations and export XLS/PDF reports for:', 50, 455);

const reportsList = [
  '• Operator productivity and contribution reports',
  '• Alloy production metrics and rejection rate summaries',
  '• Process-specific cycle and throughput logs',
  '• System audit history reports listing user operations'
];

let repY = 485;
reportsList.forEach(rep => {
  doc.fillColor(COLORS.darkText)
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(rep, 70, repY);
  repY += 20;
});

// ==========================================
// 4. PAGE 4: SECURITY PROTOCOLS
// ==========================================
doc.addPage();

// Decorative top bar
doc.rect(0, 0, doc.page.width, 15).fill(COLORS.accent);

doc.fillColor(COLORS.primary)
   .font('Helvetica-Bold')
   .fontSize(20)
   .text('3. Production Security Protocols', 50, 45);

doc.moveTo(50, 75)
   .lineTo(doc.page.width - 50, 75)
   .strokeColor(COLORS.border)
   .lineWidth(1)
   .stroke();

doc.fillColor(COLORS.text)
   .font('Helvetica')
   .fontSize(11)
   .text('The Nobel Alloy system has been hardened against security vulnerabilities to prepare for live production deployment.', 50, 95);

// Security Features List
const securityFeatures = [
  {
    title: '🛡️ Helmet Header Protection',
    desc: 'Sets HTTP security headers including Content-Security-Policy (CSP), Frameguard to prevent clickjacking, and XSS filtering, while completely hiding backend signature headers like X-Powered-By.'
  },
  {
    title: '🔒 Secure Authentication (JWT & Bcrypt)',
    desc: 'All passwords are hashed with 12 rounds of bcrypt. Tokens expire in 8 hours to minimize leakage windows, and user deletion endpoints prevent self-deletion.'
  },
  {
    title: '⏳ Rate Limiting',
    desc: 'Login routes are locked to a maximum of 5 attempts per 15 minutes per IP to prevent brute-force attacks. Global endpoints are capped at 100 requests per 15 minutes.'
  },
  {
    title: '📦 Denial of Service (DoS) Prevention',
    desc: 'Strict 10KB body size limits are enforced on incoming JSON payloads to block memory exhaustion attempts.'
  }
];

let secY = 130;
securityFeatures.forEach(feat => {
  doc.rect(50, secY, 4, 30).fill(COLORS.accent);
  
  doc.fillColor(COLORS.darkText)
     .font('Helvetica-Bold')
     .fontSize(11)
     .text(feat.title, 65, secY);

  doc.fillColor(COLORS.text)
     .font('Helvetica')
     .fontSize(9.5)
     .text(feat.desc, 65, secY + 16, { width: doc.page.width - 120, lineGap: 2 });

  secY += 65;
});

// System Architecture Box
const archY = 400;
doc.rect(50, archY, doc.page.width - 100, 120)
   .fillAndStroke(COLORS.lightBg, COLORS.border);

doc.fillColor(COLORS.primary)
   .font('Helvetica-Bold')
   .fontSize(11)
   .text('⚙️ HARDENED SERVER INFRASTRUCTURE DETAILS', 70, archY + 15);

const archItems = [
  { label: 'CORS Configuration', val: 'Configured via CORS_ORIGIN environment variable' },
  { label: 'Proxy Trust Level', val: 'Express trust proxy configured (Client IP forwarding)' },
  { label: 'Security Test Suite', val: 'Automated test_security.js verification suite included' }
];

let archTextY = archY + 40;
archItems.forEach(item => {
  doc.fillColor(COLORS.text)
     .font('Helvetica-Bold')
     .fontSize(9)
     .text(item.label + ':', 70, archTextY);
  
  doc.fillColor(COLORS.darkText)
     .font('Helvetica')
     .fontSize(9)
     .text(item.val, 200, archTextY);
  archTextY += 22;
});

// ==========================================
// PAGE NUMBERING & FOOTER (Runs on all pages)
// ==========================================
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i);
  
  // Footer text
  doc.fillColor('#94a3b8')
     .font('Helvetica')
     .fontSize(8);
  
  // Left side footer: Document title
  doc.text('Nobel Alloy System Reference Manual | Confidential', 50, doc.page.height - 35);
  
  // Right side footer: Page numbers
  const pageStr = `Page ${i + 1} of ${pages.count}`;
  doc.text(pageStr, doc.page.width - doc.widthOfString(pageStr) - 50, doc.page.height - 35);
}

// End the PDF generation
doc.end();
console.log('PDF Generated Successfully at:', outputPath);
