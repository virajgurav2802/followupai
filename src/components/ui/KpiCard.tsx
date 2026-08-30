import React from 'react';
import { motion } from 'framer-motion';

interface KpiCardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  icon?: React.ReactNode;
  isUrgent?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  sublabel,
  icon,
  isUrgent = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`relative p-5 rounded-[12px] bg-white border border-[#E4E2DC] shadow-subtle hover:border-[#D5D2C8] transition-colors ${
        isUrgent ? 'border-l-4 border-l-[#B94A48]' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-[#687068] tracking-tight">{label}</p>
        {icon && (
          <div className="text-[#687068] p-1.5 rounded-[6px] bg-[#F7F6F2]">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-semibold text-[#171A17] tracking-tight">
          {value}
        </span>
      </div>
      {sublabel && (
        <p className="mt-1 text-xs text-[#687068]">{sublabel}</p>
      )}
    </motion.div>
  );
};
