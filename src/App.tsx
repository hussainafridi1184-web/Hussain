import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'motion/react';
import { Bookmark, X } from 'lucide-react';
import {
  BookmarkPosition,
  DailyProgress,
  HabitSettings,
  HabitStats,
  NavigationTab,
} from './types';
import {
  DEFAULT_SETTINGS,
  getTodayDateString,
  hasCompletedOnboarding,
  loadDailyProgress,
  loadHabitSettings,
  loadHabitStats,
  loadLastRead,
  markOnboardingCompleted,
  resetAllData,
  saveDailyProgress,
  saveHabitSettings,
  saveHabitStats,
  ZERO_STATS,
} from './services/storageService';
import {
  InAppNotificationPayload,
  playNotificationChime,
  triggerSystemNotification,
} from './services/notificationService';
import { VERIFIED_OFFLINE_AYAHS } from './data/quranData';

import { AndroidFrame } from './components/AndroidFrame';
import { HomeDashboard } from './components/HomeDashboard';
import { DailyGoalCard } from './components/DailyGoalCard';
import { QuranReader } from './components/QuranReader';
import { AzkarModule } from './components/AzkarModule';
import { ProgressTracker } from './components/ProgressTracker';
import { InAppNotificationBanner } from './components/InAppNotificationBanner';
import { OnboardingModal } from './components/OnboardingModal';
import { ReminderSettingsModal } from './components/ReminderSettingsModal';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [settings, setSettings] = useState<HabitSettings>(loadHabitSettings);
  const [todayDate] = useState<string>(getTodayDateString);
  const [progress, setProgress] = useState<DailyProgress>(() =>
    loadDailyProgress(todayDate, settings.dailyQuota)
  );
  const [stats, setStats] = useState<HabitStats>(loadHabitStats);

  // Active view tab in Android frame: 'home' | 'reading' | 'explore' | 'leaderboard' | 'settings'
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  // Modals & Banners
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !hasCompletedOnboarding());
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<InAppNotificationPayload | null>(null);

  // 1 & 2. Automatic Position & Seamless Auto-Resume
  const [lastReadPosition, setLastReadPosition] = useState<BookmarkPosition>(loadLastRead);
  const [showResumeToast, setShowResumeToast] = useState<boolean>(true);

  // Navigation target state to explicitly pass surahNumber and ayahNumber to QuranReader
  const [readerNavigationTarget, setReaderNavigationTarget] = useState<{
    surahNumber: number;
    ayahNumber: number;
    timestamp: number;
  }>(() => {
    const saved = loadLastRead();
    return {
      surahNumber: saved.surahNumber,
      ayahNumber: saved.ayahNumber,
      timestamp: Date.now(),
    };
  });

  const handleResumeToPosition = useCallback((surahNumber: number, ayahNumber: number) => {
    setReaderNavigationTarget({
      surahNumber,
      ayahNumber,
      timestamp: Date.now(),
    });
    setActiveTab('reading');
    setShowOnboarding(false);
    markOnboardingCompleted();
  }, []);

  const handleTabChange = useCallback((tab: NavigationTab) => {
    if (tab === 'reading') {
      const latest = loadLastRead();
      setLastReadPosition(latest);
      setReaderNavigationTarget({
        surahNumber: latest.surahNumber,
        ayahNumber: latest.ayahNumber,
        timestamp: Date.now(),
      });
    }
    setActiveTab(tab);
    setShowSettingsModal(false);
    // Dismiss onboarding overlay immediately upon switching to any tab
    setShowOnboarding(false);
    markOnboardingCompleted();
  }, []);

  const handleResetAllData = useCallback(() => {
    resetAllData();
    setSettings(DEFAULT_SETTINGS);
    setStats(ZERO_STATS);
    const freshProgress: DailyProgress = {
      date: getTodayDateString(),
      readAyahs: [],
      targetQuota: DEFAULT_SETTINGS.dailyQuota,
      isCompleted: false,
      remindersDismissed: false,
    };
    setProgress(freshProgress);
    const initialBookmark: BookmarkPosition = {
      surahNumber: 1,
      ayahNumber: 1,
      surahNameEnglish: 'Al-Faatiha',
      surahNameArabic: 'ٱلْفَاتِحَةِ',
      timestamp: new Date().toISOString(),
      juz: 1,
    };
    setLastReadPosition(initialBookmark);
    setReaderNavigationTarget({
      surahNumber: 1,
      ayahNumber: 1,
      timestamp: Date.now(),
    });
    setShowSettingsModal(false);
  }, []);

  const handleCloseSettingsModal = useCallback(() => {
    setShowSettingsModal(false);
  }, []);

  // Auto-dismiss settings modal whenever activeTab switches
  useEffect(() => {
    if (activeTab !== 'settings') {
      setShowSettingsModal(false);
    }
  }, [activeTab]);

  // 3. Resume Feedback Banner auto-dismiss after launch
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResumeToast(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  const handlePositionBookmark = useCallback((bookmark: BookmarkPosition) => {
    setLastReadPosition(bookmark);
    setReaderNavigationTarget({
      surahNumber: bookmark.surahNumber,
      ayahNumber: bookmark.ayahNumber,
      timestamp: Date.now(),
    });
  }, []);

  // Save settings when changed
  const handleUpdateSettings = useCallback(
    (newSettings: Partial<HabitSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        saveHabitSettings(updated);
        return updated;
      });
    },
    []
  );

  // Sync progress changes to localStorage
  const updateProgressState = useCallback(
    (newProgress: DailyProgress) => {
      setProgress(newProgress);
      saveDailyProgress(newProgress);
    },
    []
  );

  // Toggle dark/light theme
  const toggleTheme = () => {
    handleUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const isDark = settings.theme === 'dark';

  // Check goal completion and update streak accordingly
  const handleCompleteToday = useCallback(() => {
    const isAlreadyCompleted = progress.isCompleted;
    const newProgress: DailyProgress = {
      ...progress,
      isCompleted: true,
      remindersDismissed: true,
      completedAt: new Date().toISOString(),
    };
    updateProgressState(newProgress);

    if (!isAlreadyCompleted) {
      setStats((prev) => {
        const newStreak = prev.currentStreak + 1;
        const updatedStats: HabitStats = {
          ...prev,
          currentStreak: newStreak,
          longestStreak: Math.max(prev.longestStreak, newStreak),
          totalAyahsRead: prev.totalAyahsRead + (progress.targetQuota - progress.readAyahs.length),
          totalDaysActive: prev.totalDaysActive + 1,
          completionHistory: {
            ...prev.completionHistory,
            [todayDate]: progress.targetQuota,
          },
        };
        saveHabitStats(updatedStats);
        return updatedStats;
      });

      // Trigger Confetti Celebration
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24', '#059669'],
      });
    }
  }, [progress, todayDate, updateProgressState]);

  // Read one more Ayah
  const handleIncrementAyah = useCallback(() => {
    const nextAyahNum = progress.readAyahs.length + 1;
    const newAyahItem = {
      surahNumber: 67, // Surah Al-Mulk daily reading
      ayahNumber: nextAyahNum,
      key: `67:${nextAyahNum}`,
      timestamp: new Date().toISOString(),
    };

    const newReadAyahs = [...progress.readAyahs, newAyahItem];
    const willComplete = newReadAyahs.length >= (progress.targetQuota || settings.dailyQuota);

    const updatedProgress: DailyProgress = {
      ...progress,
      readAyahs: newReadAyahs,
      isCompleted: willComplete,
      remindersDismissed: willComplete,
      completedAt: willComplete ? new Date().toISOString() : undefined,
    };
    updateProgressState(updatedProgress);

    // Update global read stats
    setStats((prev) => {
      const updated = {
        ...prev,
        totalAyahsRead: prev.totalAyahsRead + 1,
        currentStreak: willComplete && !progress.isCompleted ? prev.currentStreak + 1 : prev.currentStreak,
        completionHistory: {
          ...prev.completionHistory,
          [todayDate]: newReadAyahs.length,
        },
      };
      saveHabitStats(updated);
      return updated;
    });

    if (willComplete) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
      });
    }
  }, [progress, settings.dailyQuota, todayDate, updateProgressState]);

  // Reset today's progress
  const handleResetToday = () => {
    const resetProgress: DailyProgress = {
      ...progress,
      readAyahs: [],
      isCompleted: false,
      remindersDismissed: false,
      completedAt: undefined,
    };
    updateProgressState(resetProgress);
  };

  // Toggle specific Ayah read state from QuranReader
  const handleToggleAyahRead = (surahNumber: number, ayahNumber: number) => {
    const key = `${surahNumber}:${ayahNumber}`;
    const exists = progress.readAyahs.some((a) => a.key === key);

    let updatedAyahs = [...progress.readAyahs];
    if (exists) {
      updatedAyahs = updatedAyahs.filter((a) => a.key !== key);
    } else {
      updatedAyahs.push({
        surahNumber,
        ayahNumber,
        key,
        timestamp: new Date().toISOString(),
      });
    }

    const willComplete = updatedAyahs.length >= (progress.targetQuota || settings.dailyQuota);

    const updatedProgress: DailyProgress = {
      ...progress,
      readAyahs: updatedAyahs,
      isCompleted: willComplete,
      remindersDismissed: willComplete,
      completedAt: willComplete ? new Date().toISOString() : undefined,
    };
    updateProgressState(updatedProgress);

    // Update stats
    setStats((prev) => {
      const delta = exists ? -1 : 1;
      const updated = {
        ...prev,
        totalAyahsRead: Math.max(0, prev.totalAyahsRead + delta),
        completionHistory: {
          ...prev.completionHistory,
          [todayDate]: updatedAyahs.length,
        },
      };
      saveHabitStats(updated);
      return updated;
    });

    if (!exists && willComplete && !progress.isCompleted) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
      });
    }
  };

  // Auto-mark Ayah read when user swipes to the next Ayah
  const handleAutoMarkAyahRead = (surahNumber: number, ayahNumber: number) => {
    const key = `${surahNumber}:${ayahNumber}`;
    const exists = progress.readAyahs.some((a) => a.key === key);
    if (exists) return; // already marked read

    const updatedAyahs = [
      ...progress.readAyahs,
      {
        surahNumber,
        ayahNumber,
        key,
        timestamp: new Date().toISOString(),
      },
    ];

    const willComplete = updatedAyahs.length >= (progress.targetQuota || settings.dailyQuota);

    const updatedProgress: DailyProgress = {
      ...progress,
      readAyahs: updatedAyahs,
      isCompleted: willComplete,
      remindersDismissed: willComplete,
      completedAt: willComplete ? new Date().toISOString() : progress.completedAt,
    };
    updateProgressState(updatedProgress);

    setStats((prev) => {
      const updated = {
        ...prev,
        totalAyahsRead: prev.totalAyahsRead + 1,
        currentStreak: willComplete && !progress.isCompleted ? prev.currentStreak + 1 : prev.currentStreak,
        completionHistory: {
          ...prev.completionHistory,
          [todayDate]: updatedAyahs.length,
        },
      };
      saveHabitStats(updated);
      return updated;
    });

    // If this swipe triggered daily goal completion, celebrate with confetti
    if (willComplete && !progress.isCompleted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
      });
    }
  };

  // Test Notification Trigger
  const handleTestNotification = () => {
    if (settings.soundEnabled) {
      playNotificationChime();
    }

    // Next suggested verse for today
    const currentReadCount = progress.readAyahs.length;
    const target = progress.targetQuota || settings.dailyQuota;
    const sampleAyah = VERIFIED_OFFLINE_AYAHS[Math.min(currentReadCount, VERIFIED_OFFLINE_AYAHS.length - 1)];

    const payload: InAppNotificationPayload = {
      id: String(Date.now()),
      title: '⏰ QuranHabit: Daily Ayah Reminder',
      message: progress.isCompleted
        ? "Masha'Allah! You have already finished your goal today. All remaining alarms are silenced until tomorrow."
        : `You have read ${currentReadCount} of ${target} Ayahs today. Take a quick moment for your next verse:`,
      ayahText: sampleAyah ? sampleAyah.textUthmani : undefined,
      ayahKey: sampleAyah ? sampleAyah.key : undefined,
      progressText: progress.isCompleted
        ? 'Daily Goal: 100% Completed'
        : `Progress: ${currentReadCount} / ${target} Ayahs (${Math.round((currentReadCount / target) * 100)}%)`,
      timestamp: 'Just now',
    };

    setActiveNotification(payload);

    // Also trigger system desktop/android notification if granted
    triggerSystemNotification({
      title: payload.title,
      body: `${payload.message} ${payload.progressText}`,
    });
  };

  // Smart Scheduler: periodic check every 30 seconds
  useEffect(() => {
    const checkSchedule = () => {
      // If today is already completed, ALL remaining alarms are auto-dismissed!
      if (progress.isCompleted || progress.readAyahs.length >= progress.targetQuota) {
        return;
      }

      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      // Find if an enabled slot matches current time
      const matchingSlot = settings.reminderSlots.find(
        (slot) => slot.enabled && slot.time === currentHHMM && !slot.triggeredToday
      );

      if (matchingSlot) {
        // Trigger notification & chime!
        handleTestNotification();

        // Mark this slot triggered for today
        setSettings((prev) => {
          const updatedSlots = prev.reminderSlots.map((s) =>
            s.id === matchingSlot.id ? { ...s, triggeredToday: true } : s
          );
          const updated = { ...prev, reminderSlots: updatedSlots };
          saveHabitSettings(updated);
          return updated;
        });
      }
    };

    const interval = setInterval(checkSchedule, 30000);
    return () => clearInterval(interval);
  }, [progress, settings]);

  const readAyahKeys = progress.readAyahs.map((a) => a.key);

  return (
    <div className={isDark ? 'dark' : ''}>
      {/* 3. Resume Feedback Banner upon app launch */}
      <AnimatePresence>
        {showResumeToast && lastReadPosition && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="fixed top-12 left-4 right-4 max-w-sm mx-auto z-50 p-3 rounded-2xl shadow-2xl backdrop-blur-xl border border-emerald-500/40 bg-slate-900/95 text-slate-100 flex items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Bookmark className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Auto-Bookmark
                  </span>
                  <span className="text-[9px] text-slate-400">• Session Resumed</span>
                </div>
                <p className="text-xs font-semibold text-slate-100 truncate">
                  Resumed from Surah {lastReadPosition.surahNameEnglish}, Ayah {lastReadPosition.ayahNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowResumeToast(false);
                  handleResumeToPosition(lastReadPosition.surahNumber, lastReadPosition.ayahNumber);
                }}
                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-transform active:scale-95"
              >
                Read →
              </button>
              <button
                type="button"
                onClick={() => setShowResumeToast(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heads-up Android in-app notification banner */}
      <InAppNotificationBanner
        notification={activeNotification}
        onDismiss={() => setActiveNotification(null)}
        onReadNow={() => {
          setActiveNotification(null);
          if (lastReadPosition) {
            handleResumeToPosition(lastReadPosition.surahNumber, lastReadPosition.ayahNumber);
          } else {
            setActiveTab('reading');
          }
        }}
        onMarkRead={() => {
          handleIncrementAyah();
          setActiveNotification(null);
        }}
        isDark={isDark}
      />

      {/* Main Android Jetpack Compose inspired Shell */}
      <AndroidFrame
        activeTab={activeTab}
        onTabChange={handleTabChange}
        settings={settings}
        stats={stats}
        todayCompleted={progress.isCompleted}
        onOpenSettings={() => setActiveTab('settings')}
        onToggleTheme={toggleTheme}
        onTestNotification={handleTestNotification}
        isDark={isDark}
      >
        {/* Tab 1: 1:1 Home Dashboard (Mirroring reference screenshots & video) */}
        {(activeTab === 'home' || activeTab === 'habit') && (
          <HomeDashboard
            progress={progress}
            settings={settings}
            stats={stats}
            lastReadPosition={lastReadPosition}
            onReadQuran={() =>
              lastReadPosition
                ? handleResumeToPosition(lastReadPosition.surahNumber, lastReadPosition.ayahNumber)
                : setActiveTab('reading')
            }
            onResumeSurah={(surahNumber, ayahNumber) =>
              handleResumeToPosition(surahNumber, ayahNumber)
            }
            onUpdateSettings={handleUpdateSettings}
            onOpenSettings={() => setActiveTab('settings')}
            onChallengeComplete={(hasanat) => {
              setStats((prev) => ({
                ...prev,
                totalAyahsRead: prev.totalAyahsRead + 1,
              }));
            }}
            isDark={isDark}
          />
        )}

        {/* Tab 2: Full Quran Reader (Swipeable Ayah Cards with Auto-Resume) */}
        {(activeTab === 'reading' || activeTab === 'quran') && (
          <QuranReader
            initialSurahNumber={readerNavigationTarget.surahNumber}
            initialAyahNumber={readerNavigationTarget.ayahNumber}
            navigationTimestamp={readerNavigationTarget.timestamp}
            readAyahKeys={readAyahKeys}
            onToggleAyahRead={handleToggleAyahRead}
            onAutoMarkAyahRead={handleAutoMarkAyahRead}
            onPositionBookmark={handlePositionBookmark}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            todayTarget={progress.targetQuota || settings.dailyQuota}
            todayReadCount={progress.readAyahs.length}
            streak={stats.currentStreak}
            isDark={isDark}
            onExitReader={() => setActiveTab('home')}
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}

        {/* Tab 3: Curated Daily Azkar & Duas (Explore Tab) */}
        {(activeTab === 'explore' || activeTab === 'azkar') && (
          <AzkarModule
            settings={settings}
            isDark={isDark}
            onReturnHome={() => setActiveTab('home')}
            onOpenSettings={() => setActiveTab('settings')}
            onAzkarProgress={(completedCount, hasanat) => {
              setStats((prev) => ({
                ...prev,
                totalAyahsRead: prev.totalAyahsRead + completedCount,
              }));
            }}
          />
        )}

        {/* Tab 4: Habit Progress & Community Leaderboard */}
        {(activeTab === 'leaderboard' || activeTab === 'progress') && (
          <ProgressTracker
            stats={stats}
            settings={settings}
            todayCompleted={progress.isCompleted}
            isDark={isDark}
            initialView="leaderboard"
          />
        )}

        {/* Tab 5: Complete Settings View */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            stats={stats}
            onResetData={handleResetAllData}
            onResumeSurah={handleResumeToPosition}
            onTestNotification={handleTestNotification}
            isDark={isDark}
            onClose={() => setActiveTab('home')}
          />
        )}
      </AndroidFrame>

      {/* First-time User Onboarding Modal (strictly unmounted when navigating to other tabs) */}
      {showOnboarding && activeTab === 'home' && (
        <OnboardingModal
          isOpen={true}
          onClose={() => {
            setShowOnboarding(false);
            markOnboardingCompleted(settings.dailyQuota || 5);
          }}
          onComplete={(newSettings) => {
            handleUpdateSettings(newSettings);
            setShowOnboarding(false);
            markOnboardingCompleted(newSettings.dailyQuota || 5, newSettings.userName);
          }}
          isDark={isDark}
        />
      )}

      {/* Reminder & Schedule Settings Modal */}
      <ReminderSettingsModal
        isOpen={showSettingsModal}
        onClose={handleCloseSettingsModal}
        settings={settings}
        onSave={(updated) => handleUpdateSettings(updated)}
        onTestNotification={handleTestNotification}
        isDark={isDark}
      />
    </div>
  );
}
