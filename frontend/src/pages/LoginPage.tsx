import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('[LOGIN_PAGE]: Attempting login for email:', email);
    try {
      const success = await login(email, password);
      if (success) {
        console.log('[LOGIN_PAGE]: Login successful! Navigating to dashboard.');
        navigate('/dashboard');
      } else {
        setError('Invalid email or password.');
        console.error('[LOGIN_PAGE]: Login function returned false (should throw on error).');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      if (err && typeof err === 'object') {
        const errorObj = err as { response?: { data?: any }, message?: string };
        console.error(
          '[LOGIN_PAGE]: Login API call failed:',
          errorObj.response?.data || errorObj.message || err
        );
      } else {
        console.error('[LOGIN_PAGE]: Login API call failed:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-white" />
          {/* CORRECTED: Changed heading to be more neutral */}
          <h2 className="mt-6 text-3xl font-bold font-playfair text-white">
            Sign In to Your Account
          </h2>
          {/* CORRECTED: Changed subheading */}
          <p className="mt-2 text-sm text-gray-400">
            Enter your credentials to access your dashboard.
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-900/20 border border-red-800">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@university.edu"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your secure password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={!email || !password}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-white hover:text-gray-300 transition-colors"
              >
                Create your portfolio
              </Link>
            </p>
          </div>

          {/* CORRECTED: The Demo Credentials box has been completely removed. */}
        </Card>
      </div>
    </div>
  );
};