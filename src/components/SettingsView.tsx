import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Bell,
  BookOpen,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronRight,
  FileCheck,
  FileText,
  Globe,
  Heart,
  HelpCircle,
  Info,
  LogOut,
  Moon,
  Palette,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sliders,
  Smartphone,
  Sparkles,
  Star,
  Sun,
  Trash2,
  User,
  Volume2,
  X,
} from 'lucide-react';
import {
  AppAppearance,
  GenderSelection,
  HabitSettings,
  HabitStats,
  PersonalNote,
  ReadingTheme,
  SavedItem,
  ScriptType,
  VibrationLevel,
} from '../types';
import {
  loadBookmarksList,
  loadFavourites,
  loadNotes,
  saveBookmarksList,
  saveFavourites,
  saveNotes,
} from '../services/storageService';

interface SettingsViewProps {
  settings: HabitSettings;
  onUpdateSettings: (newSettings: Partial<HabitSettings>) => void;
  stats: HabitStats;
  onResetData: () => void;
  onResumeSurah?: (surahNumber: number, ayahNumber: number) => void;
  onTestNotification: () => void;
  isDark: boolean;
  onClose?: () => void;
}

type SettingsSubView =
  | 'menu'
  | 'account_settings'
  | 'favourites'
  | 'bookmarks'
  | 'notes'
  | 'appearance'
  | 'language'
  | 'support'
  | 'terms'
  | 'privacy';

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  stats,
  onResetData,
  onResumeSurah,
  onTestNotification,
  isDark,
  onClose,
}) => {
  const [currentView, setCurrentView] = useState<SettingsSubView>('menu');
  const [favourites, setFavourites] = useState<SavedItem[]>(loadFavourites);
  const [bookmarks, setBookmarks] = useState<SavedItem[]>(loadBookmarksList);
  const [notes, setNotes] = useState<PersonalNote[]>(loadNotes);

  // New Note Modal state
  const [showAddNote, setShowAddNote] = useState<boolean>(false);
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteSurah, setNoteSurah] = useState<number>(1);
  const [noteAyah, setNoteAyah] = useState<number>(1);

  // Confirmation Modals
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Custom Alert Time Input Modal
  const [showCustomTimeInput, setShowCustomTimeInput] = useState<boolean>(false);
  const [customTimeValue, setCustomTimeValue] = useState<string>('07:30');

  // Profile Name state
  const currentUserName = settings.userName?.trim() || '';
  const [nameInput, setNameInput] = useState<string>(currentUserName);
  const [nameSaved, setNameSaved] = useState<boolean>(false);

  // Sync state if settings prop changes externally
  useEffect(() => {
    setNameInput(settings.userName?.trim() || '');
  }, [settings.userName]);

  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'QH';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const userInitials = getInitials(currentUserName);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    onUpdateSettings({ userName: trimmed });
    try {
      if (trimmed) {
        localStorage.setItem('quranhabit_user_name', trimmed);
      } else {
        localStorage.removeItem('quranhabit_user_name');
        localStorage.removeItem('quranhabit_profile_name');
      }
    } catch (_) {}
    setNameSaved(true);
    triggerHaptic('medium');
    showToast(trimmed ? `Profile name updated to "${trimmed}"` : 'Profile name cleared (using generic greeting)');
    setTimeout(() => setNameSaved(false), 2500);
  };

  // Helper to show transient toast message
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Trigger vibration haptic feedback if enabled
  const triggerHaptic = (level: VibrationLevel = settings.vibrationLevel || 'high') => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      if (level === 'low') navigator.vibrate?.([15]);
      else if (level === 'medium') navigator.vibrate?.([30]);
      else if (level === 'high') navigator.vibrate?.([50]);
    }
  };

  // Add Note handler
  const handleSaveNewNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newNote: PersonalNote = {
      id: `note-${Date.now()}`,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      surahNumber: Number(noteSurah) || 1,
      ayahNumber: Number(noteAyah) || 1,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setShowAddNote(false);
    setNoteTitle('');
    setNoteContent('');
    showToast('Reflection note saved successfully');
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
    showToast('Note deleted');
  };

  const handleDeleteFavourite = (id: string) => {
    const updated = favourites.filter((f) => f.id !== id);
    setFavourites(updated);
    saveFavourites(updated);
    showToast('Removed from favourites');
  };

  const handleDeleteBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarks(updated);
    saveBookmarksList(updated);
    showToast('Bookmark removed');
  };

  const handleSelectTimeAlert = (timeStr: string) => {
    triggerHaptic();
    const currentTimes = settings.alertTimes || ['09:00', '12:00', '15:00', '18:00'];
    let updated: string[];
    if (currentTimes.includes(timeStr)) {
      if (currentTimes.length <= 1) {
        showToast('At least one alert time must remain active');
        return;
      }
      updated = currentTimes.filter((t) => t !== timeStr);
    } else {
      updated = [...currentTimes, timeStr].sort();
    }
    onUpdateSettings({ alertTimes: updated });
    showToast(`Alerts updated (${updated.length} scheduled)`);
  };

  const handleAddCustomAlertTime = () => {
    if (!customTimeValue) return;
    triggerHaptic();
    const currentTimes = settings.alertTimes || ['09:00', '12:00', '15:00', '18:00'];
    if (!currentTimes.includes(customTimeValue)) {
      const updated = [...currentTimes, customTimeValue].sort();
      onUpdateSettings({ alertTimes: updated });
      showToast(`Added custom alert at ${customTimeValue}`);
    }
    setShowCustomTimeInput(false);
  };

  const scriptChoices: {
    id: ScriptType;
    name: string;
    description: string;
    sampleFont: string;
    sampleText: string;
  }[] = [
    {
      id: 'uthmani',
      name: 'Madina',
      description: 'Traditional King Fahd Complex Uthmani script',
      sampleFont: 'font-serif',
      sampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    },
    {
      id: 'indopak',
      name: 'Indo-Pak Script',
      description: 'Classical Nastaliq widely read in the Indian subcontinent',
      sampleFont: 'font-serif tracking-wide',
      sampleText: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ',
    },
    {
      id: 'tajweed',
      name: 'Kitab Regular - Tajweed',
      description: 'Color-accented Tajweed rules with pronunciation guides',
      sampleFont: 'font-serif font-bold text-emerald-300',
      sampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    },
    {
      id: 'kitab_old',
      name: 'Kitab Regular - Old',
      description: 'Archaic classical Naskh typography from historic mushafs',
      sampleFont: 'font-serif italic',
      sampleText: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    },
    {
      id: 'word_by_word',
      name: 'Word By Word Quran',
      description: 'Segmented individual word breakdown with grammatical tags',
      sampleFont: 'font-mono text-purple-300',
      sampleText: 'بِسْمِ • اللَّهِ • الرَّحْمَٰنِ • الرَّحِيمِ',
    },
  ];

  const reciters = [
    { id: 'ar.alafasy', name: 'Sheikh Mishary Al Afasy', origin: 'Kuwait • Soothing Murattal' },
    { id: 'ar.muaiqly', name: 'Sheikh Maher Muaiqly', origin: 'Makkah • Emotional Recitation' },
    { id: 'ar.sudais', name: 'Abdur-Rahman as-Sudais', origin: 'Makkah • Distinctive Reverent Pace' },
    { id: 'ar.alghamdi', name: 'Sheikh Saad Al-Ghamdi', origin: 'Dammam • Clear Melodic Cadence' },
    { id: 'ar.minshawi', name: 'Sheikh Minshawi', origin: 'Egypt • Classical Reverence' },
  ];

  const readingThemes: {
    id: ReadingTheme;
    name: string;
    bgClass: string;
    accentClass: string;
    borderClass: string;
  }[] = [
    {
      id: 'royal_purple',
      name: 'Royal Purple',
      bgClass: 'from-[#120926] to-[#0A0518]',
      accentClass: 'bg-purple-500',
      borderClass: 'border-purple-500/40',
    },
    {
      id: 'sunset_amber',
      name: 'Sunset Amber',
      bgClass: 'from-[#1F130B] to-[#120B04]',
      accentClass: 'bg-amber-500',
      borderClass: 'border-amber-500/40',
    },
    {
      id: 'rose_quartz',
      name: 'Rose Quartz',
      bgClass: 'from-[#1E0F1B] to-[#11070F]',
      accentClass: 'bg-rose-400',
      borderClass: 'border-rose-400/40',
    },
    {
      id: 'ocean_blue',
      name: 'Ocean Blue',
      bgClass: 'from-[#0A1628] to-[#040C17]',
      accentClass: 'bg-cyan-400',
      borderClass: 'border-cyan-400/40',
    },
    {
      id: 'fresh_leaf',
      name: 'Fresh Leaf',
      bgClass: 'from-[#091D13] to-[#040F09]',
      accentClass: 'bg-emerald-400',
      borderClass: 'border-emerald-400/40',
    },
  ];

  const motivationalQuotes: { [quota: number]: string } = {
    1: '“The most beloved deeds to Allah are those that are most consistent, even if they are small.” — Sahih Bukhari 6464',
    3: '“Whoever reads a letter from the Book of Allah will have a reward, and that reward is multiplied by ten.” — Jami` at-Tirmidhi 2910',
    5: '“Verily in the remembrance of Allah do hearts find rest.” — Surah Ar-Ra’d 13:28',
    10: '“The one who recites the Quran beautifully, smoothly, and precisely will be in the company of the noble and obedient angels.” — Sahih Muslim 798',
  };

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'ar', name: 'Arabic', native: 'العَرَبِية' },
    { code: 'ur', name: 'Urdu', native: 'اُردُو' },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe' },
    { code: 'fr', name: 'French', native: 'Français' },
    { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
  ];

  // ==========================================
  // RENDER SUB-PAGE: ACCOUNT SETTINGS
  // ==========================================
  const renderAccountSettings = () => {
    const currentScript = settings.preferredScript || 'uthmani';
    const currentSpeed = settings.audioSpeed || 1.0;
    const arabicSize = settings.arabicFontSize || 30;
    const translationSize = settings.translationFontSize || 14;
    const transliterationSize = settings.transliterationFontSize || 13;
    const currentQuota = settings.dailyQuota || 5;
    const currentTheme = settings.readingTheme || 'royal_purple';
    const alertTimes = settings.alertTimes || ['09:00', '12:00', '15:00', '18:00'];

    return (
      <div className="space-y-6 pb-28">
        {/* 0. Profile Name Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
          <div className="flex items-center gap-2 text-purple-300">
            <User className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold tracking-wide">Profile Name</h3>
          </div>
          <p className="text-xs text-slate-400">
            Enter your name to personalize your daily Quran habit greeting and progress.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <div className="relative flex-1">
              <User className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="account-settings-profile-name-input"
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setNameSaved(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveName();
                  }
                }}
                placeholder="Enter your name..."
                maxLength={40}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-purple-950/60 border border-purple-400/30 text-white placeholder-purple-400/50 text-xs font-bold focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all"
              />
            </div>
            <button
              id="account-save-profile-name-btn"
              type="button"
              onClick={handleSaveName}
              disabled={!nameInput.trim()}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md ${
                nameSaved
                  ? 'bg-emerald-600 text-white border border-emerald-400/40'
                  : nameInput.trim() !== currentUserName
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 shadow-emerald-500/20'
                  : 'bg-purple-600/50 hover:bg-purple-600 text-white border border-purple-500/40 active:scale-95'
              }`}
            >
              {nameSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>

        {/* 1. Alerts & Reminder Time Selection Grid */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300">
              <Bell className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold tracking-wide">Daily Alert Times</h3>
            </div>
            <button
              onClick={onTestNotification}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
            >
              Test Alert
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Select daily times to receive gentle reminder chimes. Tap to toggle slots.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {['09:00', '12:00', '15:00', '18:00'].map((time) => {
              const active = alertTimes.includes(time);
              const label =
                time === '09:00'
                  ? '9:00 AM'
                  : time === '12:00'
                  ? '12:00 PM'
                  : time === '15:00'
                  ? '3:00 PM'
                  : '6:00 PM';
              return (
                <button
                  key={time}
                  type="button"
                  id={`alert-grid-${time.replace(':', '')}-btn`}
                  onClick={() => handleSelectTimeAlert(time)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                    active
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 shadow-sm shadow-purple-900/40'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{label}</span>
                  {active ? (
                    <Check className="w-3.5 h-3.5 text-purple-400" />
                  ) : (
                    <span className="w-3 h-3 rounded-full border border-slate-600" />
                  )}
                </button>
              );
            })}

            {/* "Choose another time" button */}
            <button
              type="button"
              id="choose-custom-alert-time-btn"
              onClick={() => setShowCustomTimeInput(true)}
              className="col-span-2 sm:col-span-2 py-2 px-3 rounded-xl border border-dashed border-purple-400/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Choose another time</span>
            </button>
          </div>

          {alertTimes.some((t) => !['09:00', '12:00', '15:00', '18:00'].includes(t)) && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-400 self-center mr-1">Custom:</span>
              {alertTimes
                .filter((t) => !['09:00', '12:00', '15:00', '18:00'].includes(t))
                .map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-200 border border-purple-700/50 text-[11px]"
                  >
                    {t}
                    <button
                      onClick={() => handleSelectTimeAlert(t)}
                      className="hover:text-red-300 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* 2. Notification Channels Toggles */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-purple-300">
            <Smartphone className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold tracking-wide">Notification Channels</h3>
          </div>

          <div className="divide-y divide-white/5 space-y-1">
            {[
              {
                id: 'notificationsAll',
                label: 'All Notifications',
                desc: 'Master toggle for all push alerts and audio chimes',
                val: settings.notificationsAll !== false,
              },
              {
                id: 'notificationsDoseOfQuran',
                label: 'Dose of Quran',
                desc: 'Daily ayah inspiration and contextual reflection prompts',
                val: settings.notificationsDoseOfQuran !== false,
              },
              {
                id: 'notificationsFriends',
                label: 'Friends & Community',
                desc: 'Alerts when friends in your circle complete their daily quota',
                val: !!settings.notificationsFriends,
              },
              {
                id: 'notificationsReminders',
                label: 'Habit Reminders',
                desc: 'Scheduled reminders matching your daily time targets',
                val: settings.notificationsReminders !== false,
              },
            ].map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                  <div className="text-[11px] text-slate-400">{item.desc}</div>
                </div>
                <button
                  type="button"
                  id={`toggle-${item.id}-btn`}
                  onClick={() => {
                    triggerHaptic();
                    onUpdateSettings({ [item.id]: !item.val });
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    item.val ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-md"
                    animate={{ x: item.val ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Reciter Selection & Audio Speed Adjustment */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold tracking-wide">Reciter & Playback</h3>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              {currentSpeed}x Speed
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-medium text-slate-300">Featured Qari Voice:</label>
            <div className="space-y-1.5">
              {reciters.map((r) => {
                const isSelected = settings.preferredReciter === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    id={`reciter-${r.id.replace('.', '-')}-btn`}
                    onClick={() => {
                      triggerHaptic();
                      onUpdateSettings({ preferredReciter: r.id });
                      showToast(`Selected ${r.name}`);
                    }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm shadow-purple-900/40'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5">
                        {r.name}
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <div className="text-[10px] text-slate-400">{r.origin}</div>
                    </div>
                    <Play className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-300' : 'text-slate-500'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Speed Slider */}
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Recitation Speed</span>
              <span className="font-bold text-purple-300">{currentSpeed}x</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  id={`audio-speed-${spd}x-btn`}
                  onClick={() => {
                    triggerHaptic();
                    onUpdateSettings({ audioSpeed: spd });
                  }}
                  className={`py-1.5 rounded-lg border text-xs font-bold text-center transition-all ${
                    currentSpeed === spd
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Quran Script Selector with Dynamic Arabic Preview */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold tracking-wide">Quran Script Selector</h3>
            </div>
          </div>

          {/* Live Arabic Preview Box */}
          <div className="p-4 rounded-xl bg-[#0B0616] border border-purple-500/30 text-center space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-purple-400/80 font-bold">
              Dynamic Script Preview
            </span>
            <div
              dir="rtl"
              className="text-2xl sm:text-3xl py-1 transition-all duration-200"
              style={{
                fontFamily:
                  currentScript === 'indopak'
                    ? 'serif'
                    : currentScript === 'tajweed'
                    ? 'serif'
                    : 'inherit',
                color: currentScript === 'tajweed' ? '#34d399' : '#f8fafc',
                letterSpacing: currentScript === 'word_by_word' ? '0.15em' : 'normal',
              }}
            >
              {scriptChoices.find((s) => s.id === currentScript)?.sampleText ||
                'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ'}
            </div>
            <div className="text-[11px] text-slate-400">
              Selected:{' '}
              <span className="text-purple-300 font-semibold">
                {scriptChoices.find((s) => s.id === currentScript)?.name}
              </span>
            </div>
          </div>

          {/* Choices */}
          <div className="space-y-2 pt-1">
            {scriptChoices.map((s) => {
              const isSelected = currentScript === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  id={`script-${s.id}-btn`}
                  onClick={() => {
                    triggerHaptic();
                    onUpdateSettings({ preferredScript: s.id });
                    showToast(`Active Script: ${s.name}`);
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-purple-600/30 border-purple-500 text-white shadow-sm shadow-purple-900/40'
                      : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold flex items-center gap-2">
                      {s.name}
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{s.description}</div>
                  </div>
                  <div dir="rtl" className="text-sm font-serif text-slate-300">
                    {s.sampleText.slice(0, 14)}...
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Daily Quran Goal with Motivational Highlight Box */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold tracking-wide">Daily Quran Goal</h3>
            </div>
            <span className="text-xs font-bold text-emerald-400">{currentQuota} Verses / day</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 5, 10].map((quota) => {
              const active = currentQuota === quota;
              return (
                <button
                  key={quota}
                  type="button"
                  id={`daily-goal-${quota}-btn`}
                  onClick={() => {
                    triggerHaptic();
                    onUpdateSettings({ dailyQuota: quota });
                    showToast(`Daily Goal updated to ${quota} Verses`);
                  }}
                  className={`py-3 px-2 rounded-2xl border text-center transition-all ${
                    active
                      ? 'bg-purple-600 border-purple-400 text-white font-bold shadow-lg shadow-purple-950/50 scale-102'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="text-base font-black">{quota}</div>
                  <div className="text-[10px] uppercase tracking-wider">{quota === 1 ? 'Ayah' : 'Ayahs'}</div>
                </button>
              );
            })}
          </div>

          {/* Motivational Quote Highlight Box */}
          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs italic text-purple-200/90 leading-relaxed">
            {motivationalQuotes[currentQuota] || motivationalQuotes[5]}
          </div>
        </div>

        {/* 6. Font Size Customizer with Live Dynamic Preview */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-purple-300">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold tracking-wide">Font Size Customizer</h3>
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Quranic Script Size</span>
                <span className="font-bold text-purple-300">{arabicSize}px</span>
              </div>
              <input
                id="arabic-font-size-slider"
                type="range"
                min={22}
                max={42}
                step={2}
                value={arabicSize}
                onChange={(e) => onUpdateSettings({ arabicFontSize: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Translation Size</span>
                <span className="font-bold text-purple-300">{translationSize}px</span>
              </div>
              <input
                id="translation-font-size-slider"
                type="range"
                min={12}
                max={20}
                step={1}
                value={translationSize}
                onChange={(e) => onUpdateSettings({ translationFontSize: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Transliteration Size</span>
                <span className="font-bold text-purple-300">{transliterationSize}px</span>
              </div>
              <input
                id="transliteration-font-size-slider"
                type="range"
                min={11}
                max={18}
                step={1}
                value={transliterationSize}
                onChange={(e) => onUpdateSettings({ transliterationFontSize: Number(e.target.value) })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Live Dynamic Preview */}
          <div className="p-4 rounded-xl bg-[#0B0616] border border-white/10 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-400">Live Typography Preview:</div>
            <div
              dir="rtl"
              style={{ fontSize: `${arabicSize}px`, lineHeight: 1.6 }}
              className="text-white font-serif text-center py-1"
            >
              الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
            </div>
            <div
              style={{ fontSize: `${transliterationSize}px` }}
              className="text-purple-300/80 italic text-center"
            >
              Al-hamdu lillahi rabbi l-alameen
            </div>
            <div
              style={{ fontSize: `${translationSize}px` }}
              className="text-slate-300 text-center leading-relaxed"
            >
              [All] praise is [due] to Allah, Lord of the worlds.
            </div>
          </div>
        </div>

        {/* 7. Vibration Settings */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-300">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold tracking-wide">Vibration & Haptics</h3>
            </div>
            <span className="text-xs font-semibold text-slate-300 uppercase">
              {settings.vibrationLevel || 'High'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {(['off', 'low', 'medium', 'high'] as VibrationLevel[]).map((level) => {
              const active = (settings.vibrationLevel || 'high') === level;
              return (
                <button
                  key={level}
                  type="button"
                  id={`vibration-${level}-btn`}
                  onClick={() => {
                    triggerHaptic(level);
                    onUpdateSettings({ vibrationLevel: level });
                  }}
                  className={`py-2 px-2 rounded-xl border text-center text-xs font-bold capitalize transition-all ${
                    active
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* 8. Reading Themes Selector Cards with Visual Thumbnails */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-purple-300">
            <Palette className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold tracking-wide">Reading Themes</h3>
          </div>
          <p className="text-xs text-slate-400">Personalize reader ambient hues and highlights.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {readingThemes.map((theme) => {
              const active = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  id={`reading-theme-${theme.id}-btn`}
                  onClick={() => {
                    triggerHaptic();
                    onUpdateSettings({ readingTheme: theme.id });
                    showToast(`Reading theme: ${theme.name}`);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    active
                      ? 'border-purple-400 bg-purple-600/20 shadow-md shadow-purple-950/50 ring-1 ring-purple-400'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.bgClass} border ${theme.borderClass} flex items-center justify-center shadow-inner`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full ${theme.accentClass}`} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{theme.name}</div>
                      <div className="text-[10px] text-slate-400">High contrast night palette</div>
                    </div>
                  </div>
                  {active && <Check className="w-4 h-4 text-purple-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 9. Core Switches / Toggles */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-purple-300">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold tracking-wide">Reader Preferences</h3>
          </div>

          <div className="divide-y divide-white/5 space-y-1">
            {[
              {
                id: 'showTranslation',
                label: 'Show Translation',
                desc: 'Render English verse translations under each ayah',
                val: settings.showTranslation !== false,
              },
              {
                id: 'showReadingLevels',
                label: 'Reading Levels',
                desc: 'Display word difficulty tags and tajweed milestones',
                val: settings.showReadingLevels !== false,
              },
              {
                id: 'showLeaderboard',
                label: 'Show Leaderboard',
                desc: 'Show community podium ranks and peer consistency score',
                val: settings.showLeaderboard !== false,
              },
              {
                id: 'showTransliteration',
                label: 'Show Transliteration',
                desc: 'Display Latin phonetic pronunciation guides',
                val: !!settings.showTransliteration,
              },
              {
                id: 'autoplay',
                label: 'Autoplay Audio Recitation',
                desc: 'Continuously recite next ayah after current finishes',
                val: !!settings.autoplay,
              },
            ].map((toggle) => (
              <div key={toggle.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-200">{toggle.label}</div>
                  <div className="text-[11px] text-slate-400">{toggle.desc}</div>
                </div>
                <button
                  type="button"
                  id={`toggle-${toggle.id}-btn`}
                  onClick={() => {
                    triggerHaptic();
                    onUpdateSettings({ [toggle.id]: !toggle.val });
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    toggle.val ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-md"
                    animate={{ x: toggle.val ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 10. Gender Selector */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-purple-300">
            <User className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold tracking-wide">Gender Selector</h3>
          </div>
          <p className="text-xs text-slate-400">
            Used strictly for optional community leaderboard avatar styling.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {(['male', 'female', 'skip'] as GenderSelection[]).map((gen) => {
              const active = (settings.gender || 'skip') === gen;
              return (
                <button
                  key={gen}
                  type="button"
                  id={`gender-${gen}-btn`}
                  onClick={() => {
                    triggerHaptic();
                    onUpdateSettings({ gender: gen });
                    showToast(`Profile: ${gen.toUpperCase()}`);
                  }}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                    active
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {gen}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER SUB-PAGE: SAVED CONTENT (FAVOURITES)
  // ==========================================
  const renderFavourites = () => (
    <div className="space-y-4 pb-28">
      <p className="text-xs text-slate-400">
        Quickly revisit ayahs and passages you have favorited during daily recitations.
      </p>

      {favourites.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-white/15 text-center text-slate-400 space-y-2">
          <Heart className="w-8 h-8 mx-auto text-purple-400/60" />
          <div className="text-sm font-bold text-slate-300">No Favourites Saved Yet</div>
          <div className="text-xs">Tap the heart icon on any Ayah card in Reading view to save it here.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {favourites.map((fav) => (
            <div
              key={fav.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-purple-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-purple-200">{fav.title}</h4>
                  <div className="text-xs text-slate-400">{fav.subtitle}</div>
                </div>
                <button
                  onClick={() => handleDeleteFavourite(fav.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Remove from favourites"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {fav.arabicSnippet && (
                <div dir="rtl" className="text-base font-serif text-slate-200 py-1">
                  {fav.arabicSnippet}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500">Added {fav.savedAt}</span>
                {onResumeSurah && (
                  <button
                    onClick={() => onResumeSurah(fav.surahNumber, fav.ayahNumber)}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <span>Read in Quran</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ==========================================
  // RENDER SUB-PAGE: SAVED CONTENT (BOOKMARKS)
  // ==========================================
  const renderBookmarks = () => (
    <div className="space-y-4 pb-28">
      <p className="text-xs text-slate-400">
        Saved positions to resume deep reflection or weekly khatm reading goals.
      </p>

      {bookmarks.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-white/15 text-center text-slate-400 space-y-2">
          <Bookmark className="w-8 h-8 mx-auto text-purple-400/60" />
          <div className="text-sm font-bold text-slate-300">No Bookmarks Saved</div>
          <div className="text-xs">Your auto-resume position and saved markers will appear here.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bm) => (
            <div
              key={bm.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-purple-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-purple-200">{bm.title}</h4>
                  <div className="text-xs text-slate-400">{bm.subtitle}</div>
                </div>
                <button
                  onClick={() => handleDeleteBookmark(bm.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Remove bookmark"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {bm.arabicSnippet && (
                <div dir="rtl" className="text-base font-serif text-slate-200 py-1">
                  {bm.arabicSnippet}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500">Saved {bm.savedAt}</span>
                {onResumeSurah && (
                  <button
                    onClick={() => onResumeSurah(bm.surahNumber, bm.ayahNumber)}
                    className="text-xs font-semibold text-purple-300 hover:text-purple-200 flex items-center gap-1"
                  >
                    <span>Resume Here</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ==========================================
  // RENDER SUB-PAGE: SAVED CONTENT (NOTES)
  // ==========================================
  const renderNotes = () => (
    <div className="space-y-4 pb-28">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">Record personal Tadabbur and reflections.</p>
        <button
          onClick={() => setShowAddNote(true)}
          className="text-xs px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1 shadow-md shadow-purple-950/40"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-white/15 text-center text-slate-400 space-y-2">
          <FileText className="w-8 h-8 mx-auto text-purple-400/60" />
          <div className="text-sm font-bold text-slate-300">No Reflection Notes</div>
          <div className="text-xs">Tap "+ New Note" above to write your first reflection on an Ayah.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-purple-500/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-purple-200">{note.title}</h4>
                  {note.surahNumber && (
                    <div className="text-[11px] text-purple-400">
                      Surah {note.surahNumber} : Ayah {note.ayahNumber}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Delete Note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5">
                {note.content}
              </p>

              <div className="text-[10px] text-slate-500 pt-1">Written on {note.createdAt}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ==========================================
  // RENDER SUB-PAGE: APPEARANCE
  // ==========================================
  const renderAppearance = () => {
    const currentMode = settings.appearance || (settings.theme === 'light' ? 'light' : 'dark');

    const modes: { id: AppAppearance; title: string; desc: string; icon: any }[] = [
      {
        id: 'light',
        title: 'Light Mode',
        desc: 'Crisp parchment background with high legibility contrast',
        icon: Sun,
      },
      {
        id: 'dark',
        title: 'Dark Mode',
        desc: 'Signature deep twilight palette matching ambient night prayers',
        icon: Moon,
      },
      {
        id: 'system',
        title: 'System Default',
        desc: 'Automatically synchronizes with your device display mode',
        icon: Smartphone,
      },
      {
        id: 'night',
        title: 'Night Mode (OLED Pure Black)',
        desc: 'True #000000 black canvas for battery conservation & low-light ease',
        icon: Sparkles,
      },
    ];

    return (
      <div className="space-y-4 pb-28">
        <p className="text-xs text-slate-400">
          Choose the overall color theme and display intensity for the application.
        </p>

        <div className="space-y-2.5">
          {modes.map((m) => {
            const active = currentMode === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                id={`appearance-mode-${m.id}-btn`}
                onClick={() => {
                  triggerHaptic();
                  const themeVal = m.id === 'light' ? 'light' : 'dark';
                  onUpdateSettings({ appearance: m.id, theme: themeVal });
                  showToast(`Appearance: ${m.title}`);
                }}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  active
                    ? 'bg-purple-600/30 border-purple-500 shadow-md shadow-purple-950/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      active ? 'bg-purple-600 text-white' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{m.title}</div>
                    <div className="text-xs text-slate-400">{m.desc}</div>
                  </div>
                </div>
                {active && <Check className="w-5 h-5 text-purple-300" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER SUB-PAGE: LANGUAGE
  // ==========================================
  const renderLanguage = () => {
    const currentLang = settings.language || 'English';

    return (
      <div className="space-y-4 pb-28">
        <p className="text-xs text-slate-400">
          Select your preferred interface and translation language.
        </p>

        <div className="space-y-2">
          {languages.map((lang) => {
            const active = currentLang === lang.name;
            return (
              <button
                key={lang.code}
                type="button"
                id={`lang-${lang.code}-btn`}
                onClick={() => {
                  triggerHaptic();
                  onUpdateSettings({ language: lang.name });
                  showToast(`Language set to ${lang.name}`);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  active
                    ? 'bg-purple-600/30 border-purple-500 shadow-sm'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-white">{lang.name}</div>
                  <div className="text-xs text-slate-400">{lang.native}</div>
                </div>
                {active && <Check className="w-4 h-4 text-purple-300" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ==========================================
  // RENDER SUB-PAGE: SUPPORT & FAQS
  // ==========================================
  const renderSupport = () => (
    <div className="space-y-5 pb-28 text-xs text-slate-300">
      <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
        <h4 className="text-sm font-bold text-purple-200 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          QuranHabit Support & Assistance
        </h4>
        <p className="text-slate-400 leading-relaxed">
          Need help with your reading habit, notifications, audio downloads, or feature requests?
          We are committed to building a distraction-free, 100% private companion for the Ummah.
        </p>
        <div className="pt-2">
          <a
            href="mailto:support@quranhabit.app?subject=QuranHabit%20App%20Inquiry"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
          >
            <span>Contact Support Email</span>
          </a>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Frequently Asked Questions</h4>

        {[
          {
            q: 'How does QuranHabit work offline?',
            a: 'All ayah texts (both Uthmani & Indo-Pak scripts), English and Urdu translations, and daily Azkar are pre-bundled in the application. Audio recitations stream on demand and are cached locally for offline playback.',
          },
          {
            q: 'How are reminders triggered?',
            a: 'Reminders utilize standard modern web notifications and internal timing slots. Once you mark your daily goal as complete, reminders automatically silence themselves for the rest of the day.',
          },
          {
            q: 'Is my data private and secure?',
            a: 'Yes. QuranHabit operates 100% on your device using client-side local storage. There are no tracking scripts, ads, or third-party analytics harvesting your Quran habits.',
          },
          {
            q: 'How does the Streak Shield work?',
            a: 'Every 7 consecutive days of completing your goal earns 1 Streak Shield. If you ever miss a single day due to travel or illness, the shield automatically absorbs the break so your hard-earned streak remains intact!',
          },
        ].map((faq, i) => (
          <div key={i} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="font-bold text-slate-200 text-xs">{faq.q}</div>
            <div className="text-slate-400 leading-relaxed text-[11px]">{faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ==========================================
  // RENDER SUB-PAGE: TERMS & CONDITIONS
  // ==========================================
  const renderTerms = () => (
    <div className="space-y-4 pb-28 text-xs text-slate-300 leading-relaxed">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <h4 className="text-sm font-bold text-white">Terms & Conditions of Use</h4>
        <p className="text-slate-400 text-[11px]">Last Updated: September 2026</p>

        <section className="space-y-1.5">
          <h5 className="font-bold text-purple-300">1. Acceptance of Terms</h5>
          <p>
            By accessing and utilizing the QuranHabit application, you agree to be bound by these Terms of
            Service and all applicable laws and regulations. QuranHabit is dedicated to facilitating regular,
            thoughtful recitation of the Holy Quran.
          </p>
        </section>

        <section className="space-y-1.5">
          <h5 className="font-bold text-purple-300">2. Authenticity & Quranic Text Integrity</h5>
          <p>
            The Quranic text provided in this application originates from verified, open-access scholarly
            databases (including the King Fahd Complex for the Printing of the Holy Quran and verified Tanzil
            datasets). Every effort is made to maintain absolute typographical accuracy and diacritical fidelity.
          </p>
        </section>

        <section className="space-y-1.5">
          <h5 className="font-bold text-purple-300">3. Non-Commercial & Distraction-Free Philosophy</h5>
          <p>
            QuranHabit does not sell ads, monetize sacred scriptures, or gate core Quran reading behind mandatory
            paywalls. The application is intended for personal spiritual enrichment and daily consistency.
          </p>
        </section>

        <section className="space-y-1.5">
          <h5 className="font-bold text-purple-300">4. User Conduct & Community Standing</h5>
          <p>
            When utilizing optional community features such as leaderboards and study circles, users are
            expected to maintain respectful, encouraging behavior appropriate for a sacred learning environment.
          </p>
        </section>
      </div>
    </div>
  );

  // ==========================================
  // RENDER SUB-PAGE: PRIVACY POLICY
  // ==========================================
  const renderPrivacy = () => (
    <div className="space-y-4 pb-28 text-xs text-slate-300 leading-relaxed">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
        <h4 className="text-sm font-bold text-white">Privacy Policy</h4>
        <p className="text-slate-400 text-[11px]">Last Updated: September 2026</p>

        <section className="space-y-1.5">
          <h5 className="font-bold text-emerald-300">1. Zero Personal Data Collection</h5>
          <p>
            QuranHabit is designed with a strict privacy-first architecture. We do not collect your name,
            personal phone number, contacts, location, or private reading reflections. All reading statistics,
            streaks, bookmarks, and personal notes are stored strictly on your device.
          </p>
        </section>

        <section className="space-y-1.5">
          <h5 className="font-bold text-emerald-300">2. Local Storage & Cache</h5>
          <p>
            Your reading history, last read Ayah position, preferred script, font sizes, and daily quota
            preferences are preserved via your browser’s standard HTML5 LocalStorage mechanism. This data never
            leaves your device without your explicit action.
          </p>
        </section>

        <section className="space-y-1.5">
          <h5 className="font-bold text-emerald-300">3. Audio Streaming & Third-Party CDNs</h5>
          <p>
            Recitation audio files are served from established, high-availability public Quran CDNs (EveryAyah /
            Quran.com API). When audio is streamed, standard encrypted HTTP GET requests are issued to retrieve
            the audio segments. No personal identifiers are transmitted in these audio requests.
          </p>
        </section>

        <section className="space-y-1.5">
          <h5 className="font-bold text-emerald-300">4. Data Deletion Rights</h5>
          <p>
            You have complete control over your data. You may reset all streaks, progress, bookmarks, and
            settings at any time using the "Reset Stats / Delete Account" option in the Settings menu.
          </p>
        </section>
      </div>
    </div>
  );

  // ==========================================
  // MAIN SETTINGS NAVIGATION LIST VIEW
  // ==========================================
  const renderMainMenu = () => (
    <div className="space-y-6 pb-32">
      {/* Profile Header & Name Customization Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-purple-900/40 via-purple-950/30 to-[#120926] border border-purple-500/30 space-y-3.5 shadow-xl shadow-purple-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#5AD8B5] text-[#0B3327] font-black text-base flex items-center justify-center shadow-md shadow-emerald-950/40 shrink-0 border border-emerald-300/40">
              {userInitials}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Profile Name</div>
              <h3 className="text-base font-extrabold text-white tracking-tight">{currentUserName}</h3>
              <div className="text-xs text-purple-300/90 flex items-center gap-2 mt-0.5">
                <span>🔥 {stats.currentStreak} Day Streak</span>
                <span>•</span>
                <span>🎯 {settings.dailyQuota || 5} Ayahs/day</span>
              </div>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            Active
          </span>
        </div>

        {/* Profile Name Input Field & Instant Save Button */}
        <div className="pt-2.5 border-t border-purple-500/20">
          <label htmlFor="settings-profile-name-input" className="block text-xs font-semibold text-slate-200 mb-1.5">
            Profile Name
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <User className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="settings-profile-name-input"
                type="text"
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setNameSaved(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveName();
                  }
                }}
                placeholder="Enter your name..."
                maxLength={40}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-purple-950/60 border border-purple-400/30 text-white placeholder-purple-400/50 text-xs font-bold focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all"
              />
            </div>
            <button
              id="save-profile-name-btn"
              type="button"
              onClick={handleSaveName}
              disabled={!nameInput.trim()}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md ${
                nameSaved
                  ? 'bg-emerald-600 text-white border border-emerald-400/40'
                  : nameInput.trim() !== currentUserName
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 active:scale-95 shadow-emerald-500/20'
                  : 'bg-purple-600/50 hover:bg-purple-600 text-white border border-purple-500/40 active:scale-95'
              }`}
            >
              {nameSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Name</span>
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">
            This name personalizes your Home greeting ({currentUserName ? `"Asalam Alaykum, ${currentUserName}"` : '"Asalam Alaykum"'}) and Habit tracking.
          </p>
        </div>
      </div>

      {/* SECTION 1: SAVED CONTENT */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Saved Content
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/5 overflow-hidden">
          <button
            type="button"
            id="settings-nav-favourites-btn"
            onClick={() => setCurrentView('favourites')}
            className="w-full p-3.5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Favourites</div>
                <div className="text-[10px] text-slate-400">Loved ayahs & surahs</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                {favourites.length}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <button
            type="button"
            id="settings-nav-bookmarks-btn"
            onClick={() => setCurrentView('bookmarks')}
            className="w-full p-3.5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Bookmarks</div>
                <div className="text-[10px] text-slate-400">Saved reading positions</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                {bookmarks.length}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <button
            type="button"
            id="settings-nav-notes-btn"
            onClick={() => setCurrentView('notes')}
            className="w-full p-3.5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Personal Notes</div>
                <div className="text-[10px] text-slate-400">Tadabbur & ayah reflections</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                {notes.length}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: ACCOUNT & LEGAL */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Account & Legal
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/5 overflow-hidden">
          <button
            type="button"
            id="settings-nav-account-settings-btn"
            onClick={() => setCurrentView('account_settings')}
            className="w-full p-3.5 text-left flex items-center justify-between hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  Account Settings
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500 text-white font-bold">
                    Expanded
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Alerts, scripts, reciters, font sizes & themes
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            id="settings-nav-support-btn"
            onClick={() => setCurrentView('support')}
            className="w-full p-3.5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Support & FAQs</div>
                <div className="text-[10px] text-slate-400">Questions, feedback & help</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            id="settings-nav-terms-btn"
            onClick={() => setCurrentView('terms')}
            className="w-full p-3.5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-500/10 text-slate-300 border border-slate-500/20 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Terms & Conditions</div>
                <div className="text-[10px] text-slate-400">Usage terms & scholarly integrity</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            id="settings-nav-privacy-btn"
            onClick={() => setCurrentView('privacy')}
            className="w-full p-3.5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Privacy Policy</div>
                <div className="text-[10px] text-slate-400">Zero data tracking guarantee</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* SECTION 3: PREFERENCES */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Preferences
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/5 overflow-hidden">
          <button
            type="button"
            id="settings-nav-appearance-btn"
            onClick={() => setCurrentView('appearance')}
            className="w-full p-3.5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Appearance</div>
                <div className="text-[10px] text-slate-400">Light, Dark, System, Night</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 font-semibold uppercase border border-purple-800/60">
                {settings.appearance || (settings.theme === 'light' ? 'Light' : 'Dark')}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <button
            type="button"
            id="settings-nav-language-btn"
            onClick={() => setCurrentView('language')}
            className="w-full p-3.5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">Language</div>
                <div className="text-[10px] text-slate-400">Translation & interface text</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-semibold">
                {settings.language || 'English'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 4: ACCOUNT MANAGEMENT */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          Account Management
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/5 overflow-hidden">
          <button
            type="button"
            id="settings-reset-stats-btn"
            onClick={() => setShowResetConfirm(true)}
            className="w-full p-3.5 text-left flex items-center justify-between hover:bg-rose-500/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-rose-300">Reset Stats / Delete Account</div>
                <div className="text-[10px] text-rose-400/80">Wipe streaks, bookmarks, & saved history</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400/60" />
          </button>

          <button
            type="button"
            id="settings-logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full p-3.5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-300">Logout</div>
                <div className="text-[10px] text-slate-500">Sign out of local offline session</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Clean Version & Privacy Footer */}
      <div className="pt-2 text-center text-[10px] text-slate-500 space-y-1">
        <div>QuranHabit v2.4.0 • 100% Offline & Private</div>
        <div>May Allah bless your recitation and keep you steadfast.</div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-full">
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-24 left-6 right-6 z-[1000] p-3 rounded-2xl bg-purple-600 text-white text-xs font-bold text-center shadow-xl border border-purple-400/40"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="sticky top-0 z-20 pb-3 pt-1 bg-[#0E0720]/90 backdrop-blur-md flex items-center justify-between border-b border-white/5 mb-4">
        {currentView === 'menu' ? (
          <div>
            <h2 className="text-lg font-black tracking-tight text-white">Settings</h2>
            <p className="text-[11px] text-purple-300">Personalize your daily Quran journey</p>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              id="settings-back-btn"
              onClick={() => setCurrentView('menu')}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-sm font-bold text-white capitalize">
                {currentView.replace('_', ' ')}
              </h2>
              <p className="text-[10px] text-slate-400">Settings Sub-Page</p>
            </div>
          </div>
        )}

        {onClose && (
          <button
            id="settings-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body View Rendering */}
      {currentView === 'menu' && renderMainMenu()}
      {currentView === 'account_settings' && renderAccountSettings()}
      {currentView === 'favourites' && renderFavourites()}
      {currentView === 'bookmarks' && renderBookmarks()}
      {currentView === 'notes' && renderNotes()}
      {currentView === 'appearance' && renderAppearance()}
      {currentView === 'language' && renderLanguage()}
      {currentView === 'support' && renderSupport()}
      {currentView === 'terms' && renderTerms()}
      {currentView === 'privacy' && renderPrivacy()}

      {/* MODAL: ADD REFLECTION NOTE */}
      <AnimatePresence>
        {showAddNote && (
          <div
            className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddNote(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-purple-500/30 p-5 shadow-2xl text-slate-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  New Ayah Reflection Note
                </h3>
                <button
                  onClick={() => setShowAddNote(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveNewNote} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tadabbur on Patience"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Surah #</label>
                    <input
                      type="number"
                      min={1}
                      max={114}
                      value={noteSurah}
                      onChange={(e) => setNoteSurah(Number(e.target.value))}
                      className="w-full mt-1 p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300">Ayah #</label>
                    <input
                      type="number"
                      min={1}
                      max={286}
                      value={noteAyah}
                      onChange={(e) => setNoteAyah(Number(e.target.value))}
                      className="w-full mt-1 p-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300">Your Reflection</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write what this verse inspired in your heart..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddNote(false)}
                    className="w-1/3 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-950/50"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CUSTOM ALERT TIME PICKER */}
      <AnimatePresence>
        {showCustomTimeInput && (
          <div
            className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCustomTimeInput(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-3xl bg-slate-900 border border-purple-500/30 p-5 shadow-2xl text-slate-100 space-y-4"
            >
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                Choose Another Reminder Time
              </h3>
              <p className="text-xs text-slate-400">
                Set a custom reminder slot for your daily schedule.
              </p>

              <div>
                <label className="text-[11px] font-semibold text-slate-300">Time (24h)</label>
                <input
                  type="time"
                  value={customTimeValue}
                  onChange={(e) => setCustomTimeValue(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-purple-400 text-center font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomTimeInput(false)}
                  className="w-1/3 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomAlertTime}
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-950/50"
                >
                  Add Alert Time
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: RESET STATS / DELETE ACCOUNT CONFIRMATION */}
      <AnimatePresence>
        {showResetConfirm && (
          <div
            className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-rose-500/30 p-5 shadow-2xl text-slate-100 space-y-3"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-center text-white">Reset All Progress & Stats?</h3>
              <p className="text-xs text-center text-slate-400 leading-relaxed">
                This will reset your current streak, reading logs, saved bookmarks, and custom notes.
                This action cannot be undone.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetData();
                    setFavourites([]);
                    setBookmarks([]);
                    setNotes([]);
                    setShowResetConfirm(false);
                    showToast('All progress & data have been reset to zero');
                  }}
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/40"
                >
                  Confirm Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: LOGOUT CONFIRMATION */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div
            className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-700 p-5 shadow-2xl text-slate-100 space-y-3 text-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/10 text-slate-300 flex items-center justify-center mx-auto">
                <LogOut className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Logout of Local Session?</h3>
              <p className="text-xs text-slate-400">
                Your local progress remains safely stored on this device.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-1/2 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    showToast('Logged out of local session');
                  }}
                  className="w-1/2 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
