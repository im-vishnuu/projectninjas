import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, BookOpen, Plus, LayoutDashboard, Compass } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };
  
  const username = user?.email.split('@')[0];

  const NavLink = ({ to, children, state }: { to: string, children: React.ReactNode, state?: object }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        state={state} // Pass state for navigation
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
        }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors group">
            <BookOpen className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold font-playfair">ProjectNinjas</span>
          </Link>

          {/* Central Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/projects"><Compass className="w-4 h-4 mr-1" /><span>Explore</span></NavLink>
                <NavLink to="/dashboard"><LayoutDashboard className="w-4 h-4 mr-1" /><span>Dashboard</span></NavLink>
                {/* --- THIS IS THE FIX --- */}
                <NavLink to="/dashboard" state={{ openCreateForm: true }}>
                    <Plus className="w-4 h-4 mr-1" /><span>Add Project</span>
                </NavLink>
                <NavLink to="/my-requests"><User className="w-4 h-4 mr-1" /><span>My Requests</span></NavLink>
              </>
            ) : (
              <NavLink to="/projects"><Compass className="w-4 h-4 mr-1" /><span>Explore Projects</span></NavLink>
              
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              
              <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                      <User className="w-5 h-5" />
                      <span className="text-sm hidden md:inline">{username}</span>
                  </button>
                  {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg py-1">
                          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 flex items-center space-x-2">
                              <LogOut className="w-4 h-4" />
                              <span>Logout</span>
                          </button>
                      </div>
                  )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login"><Button variant="outline" size="sm">Login</Button></Link>
                <Link to="/register"><Button variant="primary" size="sm">Register</Button></Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};