import React from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  BellOff,
  Bookmark,
  BookOpen,
  CheckCircle2,
  Flame,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BookmarkPosition, DailyProgress, HabitSettings, HabitStats } from '../types';

interface DailyGoalCardProps {
  progress: DailyProgress;
  settings: HabitSettings;
  stats: HabitStats;
  lastReadPosition?: BookmarkPosition;
  onResumePosition?: (surahNumber: number, ayahNumber: number) => void;
  onReadNow: () => void;
  onIncrementAyah: () => void;
  onCompleteToday: () => void;
  onResetToday: () => void;
  onTestNotification: () => void;
  onOpenSettings: () => void;
  isDark: boolean;
}

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({
  progress,
  settings,
  stats,
  lastReadPosition,
  onResumePosition,
  onReadNow,
  onIncrementAyah,
  onCompleteToday,
  onResetToday,
  onTestNotification,
  onOpenSettings,
  isDark,
}) => {
  const readCount = progress.readAyahs.length;
  const target = progress.targetQuota || settings.dailyQuota;
  const percentage = Math.min(100, Math.round((readCount / target) * 100));
  const isCompleted = progress.isCompleted || readCount >= target;

  // SVG Circular progress math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleQuickComplete = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#059669', '#f59e0b', '#34d399'],
    });
    onCompleteToday();
  };

  return (
    <div className="space-y-4">
      {/* Main Habit Goal Card */}
      <motion.div
        layout
        className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 border transition-all ${
          isDark
            ? 'bg-gradient-to-b from-slate-800/90 to-slate-900/90 border-emerald-500/20 shadow-xl shadow-emerald-950/20'
            : 'bg-gradient-to-b from-white to-emerald-50/40 border-emerald-100 shadow-xl shadow-slate-200/50'
        }`}
      >
        {/* Subtle Islamic geometric pattern overlay */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 opacity-5 pointer-events-none rounded-full border-[12px] border-emerald-400 transform rotate-45" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                <span>Daily Quran Habit</span>
              </span>
              <span className="inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{stats.currentStreak} Day Streak</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {isCompleted ? 'Daily Quota Achieved! 🎉' : "Today's Ayah Goal"}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {isCompleted
                ? `Masha'Allah! You have completed your goal of ${target} Ayahs today. Consistency builds devotion.`
                : `Read ${target - readCount} more ${
                    target - readCount === 1 ? 'Ayah' : 'Ayahs'
                  } to complete today's micro-goal.`}
            </p>
          </div>

          {/* Progress Dial */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={isDark ? 'stroke-slate-800' : 'stroke-emerald-100'}
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-emerald-500 transition-all duration-700 ease-out"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-black text-emerald-400">
                {readCount}/{target}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Ayahs</span>
            </div>
          </div>
        </div>

        {/* Auto-Resume Position Indicator */}
        {lastReadPosition && (
          <div
            onClick={() => {
              if (onResumePosition) {
                onResumePosition(lastReadPosition.surahNumber, lastReadPosition.ayahNumber);
              } else {
                onReadNow();
              }
            }}
            className="mt-4 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs cursor-pointer hover:bg-emerald-500/15 transition-colors"
            title="Click to resume at saved verse"
          >
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Bookmark className="w-3.5 h-3.5 fill-emerald-400" />
              </span>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Last Saved Position</span>
                <span className="font-bold text-emerald-400 text-xs">
                  Surah {lastReadPosition.surahNameEnglish} • Ayah {lastReadPosition.ayahNumber}
                </span>
              </div>
            </div>
            <button
              id="resume-saved-ayah-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onResumePosition) {
                  onResumePosition(lastReadPosition.surahNumber, lastReadPosition.ayahNumber);
                } else {
                  onReadNow();
                }
              }}
              className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all shadow-sm active:scale-95"
            >
              Resume →
            </button>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5">
          <button
            id="start-reading-btn"
            onClick={() => {
              if (onResumePosition && lastReadPosition) {
                onResumePosition(lastReadPosition.surahNumber, lastReadPosition.ayahNumber);
              } else {
                onReadNow();
              }
            }}
            className="py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/30 active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Read Verses</span>
          </button>

          {!isCompleted ? (
            <button
              id="increment-ayah-btn"
              onClick={onIncrementAyah}
              className={`py-2.5 px-4 rounded-2xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                isDark
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>+1 Ayah Read</span>
            </button>
          ) : (
            <button
              id="reset-today-btn"
              onClick={onResetToday}
              className={`py-2.5 px-4 rounded-2xl border font-semibold text-xs flex items-center justify-center gap-2 transition-all text-slate-400 hover:text-slate-200 ${
                isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Today</span>
            </button>
          )}

          {!isCompleted && (
            <button
              id="complete-all-today-btn"
              onClick={handleQuickComplete}
              className="col-span-2 sm:col-span-1 py-2.5 px-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complete Quota</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Smart Local Notification Status Banner */}
      <div
        className={`rounded-2xl p-4 border transition-all ${
          isCompleted
            ? isDark
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : isDark
            ? 'bg-slate-800/60 border-slate-700/60 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {isCompleted ? (
                <BellOff className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  {isCompleted
                    ? 'Smart Reminders: Auto-Dismissed'
                    : 'Smart Reminders: Active'}
                </h4>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {isCompleted ? 'Silenced Until Tomorrow' : `${settings.reminderFrequency} Schedule`}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {isCompleted
                  ? 'Remaining alarms for today have been automatically silenced. They will resume normally tomorrow morning at 06:00 AM.'
                  : `Alarms trigger periodically (${settings.reminderSlots
                      .map((s) => s.time)
                      .join(', ')}) until you mark today's Ayahs completed.`}
              </p>
            </div>
          </div>
        </div>

        {/* Notification Testing & Setup Utility Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-700/30 text-xs">
          <button
            id="test-reminder-notification-btn"
            onClick={onTestNotification}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Test Push Notification & Chime</span>
          </button>

          <button
            id="configure-reminders-link-btn"
            onClick={onOpenSettings}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Configure Alarm Times →
          </button>
        </div>
      </div>
    </div>
  );
};
