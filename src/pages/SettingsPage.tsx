import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { Check, User, Building, Sliders, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'preferences'>('profile');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile Form State
  const [fullName, setFullName] = useState(userProfile?.displayName || user?.displayName || 'Alex Carter');
  const [email, setEmail] = useState(userProfile?.email || user?.email || 'alex.carter@enterprise.com');
  const [role, setRole] = useState(userProfile?.role || 'Senior Enterprise Account Executive');

  // Account Form State
  const [workspaceName, setWorkspaceName] = useState('FollowUpAI Workspace');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST)');

  // Preferences Form State
  const [autoPriority, setAutoPriority] = useState(true);
  const [highPriorityAlerts, setHighPriorityAlerts] = useState(true);
  const [approvalRequirement, setApprovalRequirement] = useState(true);

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.displayName || '');
      setEmail(userProfile.email || '');
      setRole(userProfile.role || 'Senior Enterprise Account Executive');
    } else if (user) {
      setFullName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [userProfile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (activeTab === 'profile') {
        if (!fullName.trim()) throw new Error('Please enter a valid display name.');
        await updateProfile(fullName.trim(), role.trim());
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      console.error('Settings update error:', err);
      setErrorMessage(err.message || 'Unable to update your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const initials = fullName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SE';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#171A17] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[#687068] mt-1">
          Manage your personal executive profile, workspace preferences, and Firestore persistence policies.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-[#E4E2DC] gap-6 text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-[#1F5C48] text-[#1F5C48]'
              : 'border-transparent text-[#687068] hover:text-[#171A17]'
          }`}
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'account'
              ? 'border-[#1F5C48] text-[#1F5C48]'
              : 'border-transparent text-[#687068] hover:text-[#171A17]'
          }`}
        >
          <Building className="w-4 h-4" />
          Account
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'preferences'
              ? 'border-[#1F5C48] text-[#1F5C48]'
              : 'border-transparent text-[#687068] hover:text-[#171A17]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Preferences
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-[16px] border border-[#E4E2DC] shadow-subtle p-6 sm:p-8">
        {errorMessage && (
          <div className="mb-5 p-3 rounded-[8px] bg-[#FDF2F2] border border-[#F2C5C5] text-[#B94A48] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Section */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-[#E4E2DC]">
                <div className="w-16 h-16 rounded-full bg-[#12231D] text-white flex items-center justify-center text-xl font-bold border border-[#1F5C48]">
                  {initials}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#171A17]">{fullName}</h3>
                  <p className="text-xs text-[#687068]">{email}</p>
                  <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-[#FAF9F6] border border-[#E4E2DC] text-[#687068]">
                    {role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="fullName"
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  value={email}
                  disabled
                  helperText="Primary email is managed by Firebase Authentication"
                />
              </div>

              <Input
                id="role"
                label="Role / Title"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          )}

          {/* Account Section */}
          {activeTab === 'account' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="workspace"
                  label="Workspace"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
                <Input
                  id="timezone"
                  label="Working Timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>

              <div className="p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC]">
                <h4 className="text-xs font-semibold text-[#171A17] uppercase tracking-wider mb-1">
                  Database & Backend
                </h4>
                <p className="text-xs text-[#687068] leading-relaxed">
                  Firebase Cloud Firestore and Authentication are connected.
                </p>
                <div className="mt-3 pt-3 border-t border-[#E4E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-[#687068] uppercase tracking-wider block">
                      Firebase Account Status
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#2F7D5B] mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#2F7D5B]" />
                      Connected
                    </span>
                  </div>
                  {user?.uid && (
                    <div className="text-[11px] text-[#8D968D]">
                      Account UID: <code className="font-mono text-[#687068]">{user.uid.slice(0, 6)}••••{user.uid.slice(-4)}</code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Preferences Section */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC]">
                <div>
                  <h4 className="text-xs font-semibold text-[#171A17]">
                    Autonomous Priority Detection
                  </h4>
                  <p className="text-xs text-[#687068] mt-0.5">
                    Automatically classify buyer urgency into HIGH, MEDIUM, or LOW based on timeline constraints.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoPriority}
                  onChange={(e) => setAutoPriority(e.target.checked)}
                  className="rounded border-[#E4E2DC] text-[#1F5C48] focus:ring-[#1F5C48] w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC]">
                <div>
                  <h4 className="text-xs font-semibold text-[#171A17]">
                    Strict Human Approval Mandate
                  </h4>
                  <p className="text-xs text-[#687068] mt-0.5">
                    Require human salesperson approval before saving or staging any generated follow-up message.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={approvalRequirement}
                  onChange={(e) => setApprovalRequirement(e.target.checked)}
                  className="rounded border-[#E4E2DC] text-[#1F5C48] focus:ring-[#1F5C48] w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC]">
                <div>
                  <h4 className="text-xs font-semibold text-[#171A17]">
                    High Priority Daily Attention Alerts
                  </h4>
                  <p className="text-xs text-[#687068] mt-0.5">
                    Surface leads with pending deadlines in the Attention Queue every morning.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={highPriorityAlerts}
                  onChange={(e) => setHighPriorityAlerts(e.target.checked)}
                  className="rounded border-[#E4E2DC] text-[#1F5C48] focus:ring-[#1F5C48] w-4 h-4"
                />
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-5 border-t border-[#E4E2DC] flex items-center justify-between">
            {isSaved ? (
              <span className="inline-flex items-center gap-1 text-xs text-[#2F7D5B] font-medium">
                <Check className="w-4 h-4 text-[#2F7D5B]" />
                Settings saved successfully
              </span>
            ) : (
              <span />
            )}

            <Button type="submit" variant="primary" isLoading={isLoading}>
              {activeTab === 'profile'
                ? 'Save Profile'
                : activeTab === 'account'
                ? 'Save Account'
                : 'Save Preferences'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
