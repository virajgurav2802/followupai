import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F7F6F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#12231D] border border-[#1F5C48] flex items-center justify-center text-white font-bold text-lg shadow-subtle">
            F
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#687068]">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1F5C48]" />
            <span>Authenticating session...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
