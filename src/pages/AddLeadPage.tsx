import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { agentService } from '../services/agentService';
import { ArrowLeft, Sparkles, FileText, AlertCircle, RotateCw } from 'lucide-react';

export const AddLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [conversation, setConversation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('Analyzing conversation with sales intelligence...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sampleConversations = [
    {
      label: 'Sample: Enterprise Pricing Thread',
      name: 'Rahul Mehta',
      company: 'Acme Corporation',
      email: 'rahul.mehta@acme.corp',
      text: `Thanks for the pricing proposal. The enterprise plan looks promising, but I need to understand the implementation timeline and whether SSO and security documentation are included. If the technical review goes well, we should be able to move forward with procurement.`,
    },
    {
      label: 'Sample: High-Volume Logistics',
      name: 'Vikram Singhania',
      company: 'Apex Logistics Group',
      email: 'vikram.s@apexlogistics.com',
      text: `Vikram Singhania [Aug 29, 10:15 AM]:
Hi Alex, we enjoyed the solution walk-through earlier today. Our leadership is ready to allocate budget for 85 operational dispatchers if we can agree on tiered pricing.

Could you send over the custom quote with volume discounting? Also, if we sign off before Friday, could we guarantee kickoff within 2 weeks? We have another vendor proposal on our desk today so prompt timing is critical.`,
    },
    {
      label: 'Sample: Security & Contract Review',
      name: 'Samantha Reed',
      company: 'NexaHealth Systems',
      email: 's.reed@nexahealth.org',
      text: `Samantha Reed [Aug 29, 11:30 AM]:
Thanks for the follow-up note. Our security architect raised questions about BAA execution under HIPAA regulations. Can you provide your SOC2 report and confirm whether dedicated audit logging is included? We have an executive committee meeting on Tuesday to approve preferred vendors.`,
    },
  ];

  const handleApplySample = (sample: typeof sampleConversations[0]) => {
    setName(sample.name);
    setCompany(sample.company);
    setEmail(sample.email);
    setConversation(sample.text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !conversation.trim()) {
      setErrorMessage('Please fill in prospect name, company, and sales conversation context.');
      return;
    }
    if (conversation.trim().length < 10) {
      setErrorMessage('Conversation must be at least 10 characters long to analyze.');
      return;
    }
    if (!user) {
      setErrorMessage('You must be signed in to add leads.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setProgressStatus('Analyzing conversation with sales intelligence...');

    try {
      const createdLead = await agentService.processNewLead({
        name: name.trim(),
        company: company.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        conversation: conversation.trim(),
        onProgress: (status) => setProgressStatus(status),
      });

      navigate(`/leads/${createdLead.id}`);
    } catch (error: any) {
      console.error('Lead processing error:', error);
      setErrorMessage(error.message || 'Unable to complete AI analysis. Your lead has been preserved.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate('/leads')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#687068] hover:text-[#171A17] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Leads
      </button>

      {/* Page Title & Description */}
      <div>
        <h1 className="text-2xl font-bold text-[#171A17] tracking-tight">
          Add New Lead
        </h1>
        <p className="text-sm text-[#687068] mt-1">
          Capture a prospect and let FollowUpAI identify the next best action.
        </p>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="p-4 rounded-[8px] bg-[#FDF2F2] border border-[#F2C5C5] text-[#B94A48] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-medium leading-relaxed block">{errorMessage}</span>
            <span className="text-[#687068] block">
              You can check your saved leads in the pipeline and retry analysis at any time.
            </span>
          </div>
        </div>
      )}

      {/* Sample presets for fast testing */}
      <div className="p-4 rounded-[12px] bg-[#FAF9F6] border border-[#E4E2DC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[#687068]">
          <FileText className="w-4 h-4 text-[#1F5C48]" />
          <span>Quick test scenarios:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sampleConversations.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplySample(sample)}
              className="text-xs px-2.5 py-1 rounded-[6px] bg-white border border-[#E4E2DC] text-[#171A17] hover:bg-[#F2F1ED] hover:border-[#D5D2C8] transition-colors font-medium"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <div className="bg-white rounded-[16px] border border-[#E4E2DC] shadow-subtle p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input
              id="prospectName"
              label="Prospect Name"
              placeholder="e.g. Rahul Mehta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isAnalyzing}
              required
            />

            <Input
              id="company"
              label="Company"
              placeholder="e.g. Acme Corporation"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={isAnalyzing}
              required
            />
          </div>

          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="e.g. rahul.mehta@acme.corp"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isAnalyzing}
          />

          <div className="space-y-1.5 text-left">
            <label
              htmlFor="conversation"
              className="block text-[13px] font-medium text-[#171A17]"
            >
              Conversation / Sales Context
            </label>
            <p className="text-xs text-[#687068]">
              Paste a sales conversation, meeting notes, customer call notes, or email thread.
            </p>
            <textarea
              id="conversation"
              rows={8}
              value={conversation}
              onChange={(e) => setConversation(e.target.value)}
              placeholder="Paste a sales conversation, meeting notes, or email thread..."
              required
              disabled={isAnalyzing}
              className="w-full rounded-[8px] p-3.5 bg-[#FAF9F6] border border-[#E4E2DC] text-sm text-[#171A17] placeholder:text-[#8D968D] transition-colors focus:outline-none focus:bg-white focus:border-[#1F5C48] focus:ring-2 focus:ring-[#1F5C48]/10 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          {/* Real-time processing progress banner */}
          {isAnalyzing && (
            <div className="p-3.5 rounded-[8px] bg-[#FAF9F6] border border-[#E4E2DC] flex items-center gap-3">
              <RotateCw className="w-4 h-4 text-[#1F5C48] animate-spin shrink-0" />
              <span className="text-xs font-medium text-[#171A17]">{progressStatus}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-4 border-t border-[#E4E2DC] flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/leads')}
              disabled={isAnalyzing}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              isLoading={isAnalyzing}
              disabled={isAnalyzing}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
