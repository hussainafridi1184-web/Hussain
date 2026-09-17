import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { InAppNotificationPayload } from '../services/notificationService';

interface InAppNotificationBannerProps {
  notification: InAppNotificationPayload | null;
  onDismiss: () => void;
  onReadNow: () => void;
  onMarkRead: () => void;
  isDark: boolean;
}

export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  notification,
  onDismiss,
  onReadNow,
  onMarkRead,
  isDark,
}) => {
  if (!notification) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="android-notification-shade"
        initial={{ y: -80, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -80, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-3 left-3 right-3 z-50 max-w-md mx-auto"
      >
        <div
          className={`rounded-2xl p-4 shadow-2xl border backdrop-blur-xl transition-all ${
            isDark
              ? 'bg-slate-800/95 text-slate-100 border-emerald-500/30 shadow-emerald-950/50'
              : 'bg-white/95 text-slate-900 border-emerald-200 shadow-slate-300'
          }`}
        >
          {/* Header info like Android Heads-Up Notification */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold tracking-wide text-emerald-500 uppercase">
                QuranHabit • Now
              </span>
            </div>
            <button
              id="dismiss-notification-btn"
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 -mr-1"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title & Body */}
          <div className="space-y-1">
            <h4 className="font-semibold text-sm flex items-center gap-1.5">
              <span>{notification.title}</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {notification.message}
            </p>

            {notification.ayahText && (
              <div
                className={`p-2.5 rounded-xl my-2 border text-right font-uthmani text-base ${
                  isDark
                    ? 'bg-slate-900/80 border-slate-700/60 text-emerald-300'
                    : 'bg-emerald-50/70 border-emerald-100 text-emerald-900'
                }`}
                dir="rtl"
              >
                {notification.ayahText}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-medium text-emerald-500">
                {notification.progressText}
              </span>
            </div>
          </div>

          {/* Android action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-700/30">
            <button
              id="notification-read-now-btn"
              onClick={onReadNow}
              className="py-1.5 px-3 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1 transition-colors shadow-sm"
            >
              <span>Read Verse</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              id="notification-mark-read-btn"
              onClick={onMarkRead}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-colors ${
                isDark
                  ? 'border-slate-600 hover:bg-slate-700/60 text-slate-200'
                  : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Mark as Read</span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
