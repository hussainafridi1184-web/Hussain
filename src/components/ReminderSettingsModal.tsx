import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  Check,
  Clock,
  Plus,
  Trash2,
  Volume2,
  X,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { HabitSettings, ReminderFrequency, ReminderSlot } from '../types';
import { requestNotificationPermission } from '../services/notificationService';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: HabitSettings;
  onSave: (newSettings: HabitSettings) => void;
  onTestNotification: () => void;
  isDark: boolean;
}

export const ReminderSettingsModal: React.FC<ReminderSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  onTestNotification,
  isDark,
}) => {
  const [localSettings, setLocalSettings] = useState<HabitSettings>(settings);
  const [hasPermission, setHasPermission] = useState<boolean>(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setHasPermission(
        typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
      );
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleToggleSlot = (id: string) => {
    const updated = localSettings.reminderSlots.map((slot) =>
      slot.id === id ? { ...slot, enabled: !slot.enabled } : slot
    );
    setLocalSettings({ ...localSettings, reminderSlots: updated });
  };

  const handleTimeChange = (id: string, newTime: string) => {
    const updated = localSettings.reminderSlots.map((slot) =>
      slot.id === id ? { ...slot, time: newTime } : slot
    );
    setLocalSettings({ ...localSettings, reminderSlots: updated });
  };

  const handleRequestWebPermission = async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
    setLocalSettings({ ...localSettings, webNotificationsEnabled: granted });
  };

  const handleSaveAndClose = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div
      id="reminder-settings-modal-overlay"
      className="fixed inset-0 z-[950] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        id="reminder-settings-modal-card"
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{ paddingBottom: '100px' }}
        className={`w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border max-h-[85vh] sm:max-h-[82vh] overflow-y-auto scrollbar-thin my-auto ${
          isDark
            ? 'bg-slate-900 border-emerald-500/20 text-slate-100'
            : 'bg-white border-emerald-100 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Reminder & Quota Settings</h3>
              <p className="text-[11px] text-slate-400">Smart Auto-Dismissing Alarms</p>
            </div>
          </div>
          <button
            id="reminder-settings-close-x-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-xs">
          {/* Daily Quota Setting */}
          <div className="space-y-2">
            <label className="font-bold text-slate-300 block">Daily Ayah Quota</label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 10, 15].map((count) => (
                <button
                  key={count}
                  id={`quota-option-${count}-btn`}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, dailyQuota: count })}
                  className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                    localSettings.dailyQuota === count
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                      : isDark
                      ? 'border-slate-800 bg-slate-800/40 text-slate-300'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  {count} Ayahs
                </button>
              ))}
            </div>
          </div>

          {/* Smart Auto-Dismiss Logic Info Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/30 text-emerald-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>How Smart Auto-Dismiss Works</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Your alarms remind you at each interval until you complete your daily {localSettings.dailyQuota} Ayahs. The instant you complete them, all subsequent reminders for today turn off automatically and resume fresh tomorrow!
            </p>
          </div>

          {/* Alarm Slots List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-300">Daily Alarm Schedule</label>
              <span className="text-[10px] text-slate-400">
                {localSettings.reminderSlots.filter((s) => s.enabled).length} Active
              </span>
            </div>

            <div className="space-y-2">
              {localSettings.reminderSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                    slot.enabled
                      ? isDark
                        ? 'bg-slate-800/80 border-slate-700'
                        : 'bg-slate-50 border-slate-200'
                      : 'opacity-50 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold block">{slot.label}</span>
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) => handleTimeChange(slot.id, e.target.value)}
                        className="bg-transparent text-emerald-400 font-bold focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <button
                    id={`toggle-alarm-slot-${slot.id}-btn`}
                    type="button"
                    onClick={() => handleToggleSlot(slot.id)}
                    className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
                      slot.enabled ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        slot.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sound Chime & Browser Notification Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            {/* Sound Chime */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-800 bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-semibold block">Harmonic Audio Chime</span>
                  <span className="text-[10px] text-slate-400">
                    Gentle spiritual bell tone when alert fires
                  </span>
                </div>
              </div>
              <input
                id="toggle-chime-checkbox"
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, soundEnabled: e.target.checked })
                }
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Native Web Push Notification Permission */}
            <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-800 bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-semibold block">Push Notifications</span>
                  <span className="text-[10px] text-slate-400">
                    {hasPermission ? 'Permission Granted' : 'Allow Android / Browser notifications'}
                  </span>
                </div>
              </div>
              {!hasPermission ? (
                <button
                  id="enable-push-permission-btn"
                  type="button"
                  onClick={handleRequestWebPermission}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px]"
                >
                  Enable
                </button>
              ) : (
                <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Active
                </span>
              )}
            </div>
          </div>

          {/* Send Instant Test Button */}
          <button
            id="reminder-settings-test-notification-btn"
            type="button"
            onClick={onTestNotification}
            className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
            <span>Send Test Push Notification Now</span>
          </button>
        </div>

        {/* Save & Apply Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex gap-2">
          <button
            id="reminder-settings-cancel-btn"
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            id="reminder-settings-save-btn"
            type="button"
            onClick={handleSaveAndClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
};
