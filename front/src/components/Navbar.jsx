import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Gem, LogOut, Lock, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl text-emerald-700">
        <Gem className="w-7 h-7" /> ATK Gem Identification System
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/" className="text-slate-600 hover:text-emerald-600 font-medium text-sm flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition">
          Identify
        </Link>

        {admin ? (
          <>
            <Link 
              to="/admin/dashboard" 
              className="text-slate-600 hover:text-emerald-600 font-medium text-sm flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" /> 
              <span>Go to Dashboard</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition cursor-pointer border border-red-200"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium transition cursor-pointer border border-emerald-100"
          >
            <Lock className="w-4 h-4" /> Admin Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;