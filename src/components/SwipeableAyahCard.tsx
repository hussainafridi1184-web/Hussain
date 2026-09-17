import React, { useState } from 'react';
import { motion, PanInfo } from 'motion/react';
import {
  Bookmark,
  Heart,
  Pause,
  Play,
  Repeat,
  Share2,
} from 'lucide-react';
import { Ayah, HabitSettings, SavedItem, SurahMeta } from '../types';
import { loadFavourites, saveFavourites } from '../services/storageService';

interface SwipeableAyahCardProps {
  ayah: Ayah;
  currentSurah: SurahMeta;
  totalAyahsInSurah: number;
  isRead: boolean;
  onSwipeNext: () => void;
  onSwipePrev: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  isPlaying: boolean;
  onTogglePlayAudio: () => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  onCopyAyah: () => void;
  isCopied: boolean;
  onBookmarkClick?: () => void;
  settings: HabitSettings;
  isDark: boolean;
  points: number;
}

export const SwipeableAyahCard: React.FC<SwipeableAyahCardProps> = ({
  ayah,
  currentSurah,
  totalAyahsInSurah,
  isRead,
  onSwipeNext,
  onSwipePrev,
  hasPrev,
  hasNext,
  isPlaying,
  onTogglePlayAudio,
  isLooping,
  onToggleLoop,
  onCopyAyah,
  isCopied,
  onBookmarkClick,
  settings,
  points,
}) => {
  const [isFavorited, setIsFavorited] = useState(() => {
    const favs = loadFavourites();
    return favs.some((f) => f.surahNumber === currentSurah.number && f.ayahNumber === ayah.ayahNumber);
  });
  const [favCount, setFavCount] = useState(() => 6400 + (ayah.ayahNumber * 37) % 3500);

  const handleToggleFavorite = () => {
    setIsFavorited((prev) => {
      const next = !prev;
      setFavCount((c) => (next ? c + 1 : c - 1));
      const currentFavs = loadFavourites();
      if (next) {
        const newItem: SavedItem = {
          id: `fav-${currentSurah.number}-${ayah.ayahNumber}-${Date.now()}`,
          title: `Surah ${currentSurah.nameEnglish}`,
          subtitle: `Surah ${currentSurah.number}:${ayah.ayahNumber}`,
          arabicSnippet: ayah.textUthmani.slice(0, 45),
          surahNumber: currentSurah.number,
          ayahNumber: ayah.ayahNumber,
          savedAt: 'Just now',
        };
        saveFavourites([newItem, ...currentFavs]);
      } else {
        saveFavourites(
          currentFavs.filter(
            (f) => !(f.surahNumber === currentSurah.number && f.ayahNumber === ayah.ayahNumber)
          )
        );
      }
      return next;
    });
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 40;
    const velocityThreshold = 150;

    // RTL reading direction swipe gestures:
    // Dragging left advances to next Ayah
    // Dragging right returns to previous Ayah
    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      if (hasNext) {
        onSwipeNext();
      }
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      if (hasPrev) {
        onSwipePrev();
      }
    }
  };

  // Format favorite count e.g. 6.4K, 9.8K
  const formattedFav =
    favCount >= 1000 ? `${(favCount / 1000).toFixed(1)}K` : favCount.toString();

  return (
    <div className="relative w-full h-full flex-1 min-h-0 flex flex-col justify-between select-none">
      {/* Pristine Quranly White Rounded Reading Card */}
      <motion.div
        key={ayah.key}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, scale: 0.98, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -4 }}
        transition={{ type: 'spring', damping: 30, stiffness: 380 }}
        className="w-full flex-1 min-h-0 rounded-[28px] p-4 sm:p-5 bg-white text-slate-900 shadow-2xl flex flex-col justify-between relative overflow-hidden border border-white/40 cursor-grab active:cursor-grabbing"
      >
        {/* Top Header of Card: Audio pill on left, Surah & Ayah in center, Heart & Bookmark on right */}
        <div className="shrink-0 flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
          {/* Left: Purple Audio Recitation & Repeat Pill */}
          <div className="flex items-center gap-1.5 bg-[#ECE6F8] rounded-full px-2.5 py-1 text-[#6C3CE8]">
            <button
              id="card-audio-play-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlayAudio();
              }}
              className="hover:scale-110 active:scale-95 transition-transform"
              title={isPlaying ? 'Pause' : 'Play Audio Recitation'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-[#6C3CE8] text-[#6C3CE8]" />
              ) : (
                <Play className="w-4 h-4 fill-[#6C3CE8] text-[#6C3CE8]" />
              )}
            </button>
            <button
              id="card-audio-repeat-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleLoop();
              }}
              className={`hover:scale-110 active:scale-95 transition-all ${
                isLooping ? 'text-amber-600 font-bold scale-110' : 'text-[#6C3CE8]'
              }`}
              title={isLooping ? 'Loop Mode: Active' : 'Loop Mode: Inactive'}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Center: Surah Title & Verse Number */}
          <div className="text-center">
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-tight">
              {currentSurah.number}. {currentSurah.nameEnglish}
            </h3>
            <p className="text-xs text-slate-500 font-semibold tracking-wider">
              {ayah.ayahNumber}/{totalAyahsInSurah}
            </p>
          </div>

          {/* Right: Heart (Favorites) & Bookmark */}
          <div className="flex items-center gap-2 text-slate-800">
            {/* Heart with count (e.g. 6.4K, 9.8K) */}
            <button
              id="card-heart-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite();
              }}
              className="flex flex-col items-center justify-center text-slate-800 hover:text-rose-500 transition-colors"
              title="Favorite Ayah"
            >
              <Heart
                className={`w-4 h-4 transition-all ${
                  isFavorited ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-800'
                }`}
              />
              <span className="text-[9px] font-bold text-slate-500 -mt-0.5">{formattedFav}</span>
            </button>

            {/* Bookmark Icon */}
            <button
              id="card-bookmark-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onBookmarkClick) onBookmarkClick();
              }}
              className="p-1 text-slate-800 hover:text-purple-700 transition-colors"
              title="Bookmark this verse"
            >
              <Bookmark className="w-4 h-4 fill-slate-800 text-slate-800" />
            </button>
          </div>
        </div>

        {/* Center Card Body: Beautiful Arabic Quranic Text & Urdu Translation */}
        <div className="flex-1 min-h-0 overflow-y-auto my-auto py-2 sm:py-3 flex flex-col justify-center space-y-3 scrollbar-thin">
          {/* Reverent Arabic Bismillah Header for Ayah 1 (except Surah 1 & 9) */}
          {currentSurah.number !== 1 && currentSurah.number !== 9 && ayah.ayahNumber === 1 && (
            <div className="text-center py-1 shrink-0">
              <p
                className={`text-lg sm:text-xl text-purple-900 font-bold ${
                  settings.preferredScript === 'uthmani' ? 'font-uthmani' : 'font-indopak'
                }`}
                dir="rtl"
              >
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </p>
            </div>
          )}

          {/* Crisp Black Quranic Arabic Script with authentic Diacritics */}
          <div
            className={`text-right leading-[2.2] sm:leading-[2.4] font-normal transition-all ${
              settings.preferredScript === 'indopak'
                ? 'font-indopak'
                : settings.preferredScript === 'tajweed'
                ? 'font-uthmani text-emerald-800 font-bold'
                : settings.preferredScript === 'kitab_old'
                ? 'font-serif text-slate-900'
                : settings.preferredScript === 'word_by_word'
                ? 'font-mono text-purple-900'
                : 'font-uthmani text-slate-950'
            }`}
            style={{ fontSize: `${settings.arabicFontSize || 26}px` }}
            dir="rtl"
          >
            {settings.preferredScript === 'indopak' ? ayah.textIndoPak : ayah.textUthmani}
            <span className="inline-block text-purple-700 font-sans text-xs sm:text-sm px-1.5 select-none align-middle font-bold">
              ۝{ayah.ayahNumber}
            </span>
          </div>

          {/* Optional Phonetic Transliteration */}
          {settings.showTransliteration && (
            <div
              className="text-left text-purple-700/80 italic text-xs leading-relaxed"
              style={{ fontSize: `${settings.transliterationFontSize || 13}px` }}
            >
              Surah {currentSurah.nameEnglish} • Verse {ayah.ayahNumber}
            </div>
          )}

          {/* Translations (English & Urdu based on settings) */}
          {settings.showTranslation !== false && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              {ayah.translationEnglish && settings.showEnglish !== false && (
                <div
                  className="text-left text-slate-800 leading-relaxed font-normal"
                  style={{ fontSize: `${settings.translationFontSize || 14}px` }}
                >
                  <p>{ayah.translationEnglish}</p>
                </div>
              )}
              {ayah.translationUrdu && settings.showUrdu !== false && (
                <div
                  className="text-right font-urdu text-slate-700 leading-relaxed pt-1"
                  dir="rtl"
                  style={{ fontSize: `${(settings.translationFontSize || 14) + 1}px` }}
                >
                  <p>{ayah.translationUrdu}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Footer Tools (Share & Copy buttons) */}
        <div className="shrink-0 pt-1.5 border-t border-slate-100 flex items-center justify-between text-slate-400">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCopyAyah();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-purple-600 transition-colors flex items-center gap-1 text-[11px]"
            title="Share or Copy Ayah"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-sans">{isCopied ? 'Copied!' : ''}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-600">
              {isRead ? '✓ Read' : ''}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Points indicator at Bottom Right (e.g., +2,880) right under card */}
      <div className="flex justify-end items-center pr-2 pt-1 pb-0.5 shrink-0">
        <span className="text-white font-extrabold text-sm sm:text-base tracking-wide drop-shadow">
          +{points.toLocaleString()}
        </span>
      </div>
    </div>
  );
};
