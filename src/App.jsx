import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import AssignWork from './pages/AssignWork';
import MasterData from './pages/MasterData';
import CardDetails from './pages/CardDetails';
import Bags from './pages/Bags';
import WorkAudit from './pages/WorkAudit';
import Reports from './pages/Reports';

import OperatorDashboard from './pages/OperatorDashboard';
import OperatorWorkLog from './pages/OperatorWorkLog';
import OperatorEditWork from './pages/OperatorEditWork';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Admin Routes */}
          <Route element={<Layout allowedRoles={['admin']} />}>
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/products" element={<Products />} />
            <Route path="/assign-work" element={<AssignWork />} />
            <Route path="/master-data" element={<MasterData />} />
            <Route path="/card-details" element={<CardDetails />} />
            <Route path="/bags" element={<Bags />} />
            <Route path="/work-audit" element={<WorkAudit />} />
            <Route path="/reports" element={<Reports />} />
          </Route>

          {/* Operator Routes */}
          <Route element={<Layout allowedRoles={['operator']} />}>
            <Route path="/operator/dashboard" element={<OperatorDashboard />} />
            <Route path="/operator/work-log" element={<OperatorWorkLog />} />
            <Route path="/operator/edit-work" element={<OperatorEditWork />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
