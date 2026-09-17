import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Calendar,
  Check,
  Flame,
  Milestone,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Medal,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { HabitSettings, HabitStats } from '../types';
import { getDateOffset } from '../services/storageService';

interface ProgressTrackerProps {
  stats: HabitStats;
  settings: HabitSettings;
  todayCompleted: boolean;
  isDark: boolean;
  initialView?: 'leaderboard' | 'milestones';
}

interface LeaderboardMember {
  rank: number;
  name: string;
  avatar: string;
  avatarBg: string;
  streak: number;
  ayahsRead: number;
  tier: string;
  hasShield: boolean;
  isUser?: boolean;
}

const MOCK_LEADERBOARD_MEMBERS: LeaderboardMember[] = [
  {
    rank: 1,
    name: 'Tariq Al-Mansoor',
    avatar: 'TM',
    avatarBg: 'bg-amber-500 text-slate-950',
    streak: 52,
    ayahsRead: 480,
    tier: 'Diamond Hafiz',
    hasShield: true,
  },
  {
    rank: 2,
    name: 'Maryam Zahra',
    avatar: 'MZ',
    avatarBg: 'bg-emerald-500 text-slate-950',
    streak: 46,
    ayahsRead: 425,
    tier: 'Gold Muqri',
    hasShield: true,
  },
  {
    rank: 3,
    name: 'Zaid Khan',
    avatar: 'ZK',
    avatarBg: 'bg-purple-500 text-white',
    streak: 39,
    ayahsRead: 360,
    tier: 'Silver Qari',
    hasShield: false,
  },
  {
    rank: 4,
    name: 'Hussain Afridi (You)',
    avatar: 'HA',
    avatarBg: 'bg-[#5AD8B5] text-[#0B3327]',
    streak: 14,
    ayahsRead: 110,
    tier: 'Habit Builder',
    hasShield: true,
    isUser: true,
  },
  {
    rank: 5,
    name: 'Fatima Noor',
    avatar: 'FN',
    avatarBg: 'bg-rose-500 text-white',
    streak: 28,
    ayahsRead: 245,
    tier: 'Bronze Seeker',
    hasShield: true,
  },
  {
    rank: 6,
    name: 'Bilal Ahmed',
    avatar: 'BA',
    avatarBg: 'bg-teal-500 text-slate-950',
    streak: 21,
    ayahsRead: 195,
    tier: 'Consistent Reader',
    hasShield: false,
  },
  {
    rank: 7,
    name: 'Aisha Siddiqui',
    avatar: 'AS',
    avatarBg: 'bg-indigo-500 text-white',
    streak: 18,
    ayahsRead: 165,
    tier: 'Consistent Reader',
    hasShield: true,
  },
];

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  stats,
  settings,
  todayCompleted,
  isDark,
  initialView = 'leaderboard',
}) => {
  const [selectedTab, setSelectedTab] = useState<'leaderboard' | 'milestones'>(initialView);
  const TOTAL_QURAN_AYAHS = 6236;
  const totalRead = stats.totalAyahsRead;
  const overallPercentage = ((totalRead / TOTAL_QURAN_AYAHS) * 100).toFixed(2);

  // Daily quota completion forecast
  const dailyPace = settings.dailyQuota;
  const remainingAyahs = TOTAL_QURAN_AYAHS - totalRead;
  const daysToComplete = Math.ceil(remainingAyahs / dailyPace);
  const yearsToComplete = (daysToComplete / 365).toFixed(1);

  // Dynamic user name and initials
  const currentUserName = settings?.userName?.trim() || 'Hussain Afridi';
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'HA';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const userInitials = getInitials(currentUserName);

  // Dynamic leaderboard members mapping
  const leaderboardMembers = MOCK_LEADERBOARD_MEMBERS.map((m) =>
    m.isUser
      ? {
          ...m,
          name: `${currentUserName} (You)`,
          avatar: userInitials,
          streak: stats.currentStreak || m.streak,
          ayahsRead: stats.totalAyahsRead || m.ayahsRead,
        }
      : m
  );

  // Last 7 days check
  const last7Days = [-6, -5, -4, -3, -2, -1, 0].map((offset) => {
    const dateStr = getDateOffset(offset);
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = offset === 0;
    const ayahsRead = isToday
      ? todayCompleted
        ? settings.dailyQuota
        : stats.completionHistory[dateStr] || 0
      : stats.completionHistory[dateStr] || 0;
    const completed = ayahsRead >= settings.dailyQuota || (isToday && todayCompleted);

    return {
      dateStr,
      dayName,
      isToday,
      ayahsRead,
      completed,
    };
  });

  const badges = [
    { id: 'b1', name: 'First Step', desc: 'Read your first Ayahs', unlocked: totalRead >= 3 },
    { id: 'b2', name: '3-Day Spark', desc: 'Maintained a 3-day habit streak', unlocked: stats.currentStreak >= 3 || stats.longestStreak >= 3 },
    { id: 'b3', name: '7-Day Pillar', desc: 'A full week of uninterrupted reading', unlocked: stats.currentStreak >= 7 || stats.longestStreak >= 7 },
    { id: 'b4', name: 'Al-Mulk Guardian', desc: 'Read Surah Al-Mulk night verses', unlocked: totalRead >= 15 },
    { id: 'b5', name: 'Century Club', desc: 'Completed 100+ Holy Ayahs', unlocked: totalRead >= 100 },
  ];

  return (
    <div className="space-y-4 pb-32 sm:pb-36 select-none">
      {/* 1. TOP SEGMENTED SWITCHER: Community Leaderboard vs My Milestones */}
      <div className="p-1 rounded-2xl bg-[#150D2E] border border-purple-500/25 flex items-center gap-1 shadow-inner">
        <button
          type="button"
          onClick={() => setSelectedTab('leaderboard')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            selectedTab === 'leaderboard'
              ? 'bg-gradient-to-r from-purple-600 to-emerald-600 text-white shadow-md shadow-purple-950/50'
              : 'text-purple-300/60 hover:text-purple-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Community Leaderboard</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedTab('milestones')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            selectedTab === 'milestones'
              ? 'bg-gradient-to-r from-purple-600 to-emerald-600 text-white shadow-md shadow-purple-950/50'
              : 'text-purple-300/60 hover:text-purple-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>My Habits & Journey</span>
        </button>
      </div>

      {selectedTab === 'leaderboard' ? (
        <div className="space-y-4">
          {/* Top 3 Podium Card */}
          <div
            className={`rounded-3xl p-5 border relative overflow-hidden ${
              isDark
                ? 'bg-gradient-to-b from-[#1C1038] via-[#160B2E] to-[#0F0721] border-purple-500/30 shadow-xl'
                : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">
                    Weekly Habit Podium
                  </h3>
                  <p className="text-[11px] text-purple-300/80 font-medium">
                    Top consistent readers worldwide
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Ranks
              </span>
            </div>

            {/* 3-Column Visual Podium */}
            <div className="grid grid-cols-3 gap-2 pt-2 items-end">
              {/* 2nd Place: Silver */}
              <div className="text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-slate-300 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-slate-100 shadow-md mb-1.5 relative">
                  MZ
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-black flex items-center justify-center border border-white">
                    2
                  </span>
                </div>
                <div className="text-[11px] font-bold text-white truncate max-w-full">
                  Maryam Z.
                </div>
                <div className="text-[10px] font-extrabold text-amber-400 flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-amber-400" />
                  46d
                </div>
                <div className="w-full mt-2 h-16 rounded-t-2xl bg-gradient-to-t from-slate-700/60 to-slate-500/40 border-t border-slate-400/40 flex items-center justify-center text-xs font-black text-slate-200">
                  🥈 2nd
                </div>
              </div>

              {/* 1st Place: Gold Champion */}
              <div className="text-center flex flex-col items-center">
                <div className="w-15 h-15 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black text-base flex items-center justify-center border-3 border-amber-300 shadow-xl shadow-amber-500/30 mb-1.5 relative">
                  TM
                  <span className="absolute -bottom-1.5 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 text-[11px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                    👑
                  </span>
                </div>
                <div className="text-xs font-black text-amber-300 truncate max-w-full">
                  Tariq M.
                </div>
                <div className="text-[11px] font-extrabold text-amber-400 flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  52d
                </div>
                <div className="w-full mt-2 h-22 rounded-t-2xl bg-gradient-to-t from-amber-600/50 to-amber-400/40 border-t border-amber-400/50 flex items-center justify-center text-xs font-black text-amber-200 shadow-lg">
                  🥇 1st
                </div>
              </div>

              {/* 3rd Place: Bronze */}
              <div className="text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center border-2 border-amber-600 shadow-md mb-1.5 relative">
                  ZK
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-black flex items-center justify-center border border-white">
                    3
                  </span>
                </div>
                <div className="text-[11px] font-bold text-white truncate max-w-full">
                  Zaid K.
                </div>
                <div className="text-[10px] font-extrabold text-amber-400 flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-amber-400" />
                  39d
                </div>
                <div className="w-full mt-2 h-12 rounded-t-2xl bg-gradient-to-t from-amber-900/60 to-amber-700/40 border-t border-amber-600/40 flex items-center justify-center text-xs font-black text-amber-300">
                  🥉 3rd
                </div>
              </div>
            </div>
          </div>

          {/* User's Personal Community Standing Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-900/40 via-emerald-950/40 to-slate-900 border border-emerald-500/40 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#5AD8B5] text-[#0B3327] font-black text-sm flex items-center justify-center shadow-md">
                  {userInitials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">Your Rank: #4</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Top 5%
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200/90 mt-0.5">
                    {stats.currentStreak} Day Streak • {stats.totalAyahsRead} Total Ayahs
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Protection</span>
                <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  Shield Ready
                </span>
              </div>
            </div>
          </div>

          {/* Global Community Leaderboard Table */}
          <div
            className={`rounded-3xl p-4 border transition-all ${
              isDark ? 'bg-[#150B2D]/80 border-purple-500/20' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Global Quran Readers
                </h4>
              </div>
              <span className="text-[10px] text-purple-300 font-semibold">1,280+ Active Today</span>
            </div>

            <div className="space-y-2">
              {leaderboardMembers.map((member) => (
                <div
                  key={member.rank}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2.5 transition-all ${
                    member.isUser
                      ? 'bg-emerald-950/30 border-emerald-400/40 ring-1 ring-emerald-500/30 shadow-md'
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-5 text-center text-xs font-black ${
                        member.rank === 1
                          ? 'text-amber-400'
                          : member.rank === 2
                          ? 'text-slate-300'
                          : member.rank === 3
                          ? 'text-amber-600'
                          : 'text-purple-300'
                      }`}
                    >
                      #{member.rank}
                    </span>

                    <div
                      className={`w-8 h-8 rounded-full ${member.avatarBg} font-black text-xs flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      {member.avatar}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white truncate max-w-[130px]">
                          {member.name}
                        </span>
                        {member.hasShield && (
                          <ShieldCheck
                            className="w-3.5 h-3.5 text-amber-400 shrink-0"
                            title="Streak Shield Active"
                          />
                        )}
                      </div>
                      <span className="text-[10px] text-purple-300/80 font-medium block truncate">
                        {member.tier}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-xs font-black text-amber-400 justify-end">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{member.isUser ? stats.currentStreak : member.streak}d</span>
                    </div>
                    <span className="text-[10px] text-purple-300 font-medium block">
                      {member.isUser ? stats.totalAyahsRead : member.ayahsRead} Ayahs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Hero Streak Card */}
          <div
            className={`rounded-3xl p-6 border relative overflow-hidden transition-all ${
              isDark
                ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950/40 border-emerald-500/20 shadow-xl'
                : 'bg-gradient-to-br from-white via-emerald-50/50 to-emerald-100/30 border-emerald-100 shadow-lg'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                    Habit Momentum
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {stats.currentStreak}{' '}
                  <span className="text-lg font-bold text-slate-400">Day Streak</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Personal Best: <strong className="text-emerald-400">{stats.longestStreak} days</strong>{' '}
                  • Total Days Active:{' '}
                  <strong className="text-emerald-400">{stats.totalDaysActive} days</strong>
                </p>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                <Flame className="w-9 h-9 fill-amber-400 text-amber-400" />
              </div>
            </div>

            {/* 7-Day Visual Consistency Row */}
            <div className="mt-6 pt-5 border-t border-slate-700/30">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>7-Day Habit Consistency</span>
                </span>
                <span className="text-emerald-400 font-bold">
                  {last7Days.filter((d) => d.completed).length} / 7 Days Active
                </span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {last7Days.map((day) => (
                  <div key={day.dateStr} className="text-center space-y-1.5">
                    <div
                      className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        day.completed
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/30 ring-2 ring-emerald-400/40'
                          : day.isToday
                          ? 'border-2 border-dashed border-emerald-500/60 bg-emerald-500/10 text-emerald-400'
                          : isDark
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {day.completed ? <Check className="w-4 h-4 stroke-[3]" /> : day.isToday ? '•' : ''}
                    </div>
                    <span
                      className={`text-[10px] block font-semibold ${
                        day.isToday ? 'text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {day.dayName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overall Quran Completion Progress Card */}
          <div
            className={`rounded-3xl p-5 sm:p-6 border transition-all ${
              isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white">Quran Completion Journey</h3>
                  <p className="text-[11px] text-slate-400">Total 6,236 Ayahs across 114 Surahs</p>
                </div>
              </div>
              <span className="text-sm font-black text-emerald-400">{overallPercentage}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-slate-700/40 overflow-hidden my-3">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000"
                style={{ width: `${Math.max(1, parseFloat(overallPercentage))}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div
                className={`p-3 rounded-2xl border ${
                  isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[11px] text-slate-400 block">Ayahs Completed</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {totalRead}{' '}
                  <span className="text-xs font-normal text-slate-400">/ 6,236</span>
                </span>
              </div>

              <div
                className={`p-3 rounded-2xl border ${
                  isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[11px] text-slate-400 block">Pace Estimation</span>
                <span className="text-base font-extrabold text-amber-400">
                  ~{yearsToComplete} yrs{' '}
                  <span className="text-[10px] font-normal text-slate-400">(@ {dailyPace}/day)</span>
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 italic text-center">
              "Recite the Quran, for it will come on the Day of Resurrection as an intercessor for its companions." (Sahih Muslim)
            </p>
          </div>

          {/* Habit Milestones & Badges */}
          <div
            className={`rounded-3xl p-5 sm:p-6 border transition-all ${
              isDark ? 'bg-slate-800/70 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold tracking-tight text-white">Milestones & Achievements</h3>
            </div>

            <div className="space-y-2.5">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                    badge.unlocked
                      ? isDark
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-emerald-50 border-emerald-200'
                      : isDark
                      ? 'bg-slate-900/40 border-slate-800 opacity-60'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        badge.unlocked
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          badge.unlocked ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {badge.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">{badge.desc}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      badge.unlocked
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700/30 text-slate-500'
                    }`}
                  >
                    {badge.unlocked ? 'Unlocked' : 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
