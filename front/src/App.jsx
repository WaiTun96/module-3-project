import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Register from './pages/Register';

// Pages & Components
import Identify from './pages/Identify';
import GemDetail from './pages/GemDetail';
import Login from './pages/Login';
import Dashboard from './pages/Admin/Dashboard';

// Identify Page မှ Detail Page သို့ သွားနိုင်ရန် Helper Component
const IdentifyWrapper = () => {
  const navigate = useNavigate();

  const handleSelectGem = (gemId) => {
    navigate(`/gem/${gemId}`);
  };

  return <Identify onSelectGem={handleSelectGem} />;
};

// GemDetail Page အတွက် URL Params မှ gemId ရယူမည့် Helper Component
const GemDetailWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return <GemDetail gemId={id} onBack={handleBack} />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
          {/* Top Navigation Bar */}
          <Navbar />

          {/* Main Body Content */}
          <main className="flex-grow py-6">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<IdentifyWrapper />} />
              <Route path="/gem/:id" element={<GemDetailWrapper />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Admin Routes (Login ဝင်ထားသူများသာ ဝင်ရောက်နိုင်မည်) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
              </Route>

              {/* Page Not Found Fallback */}
              <Route
                path="*"
                element={
                  <div className="text-center py-20">
                    <h1 className="text-4xl font-bold text-slate-700">404</h1>
                    <p className="text-slate-500 mt-2">စာမျက်နှာ မတွေ့ရှိပါ။</p>
                  </div>
                }
              />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Gem Identification System. All rights reserved. Coded by Min Wai Tun.
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;