import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Flame,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Compass,
  Volume2,
  HeartHandshake,
  User,
  X,
} from 'lucide-react';
import { HabitSettings } from '../types';
import { markOnboardingCompleted } from '../services/storageService';

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
  const [slide, setSlide] = useState<1 | 2 | 3>(1);
  const [selectedQuota, setSelectedQuota] = useState<number>(5);
  const [userNameInput, setUserNameInput] = useState<string>('');

  if (!isOpen) return null;

  const handleFinish = (quota = selectedQuota, name = userNameInput) => {
    const trimmedName = name.trim();
    markOnboardingCompleted(quota, trimmedName);
    onComplete({
      dailyQuota: quota,
      ...(trimmedName ? { userName: trimmedName } : {}),
      onboardingCompleted: true,
    });
    if (onClose) {
      onClose();
    }
  };

  const handleSkip = () => {
    handleFinish(selectedQuota || 5, '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border transition-colors relative overflow-hidden flex flex-col justify-between min-h-[520px] ${
          isDark
            ? 'bg-slate-900 border-emerald-500/30 text-slate-100 shadow-emerald-950/50'
            : 'bg-white border-emerald-200 text-slate-900 shadow-slate-300'
        }`}
      >
        {/* Top Header: Step Indicators & Skip Button */}
        <div className="flex items-center justify-between mb-5">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSlide(s as 1 | 2 | 3)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  slide === s
                    ? 'w-7 bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    : 'w-2 bg-slate-700/50 hover:bg-slate-600'
                }`}
                title={`Go to Slide ${s}`}
                aria-label={`Slide ${s}`}
              />
            ))}
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1.5">
              {slide} of 3
            </span>
          </div>

          {/* Skip Button */}
          <button
            id="onboarding-skip-btn"
            type="button"
            onClick={handleSkip}
            className="px-2.5 py-1 rounded-full text-xs font-semibold text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors"
            title="Skip intro and go to Dashboard"
          >
            Skip
          </button>
        </div>

        {/* Dynamic Animated Slide Content */}
        <div className="flex-1 flex flex-col justify-center my-auto">
          <AnimatePresence mode="wait">
            {/* SLIDE 1: Welcome to QuranHabit */}
            {slide === 1 && (
              <motion.div
                key="slide-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.24 }}
                className="space-y-4"
              >
                {/* Hero Illustration */}
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 mx-auto">
                  <BookOpen className="w-8 h-8" />
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    Welcome to QuranHabit
                  </h2>
                  <p className="text-xs text-emerald-400 font-semibold tracking-wide">
                    Track your daily Quran recitation naturally.
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="space-y-2.5 pt-1">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Distraction-Free Reading</h4>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Authentic Uthmani & Indo-Pak scripts formatted for effortless daily reflection.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Soulful Audio Recitations</h4>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Verse-by-verse recitations with word highlights from renowned reciters.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">English & Urdu Translations</h4>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        Deepen your connection with parallel translations and daily reflections.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SLIDE 2: Build Lasting Habits */}
            {slide === 2 && (
              <motion.div
                key="slide-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.24 }}
                className="space-y-4"
              >
                {/* Streak Emblem */}
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-900/30 mx-auto">
                  <Flame className="w-8 h-8 fill-slate-950" />
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    Build Lasting Habits
                  </h2>
                  <p className="text-xs text-amber-400 font-semibold tracking-wide">
                    Set daily micro-goals and track your streaks.
                  </p>
                </div>

                {/* Micro-Goal Selector */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                    Select Your Daily Habit Goal
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { count: 3, label: 'Light', time: '~2 mins' },
                      { count: 5, label: 'Popular', time: '~4 mins', popular: true },
                      { count: 10, label: 'Steady', time: '~8 mins' },
                    ].map((opt) => {
                      const isSelected = selectedQuota === opt.count;
                      return (
                        <button
                          key={opt.count}
                          type="button"
                          onClick={() => setSelectedQuota(opt.count)}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                            isSelected
                              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 ring-2 ring-emerald-400/80 shadow-md shadow-emerald-950/40'
                              : 'border-slate-800 bg-slate-800/40 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          {opt.popular && (
                            <span className="absolute -top-2 bg-emerald-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded-full uppercase">
                              Best
                            </span>
                          )}
                          <span className="text-xl font-black text-white">{opt.count}</span>
                          <span className="text-[10px] font-semibold text-slate-300">Ayahs / day</span>
                          <span className="text-[9px] text-emerald-400">{opt.time}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hadith / Insight Box */}
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 text-xs leading-relaxed flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    "The most beloved of deeds to Allah are those that are most consistent, even if they are small."
                    <span className="block text-[10px] text-emerald-400/80 mt-0.5">— Sahih Muslim</span>
                  </span>
                </div>
              </motion.div>
            )}

            {/* SLIDE 3: Stay Connected */}
            {slide === 3 && (
              <motion.div
                key="slide-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.24 }}
                className="space-y-4"
              >
                {/* Stay Connected Emblem */}
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-purple-500 to-indigo-400 text-white flex items-center justify-center shadow-lg shadow-purple-900/40 mx-auto">
                  <Compass className="w-8 h-8" />
                </div>

                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    Stay Connected
                  </h2>
                  <p className="text-xs text-purple-300 font-semibold tracking-wide">
                    Explore surahs, recitations, and reminders.
                  </p>
                </div>

                {/* App Features Overview */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Daily Azkar</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Morning & evening remembrances with haptic counter.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Auto-Resume</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug">
                      Instantly resume exactly from your last read verse.
                    </p>
                  </div>
                </div>

                {/* Optional Name Personalization */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="onboarding-user-name" className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Your Name (Optional)</span>
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">Can change anytime</span>
                  </div>
                  <input
                    id="onboarding-user-name"
                    type="text"
                    value={userNameInput}
                    onChange={(e) => setUserNameInput(e.target.value)}
                    placeholder="Enter your name (e.g. Tariq)"
                    maxLength={32}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 text-xs font-semibold focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                  <p className="text-[10px] text-slate-400">
                    Leave blank to show the clean generic "Asalam Alaykum" greeting.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions: Navigation Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 mt-auto">
          {slide > 1 ? (
            <button
              id="onboarding-back-btn"
              type="button"
              onClick={() => setSlide((prev) => (prev - 1) as 1 | 2)}
              className="py-2.5 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-white font-medium transition-colors px-2"
            >
              Skip Tour
            </button>
          )}

          {slide < 3 ? (
            <button
              id={`onboarding-next-slide-${slide}-btn`}
              type="button"
              onClick={() => setSlide((prev) => (prev + 1) as 2 | 3)}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 ml-auto"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="onboarding-get-started-btn"
              type="button"
              onClick={() => handleFinish()}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/50 ml-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Started</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
