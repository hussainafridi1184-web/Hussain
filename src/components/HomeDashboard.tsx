import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  BookOpen,
  Edit2,
  Users,
  Flame,
  Clock,
  FileText,
  Sparkles,
  Share2,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Heart,
  ChevronRight,
  Gift,
  HelpCircle,
  X,
  RotateCcw,
  Check,
  Zap,
  Shield,
  ShieldCheck,
  Play,
  Pause,
  Volume2,
} from 'lucide-react';
import { BookmarkPosition, DailyProgress, HabitSettings, HabitStats } from '../types';

// Sleek glowing & pulsing radar indicator for live real-time sync
const SleekRadarPulse: React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: 'emerald' | 'teal' }> = ({
  size = 'md',
  color = 'emerald',
}) => {
  const ringColor = color === 'emerald' ? 'bg-emerald-400' : 'bg-teal-400';
  const glow = color === 'emerald' ? 'shadow-[0_0_10px_#34d399]' : 'shadow-[0_0_10px_#2dd4bf]';
  const dim = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  const dotDim = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-2.5 h-2.5' : 'w-2 h-2';

  return (
    <span className={`relative flex items-center justify-center shrink-0 ${dim}`}>
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${ringColor} opacity-75`} />
      <span className={`animate-pulse absolute inline-flex h-3/4 w-3/4 rounded-full ${ringColor} opacity-50`} />
      <span className={`relative inline-flex rounded-full ${dotDim} ${ringColor} ${glow}`} />
    </span>
  );
};

interface HomeDashboardProps {
  progress: DailyProgress;
  settings: HabitSettings;
  stats: HabitStats;
  lastReadPosition?: BookmarkPosition;
  onReadQuran: () => void;
  onResumeSurah: (surahNumber: number, ayahNumber: number) => void;
  onOpenSettings?: () => void;
  onChallengeComplete?: (hasanat: number) => void;
  isDark?: boolean;
}

// Quick navigation Surah items from screenshot
const POPULAR_SURAHS = [
  { name: 'Al Muzzammil', surahNumber: 73, ayahNumber: 1 },
  { name: 'Al Mulk', surahNumber: 67, ayahNumber: 1 },
  { name: 'Ya-sin', surahNumber: 36, ayahNumber: 1 },
  { name: 'Ayat al Kursi', surahNumber: 2, ayahNumber: 255 },
  { name: 'Ar-Rahman', surahNumber: 55, ayahNumber: 1 },
  { name: 'Al Waqi\'ah', surahNumber: 56, ayahNumber: 1 },
  { name: 'As-Sajdah', surahNumber: 32, ayahNumber: 1 },
  { name: 'Al Baqarah', surahNumber: 2, ayahNumber: 1 },
];

// System-assigned bite-sized daily challenges auto-rotated every 24 hours
interface DailyChallenge {
  id: string;
  dayIndex: number; // 0 for Sun, 1 for Mon, etc.
  title: string;
  desc: string;
  tag: string;
  targetCount: number;
  unit: string;
  rewardHasanat: number;
  arabic: string;
  transliteration: string;
  translationUrdu: string;
  translationEnglish: string;
  virtue: string;
}

const SYSTEM_DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'challenge-sun',
    dayIndex: 0,
    title: '10 SubhanAllah wa Bihamdihi',
    desc: 'Recite 10x to earn treasures of Paradise and wash away sins.',
    tag: "Today's Habit",
    targetCount: 10,
    unit: 'Dhikr',
    rewardHasanat: 100,
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    transliteration: 'SubhanAllahi wa bihamdihi, SubhanAllahil Azeem',
    translationUrdu: 'پاک ہے اللہ اپنی تعریفوں کے ساتھ، پاک ہے اللہ جو بڑی عظمت والا ہے۔',
    translationEnglish: 'Glory be to Allah and His is the praise, Glory be to Allah the Supreme.',
    virtue: 'Two phrases light on the tongue, heavy on the Scale, beloved to the Most Merciful.',
  },
  {
    id: 'challenge-mon',
    dayIndex: 1,
    title: '10 Astaghfirullah & Repentance',
    desc: 'Seek forgiveness 10x to open doors of sustenance, relief & divine mercy.',
    tag: "Today's Habit",
    targetCount: 10,
    unit: 'Istighfar',
    rewardHasanat: 100,
    arabic: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha alladhi la ilaha illa Huwal Hayyul Qayyum wa atubu ilayh',
    translationUrdu: 'میں اللہ سے بخشش مانگتا ہوں جس کے سوا کوئی معبود نہیں، وہ زندہ اور قائم رہنے والا ہے اور میں اسی کی طرف رجوع کرتا ہوں۔',
    translationEnglish: 'I seek forgiveness from Allah, there is no deity except Him, the Ever-Living, the Sustainer, and I repent to Him.',
    virtue: 'Whoever constantly seeks forgiveness, Allah appoints for him an escape from every distress.',
  },
  {
    id: 'challenge-tue',
    dayIndex: 2,
    title: '3x Surah Al-Ikhlas',
    desc: 'Recite 3x to gain the tremendous reward of completing the entire Quran.',
    tag: "Today's Sunnah",
    targetCount: 3,
    unit: 'Surah',
    rewardHasanat: 150,
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
    transliteration: 'Qul huwa Allahu ahad. Allahu assamad. Lam yalid wa lam yoolad. Wa lam yakun lahu kufuwan ahad.',
    translationUrdu: 'کہہ دیجیے: وہ اللہ ایک ہے۔ اللہ بے نیاز ہے۔ نہ اس نے کسی کو جنا اور نہ وہ جنا گیا۔ اور کوئی اس کا ہمسر نہیں۔',
    translationEnglish: 'Say: He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.',
    virtue: 'Reciting Surah Al-Ikhlas 3 times equals one complete recitation of the Holy Quran.',
  },
  {
    id: 'challenge-wed',
    dayIndex: 3,
    title: '5 Ayahs of Surah Al-Mulk',
    desc: 'Recite 5 verses for illumination and supreme protection from grave trials.',
    tag: "Today's Habit",
    targetCount: 5,
    unit: 'Verses',
    rewardHasanat: 150,
    arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ ۝ الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا',
    transliteration: 'Tabaraka allathee biyadihi almulku wahuwa ala kulli shayin qadeer. Allathee khalaqa almawta walhayata...',
    translationUrdu: 'بڑی برکت والا ہے وہ جس کے ہاتھ میں بادشاہی ہے اور وہ ہر چیز پر قادر ہے۔ جس نے موت اور زندگی کو پیدا کیا تاکہ تمہاری آزمائش کرے۔',
    translationEnglish: 'Blessed is He in whose hand is dominion, and He is over all things competent. [He] who created death and life to test you as to which of you is best in deed.',
    virtue: 'Surah Al-Mulk intercedes for its reader on the Day of Judgment until forgiven.',
  },
  {
    id: 'challenge-thu',
    dayIndex: 4,
    title: '10 Durood Shareef',
    desc: 'Send 10 blessings upon Prophet Muhammad ﷺ to have 10 sins erased & ranks elevated.',
    tag: "Today's Habit",
    targetCount: 10,
    unit: 'Durood',
    rewardHasanat: 100,
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
    transliteration: 'Allahumma salli ala Muhammadin wa ala ali Muhammadin kama sallayta ala Ibrahima wa ala ali Ibrahima innaka Hamidum Majid',
    translationUrdu: 'اے اللہ! رحمت نازل فرما حضرت محمد ﷺ پر اور ان کی آل پر جیسا کہ تو نے رحمت نازل فرمائی حضرت ابراہیم علیہ السلام اور ان کی آل پر۔',
    translationEnglish: 'O Allah, bestow Your blessings upon Muhammad and the family of Muhammad, as You bestowed blessings upon Abraham and his family.',
    virtue: 'Whoever sends blessings upon me once, Allah will send blessings upon him tenfold.',
  },
  {
    id: 'challenge-fri',
    dayIndex: 5,
    title: 'Friday 20 Durood & Salawat',
    desc: 'Special Blessed Friday Sunnah: Send abundant blessings on Prophet Muhammad ﷺ.',
    tag: 'Friday Special',
    targetCount: 20,
    unit: 'Durood',
    rewardHasanat: 200,
    arabic: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ نَبِيِّنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَصَحْبِهِ أَجْمَعِينَ',
    transliteration: 'Allahumma salli wa sallim ala Nabiyyina Muhammadin wa ala alihi wa sahbihi ajmaeen',
    translationUrdu: 'اے اللہ! رحمت اور سلامتی نازل فرما ہمارے نبی حضرت محمد ﷺ پر اور ان کی آل اور اصحاب پر۔',
    translationEnglish: 'O Allah, send blessings and peace upon our Prophet Muhammad, his family, and all his companions.',
    virtue: 'The best of your days is Friday; increase your prayers upon me on this day.',
  },
  {
    id: 'challenge-sat',
    dayIndex: 6,
    title: 'Ayat al-Kursi (1x Recitation)',
    desc: 'Recite the Master Verse of the Holy Quran for supreme divine protection.',
    tag: "Today's Sunnah",
    targetCount: 1,
    unit: 'Ayah',
    rewardHasanat: 120,
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
    transliteration: 'Allahu la ilaha illa Huwal Hayyul Qayyum, la ta/khudhuhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard...',
    translationUrdu: 'اللہ، اس کے سوا کوئی معبود نہیں، وہ ہمیشہ زندہ رہنے والا اور تمام کائنات کو قائم رکھنے والا ہے۔',
    translationEnglish: 'Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep.',
    virtue: 'Whoever recites Ayat al-Kursi, an angel guards him and no evil approaches him.',
  },
];

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  progress,
  settings,
  stats,
  lastReadPosition,
  onReadQuran,
  onResumeSurah,
  onOpenSettings,
  onChallengeComplete,
}) => {
  // Live reading counter fluctuating realistically around 362
  const [liveReaders, setLiveReaders] = useState<number>(362);
  const [liveReadersDelta, setLiveReadersDelta] = useState<number>(0);
  const [versesReadCommunity, setVersesReadCommunity] = useState<number>(
    73 + (progress.readAyahs?.length || 0)
  );
  const [versesDelta, setVersesDelta] = useState<number>(0);
  const [activeTimeframe, setActiveTimeframe] = useState<'today' | 'week' | 'all'>('today');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // 1. Determine system-assigned daily small challenge based on current day of week (auto-rotated every 24h)
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Selected system challenge (defaults to today's assigned challenge, user can preview other days too)
  const [selectedChallengeDay, setSelectedChallengeDay] = useState<number>(currentDayOfWeek);
  const activeDailyChallenge =
    SYSTEM_DAILY_CHALLENGES.find((c) => c.dayIndex === selectedChallengeDay) ||
    SYSTEM_DAILY_CHALLENGES[0];

  // Time remaining until 24-hour midnight reset
  const hoursRemaining = 23 - currentHour;
  const minutesRemaining = 59 - currentMinute;
  const timeLeftToday = `${hoursRemaining}h ${minutesRemaining}m left today`;

  // Dynamic Time-Based Community Rates (low in morning, high in evening)
  const calculateTimeBasedRate = (hour: number) => {
    if (hour < 5) return 16;
    if (hour < 12) return Math.min(48, Math.round(24 + (hour - 5) * 3.4));
    if (hour < 18) return Math.min(74, Math.round(48 + (hour - 12) * 4.3));
    return Math.min(94, Math.round(74 + (hour - 18) * 3.3));
  };

  const calculateTimeBasedParticipants = (hour: number) => {
    if (hour < 5) return 9400;
    if (hour < 12) return Math.round(14000 + (hour - 5) * 1900);
    if (hour < 18) return Math.round(27300 + (hour - 12) * 2300);
    return Math.round(41100 + (hour - 18) * 980);
  };

  const [communityCompletionRate, setCommunityCompletionRate] = useState<number>(() =>
    calculateTimeBasedRate(currentHour)
  );
  const [dynamicParticipants, setDynamicParticipants] = useState<number>(() =>
    calculateTimeBasedParticipants(currentHour)
  );

  // In-place interactive challenge state with local persistence
  const todayDateStr = now.toISOString().split('T')[0];
  const challengeStorageKey = `quran_habit_challenge_${activeDailyChallenge.id}_${todayDateStr}`;

  const [challengeCount, setChallengeCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(challengeStorageKey);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [showChallengeOverlay, setShowChallengeOverlay] = useState<boolean>(false);
  const [challengeCelebration, setChallengeCelebration] = useState<boolean>(false);

  // Subtle real-time live pulse every 5 to 10 seconds
  useEffect(() => {
    // 1. Live Readers fluctuation (every 6 seconds)
    const readersInterval = setInterval(() => {
      const deltaChoices = [-2, -1, 1, 2, 3];
      const delta = deltaChoices[Math.floor(Math.random() * deltaChoices.length)];
      setLiveReadersDelta(delta);
      setLiveReaders((prev) => {
        const nextVal = Math.max(348, Math.min(385, prev + delta));
        return nextVal;
      });
      setTimeout(() => setLiveReadersDelta(0), 2500);
    }, 6500);

    // 2. Global Verses Read counter increment (every 8 seconds)
    const versesInterval = setInterval(() => {
      const addedVerses = Math.random() > 0.35 ? 1 : 2;
      setVersesDelta(addedVerses);
      setVersesReadCommunity((prev) => prev + addedVerses);
      setTimeout(() => setVersesDelta(0), 3000);
    }, 8000);

    // 3. Dynamic Time-Based Community Rates & participants counter (every 7 seconds)
    const participantsInterval = setInterval(() => {
      setDynamicParticipants((prev) => prev + (Math.random() > 0.4 ? 1 : 2));
      setCommunityCompletionRate((prev) => {
        if (Math.random() > 0.6 && prev < 98) {
          return +(prev + 0.1).toFixed(1);
        }
        return prev;
      });
    }, 7000);

    return () => {
      clearInterval(readersInterval);
      clearInterval(versesInterval);
      clearInterval(participantsInterval);
    };
  }, []);

  const isChallengeCompleted = challengeCount >= activeDailyChallenge.targetCount;

  const handleIncrementChallenge = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (challengeCount < activeDailyChallenge.targetCount) {
      const nextCount = challengeCount + 1;
      setChallengeCount(nextCount);
      try {
        localStorage.setItem(challengeStorageKey, nextCount.toString());
      } catch {}

      // Mobile haptic vibration
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(35);
        } catch {}
      }

      if (nextCount >= activeDailyChallenge.targetCount) {
        setChallengeCelebration(true);
        if (onChallengeComplete) {
          onChallengeComplete(activeDailyChallenge.rewardHasanat);
        }
      }
    }
  };

  const handleResetChallenge = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setChallengeCount(0);
    setChallengeCelebration(false);
    try {
      localStorage.setItem(challengeStorageKey, '0');
    } catch {}
  };

  // Streak Shield Protection State
  const [streakShields, setStreakShields] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('quranhabit_streak_shields');
      return saved !== null ? parseInt(saved, 10) : (stats.streakShields ?? 0);
    } catch {
      return 0;
    }
  });

  const [streakShieldActive, setStreakShieldActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('quranhabit_streak_shield_active');
      return saved !== null ? saved === 'true' : (stats.streakShieldActive ?? false);
    } catch {
      return false;
    }
  });

  const [hasClaimedFreeShield, setHasClaimedFreeShield] = useState<boolean>(() => {
    try {
      return localStorage.getItem('quranhabit_free_shield_claimed') === 'true';
    } catch {
      return false;
    }
  });

  const [showStreakShieldModal, setShowStreakShieldModal] = useState<boolean>(false);
  const [shieldClaimToast, setShieldClaimToast] = useState<string | null>(null);

  // Synchronize shields when stats are reset
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quranhabit_streak_shields');
      setStreakShields(saved !== null ? parseInt(saved, 10) : (stats.streakShields ?? 0));
      const activeSaved = localStorage.getItem('quranhabit_streak_shield_active');
      setStreakShieldActive(activeSaved !== null ? activeSaved === 'true' : (stats.streakShieldActive ?? false));
      setHasClaimedFreeShield(localStorage.getItem('quranhabit_free_shield_claimed') === 'true');
    } catch {}
  }, [stats]);

  const handleToggleStreakShield = () => {
    if (streakShields <= 0 && !streakShieldActive) return;
    const nextActive = !streakShieldActive;
    setStreakShieldActive(nextActive);
    try {
      localStorage.setItem('quranhabit_streak_shield_active', String(nextActive));
    } catch {}
  };

  const handleClaimFreeShield = () => {
    if (hasClaimedFreeShield) return;
    const nextShields = streakShields + 1;
    setStreakShields(nextShields);
    setStreakShieldActive(true);
    setHasClaimedFreeShield(true);
    try {
      localStorage.setItem('quranhabit_streak_shields', String(nextShields));
      localStorage.setItem('quranhabit_streak_shield_active', 'true');
      localStorage.setItem('quranhabit_free_shield_claimed', 'true');
    } catch {}
    setShieldClaimToast('Shield Activated! Your daily reading streak is protected.');
    setTimeout(() => setShieldClaimToast(null), 3000);
  };

  // 1-Tap Audio Quick Play State
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const homeAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const handlePlayAyahAudio = (surahNumber: number, ayahNumber: number, keyName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (playingAudioKey === keyName) {
      homeAudioRef.current?.pause();
      setPlayingAudioKey(null);
      return;
    }

    if (!homeAudioRef.current) {
      homeAudioRef.current = new Audio();
    }

    const sPad = String(surahNumber).padStart(3, '0');
    const aPad = String(ayahNumber).padStart(3, '0');
    homeAudioRef.current.src = `https://everyayah.com/data/Alafasy_128kbps/${sPad}${aPad}.mp3`;
    setPlayingAudioKey(keyName);

    homeAudioRef.current.play().catch((err) => {
      console.warn('Playback error:', err);
      setPlayingAudioKey(null);
    });

    homeAudioRef.current.onended = () => {
      setPlayingAudioKey(null);
    };
    homeAudioRef.current.onerror = () => {
      setPlayingAudioKey(null);
    };
  };

  useEffect(() => {
    return () => {
      if (homeAudioRef.current) {
        homeAudioRef.current.pause();
        homeAudioRef.current = null;
      }
    };
  }, []);

  const currentSurahName = lastReadPosition?.surahNameEnglish || 'Al-Faatiha';
  const currentSurahNum = lastReadPosition?.surahNumber || 1;
  const currentAyahNum = lastReadPosition?.ayahNumber || 1;
  const totalAyahsInCurrentSurah = currentSurahNum === 1 ? 7 : currentSurahNum === 2 ? 286 : 100;
  const currentJuzNum = lastReadPosition?.juz || 1;
  const juzCompletionPercent = Math.min(100, Math.round((currentAyahNum / totalAyahsInCurrentSurah) * 100));

  // Day of week bar: M T W T F S S (Today highlighted with purple circle)
  // Indices: Monday is 0, Sunday is 6
  const daysOfWeek = [
    { label: 'M', dayIndex: 1 },
    { label: 'T', dayIndex: 2 },
    { label: 'W', dayIndex: 3 },
    { label: 'T', dayIndex: 4, active: true },
    { label: 'F', dayIndex: 5 },
    { label: 'S', dayIndex: 6 },
    { label: 'S', dayIndex: 0 },
  ];

  const handleShareInvite = () => {
    navigator.clipboard?.writeText('https://quranhabit.app/join?ref=hussainafridi');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Dynamic profile name and initials
  const currentUserName = settings.userName?.trim() || 'Hussain Afridi';
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'HA';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const userInitials = getInitials(currentUserName);

  return (
    <div className="space-y-4 text-slate-100 select-none pb-32 sm:pb-36">
      {/* 1. TOP BAR: Greeting & Day of Week Bar */}
      <div className="space-y-2.5">
        {/* User Greeting & Streak Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* User Avatar Circle */}
            <button
              id="home-profile-avatar-btn"
              type="button"
              onClick={onOpenSettings}
              className="w-11 h-11 rounded-full bg-[#5AD8B5] text-[#0B3327] font-black text-sm flex items-center justify-center shadow-md shadow-emerald-950/40 shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              title="Edit Profile Name in Settings"
            >
              {userInitials}
            </button>
            <div>
              <span className="text-xs text-slate-300 font-medium block">Asalam Alaykum,</span>
              <button
                id="home-profile-name-btn"
                type="button"
                onClick={onOpenSettings}
                className="text-left group flex items-center gap-1.5 focus:outline-none cursor-pointer"
                title="Edit Profile Name in Settings"
              >
                <h2 className="text-base font-extrabold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                  {currentUserName}
                </h2>
                <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-emerald-300 transition-all" />
              </button>
            </div>
          </div>

          {/* Right Action: Calendar & Streak Pill */}
          <div className="flex items-center gap-1.5">
            {/* Calendar Icon Box */}
            <button
              id="top-bar-calendar-btn"
              type="button"
              onClick={onOpenSettings}
              className="w-9 h-9 rounded-2xl bg-[#1D1730] border border-purple-500/20 text-slate-200 flex items-center justify-center hover:bg-[#2A2045] transition-colors"
              title="Calendar & History"
            >
              <Calendar className="w-4 h-4" />
            </button>

            {/* Streak & Streak Shield Protection Pill */}
            <button
              id="top-bar-streak-shield-btn"
              type="button"
              onClick={() => setShowStreakShieldModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-[#1D1730] border border-purple-500/20 text-white shadow-sm hover:border-purple-400/40 active:scale-95 transition-all"
              title="Streak Shield Protection"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-[10px] shadow-sm">
                🔥
              </div>
              <span className="font-extrabold text-xs text-white">
                {stats.currentStreak || 0}
              </span>
              {streakShieldActive && (
                <div className="flex items-center text-amber-300 ml-0.5" title="Streak Shield Active">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Horizontal Day-of-Week Row: M T W T F S S in discrete dark pills */}
        <div className="w-full py-1.5 px-3 rounded-2xl bg-[#160E2A]/90 border border-purple-500/15 flex items-center justify-between shadow-inner">
          {daysOfWeek.map((day, idx) => {
            const isToday = day.active || idx === 3;
            return (
              <div
                key={idx}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isToday
                    ? 'bg-[#58399E] text-white border-2 border-purple-300/40 shadow-md shadow-purple-950/40 scale-105'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {day.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. PRIMARY GOAL CARD: Purple Gradient Container */}
      <div className="relative overflow-hidden rounded-[28px] p-5 bg-gradient-to-b from-[#C4B5FD] via-[#A78BFA] to-[#8B5CF6] text-slate-900 shadow-xl border border-white/40">
        {/* Top Header: Goal Completed Badge & Live Reading Counter */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-2xl text-white tracking-tight">Goal</h3>
            <span className="px-2 py-0.5 rounded-md bg-[#6EE7B7] text-[#064E3B] text-[11px] font-black tracking-wide">
              Completed
            </span>
          </div>

          {/* Live Reading Counter: Active sleek glowing radar pulse */}
          <div className="flex items-center gap-1.5 bg-black/15 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
            {/* 3 mini avatar stack */}
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-4 h-4 rounded-full bg-emerald-400 border border-white text-[7px] flex items-center justify-center font-bold text-slate-900">
                👤
              </div>
              <div className="w-4 h-4 rounded-full bg-teal-300 border border-white text-[7px] flex items-center justify-center font-bold text-slate-900">
                👤
              </div>
              <div className="w-4 h-4 rounded-full bg-purple-300 border border-white text-[7px] flex items-center justify-center font-bold text-slate-900">
                👤
              </div>
            </div>

            <div className="flex items-center gap-1.5 pl-1">
              <span className="font-extrabold text-xs text-white leading-none">
                {liveReaders}
              </span>
              <span className="text-[10px] text-white/90 font-medium leading-none">
                Reading Live
              </span>
              <SleekRadarPulse size="sm" color="emerald" />
            </div>
          </div>
        </div>

        {/* Per Day Verses: 3/3 ✓ +17 */}
        <div className="mb-3.5">
          <p className="text-xs text-white/90 font-bold">Per Day Verses</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm font-extrabold text-white">3/3</span>
            <span className="text-emerald-300 font-extrabold text-sm">✓</span>
            <span className="text-sm font-extrabold text-white/90">+24</span>
          </div>
        </div>

        {/* Surah & Ayah Progress */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-1 text-xs font-extrabold text-white">
            <span>
              {currentSurahNum} {currentSurahName} | {currentAyahNum}/{totalAyahsInCurrentSurah}
            </span>
            <Edit2 className="w-3 h-3 text-white/80 inline cursor-pointer" />
          </div>

          {/* Smooth Progress Slider Bar */}
          <div className="relative w-full h-2.5 bg-[#6D28D9]/40 rounded-full overflow-hidden border border-white/20">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${(currentAyahNum / totalAyahsInCurrentSurah) * 100}%` }}
            />
          </div>

          {/* Juz status & percentage */}
          <div className="flex items-center justify-between text-xs font-bold text-white/90 mt-1">
            <span>{currentJuzNum}/30 Juz</span>
            <span>{juzCompletionPercent}%</span>
          </div>
        </div>

        {/* Read Quran Prominent Action Button + 1-Tap Recitation Audio */}
        <div className="flex items-center gap-2">
          <button
            id="home-read-quran-btn"
            type="button"
            onClick={onReadQuran}
            className="flex-1 py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white font-black text-sm tracking-wide shadow-lg shadow-purple-900/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2 border border-purple-400/40"
          >
            Read Quran
          </button>
          <button
            id="home-quick-listen-btn"
            type="button"
            onClick={(e) => handlePlayAyahAudio(currentSurahNum, currentAyahNum, 'home_resume', e)}
            className="px-3.5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs tracking-wide border border-white/20 transition-all flex items-center gap-1.5 shadow-sm"
            title="1-Tap Listen with Alafasy"
          >
            {playingAudioKey === 'home_resume' ? (
              <>
                <Pause className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span className="text-emerald-300 font-extrabold">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white fill-white" />
                <span>Listen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. IN-PLACE DIRECTLY INTERACTIVE DAILY CHALLENGE CARD */}
      <div
        id="home-daily-challenge-card"
        role="button"
        tabIndex={0}
        onClick={() => setShowChallengeOverlay(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShowChallengeOverlay(true);
          }
        }}
        className="relative overflow-hidden rounded-[26px] p-4 sm:p-5 bg-gradient-to-r from-[#1E1138] via-[#2A174F] to-[#170C2D] border border-purple-500/30 hover:border-purple-400/60 shadow-xl cursor-pointer transition-all duration-200 active:scale-[0.99] group select-none"
      >
        {/* Glow & Cosmic elements */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-purple-600/20 blur-2xl pointer-events-none group-hover:bg-purple-500/30 transition-all" />

        {/* Top Challenge Header with Rotating Tag & Countdown Badge */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              <span>{activeDailyChallenge.tag}</span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedChallengeDay((prev) => (prev + 1) % 7);
              }}
              className="w-5 h-5 rounded-full bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 flex items-center justify-center text-[10px] transition-colors"
              title="Preview next daily small challenge"
            >
              ↻
            </button>
          </div>

          {/* Countdown Badge: 🕒 5h 26m left today */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F59E0B] text-slate-950 text-[11px] font-black shadow-md">
            <Clock className="w-3 h-3 stroke-[2.5]" />
            <span>{timeLeftToday}</span>
          </div>
        </div>

        {/* Challenge Title & Tap Indicator */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-1.5 group-hover:text-purple-200 transition-colors">
              <span>{activeDailyChallenge.title}</span>
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            </h3>
            <p className="text-xs text-purple-200/90 font-medium mt-0.5 leading-relaxed max-w-[290px]">
              {activeDailyChallenge.desc}
            </p>
          </div>
        </div>

        {/* Dynamic Time-Based Community Rates & Participants */}
        <div className="flex items-center justify-between mt-3 mb-2">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-5 h-5 rounded-full bg-emerald-400 border border-purple-900 text-[8px] flex items-center justify-center font-bold text-slate-900">
                👤
              </div>
              <div className="w-5 h-5 rounded-full bg-teal-300 border border-purple-900 text-[8px] flex items-center justify-center font-bold text-slate-900">
                👤
              </div>
              <div className="w-5 h-5 rounded-full bg-purple-400 border border-purple-900 text-[8px] flex items-center justify-center font-bold text-slate-900">
                👤
              </div>
            </div>
            <div>
              <span className="text-xs font-black text-white">
                {dynamicParticipants.toLocaleString()}
              </span>
              <span className="text-[11px] text-purple-300 font-medium ml-1">Participating</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-purple-300 font-semibold bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-500/20">
            <SleekRadarPulse size="sm" color="emerald" />
            <span>Live Sync</span>
          </div>
        </div>

        {/* Challenge Progress Bar (Dynamic Time-Based Community Completion Rate) */}
        <div>
          <div className="w-full h-2 bg-purple-950/70 rounded-full overflow-hidden border border-purple-600/30">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 via-teal-400 to-emerald-400 rounded-full"
              initial={{ width: '20%' }}
              animate={{ width: `${Math.max(4, communityCompletionRate)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-purple-300 mt-1">
            <span>Community Completion</span>
            <span className="text-emerald-300 font-extrabold">{communityCompletionRate}%</span>
          </div>
        </div>

        {/* In-Place Interactive Action Footer */}
        <div className="mt-3.5 pt-2.5 border-t border-purple-500/20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {isChallengeCompleted ? (
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Completed (+{activeDailyChallenge.rewardHasanat} Hasanat)</span>
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-200">
                  <span className="text-white font-extrabold">
                    {challengeCount}/{activeDailyChallenge.targetCount}
                  </span>{' '}
                  {activeDailyChallenge.unit}
                </span>

                {/* Instant 1-Tap inline button right on the home dashboard */}
                <button
                  type="button"
                  onClick={(e) => handleIncrementChallenge(e)}
                  className="px-2 py-0.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-400/30 text-xs font-black transition-all active:scale-90 shadow-sm"
                  title="Direct Home Counter (+1)"
                >
                  +1
                </button>
              </div>
            )}
          </div>

          {/* Prominent in-place overlay opener button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowChallengeOverlay(true);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black shadow-md flex items-center gap-1 transition-all active:scale-95 ${
              isChallengeCompleted
                ? 'bg-purple-600/40 text-purple-200 border border-purple-400/30 hover:bg-purple-600/60'
                : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-105'
            }`}
          >
            <span>{isChallengeCompleted ? 'Recite Again' : 'Tap to Recite'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* IN-PLACE RECITATION & TAP-COUNTER OVERLAY (STRICTLY NO REDIRECTION) */}
      <AnimatePresence>
        {showChallengeOverlay && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowChallengeOverlay(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-[32px] bg-gradient-to-b from-[#1C1233] via-[#160E2A] to-[#0F081D] border border-purple-500/40 p-5 shadow-2xl flex flex-col justify-between select-none text-white"
            >
              {/* Header: Tag + Close Button */}
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>Daily Small Challenge</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                    +{activeDailyChallenge.rewardHasanat} Hasanat
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowChallengeOverlay(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Time remaining */}
              <div className="mt-3 text-center">
                <h3 className="text-xl font-black text-white tracking-tight">
                  {activeDailyChallenge.title}
                </h3>
                <p className="text-xs text-purple-200/80 mt-0.5 flex items-center justify-center gap-1.5">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Resets in {timeLeftToday}</span>
                </p>
              </div>

              {/* Arabic Calligraphy Recitation Box */}
              <div className="my-4 p-4 rounded-2xl bg-black/30 border border-purple-500/30 text-center space-y-3 shadow-inner">
                {/* Arabic Script with authentic Uthmani styling */}
                <p
                  dir="rtl"
                  className="text-2xl sm:text-3xl leading-[2] font-serif font-bold text-amber-100 tracking-wide select-text"
                  style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                >
                  {activeDailyChallenge.arabic}
                </p>

                {/* Transliteration */}
                <p className="text-xs text-purple-200/90 italic tracking-wide leading-relaxed font-sans">
                  "{activeDailyChallenge.transliteration}"
                </p>

                {/* Urdu Translation */}
                <p
                  dir="rtl"
                  className="text-xs text-emerald-200/90 font-medium leading-relaxed"
                  style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
                >
                  {activeDailyChallenge.translationUrdu}
                </p>

                {/* English Translation */}
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans border-t border-purple-500/20 pt-2">
                  {activeDailyChallenge.translationEnglish}
                </p>

                {/* Hadith / Virtue Benefit */}
                <div className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/20 text-[11px] text-purple-200 text-left flex items-start gap-2">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Virtue: </strong>
                    {activeDailyChallenge.virtue}
                  </span>
                </div>
              </div>

              {/* Interactive In-Place Circular Tap Counter */}
              <div className="flex flex-col items-center justify-center py-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={handleIncrementChallenge}
                  className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center shadow-xl transition-all border-4 ${
                    isChallengeCompleted
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-300 text-white shadow-emerald-900/50'
                      : 'bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 border-purple-400/80 text-white shadow-purple-950/60 hover:brightness-110 active:border-purple-300'
                  }`}
                >
                  {/* Subtle ripple pulse */}
                  <span className="text-2xl sm:text-3xl font-black tracking-tight">
                    {challengeCount}
                    <span className="text-sm font-bold opacity-75">
                      /{activeDailyChallenge.targetCount}
                    </span>
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider mt-1 text-purple-200">
                    {isChallengeCompleted ? 'Completed ✓' : 'Tap to Count'}
                  </span>
                </motion.button>

                {/* Celebration Message */}
                {challengeCelebration && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black shadow-md"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Masha'Allah! Daily Challenge Completed! (+{activeDailyChallenge.rewardHasanat} Hasanat)</span>
                  </motion.div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetChallenge}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowChallengeOverlay(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#52D898] hover:bg-[#43c485] active:bg-[#39ad74] text-[#0A3822] font-black text-sm tracking-wide shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>I'm Done</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. USER STATISTICS SECTION: Timeframe Selector & 4 Metric Cards */}
      <div className="space-y-3 pt-1">
        {/* Timeframe Pills: Today | Week | All */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 bg-[#170E28] p-1 rounded-2xl border border-purple-500/20">
            {(['today', 'week', 'all'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setActiveTimeframe(tf)}
                className={`px-4 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all ${
                  activeTimeframe === tf
                    ? 'bg-[#5B37A5] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-purple-300/80 font-medium">Auto-Synced</span>
        </div>

        {/* 4 Metric Cards Grid: Hasanat, Verses, Time, Pages */}
        <div className="grid grid-cols-2 gap-3">
          {/* 1. Hasanat Card */}
          <div className="p-4 rounded-3xl bg-[#170E28] border border-purple-500/20 shadow-lg flex flex-col justify-between">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-2">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Hasanat</span>
              <h4 className="text-xl font-black text-white tracking-tight mt-0.5">
                {activeTimeframe === 'today' ? '26.6K' : activeTimeframe === 'week' ? '184.2K' : '450.8K'}
              </h4>
            </div>
          </div>

          {/* 2. Verses Read Card */}
          <div className="p-4 rounded-3xl bg-[#170E28] border border-purple-500/20 shadow-lg flex flex-col justify-between">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Verses</span>
              <h4 className="text-xl font-black text-white tracking-tight mt-0.5">
                {activeTimeframe === 'today' ? '27' : activeTimeframe === 'week' ? '189' : '720'}
              </h4>
            </div>
          </div>

          {/* 3. Reading Time Card */}
          <div className="p-4 rounded-3xl bg-[#170E28] border border-purple-500/20 shadow-lg flex flex-col justify-between">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Time</span>
              <h4 className="text-xl font-black text-white tracking-tight mt-0.5">
                {activeTimeframe === 'today' ? '1m' : activeTimeframe === 'week' ? '24m' : '3h 40m'}
              </h4>
            </div>
          </div>

          {/* 4. Pages Read Card */}
          <div className="p-4 rounded-3xl bg-[#170E28] border border-purple-500/20 shadow-lg flex flex-col justify-between">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">Pages</span>
              <h4 className="text-xl font-black text-white tracking-tight mt-0.5">
                {activeTimeframe === 'today' ? '05' : activeTimeframe === 'week' ? '22' : '88'}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* 5. QUICK NAVIGATION CHIPS (Popular Surahs / Ayahs) */}
      <div className="space-y-2 pt-1">
        <h4 className="text-xs font-bold text-purple-300/90 px-1 tracking-wide uppercase">
          Quick Verses & Surahs
        </h4>
        <div className="flex flex-wrap gap-2">
          {POPULAR_SURAHS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onResumeSurah(item.surahNumber, item.ayahNumber)}
              className="px-3.5 py-1.5 rounded-full bg-[#1E1335] hover:bg-[#2F1D54] active:scale-95 border border-purple-500/30 text-xs font-semibold text-purple-100 transition-all shadow-sm"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* 6. COMMUNITY & ENGAGEMENT CARDS */}
      <div className="space-y-3 pt-2">
        {/* Ayah of the Day Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-[#211438] to-[#190F2C] border border-purple-500/25 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 inline-block mb-1.5">
            Ayah of the Day
          </span>
          <p className="text-xs text-purple-100 leading-relaxed font-serif">
            "Do not think (O Prophet) that the disbelievers can escape in the land. The Fire will be their home. Indeed, what an evil destination!"
          </p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-purple-500/15 text-[11px] text-purple-300 font-semibold">
            <span>[An-Noor 24:57]</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => handlePlayAyahAudio(24, 57, 'ayah_of_the_day', e)}
                className="flex items-center gap-1 text-amber-300 font-bold hover:text-amber-200 transition-colors"
                title="Listen to Ayah recitation"
              >
                {playingAudioKey === 'ayah_of_the_day' ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="text-amber-400">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Listen</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onResumeSurah(24, 57)}
                className="text-emerald-400 font-bold hover:underline"
              >
                Read Ayah →
              </button>
            </div>
          </div>
        </div>

        {/* Invite to QuranHabit Card */}
        <div
          onClick={handleShareInvite}
          className="p-4 rounded-3xl bg-[#1C1232] border border-purple-500/20 shadow-md flex items-center justify-between cursor-pointer hover:bg-[#251842] transition-colors"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-extrabold text-white">Invite to QuranHabit</h4>
              {copiedLink && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                  Copied!
                </span>
              )}
            </div>
            <p className="text-xs text-purple-300 mt-0.5">Share this link and get bonuses</p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center">
            <Gift className="w-5 h-5" />
          </div>
        </div>

        {/* Bonus Hasanat Card */}
        <div className="p-4 rounded-3xl bg-[#1C1232] border border-purple-500/20 shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs text-purple-300">Bonus Hasanat</span>
            <h4 className="text-xl font-black text-white tracking-tight mt-0.5">0</h4>
          </div>
          <div className="text-2xl">⭐</div>
        </div>

        {/* Live Community 2-Card Row: Verses Read in a day & People Reading Right now */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Verses Read in a day with active live stream beacon */}
          <div className="p-4 rounded-3xl bg-[#1C1232] border border-purple-500/20 shadow-md relative overflow-hidden">
            {/* Top row: Icon + Live stream indicator */}
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 bg-teal-950/70 border border-teal-500/30 px-2 py-0.5 rounded-full">
                <SleekRadarPulse size="sm" color="teal" />
                <span className="text-[9px] font-bold text-teal-300 uppercase tracking-wider">Live</span>
              </div>
            </div>

            <span className="text-xs text-purple-300/90 block leading-tight">
              Verses Read in a day
            </span>

            <div className="flex items-baseline gap-2 mt-1">
              <motion.h4
                key={versesReadCommunity}
                initial={{ scale: 1.15, color: '#2dd4bf' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.3 }}
                className="text-xl sm:text-2xl font-black tracking-tight"
              >
                {versesReadCommunity}
              </motion.h4>
              {versesDelta > 0 && (
                <motion.span
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-[10px] font-extrabold text-teal-400 bg-teal-500/20 px-1.5 py-0.5 rounded"
                >
                  +{versesDelta}
                </motion.span>
              )}
            </div>
          </div>

          {/* Card 2: People Reading Right now with active pulse radar beacon */}
          <div className="p-4 rounded-3xl bg-[#1C1232] border border-purple-500/20 shadow-md relative overflow-hidden">
            {/* Top row: Icon + Active Pulse Beacon */}
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <SleekRadarPulse size="sm" color="emerald" />
                <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider">Active</span>
              </div>
            </div>

            <span className="text-xs text-purple-300/90 block leading-tight">
              People Reading Right now
            </span>

            <div className="flex items-baseline gap-2 mt-1">
              <motion.h4
                key={liveReaders}
                initial={{ scale: 1.15, color: '#34d399' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.3 }}
                className="text-xl sm:text-2xl font-black tracking-tight"
              >
                {liveReaders}
              </motion.h4>
              {liveReadersDelta !== 0 && (
                <motion.span
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    liveReadersDelta > 0
                      ? 'text-emerald-400 bg-emerald-500/20'
                      : 'text-rose-400 bg-rose-500/20'
                  }`}
                >
                  {liveReadersDelta > 0 ? `+${liveReadersDelta}` : liveReadersDelta}
                </motion.span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STREAK SHIELD MODAL */}
      <AnimatePresence>
        {showStreakShieldModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="w-full max-w-sm rounded-3xl bg-[#1D1236] border border-purple-500/40 p-5 shadow-2xl relative overflow-hidden"
            >
              {/* Background amber glow */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white leading-tight">
                      Streak Shield Protection
                    </h3>
                    <p className="text-[11px] text-amber-300/90 font-semibold">
                      Never lose your streak on busy days
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStreakShieldModal(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Status banner */}
              <div className="p-3.5 rounded-2xl bg-[#140A26] border border-purple-500/25 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🛡️</span>
                    <div>
                      <div className="text-xs font-bold text-white">
                        Available Shields: <span className="text-amber-400 font-extrabold">{streakShields}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Status:{' '}
                        <span className={streakShieldActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                          {streakShieldActive ? 'Active (Auto-Protect)' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleStreakShield}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all ${
                      streakShieldActive
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                        : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {streakShieldActive ? 'Enabled' : 'Enable'}
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 mb-4 text-xs text-purple-200/90 leading-relaxed">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 font-medium">
                  Streak Shield protects your daily reading streak from breaking if you miss a day due to busy schedules or travel.
                </div>
                <p className="flex items-start gap-1.5 px-1">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>Earn additional shields automatically by maintaining a 7-day uninterrupted reading streak.</span>
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleClaimFreeShield}
                  disabled={hasClaimedFreeShield}
                  className={`w-full py-2.5 rounded-2xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 ${
                    hasClaimedFreeShield
                      ? 'bg-purple-900/40 text-purple-300/60 border border-purple-500/20 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-slate-950 shadow-amber-900/30'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{hasClaimedFreeShield ? 'Free Shield Claimed ✓' : 'Claim +1 Free Streak Shield'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowStreakShieldModal(false)}
                  className="w-full py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-purple-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Claim Toast */}
      <AnimatePresence>
        {shieldClaimToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-xs shadow-xl flex items-center gap-1.5 border border-emerald-300"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{shieldClaimToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
