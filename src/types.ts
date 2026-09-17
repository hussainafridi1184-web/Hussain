export type ScriptType = 'uthmani' | 'indopak' | 'tajweed' | 'kitab_old' | 'word_by_word';

export type ReadingTheme = 'royal_purple' | 'sunset_amber' | 'rose_quartz' | 'ocean_blue' | 'fresh_leaf';
export type AppAppearance = 'dark' | 'light' | 'system' | 'night';
export type VibrationLevel = 'off' | 'low' | 'medium' | 'high';
export type GenderSelection = 'male' | 'female' | 'skip';

export interface SavedItem {
  id: string;
  title: string;
  subtitle: string;
  arabicSnippet?: string;
  surahNumber: number;
  ayahNumber: number;
  savedAt: string;
}

export interface PersonalNote {
  id: string;
  title: string;
  content: string;
  surahNumber?: number;
  ayahNumber?: number;
  createdAt: string;
}

export type NavigationTab = 'home' | 'reading' | 'explore' | 'leaderboard' | 'settings';

export type ReminderFrequency = '2x' | '3x' | '4x' | 'custom';

export interface ReminderSlot {
  id: string;
  time: string; // "HH:MM" 24h format
  label: string; // e.g. "Morning / Fajr", "Midday / Dhuhr"
  enabled: boolean;
  triggeredToday: boolean;
}

export interface HabitSettings {
  userName?: string;
  dailyQuota: number; // e.g. 1, 3, 5, 10
  reminderFrequency: ReminderFrequency;
  reminderSlots: ReminderSlot[];
  soundEnabled: boolean;
  webNotificationsEnabled: boolean;
  preferredScript: ScriptType;
  showUrdu: boolean;
  showEnglish: boolean;
  arabicFontSize: number; // 24 - 44
  theme: 'dark' | 'light';
  onboardingCompleted: boolean;
  preferredReciter: string; // 'ar.alafasy' | 'ar.muaiqly' | 'ar.sudais' | 'ar.alghamdi' | 'ar.minshawi'

  // Extended Settings Controls
  readingTheme?: ReadingTheme;
  appearance?: AppAppearance;
  vibrationLevel?: VibrationLevel;
  gender?: GenderSelection;
  audioSpeed?: number;
  translationFontSize?: number;
  transliterationFontSize?: number;
  showTranslation?: boolean;
  showReadingLevels?: boolean;
  showLeaderboard?: boolean;
  showTransliteration?: boolean;
  autoplay?: boolean;
  notificationsAll?: boolean;
  notificationsDoseOfQuran?: boolean;
  notificationsFriends?: boolean;
  notificationsReminders?: boolean;
  alertTimes?: string[];
  language?: string;
}

export interface DailyProgress {
  date: string; // "YYYY-MM-DD"
  readAyahs: {
    surahNumber: number;
    ayahNumber: number;
    key: string; // "surah:ayah"
    timestamp: string;
  }[];
  targetQuota: number;
  isCompleted: boolean;
  completedAt?: string;
  remindersDismissed: boolean;
}

export interface HabitStats {
  currentStreak: number;
  longestStreak: number;
  totalAyahsRead: number;
  totalDaysActive: number;
  completionHistory: { [dateStr: string]: number }; // date -> ayahs read count
  streakShields?: number;
  streakShieldActive?: boolean;
}

export interface Ayah {
  surahNumber: number;
  ayahNumber: number;
  key: string;
  textUthmani: string;
  textIndoPak: string;
  translationEnglish: string;
  translationUrdu: string;
  audioUrl?: string;
  juz: number;
}

export interface SurahMeta {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  englishMeaning: string;
  ayahCount: number;
  revelationType: 'Meccan' | 'Medinan';
}

export type AzkarCategory = 'morning' | 'evening' | 'after_prayer' | 'essential_duas';

export interface BookmarkPosition {
  surahNumber: number;
  ayahNumber: number;
  surahNameEnglish: string;
  surahNameArabic?: string;
  timestamp: string;
  juz?: number;
}

export interface AzkarItem {
  id: string;
  category: AzkarCategory;
  title: string;
  arabic: string;
  transliteration: string;
  translationEnglish: string;
  translationUrdu: string;
  reference: string;
  targetCount: number;
  benefit?: string;
}
