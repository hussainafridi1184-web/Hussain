import { BookmarkPosition, DailyProgress, HabitSettings, HabitStats, PersonalNote, ReminderSlot, SavedItem } from '../types';

const SETTINGS_KEY = 'quranhabit_settings_v1';
const PROGRESS_PREFIX = 'quranhabit_progress_';
const STATS_KEY = 'quranhabit_stats_v1';
const LAST_READ_KEY = 'quranhabit_last_read_v1';
const FAVOURITES_KEY = 'quranhabit_favourites_v1';
const BOOKMARKS_KEY = 'quranhabit_bookmarks_list_v1';
const NOTES_KEY = 'quranhabit_notes_v1';

export const DEFAULT_REMINDER_SLOTS: ReminderSlot[] = [
  { id: 'fajr', time: '06:00', label: 'Morning (Fajr)', enabled: true, triggeredToday: false },
  { id: 'dhuhr', time: '13:30', label: 'Midday (Dhuhr)', enabled: true, triggeredToday: false },
  { id: 'asr', time: '17:00', label: 'Afternoon (Asr)', enabled: true, triggeredToday: false },
  { id: 'isha', time: '21:00', label: 'Evening (Isha)', enabled: true, triggeredToday: false },
];

export const DEFAULT_SETTINGS: HabitSettings = {
  userName: '',
  dailyQuota: 5,
  reminderFrequency: '3x',
  reminderSlots: DEFAULT_REMINDER_SLOTS.slice(0, 3), // default 3x (Fajr, Dhuhr, Asr)
  soundEnabled: true,
  webNotificationsEnabled: false,
  preferredScript: 'uthmani',
  showUrdu: true,
  showEnglish: true,
  arabicFontSize: 30,
  theme: 'dark',
  onboardingCompleted: false,
  preferredReciter: 'ar.alafasy',

  // Extended Settings Defaults
  readingTheme: 'royal_purple',
  appearance: 'dark',
  vibrationLevel: 'high',
  gender: 'skip',
  audioSpeed: 1.0,
  translationFontSize: 14,
  transliterationFontSize: 13,
  showTranslation: true,
  showReadingLevels: true,
  showLeaderboard: true,
  showTransliteration: false,
  autoplay: false,
  notificationsAll: true,
  notificationsDoseOfQuran: true,
  notificationsFriends: false,
  notificationsReminders: true,
  alertTimes: ['09:00', '12:00', '15:00', '18:00'],
  language: 'English',
};

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function hasCompletedOnboarding(): boolean {
  try {
    if (localStorage.getItem('quranhabit_onboarding_completed') === 'true') {
      return true;
    }
    if (localStorage.getItem('quranhabit_daily_goal')) {
      return true;
    }
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.onboardingCompleted === true) {
        return true;
      }
      if (parsed.dailyQuota !== undefined && parsed.dailyQuota !== null) {
        return true;
      }
    }
    const statsRaw = localStorage.getItem(STATS_KEY);
    if (statsRaw) {
      const parsedStats = JSON.parse(statsRaw);
      if (parsedStats.totalAyahsRead > 0 || parsedStats.currentStreak > 0) {
        return true;
      }
    }
    // Check if any reading progress exists
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(PROGRESS_PREFIX) || key.startsWith('quranhabit_last_read'))) {
        return true;
      }
    }
  } catch (e) {
    console.error('Failed to check onboarding status:', e);
  }
  return false;
}

export function markOnboardingCompleted(quota?: number, name?: string): void {
  try {
    localStorage.setItem('quranhabit_onboarding_completed', 'true');
    if (quota) {
      localStorage.setItem('quranhabit_daily_goal', String(quota));
    }
    if (name !== undefined) {
      const trimmed = name.trim();
      if (trimmed && trimmed !== 'Hussain Afridi') {
        localStorage.setItem('quranhabit_user_name', trimmed);
      }
    }
    const raw = localStorage.getItem(SETTINGS_KEY);
    const current = raw ? JSON.parse(raw) : DEFAULT_SETTINGS;
    const updated = {
      ...current,
      onboardingCompleted: true,
      ...(quota ? { dailyQuota: quota } : {}),
      ...(name !== undefined && name.trim() && name.trim() !== 'Hussain Afridi' ? { userName: name.trim() } : {}),
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to mark onboarding completed:', e);
  }
}

export function loadHabitSettings(): HabitSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const completed = hasCompletedOnboarding();
    let directName = localStorage.getItem('quranhabit_user_name') || localStorage.getItem('quranhabit_profile_name');
    if (directName === 'Hussain Afridi') {
      directName = null;
      try {
        localStorage.removeItem('quranhabit_user_name');
        localStorage.removeItem('quranhabit_profile_name');
      } catch (_) {}
    }
    if (!raw) {
      return {
        ...DEFAULT_SETTINGS,
        userName: directName || '',
        onboardingCompleted: completed,
      };
    }
    const parsed = JSON.parse(raw);
    const rawSavedName = parsed.userName;
    const safeSavedName = rawSavedName === 'Hussain Afridi' ? '' : (rawSavedName || '');
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      userName: directName || safeSavedName || '',
      onboardingCompleted: completed || Boolean(parsed.onboardingCompleted),
    };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveHabitSettings(settings: HabitSettings): void {
  try {
    if (settings.userName && settings.userName.trim()) {
      localStorage.setItem('quranhabit_user_name', settings.userName.trim());
      localStorage.setItem('quranhabit_profile_name', settings.userName.trim());
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadDailyProgress(dateStr: string = getTodayDateString(), targetQuota: number = 5): DailyProgress {
  try {
    const raw = localStorage.getItem(`${PROGRESS_PREFIX}${dateStr}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load daily progress:', e);
  }

  // Initial fresh state for date
  return {
    date: dateStr,
    readAyahs: [],
    targetQuota,
    isCompleted: false,
    remindersDismissed: false,
  };
}

export function saveDailyProgress(progress: DailyProgress): void {
  try {
    localStorage.setItem(`${PROGRESS_PREFIX}${progress.date}`, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export const ZERO_STATS: HabitStats = {
  currentStreak: 0,
  longestStreak: 0,
  totalAyahsRead: 0,
  totalDaysActive: 0,
  completionHistory: {},
  streakShields: 0,
  streakShieldActive: false,
};

export function loadHabitStats(): HabitStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load stats:', e);
  }

  // Default stats with a healthy initial habit boost (e.g. 4 days active, 28 ayahs read)
  return {
    currentStreak: 4,
    longestStreak: 7,
    totalAyahsRead: 28,
    totalDaysActive: 6,
    completionHistory: {
      // populate recent 4 days so streak visual looks authentic & inspiring right away
      [getDateOffset(-4)]: 5,
      [getDateOffset(-3)]: 5,
      [getDateOffset(-2)]: 5,
      [getDateOffset(-1)]: 5,
    },
    streakShields: 1,
    streakShieldActive: true,
  };
}

export function saveHabitStats(stats: HabitStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save stats:', e);
  }
}

export const DEFAULT_BOOKMARK: BookmarkPosition = {
  surahNumber: 1,
  ayahNumber: 1,
  surahNameEnglish: 'Al-Faatiha',
  surahNameArabic: 'ٱلْفَاتِحَةِ',
  timestamp: new Date().toISOString(),
};

export function loadLastRead(): BookmarkPosition {
  try {
    const raw = localStorage.getItem(LAST_READ_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.surahNumber === 'number' && typeof parsed.ayahNumber === 'number') {
        return {
          ...DEFAULT_BOOKMARK,
          ...parsed,
        };
      }
    }
  } catch (e) {
    console.warn('Failed to load last read position:', e);
  }
  return DEFAULT_BOOKMARK;
}

export function saveLastRead(pos: BookmarkPosition): void {
  try {
    localStorage.setItem(LAST_READ_KEY, JSON.stringify(pos));
  } catch (e) {
    console.warn('Failed to save last read position:', e);
  }
}

export function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_FAVOURITES: SavedItem[] = [
  {
    id: 'fav-1',
    title: 'Ayat al-Kursi (The Throne Verse)',
    subtitle: 'Surah Al-Baqarah 2:255',
    arabicSnippet: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    surahNumber: 2,
    ayahNumber: 255,
    savedAt: '2026-09-10',
  },
  {
    id: 'fav-2',
    title: 'Opening of Surah Al-Kahf',
    subtitle: 'Surah Al-Kahf 18:1',
    arabicSnippet: 'الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ',
    surahNumber: 18,
    ayahNumber: 1,
    savedAt: '2026-09-12',
  },
  {
    id: 'fav-3',
    title: 'Protection of Surah Al-Mulk',
    subtitle: 'Surah Al-Mulk 67:1',
    arabicSnippet: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    surahNumber: 67,
    ayahNumber: 1,
    savedAt: '2026-09-15',
  },
];

export const INITIAL_BOOKMARKS_LIST: SavedItem[] = [
  {
    id: 'bm-1',
    title: 'Daily Micro-Goal Stop',
    subtitle: 'Surah Al-Baqarah 2:10',
    arabicSnippet: 'فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا',
    surahNumber: 2,
    ayahNumber: 10,
    savedAt: 'Yesterday',
  },
  {
    id: 'bm-2',
    title: 'Friday Sunnah Reading',
    subtitle: 'Surah Al-Kahf 18:10',
    arabicSnippet: 'إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ',
    surahNumber: 18,
    ayahNumber: 10,
    savedAt: '3 days ago',
  },
];

export const INITIAL_NOTES: PersonalNote[] = [
  {
    id: 'note-1',
    title: 'Reflection on Surah Al-Fatiha (1:5)',
    content: '"You alone we worship, and You alone we ask for help." A reminder to renew sincere intention in every salah and daily endeavor.',
    surahNumber: 1,
    ayahNumber: 5,
    createdAt: 'Sep 14, 2026',
  },
  {
    id: 'note-2',
    title: 'Tadabbur on Patience & Prayer (2:45)',
    content: '"And seek help through patience and prayer." When overwhelmed by work or study, pausing for 2 rakats re-centers the heart.',
    surahNumber: 2,
    ayahNumber: 45,
    createdAt: 'Sep 16, 2026',
  },
];

export function loadFavourites(): SavedItem[] {
  try {
    const raw = localStorage.getItem(FAVOURITES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load favourites:', e);
  }
  return INITIAL_FAVOURITES;
}

export function saveFavourites(favs: SavedItem[]): void {
  try {
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favs));
  } catch (e) {
    console.warn('Failed to save favourites:', e);
  }
}

export function loadBookmarksList(): SavedItem[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load bookmarks list:', e);
  }
  return INITIAL_BOOKMARKS_LIST;
}

export function saveBookmarksList(bms: SavedItem[]): void {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bms));
  } catch (e) {
    console.warn('Failed to save bookmarks list:', e);
  }
}

export function loadNotes(): PersonalNote[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load notes:', e);
  }
  return INITIAL_NOTES;
}

export function saveNotes(notes: PersonalNote[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (e) {
    console.warn('Failed to save notes:', e);
  }
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(LAST_READ_KEY);
    localStorage.removeItem(FAVOURITES_KEY);
    localStorage.removeItem(BOOKMARKS_KEY);
    localStorage.removeItem(NOTES_KEY);

    // Clear all app specific keys including progress, shields, challenges
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('quranhabit_') ||
          key.startsWith('quran_') ||
          key.startsWith(PROGRESS_PREFIX))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // Save definitive zero initial state so fresh reads never fall back to initial booster data
    saveHabitStats(ZERO_STATS);
    saveLastRead(DEFAULT_BOOKMARK);
    saveFavourites([]);
    saveBookmarksList([]);
    saveNotes([]);
  } catch (e) {
    console.error('Failed to reset all data:', e);
  }
}
