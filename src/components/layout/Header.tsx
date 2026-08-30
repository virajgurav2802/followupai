import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Plus,
  Search,
  Bell,
  CheckCheck,
  Clock,
  Flame,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  leadId?: string;
  type: 'due' | 'priority' | 'recommendation';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Follow-up due today — Rahul Mehta',
    description: 'Pricing follow-up scheduled for 10:30 AM with Acme Corporation.',
    time: '15m ago',
    isRead: false,
    leadId: 'lead-1',
    type: 'due',
  },
  {
    id: 'notif-2',
    title: 'High-priority lead identified — Acme Corporation',
    description: 'Procurement deadline next Thursday flagged with competitive evaluation.',
    time: '1h ago',
    isRead: false,
    leadId: 'lead-1',
    type: 'priority',
  },
  {
    id: 'notif-3',
    title: 'Follow-up recommendation generated',
    description: 'Recommended sending revised DPA Section 8 redlines to Sarah Jenkins (CloudScale).',
    time: '3h ago',
    isRead: true,
    leadId: 'lead-2',
    type: 'recommendation',
  },
];

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const popoverRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [notificationsOpen]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleItemClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    setNotificationsOpen(false);
    if (item.leadId) {
      navigate(`/leads/${item.leadId}`);
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'due':
        return <Clock className="w-3.5 h-3.5 text-[#1F5C48]" />;
      case 'priority':
        return <Flame className="w-3.5 h-3.5 text-[#B94A48]" />;
      case 'recommendation':
        return <Sparkles className="w-3.5 h-3.5 text-[#946E3D]" />;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-[#E4E2DC] px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-[6px] text-[#687068] hover:text-[#171A17] hover:bg-[#F2F1ED] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search */}
        <div className="relative hidden sm:block w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#687068]" />
          <input
            type="text"
            placeholder="Search prospects or companies..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-[#FAF9F6] border border-[#E4E2DC] rounded-[8px] placeholder:text-[#8D968D] text-[#171A17] focus:outline-none focus:bg-white focus:border-[#1F5C48] focus:ring-1 focus:ring-[#1F5C48]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF9F6] border border-[#E4E2DC] text-xs text-[#687068]">
          <span className="w-2 h-2 rounded-full bg-[#2F7D5B] inline-block animate-pulse" />
          <span>Follow-up queue active</span>
        </div>

        {/* Notification Bell with Dropdown Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setNotificationsOpen((prev) => !prev)}
            aria-expanded={notificationsOpen}
            aria-haspopup="true"
            aria-label="Notifications"
            title="Attention alerts"
            className={`p-2 rounded-[8px] transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5C48] ${
              notificationsOpen
                ? 'bg-[#F2F1ED] text-[#171A17]'
                : 'text-[#687068] hover:text-[#171A17] hover:bg-[#F2F1ED]'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B94A48]" />
            )}
          </button>

          {/* Dropdown Popover */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-[12px] border border-[#E4E2DC] shadow-modal z-50 overflow-hidden"
              >
                {/* Popover Header */}
                <div className="px-4 py-3 border-b border-[#E4E2DC] flex items-center justify-between bg-[#FAF9F6]">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-[#171A17]">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1F5C48] text-white">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="inline-flex items-center gap-1 text-[11px] text-[#1F5C48] hover:underline font-medium"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-[#E4E2DC]">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={`p-3.5 hover:bg-[#FAF9F6] transition-colors cursor-pointer flex items-start gap-3 ${
                        !item.isRead ? 'bg-[#FAF9F6]/60' : 'bg-white'
                      }`}
                    >
                      <div className="p-1.5 rounded-[6px] bg-white border border-[#E4E2DC] shrink-0 mt-0.5">
                        {getNotificationIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs truncate ${
                              !item.isRead
                                ? 'font-semibold text-[#171A17]'
                                : 'font-medium text-[#454D45]'
                            }`}
                          >
                            {item.title}
                          </p>
                          {!item.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1F5C48] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#687068] leading-relaxed mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                        <span className="text-[10px] text-[#8D968D] block mt-1">
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Popover Footer */}
                <div className="px-4 py-2.5 border-t border-[#E4E2DC] bg-[#FAF9F6] text-center">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/follow-ups');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1F5C48] hover:underline"
                  >
                    <span>View all in Follow-up Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Button
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/leads/new')}
        >
          Add Lead
        </Button>
      </div>
    </header>
  );
};
