import React, { useState, useEffect } from 'react';
import {
  Battery,
  Bell,
  BookOpen,
  CheckCircle2,
  Flame,
  LayoutGrid,
  Moon,
  Settings,
  Smartphone,
  Sparkles,
  Sun,
  Volume2,
  Wifi,
} from 'lucide-react';
import { HabitSettings, HabitStats, NavigationTab } from '../types';
import { BottomNavigationBar } from './BottomNavigationBar';

interface AndroidFrameProps {
  children: React.ReactNode;
  activeTab: NavigationTab | 'habit' | 'quran' | 'azkar' | 'progress';
  onTabChange: (tab: NavigationTab) => void;
  settings: HabitSettings;
  stats: HabitStats;
  todayCompleted: boolean;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onTestNotification: () => void;
  isDark: boolean;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  activeTab,
  onTabChange,
  settings,
  stats,
  todayCompleted,
  onOpenSettings,
  onToggleTheme,
  onTestNotification,
  isDark,
}) => {
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('10:05');

  // Live phone clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col items-center justify-start p-0 sm:p-4 md:p-6 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Frame / Responsive Switcher Header for Desktop */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-3 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium text-emerald-500">
          <Smartphone className="w-3.5 h-3.5" />
          <span>Android Jetpack Compose UI</span>
        </div>
        <button
          type="button"
          onClick={() => setDeviceFrameMode(!deviceFrameMode)}
          className={`px-2.5 py-1 rounded-lg border transition-colors ${
            isDark
              ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300'
              : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
          }`}
        >
          {deviceFrameMode ? 'Expand Full View' : 'Phone Frame Mode'}
        </button>
      </div>

      {/* Main Android Container */}
      <div
        className={`w-full relative flex flex-col overflow-hidden transition-all duration-300 ${
          deviceFrameMode
            ? 'max-w-md sm:rounded-[42px] sm:border-[8px] shadow-2xl sm:min-h-[840px] sm:max-h-[92vh]'
            : 'max-w-4xl rounded-2xl border min-h-[90vh]'
        } ${
          isDark
            ? 'bg-slate-950 border-slate-800 shadow-emerald-950/40'
            : 'bg-white border-slate-200 shadow-slate-300'
        }`}
      >
        {/* Android Status Bar (Camera punch-hole, time, signal, battery) */}
        <div
          className={`pt-2.5 pb-1 px-6 flex items-center justify-between text-[11px] font-semibold select-none shrink-0 ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          {/* Time & App Indicator */}
          <div className="flex items-center gap-2">
            <span>{currentTime}</span>
            <div className="w-1 h-1 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-emerald-500 font-bold">QuranHabit</span>
          </div>

          {/* Android Camera Punch Hole (in frame mode) */}
          {deviceFrameMode && (
            <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
            </div>
          )}

          {/* Icons: WiFi, Signal, Battery */}
          <div className="flex items-center gap-2">
            {todayCompleted && (
              <span className="text-emerald-400" title="Alarms dismissed for today">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-1">
              <span className="text-[10px]">98%</span>
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Top App Bar (Hidden in dedicated Quran Reading View, Azkar View, and Home Habit Dashboard) */}
        {activeTab !== 'quran' && activeTab !== 'habit' && activeTab !== 'azkar' && (
          <header
            className={`px-4 py-2.5 border-b flex items-center justify-between shrink-0 transition-colors ${
              isDark
                ? 'border-slate-800/80 bg-slate-950/80 backdrop-blur-sm'
                : 'border-slate-100 bg-white/80 backdrop-blur-sm'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-900/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-sm tracking-tight">QuranHabit</h1>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                    Daily
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Daily Ayah Reminder & Tracker</p>
              </div>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1">
              {/* Streak Pill */}
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                  isDark
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{stats.currentStreak}d</span>
              </div>

              {/* Test Alarm Sound Chime Button */}
              <button
                id="header-test-chime-btn"
                onClick={onTestNotification}
                className={`p-2 rounded-xl transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-900'
                    : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                }`}
                title="Test Push Notification & Chime"
                aria-label="Test Notification"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {/* Dark / Light Toggle */}
              <button
                id="header-theme-toggle-btn"
                onClick={onToggleTheme}
                className={`p-2 rounded-xl transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-amber-400 hover:bg-slate-900'
                    : 'text-slate-600 hover:text-amber-600 hover:bg-slate-100'
                }`}
                title="Toggle Dark/Light Mode"
                aria-label="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Settings Button */}
              <button
                id="header-settings-btn"
                onClick={onOpenSettings}
                className={`p-2 rounded-xl transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Reminder Settings"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </header>
        )}

        {/* Scrollable Content Viewport (Locked non-scrolling flex container for QuranReader & AzkarModule, scrollable for others) */}
        <main
          className={`flex-1 relative min-h-0 ${
            activeTab === 'reading' || activeTab === 'quran' || activeTab === 'explore' || activeTab === 'azkar'
              ? 'p-2 sm:p-2.5 flex flex-col overflow-hidden bg-gradient-to-b from-[#1C1335] via-[#1D1438] to-[#120B24]'
              : activeTab === 'home' || activeTab === 'habit'
              ? 'overflow-y-auto px-4 py-3 sm:px-5 bg-gradient-to-b from-[#0E0720] via-[#120928] to-[#0A0518] scrollbar-thin'
              : 'overflow-y-auto p-4 sm:p-5'
          }`}
        >
          {children}
        </main>

        {/* Modern Fixed Floating Glassmorphism Bottom Navigation Bar */}
        <BottomNavigationBar
          activeTab={activeTab}
          onTabChange={onTabChange}
          isDark={isDark}
        />
      </div>
    </div>
  );
};
