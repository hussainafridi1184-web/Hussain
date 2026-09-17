import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BookOpen, Check, Sparkles, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { HabitSettings, ReminderFrequency, ReminderSlot, ScriptType } from '../types';
import { DEFAULT_REMINDER_SLOTS, markOnboardingCompleted } from '../services/storageService';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (settings: Partial<HabitSettings>) => void;
  onClose?: () => void;
  isDark: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onClose,
  isDark,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedQuota, setSelectedQuota] = useState<number>(5);
  const [customQuotaInput, setCustomQuotaInput] = useState<string>('7');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [frequency, setFrequency] = useState<ReminderFrequency>('3x');
  const [selectedScript, setSelectedScript] = useState<ScriptType>('uthmani');
  const [justSelected, setJustSelected] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSelectGoalAndDismiss = (quota: number) => {
    const validQuota = Math.max(1, Math.min(286, quota));
    setJustSelected(validQuota);

    let slots: ReminderSlot[] = [];
    if (frequency === '2x') {
      slots = [DEFAULT_REMINDER_SLOTS[0], DEFAULT_REMINDER_SLOTS[3]];
    } else if (frequency === '3x') {
      slots = [DEFAULT_REMINDER_SLOTS[0], DEFAULT_REMINDER_SLOTS[1], DEFAULT_REMINDER_SLOTS[2]];
    } else {
      slots = [...DEFAULT_REMINDER_SLOTS];
    }

    markOnboardingCompleted(validQuota);

    // Provide a brief visual feedback then complete immediately
    setTimeout(() => {
      onComplete({
        dailyQuota: validQuota,
        reminderFrequency: frequency,
        reminderSlots: slots,
        preferredScript: selectedScript,
        onboardingCompleted: true,
      });
    }, 120);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customQuotaInput, 10);
    handleSelectGoalAndDismiss(isNaN(parsed) || parsed < 1 ? 5 : parsed);
  };

  const handleDismiss = () => {
    markOnboardingCompleted(selectedQuota || 5);
    if (onClose) {
      onClose();
    } else {
      handleSelectGoalAndDismiss(selectedQuota || 5);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className={`w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border transition-colors relative overflow-hidden ${
          isDark
            ? 'bg-slate-900 border-emerald-500/30 text-slate-100 shadow-emerald-950/50'
            : 'bg-white border-emerald-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Top Header with Close Button */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Welcome to QuranHabit
            </span>
          </div>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      step === s ? 'w-5 bg-emerald-500' : 'w-2 bg-slate-700/40'
                    }`}
                  />
                ))}
              </div>
            )}
            <button
              id="onboarding-close-btn"
              type="button"
              onClick={handleDismiss}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-xs font-bold transition-colors"
              title="Skip and continue"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step 1: Micro-Goal Selection (Immediate 1-Tap Save & Dismiss) */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-black tracking-tight mb-1 text-white">
                Choose Your Daily Micro-Goal
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Consistency is key. Select an option below to set your daily habit and start immediately.
              </p>
            </div>

            {/* Daily Goal Options - 1-Click Save & Dismiss */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { count: 3, time: '~2 mins', label: 'Light' },
                { count: 5, time: '~3-4 mins', label: 'Recommended', popular: true },
                { count: 10, time: '~7 mins', label: 'Steady' },
              ].map((opt) => {
                const isSelected = justSelected === opt.count;
                return (
                  <button
                    key={opt.count}
                    id={`goal-option-${opt.count}-btn`}
                    type="button"
                    onClick={() => handleSelectGoalAndDismiss(opt.count)}
                    className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 relative ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-400'
                        : opt.popular
                        ? 'border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 text-white'
                        : isDark
                        ? 'border-slate-800 bg-slate-800/60 hover:border-slate-700 hover:bg-slate-800 text-slate-200'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    {opt.popular && (
                      <span className="absolute -top-2.5 bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                        Best
                      </span>
                    )}
                    <span className="text-2xl font-black text-white">{opt.count}</span>
                    <span className="text-xs font-semibold text-slate-300">Ayahs / day</span>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      {opt.time}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Quota Form */}
            <form
              onSubmit={handleCustomSubmit}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isCustom
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : isDark
                  ? 'border-slate-800 bg-slate-800/40'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Custom Quota:</span>
                <input
                  id="custom-quota-input"
                  type="number"
                  min="1"
                  max="100"
                  value={customQuotaInput}
                  onChange={(e) => {
                    setIsCustom(true);
                    setCustomQuotaInput(e.target.value);
                  }}
                  className="w-14 px-2 py-1 text-center rounded-xl text-sm font-bold bg-slate-800 border border-slate-700 text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-400">ayahs</span>
              </div>

              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md"
              >
                Set Goal →
              </button>
            </form>

            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 text-xs leading-relaxed flex items-start gap-2">
              <span className="text-sm">💡</span>
              <span>
                "The most beloved of deeds to Allah are those that are most consistent, even if they are small." (Sahih Muslim)
              </span>
            </div>

            {/* Footer Skip & Advanced Options */}
            <div className="pt-1 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-purple-300 hover:text-purple-200 font-medium transition-colors underline"
              >
                Customize Reminders & Script →
              </button>
              <button
                type="button"
                onClick={() => handleSelectGoalAndDismiss(5)}
                className="text-slate-400 hover:text-white font-medium transition-colors"
              >
                Skip (Default 5)
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Smart Notification & Reminder Frequency */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-1 text-white">
                Smart Reminder Frequency
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                QuranHabit sends subtle reminders across the day. Once your quota is read, reminders auto-dismiss.
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  freq: '2x' as ReminderFrequency,
                  title: '2x Daily (Fajr & Isha)',
                  desc: 'Start and end of day (06:00 AM & 09:00 PM)',
                },
                {
                  freq: '3x' as ReminderFrequency,
                  title: '3x Daily (Recommended)',
                  desc: 'Morning (06:00), Midday (13:30), and Afternoon (17:00)',
                },
                {
                  freq: '4x' as ReminderFrequency,
                  title: '4x Daily (Persistent)',
                  desc: 'Across all 4 main prayer intervals until completed',
                },
              ].map((opt) => (
                <button
                  key={opt.freq}
                  type="button"
                  onClick={() => setFrequency(opt.freq)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start justify-between ${
                    frequency === opt.freq
                      ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                      : isDark
                      ? 'border-slate-800 bg-slate-800/40 hover:border-slate-700'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400">{opt.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                  {frequency === opt.freq && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/40"
              >
                <span>Next: Preferred Script</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Typography & Final Start */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight mb-1 text-white">
                Quranic Typography
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose your preferred script. You can switch anytime in settings.
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setSelectedScript('uthmani')}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                  selectedScript === 'uthmani'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                    : isDark
                    ? 'border-slate-800 bg-slate-800/40'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">Madina (Uthmani)</span>
                  {selectedScript === 'uthmani' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="font-serif text-lg text-right text-emerald-300" dir="rtl">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedScript('indopak')}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                  selectedScript === 'indopak'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30'
                    : isDark
                    ? 'border-slate-800 bg-slate-800/40'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white">Indo-Pak Script</span>
                  {selectedScript === 'indopak' && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="font-serif text-lg text-right text-emerald-300" dir="rtl">
                  بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
                </p>
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => handleSelectGoalAndDismiss(selectedQuota || 5)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/40"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Start Daily Habit</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
