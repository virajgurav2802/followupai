import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Sparkles,
  Settings,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();

  const mainNav = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', to: '/leads', icon: Users },
    { name: 'Follow-ups', to: '/follow-ups', icon: CalendarCheck },
    { name: 'AI Actions', to: '/ai-actions', icon: Sparkles },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Sales Executive';
  const email = userProfile?.email || user?.email || 'sales.rep@enterprise.com';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SE';

  return (
    <aside className="w-64 h-full bg-[#12231D] text-white flex flex-col justify-between select-none border-r border-[#1B352C]">
      {/* Top Brand Section */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#1B352C]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#1F5C48] border border-[#2B7A60] flex items-center justify-center text-white font-semibold text-sm tracking-wide">
              F
            </div>
            <div>
              <span className="text-base font-semibold tracking-tight text-white block leading-tight">
                FollowUpAI
              </span>
              <span className="text-[10px] tracking-wider uppercase text-[#8FA89E] font-medium block">
                Sales Intelligence
              </span>
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-[6px] text-[#8FA89E] hover:text-white hover:bg-[#1B352C]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-3 pb-1 text-[11px] font-semibold text-[#8FA89E] uppercase tracking-wider">
            Workspace
          </div>
          {mainNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1F5C48] text-white shadow-subtle'
                      : 'text-[#D2DDD7] hover:text-white hover:bg-[#1B352C]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-[#8FA89E]" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <div className="pt-4 pb-1 px-3">
            <div className="border-t border-[#1B352C] my-2" />
            <div className="text-[11px] font-semibold text-[#8FA89E] uppercase tracking-wider mb-1">
              Configuration
            </div>
          </div>

          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1F5C48] text-white'
                  : 'text-[#D2DDD7] hover:text-white hover:bg-[#1B352C]'
              }`
            }
          >
            <Settings className="w-4 h-4 shrink-0 text-[#8FA89E]" />
            <span>Settings</span>
          </NavLink>
        </nav>
      </div>

      {/* Authenticated User Profile with Sign Out */}
      <div className="p-4 border-t border-[#1B352C] bg-[#0E1C17]/60">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1F5C48] border border-[#2B7A60] flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <p className="text-[11px] text-[#8FA89E] truncate">{email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-[6px] text-[#8FA89E] hover:text-white hover:bg-[#1B352C] transition-colors shrink-0"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
