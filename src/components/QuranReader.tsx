import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  Heart,
  Layers,
  Search,
  Settings,
  X,
} from 'lucide-react';
import { Ayah, BookmarkPosition, HabitSettings } from '../types';
import { ALL_SURAHS, getAyahsForSurah, preloadNextSurah } from '../data/quranData';
import { loadLastRead, saveLastRead } from '../services/storageService';
import { SwipeableAyahCard } from './SwipeableAyahCard';

interface QuranReaderProps {
  initialSurahNumber?: number;
  initialAyahNumber?: number;
  navigationTimestamp?: number;
  readAyahKeys: string[];
  onToggleAyahRead: (surahNumber: number, ayahNumber: number) => void;
  onAutoMarkAyahRead?: (surahNumber: number, ayahNumber: number) => void;
  onPositionBookmark?: (bookmark: BookmarkPosition) => void;
  settings: HabitSettings;
  onUpdateSettings: (settings: Partial<HabitSettings>) => void;
  isDark: boolean;
  todayTarget?: number;
  todayReadCount?: number;
  streak?: number;
  onExitReader?: () => void;
  onOpenSettings?: () => void;
}

export const QuranReader: React.FC<QuranReaderProps> = ({
  initialSurahNumber,
  initialAyahNumber,
  navigationTimestamp,
  readAyahKeys,
  onToggleAyahRead,
  onAutoMarkAyahRead,
  onPositionBookmark,
  settings,
  onUpdateSettings,
  isDark,
  todayTarget = 3,
  todayReadCount = 0,
  streak = 1,
  onExitReader,
  onOpenSettings,
}) => {
  const savedBookmark = useRef<BookmarkPosition>(loadLastRead());
  const effectiveSurah = initialSurahNumber ?? (savedBookmark.current.surahNumber || 1);
  const effectiveAyah = initialAyahNumber ?? (savedBookmark.current.ayahNumber || 1);

  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(effectiveSurah);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(() => Math.max(0, effectiveAyah - 1));
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showSurahPicker, setShowSurahPicker] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Audio player state
  const [activeAudioKey, setActiveAudioKey] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Target ayah index to focus when Surah loads
  const targetAyahRef = useRef<number | null>(effectiveAyah);

  const loadSurah = (surahNum: number, targetAyahNumber?: number) => {
    setLoading(true);
    setFetchError(null);
    const target = targetAyahNumber !== undefined ? targetAyahNumber : targetAyahRef.current;

    getAyahsForSurah(surahNum)
      .then((data) => {
        if (data && data.length > 0) {
          setAyahs(data);
          let targetIndex = 0;
          if (target !== null && target !== undefined) {
            targetIndex = Math.max(0, Math.min(data.length - 1, target - 1));
          } else if (currentAyahIndex >= 0 && currentAyahIndex < data.length) {
            targetIndex = currentAyahIndex;
          }
          targetAyahRef.current = null;
          setCurrentAyahIndex(targetIndex);
          setLoading(false);
          preloadNextSurah(surahNum);
        } else {
          setFetchError('Unable to load verses. Tap Retry.');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching Surah:', err);
        setFetchError('Failed to connect to Quran API.');
        setLoading(false);
      });
  };

  // Direct Ayah navigation sync
  useEffect(() => {
    if (initialSurahNumber !== undefined && initialAyahNumber !== undefined) {
      const targetAyah = Math.max(1, initialAyahNumber);
      targetAyahRef.current = targetAyah;

      if (currentSurahNumber !== initialSurahNumber) {
        setCurrentSurahNumber(initialSurahNumber);
      } else {
        if (ayahs.length > 0) {
          const targetIndex = Math.max(0, Math.min(ayahs.length - 1, targetAyah - 1));
          setCurrentAyahIndex(targetIndex);
          targetAyahRef.current = null;
        } else {
          loadSurah(initialSurahNumber, targetAyah);
        }
      }
    }
  }, [initialSurahNumber, initialAyahNumber, navigationTimestamp]);

  useEffect(() => {
    loadSurah(currentSurahNumber);
  }, [currentSurahNumber]);

  const currentSurah = ALL_SURAHS.find((s) => s.number === currentSurahNumber) || ALL_SURAHS[1];
  const currentAyah = ayahs[currentAyahIndex];

  // Auto-bookmark current position
  useEffect(() => {
    if (!loading && targetAyahRef.current === null && ayahs.length > 0 && currentAyah) {
      const bookmark: BookmarkPosition = {
        surahNumber: currentSurah.number,
        ayahNumber: currentAyah.ayahNumber,
        surahNameEnglish: currentSurah.nameEnglish,
        surahNameArabic: currentSurah.nameArabic,
        timestamp: new Date().toISOString(),
        juz: currentAyah.juz || 1,
      };
      saveLastRead(bookmark);
      if (onPositionBookmark) {
        onPositionBookmark(bookmark);
      }
    }
  }, [currentAyahIndex, currentSurahNumber, ayahs.length, loading, currentSurah, currentAyah, onPositionBookmark]);

  // Audio Playback
  const playAyahAudio = (ayah: Ayah) => {
    if (activeAudioKey === ayah.key && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setActiveAudioKey(ayah.key);
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    audioRef.current.src =
      ayah.audioUrl ||
      `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.ayahNumber}.mp3`;
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.warn('Audio play error:', err));

    audioRef.current.onended = () => {
      if (isLooping) {
        audioRef.current?.play();
      } else {
        const nextIndex = currentAyahIndex + 1;
        if (nextIndex < ayahs.length) {
          setCurrentAyahIndex(nextIndex);
          playAyahAudio(ayahs[nextIndex]);
        } else {
          setIsPlaying(false);
          setActiveAudioKey(null);
        }
      }
    };
  };

  // Right Arrow / Swipe Next -> Advances to Next Ayah
  const handleNextAyah = () => {
    if (currentAyah) {
      if (onAutoMarkAyahRead) {
        onAutoMarkAyahRead(currentAyah.surahNumber, currentAyah.ayahNumber);
      } else {
        const key = `${currentAyah.surahNumber}:${currentAyah.ayahNumber}`;
        if (!readAyahKeys.includes(key)) {
          onToggleAyahRead(currentAyah.surahNumber, currentAyah.ayahNumber);
        }
      }
    }

    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex((prev) => prev + 1);
    } else {
      const nextSurahNum = currentSurahNumber + 1;
      if (nextSurahNum <= 114) {
        targetAyahRef.current = 1;
        setCurrentSurahNumber(nextSurahNum);
      }
    }
  };

  // Left Arrow / Swipe Prev -> Returns to Previous Ayah
  const handlePrevAyah = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex((prev) => prev - 1);
    } else if (currentSurahNumber > 1) {
      targetAyahRef.current = 1;
      setCurrentSurahNumber(currentSurahNumber - 1);
    }
  };

  // Center "I'm Done" button action
  const handleDone = () => {
    if (currentAyah && onAutoMarkAyahRead) {
      onAutoMarkAyahRead(currentAyah.surahNumber, currentAyah.ayahNumber);
    }
    if (onExitReader) {
      onExitReader();
    }
  };

  // Calculate dynamic points (+2,880 / +1,160 based on Arabic length)
  const calculatePoints = (ayah?: Ayah) => {
    if (!ayah) return 2880;
    const cleanLetters = (ayah.textUthmani || '').replace(/[\s\d۝۞]/g, '').length;
    return Math.max(440, Math.round((cleanLetters * 10) / 10) * 10);
  };

  const ayahPoints = calculatePoints(currentAyah);
  const currentJuz = currentAyah?.juz || 2;
  const versesLeftInJuz = Math.max(1, (ayahs.length || 286) - (currentAyahIndex + 1));

  const filteredSurahs = ALL_SURAHS.filter(
    (s) =>
      s.nameEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.englishMeaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameArabic.includes(searchQuery) ||
      String(s.number) === searchQuery.trim()
  );

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 justify-between select-none relative overflow-hidden text-white">
      {/* 1. TOP BAR: (←) Back Circle | Center Pill (💖 25.2K | 📑 20 | ⏱️ 01m:07s) | (⚙️) Settings Circle */}
      <div className="shrink-0 flex items-center justify-between gap-2 pb-2">
        {/* Back Button */}
        <button
          id="quranly-top-back-btn"
          type="button"
          onClick={onExitReader}
          className="w-10 h-10 rounded-full bg-[#3B2865]/70 hover:bg-[#4E3584] active:scale-95 border border-purple-400/20 text-white flex items-center justify-center transition-all shadow-md shrink-0"
          title="Back to Home"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Center Pill: Surah Name & Ayah Counter */}
        <button
          type="button"
          onClick={() => setShowSurahPicker(true)}
          className="flex-1 max-w-[260px] sm:max-w-xs py-1.5 px-3.5 rounded-full bg-[#36265B]/85 border border-purple-400/20 hover:border-purple-300/40 flex items-center justify-between text-xs font-bold text-slate-100 shadow-md transition-colors"
          title="Click to pick Surah"
        >
          <div className="flex items-center gap-1.5 text-purple-100 truncate">
            <span className="text-amber-300 font-extrabold">{currentSurah.number}.</span>
            <span className="truncate">{currentSurah.nameEnglish}</span>
          </div>

          <span className="text-[11px] font-semibold text-purple-300 bg-purple-900/50 px-2 py-0.5 rounded-full border border-purple-400/20 shrink-0">
            {currentAyah ? currentAyah.ayahNumber : currentAyahIndex + 1} / {ayahs.length || currentSurah.ayahCount}
          </span>
        </button>

        {/* Settings / Surah Picker Button */}
        <button
          id="quranly-top-settings-btn"
          type="button"
          onClick={() => (onOpenSettings ? onOpenSettings() : setShowSurahPicker(true))}
          className="w-10 h-10 rounded-full bg-[#3B2865]/70 hover:bg-[#4E3584] active:scale-95 border border-purple-400/20 text-white flex items-center justify-center transition-all shadow-md shrink-0"
          title="Settings & Surah Selection"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* 2. GOAL BAR: Mint Green Rounded Bar (Goal +10 / +17 with Checkmark) */}
      <div className="shrink-0 mb-1.5 px-3.5 py-2 rounded-2xl bg-[#52D898] text-[#0A3822] flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-black text-sm tracking-wide">Goal</span>
          <span className="font-extrabold text-xs bg-white/30 px-2 py-0.5 rounded-full">
            +{todayTarget > 0 ? todayTarget * 5 : 10}
          </span>
        </div>

        {/* Green checkbox with checkmark */}
        <div className="w-6 h-6 rounded-lg bg-[#3DB77C] text-white flex items-center justify-center shadow-sm">
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
      </div>

      {/* 4. JUZ INFO COUNTDOWN: Juz 2 : 20 Verses left */}
      <div className="shrink-0 text-center py-0.5 mb-1 text-[11px] font-semibold text-purple-200/90 tracking-wide">
        Juz {currentJuz} : {versesLeftInJuz} Verses left
      </div>

      {/* 5. MAIN WHITE AYAH READING CARD (Zero vertical page scroll, fits inside viewport) */}
      <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-purple-200">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Loading Ayahs...</p>
          </div>
        ) : fetchError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center rounded-3xl bg-white/10 border border-purple-400/30">
            <p className="text-xs font-bold text-rose-300 mb-2">{fetchError}</p>
            <button
              type="button"
              onClick={() => loadSurah(currentSurahNumber)}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-900 font-bold text-xs"
            >
              Retry
            </button>
          </div>
        ) : currentAyah ? (
          <SwipeableAyahCard
            ayah={currentAyah}
            currentSurah={currentSurah}
            totalAyahsInSurah={ayahs.length}
            isRead={readAyahKeys.includes(currentAyah.key)}
            onSwipeNext={handleNextAyah}
            onSwipePrev={handlePrevAyah}
            hasPrev={currentAyahIndex > 0 || currentSurahNumber > 1}
            hasNext={true}
            isPlaying={activeAudioKey === currentAyah.key && isPlaying}
            onTogglePlayAudio={() => playAyahAudio(currentAyah)}
            isLooping={isLooping}
            onToggleLoop={() => setIsLooping(!isLooping)}
            onCopyAyah={() => {
              const text = `${currentAyah.textUthmani}\n\nترجمہ: ${currentAyah.translationUrdu}`;
              navigator.clipboard.writeText(text);
            }}
            isCopied={false}
            settings={settings}
            isDark={isDark}
            points={ayahPoints}
          />
        ) : null}
      </div>

      {/* 6. CLEAN ANCHORED BOTTOM NAVIGATION BAR (NO TEXT LABELS ON ARROWS) */}
      {/* Exact layout: [ ← ] (Left Button)  [ I'm Done ] (Green Button)  [ → ] (Right Button) */}
      <div className="shrink-0 pt-1 pb-24 sm:pb-28 flex items-center justify-between gap-3 select-none">
        {/* Left Arrow Button: Minimal Arrow Only, Zero Text Labels */}
        <button
          id="bottom-nav-arrow-left-btn"
          type="button"
          onClick={handlePrevAyah}
          disabled={currentAyahIndex === 0 && currentSurahNumber === 1}
          className={`h-13 w-20 sm:w-24 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 ${
            currentAyahIndex > 0 || currentSurahNumber > 1
              ? 'bg-[#18112C] border border-purple-400/30 text-white hover:bg-[#251A44]'
              : 'bg-[#18112C]/40 border border-purple-900/20 text-slate-600 cursor-not-allowed'
          }`}
          title="Previous Ayah"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Center Button: Green Rounded Button with exact text "I'm Done" */}
        <button
          id="bottom-nav-im-done-btn"
          type="button"
          onClick={handleDone}
          className="flex-1 h-13 rounded-2xl bg-[#52D898] hover:bg-[#46C488] active:bg-[#3CB078] text-[#0A3822] font-black text-sm sm:text-base flex items-center justify-center transition-all shadow-lg active:scale-[0.98] select-none"
          title="Complete Session & Return to Home"
        >
          I'm Done
        </button>

        {/* Right Arrow Button: Minimal Arrow Only, Zero Text Labels */}
        <button
          id="bottom-nav-arrow-right-btn"
          type="button"
          onClick={handleNextAyah}
          className="h-13 w-20 sm:w-24 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 font-bold"
          title="Next Ayah"
        >
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Surah Picker Modal Overlay */}
      <AnimatePresence>
        {showSurahPicker && (
          <div className="absolute inset-x-0 top-10 bottom-12 z-50 rounded-3xl p-4 border bg-[#1A1230]/98 border-purple-500/40 shadow-2xl backdrop-blur-xl flex flex-col">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white">Select Surah</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-36">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-6 pr-2 py-1 text-xs rounded-xl bg-purple-950/60 border border-purple-700/50 text-white placeholder-purple-400 focus:outline-none"
                  />
                  <Search className="w-3 h-3 text-purple-400 absolute left-2 top-2" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowSurahPicker(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
              {filteredSurahs.map((surah) => (
                <button
                  key={surah.number}
                  type="button"
                  onClick={() => {
                    targetAyahRef.current = 1;
                    setCurrentSurahNumber(surah.number);
                    setCurrentAyahIndex(0);
                    setShowSurahPicker(false);
                  }}
                  className={`w-full p-2.5 rounded-2xl flex items-center justify-between text-xs transition-colors ${
                    surah.number === currentSurahNumber
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'hover:bg-purple-900/40 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-purple-950/80 text-purple-200 flex items-center justify-center text-[10px] font-bold">
                      {surah.number}
                    </span>
                    <div className="text-left">
                      <span className="font-bold text-xs">{surah.nameEnglish}</span>
                      <span className="text-[10px] opacity-70 ml-2">{surah.englishMeaning}</span>
                    </div>
                  </div>
                  <span className="font-uthmani text-sm text-purple-200">{surah.nameArabic}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
