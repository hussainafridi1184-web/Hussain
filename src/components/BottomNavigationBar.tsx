import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  BookOpen,
  Compass,
  Trophy,
  Settings,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface BottomNavigationBarProps {
  activeTab: NavigationTab | 'habit' | 'quran' | 'azkar' | 'progress';
  onTabChange: (tab: NavigationTab) => void;
  isDark?: boolean;
}

interface NavItemConfig {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'reading', label: 'Reading', icon: BookOpen },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeTab,
  onTabChange,
  isDark = true,
}) => {
  // Map legacy internal tab aliases to primary NavigationTab
  const currentTab: NavigationTab = (() => {
    if (activeTab === 'habit') return 'home';
    if (activeTab === 'quran') return 'reading';
    if (activeTab === 'azkar') return 'explore';
    if (activeTab === 'progress') return 'leaderboard';
    return activeTab as NavigationTab;
  })();

  return (
    <div
      id="fixed-bottom-nav-container"
      className="fixed bottom-0 left-0 right-0 z-[999] pointer-events-none flex justify-center w-full"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
      }}
    >
      <nav
        id="bottom-navigation-bar"
        aria-label="Main Navigation"
        className={`w-full max-w-md mx-auto pointer-events-auto rounded-t-[26px] sm:rounded-t-[30px] border-t backdrop-blur-2xl shadow-[0_-12px_40px_rgba(0,0,0,0.7)] select-none relative overflow-hidden transition-all duration-300 ${
          isDark
            ? 'bg-[#0D071E]/92 border-purple-500/25 text-purple-200'
            : 'bg-white/95 border-slate-200/80 text-slate-700 shadow-slate-400/20'
        }`}
      >
        {/* Subtle top glowing hairline gradient */}
        <div
          className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-400/70 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* Subtle ambient backlight aura */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-12 bg-purple-600/15 rounded-full blur-xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Main Tab Items Grid */}
        <div className="flex items-center justify-around px-2 pt-2 pb-1 relative z-10">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                id={`bottom-nav-${item.id}-btn`}
                type="button"
                onClick={() => onTabChange(item.id)}
                className="relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl group transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                {/* Active Capsule Fill / Icon Holder */}
                <div
                  className={`relative px-3 py-1.5 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? isDark
                        ? 'bg-gradient-to-b from-purple-500/35 to-emerald-500/20 text-emerald-300 border border-purple-400/40 shadow-[0_0_16px_rgba(168,85,247,0.35)]'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-300/60 shadow-sm'
                      : isDark
                      ? 'text-purple-300/50 hover:text-purple-200 group-hover:bg-white/5'
                      : 'text-slate-400 hover:text-slate-700 group-hover:bg-slate-100'
                  }`}
                >
                  {/* Motion active layout pill for seamless transition between tabs */}
                  {isActive && (
                    <motion.div
                      layoutId="activeBottomNavPill"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-500/20 via-purple-600/10 to-transparent pointer-events-none"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`}
                  />
                </div>

                {/* Typography Label */}
                <span
                  className={`text-[10px] sm:text-[11px] tracking-tight mt-1 transition-colors duration-200 whitespace-nowrap leading-none ${
                    isActive
                      ? isDark
                        ? 'font-black text-white'
                        : 'font-black text-slate-900'
                      : isDark
                      ? 'font-semibold text-purple-300/50 group-hover:text-purple-200'
                      : 'font-medium text-slate-400 group-hover:text-slate-700'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active Tab Indicator: Glowing Dot */}
                <div className="h-1.5 flex items-center justify-center mt-1">
                  {isActive ? (
                    <motion.div
                      layoutId="activeBottomNavDot"
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  ) : (
                    <div className="w-1.5 h-1.5 opacity-0 pointer-events-none" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Android / Device Safe-Area & Gesture Pill */}
        <div
          className="flex items-center justify-center pt-0.5 pb-1 select-none"
          style={{
            paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom, 0.35rem))',
          }}
        >
          <div
            className={`w-28 h-1 rounded-full transition-colors ${
              isDark ? 'bg-white/20 hover:bg-white/30' : 'bg-slate-300 hover:bg-slate-400'
            }`}
          />
        </div>
      </nav>
    </div>
  );
};
