import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('alex.carter@enterprise.com');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          throw new Error('Please enter your full name.');
        }
        await signUp(email.trim(), password, displayName.trim());
      } else {
        await signIn(email.trim(), password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Monogram */}
        <div className="mx-auto w-12 h-12 rounded-[10px] bg-[#12231D] border border-[#1F5C48] flex items-center justify-center text-white font-bold text-xl mb-4 shadow-subtle">
          F
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171A17]">
          FollowUpAI
        </h1>
        <p className="mt-2 text-sm text-[#687068]">
          Sales follow-ups, intelligently managed.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-[16px] border border-[#E4E2DC] shadow-card">
          {/* Header Switcher */}
          <div className="flex border-b border-[#E4E2DC] mb-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setErrorMessage(null);
              }}
              className={`pb-3 flex-1 text-center text-sm font-semibold border-b-2 transition-colors ${
                !isSignUp
                  ? 'border-[#1F5C48] text-[#1F5C48]'
                  : 'border-transparent text-[#687068] hover:text-[#171A17]'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setErrorMessage(null);
              }}
              className={`pb-3 flex-1 text-center text-sm font-semibold border-b-2 transition-colors ${
                isSignUp
                  ? 'border-[#1F5C48] text-[#1F5C48]'
                  : 'border-transparent text-[#687068] hover:text-[#171A17]'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-[8px] bg-[#FDF2F2] border border-[#F2C5C5] text-[#B94A48] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                id="displayName"
                label="Full Name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Alex Carter"
                required
              />
            )}

            <Input
              id="email"
              label="Work Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min. 6 characters)"
              required
            />

            {!isSignUp && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-[#687068] cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-[#E4E2DC] text-[#1F5C48] focus:ring-[#1F5C48]"
                  />
                  Remember this device
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setErrorMessage('Password reset instructions will be sent to your work email.');
                  }}
                  className="text-[#1F5C48] hover:underline font-medium"
                >
                  Forgot password?
                </a>
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full h-10"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isSignUp ? 'Create enterprise account' : 'Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E4E2DC] text-center">
            <p className="text-xs text-[#687068]">
              {isSignUp ? 'Already have an enterprise account? ' : "Don't have an enterprise account? "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMessage(null);
                }}
                className="font-medium text-[#1F5C48] hover:underline"
              >
                {isSignUp ? 'Sign in' : 'Create account'}
              </button>
            </p>
          </div>
        </div>

        {/* Executive Trust Badge */}
        <div className="mt-6 text-center flex items-center justify-center gap-2 text-xs text-[#8D968D]">
          <Shield className="w-3.5 h-3.5 text-[#1F5C48]" />
          <span>SOC 2 Type II Compliant & Enterprise Data Isolated</span>
        </div>
      </div>
    </div>
  );
};
