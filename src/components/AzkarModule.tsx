import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import {
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Heart,
  Check,
  CheckCircle2,
  Sun,
  Moon,
  BookMarked,
  Volume2,
  Share2,
  Settings,
  Layers,
  Award,
} from 'lucide-react';
import { AzkarCategory, AzkarItem, HabitSettings } from '../types';
import { AZKAR_ITEMS } from '../data/azkarData';

interface AzkarModuleProps {
  settings: HabitSettings;
  isDark?: boolean;
  onReturnHome?: () => void;
  onAzkarProgress?: (completedCount: number, hasanatEarned: number) => void;
  onOpenSettings?: () => void;
}

const CATEGORIES: { id: AzkarCategory; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'morning', label: 'Morning Azkar', icon: Sun },
  { id: 'evening', label: 'Evening Azkar', icon: Moon },
  { id: 'after_prayer', label: 'After Prayer', icon: Sparkles },
  { id: 'essential_duas', label: 'Essential Duas', icon: BookMarked },
];

export const AzkarModule: React.FC<AzkarModuleProps> = ({
  settings,
  isDark = true,
  onReturnHome,
  onAzkarProgress,
  onOpenSettings,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AzkarCategory>('morning');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showCategoryMenu, setShowCategoryMenu] = useState<boolean>(false);
  const [completionToast, setCompletionToast] = useState<string | null>(null);

  // Filter items by category
  const categoryItems = AZKAR_ITEMS.filter((item) => item.category === selectedCategory);
  const currentItem: AzkarItem | undefined = categoryItems[currentIndex] || categoryItems[0];

  const currentCount = currentItem ? counters[currentItem.id] || 0 : 0;
  const targetCount = currentItem ? currentItem.targetCount : 1;
  const isItemFinished = currentCount >= targetCount;

  // Total completed in current category
  const completedInCategory = categoryItems.filter(
    (item) => (counters[item.id] || 0) >= item.targetCount
  ).length;

  const handleIncrement = (item: AzkarItem) => {
    const current = counters[item.id] || 0;
    if (current < item.targetCount) {
      const nextCount = current + 1;
      setCounters((prev) => ({ ...prev, [item.id]: nextCount }));

      // Mobile haptic feedback
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate(30);
        } catch {}
      }

      if (nextCount >= item.targetCount) {
        setCompletionToast(`Masha'Allah! ${item.title} completed`);
        setTimeout(() => setCompletionToast(null), 3000);
        if (onAzkarProgress) {
          onAzkarProgress(completedInCategory + 1, (completedInCategory + 1) * 10);
        }
      }
    }
  };

  const handleReset = (itemId: string) => {
    setCounters((prev) => ({ ...prev, [itemId]: 0 }));
  };

  const handleToggleFavorite = (itemId: string) => {
    setFavorites((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < categoryItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // If at end of current category, offer switch to next category
      const currentCatIdx = CATEGORIES.findIndex((c) => c.id === selectedCategory);
      if (currentCatIdx < CATEGORIES.length - 1) {
        setSelectedCategory(CATEGORIES[currentCatIdx + 1].id);
        setCurrentIndex(0);
      }
    }
  };

  // Center button action: Save progress & return to home dashboard
  const handleDone = () => {
    if (onAzkarProgress) {
      onAzkarProgress(completedInCategory, completedInCategory * 10);
    }
    if (onReturnHome) {
      onReturnHome();
    }
  };

  // Drag / Swipe handling
  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 40;
    const velocityThreshold = 150;

    if (info.offset.x < -swipeThreshold || info.velocity.x < -velocityThreshold) {
      if (currentIndex < categoryItems.length - 1) {
        handleNext();
      }
    } else if (info.offset.x > swipeThreshold || info.velocity.x > velocityThreshold) {
      if (currentIndex > 0) {
        handlePrev();
      }
    }
  };

  if (!currentItem) {
    return null;
  }

  const currentCategoryInfo = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  const CategoryIcon = currentCategoryInfo.icon;
  const isFavorited = !!favorites[currentItem.id];

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none overflow-hidden text-slate-100">
      {/* 1. TOP BAR: [←] Back Button | Center Category Pill | [Category Switcher] */}
      <div className="shrink-0 flex items-center justify-between gap-2 pb-2">
        {/* Back Button returning to Home Dashboard */}
        <button
          id="azkar-top-back-btn"
          type="button"
          onClick={onReturnHome}
          className="w-10 h-10 rounded-full bg-[#3B2865]/70 hover:bg-[#4E3584] active:scale-95 border border-purple-400/20 text-white flex items-center justify-center transition-all shadow-md shrink-0"
          title="Back to Home Dashboard"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Clean Center Pill: Category Name and Current Position */}
        <div className="flex-1 max-w-[260px] sm:max-w-xs py-1.5 px-3.5 rounded-full bg-[#36265B]/85 border border-purple-400/20 flex items-center justify-between text-xs font-bold text-slate-100 shadow-md">
          <div className="flex items-center gap-1.5 text-purple-200">
            <CategoryIcon className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs font-bold truncate max-w-[130px]">{currentCategoryInfo.label}</span>
          </div>

          <span className="text-[11px] font-semibold text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded-full border border-purple-400/20">
            {currentIndex + 1} / {categoryItems.length}
          </span>
        </div>

        {/* Category Switcher Menu Trigger */}
        <button
          id="azkar-category-toggle-btn"
          type="button"
          onClick={() => setShowCategoryMenu(!showCategoryMenu)}
          className="w-10 h-10 rounded-full bg-[#3B2865]/70 hover:bg-[#4E3584] active:scale-95 border border-purple-400/20 text-white flex items-center justify-center transition-all shadow-md shrink-0"
          title="Switch Azkar Category"
        >
          <Layers className="w-4 h-4 text-purple-200" />
        </button>
      </div>

      {/* 2. CATEGORY PILLS BAR (Quick switch between Morning, Evening, Prayer, Duas) */}
      <div className="shrink-0 mb-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
                setShowCategoryMenu(false);
              }}
              className={`flex items-center gap-1 py-1 px-3 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                active
                  ? 'bg-[#7C3AED] text-white shadow-md border border-purple-300/40'
                  : 'bg-[#21163C] text-purple-300/80 hover:text-white border border-purple-500/20'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. GOAL BANNER: Clean reading progress */}
      <div className="shrink-0 mb-1.5 px-3.5 py-1.5 rounded-2xl bg-[#52D898] text-[#0A3822] flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <span className="font-black text-xs sm:text-sm tracking-wide">Daily Azkar</span>
          <span className="font-extrabold text-[11px] bg-white/30 px-2 py-0.5 rounded-full">
            {completedInCategory} of {categoryItems.length} Read
          </span>
        </div>

        {/* Goal status check icon */}
        <div className="w-5 h-5 rounded-lg bg-[#3DB77C] text-white flex items-center justify-center shadow-sm">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      </div>

      {/* 4. MAIN VIEWPORT-FITTED AZKAR CARD (Zero Page Scroll, Pure Viewport Fitted) */}
      <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden relative">
        <motion.div
          key={currentItem.id}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, scale: 0.98, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -4 }}
          transition={{ type: 'spring', damping: 30, stiffness: 380 }}
          className="w-full h-full rounded-[28px] p-4 sm:p-5 bg-white text-slate-900 shadow-2xl flex flex-col justify-between relative overflow-hidden border border-white/40 cursor-grab active:cursor-grabbing"
        >
          {/* Card Top Header: Category badge on left, Title in center, Heart & Reset on right */}
          <div className="shrink-0 flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            {/* Left Category Pill */}
            <div className="flex items-center gap-1.5 bg-[#ECE6F8] rounded-full px-2.5 py-1 text-[#6C3CE8]">
              <CategoryIcon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold tracking-tight">{currentCategoryInfo.label}</span>
            </div>

            {/* Center: Title & Reference */}
            <div className="text-center px-1 flex-1 min-w-0">
              <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight leading-tight truncate">
                {currentItem.title}
              </h3>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider">
                {currentItem.reference}
              </p>
            </div>

            {/* Right: Target Badge & Heart */}
            <div className="flex items-center gap-1.5 text-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => handleReset(currentItem.id)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                title="Reset counter"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleToggleFavorite(currentItem.id)}
                className="p-1 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                title="Favorite this Azkar"
              >
                <Heart
                  className={`w-4 h-4 transition-all ${
                    isFavorited ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-500'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Center Card Body: Arabic Text, Urdu Translation & Virtue (Comfortable fit) */}
          <div className="flex-1 min-h-0 overflow-y-auto my-auto py-2 flex flex-col justify-center space-y-2.5 scrollbar-thin">
            {/* Authentic Arabic Text with beautiful font selection */}
            <div
              className={`text-right leading-[2.1] text-slate-950 font-normal transition-all ${
                settings.preferredScript === 'uthmani' ? 'font-uthmani' : 'font-indopak'
              }`}
              style={{ fontSize: `${Math.min(26, Math.max(20, (settings.arabicFontSize || 26) - 2))}px` }}
              dir="rtl"
            >
              {currentItem.arabic}
            </div>

            {/* Transliteration */}
            <div className="text-[11px] sm:text-xs text-slate-500 italic leading-relaxed font-serif">
              "{currentItem.transliteration}"
            </div>

            {/* Authentic Urdu Translation */}
            {settings.showUrdu && currentItem.translationUrdu && (
              <div
                className="pt-1.5 border-t border-slate-100 text-right font-urdu text-xs sm:text-sm text-slate-700 leading-relaxed"
                dir="rtl"
              >
                {currentItem.translationUrdu}
              </div>
            )}

            {/* English Translation */}
            {settings.showEnglish && currentItem.translationEnglish && (
              <div className="text-[11px] text-slate-500 leading-relaxed font-sans">
                {currentItem.translationEnglish}
              </div>
            )}

            {/* Virtue Benefit Badge */}
            {currentItem.benefit && (
              <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-[10px] text-purple-900 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="font-medium leading-tight">{currentItem.benefit}</span>
              </div>
            )}
          </div>

          {/* Bottom Card Action: Interactive Tasbeeh Bead Tap Pad */}
          <div className="shrink-0 pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Goal:</span>
              <span className="font-extrabold text-slate-800">{targetCount}x</span>
            </div>

            {/* Main Tap-to-Count Bead Button */}
            <button
              id="azkar-tap-count-btn"
              type="button"
              onClick={() => handleIncrement(currentItem)}
              disabled={isItemFinished}
              className={`flex-1 py-2 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all active:scale-[0.97] flex items-center justify-center gap-2 shadow-md ${
                isItemFinished
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 shadow-emerald-600/20'
              }`}
            >
              {isItemFinished ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Target Completed ({targetCount}/{targetCount})</span>
                </>
              ) : (
                <>
                  <span>Tap to Count</span>
                  <span className="py-0.5 px-2.5 rounded-full bg-slate-900/20 text-slate-950 font-black text-xs">
                    {currentCount} / {targetCount}
                  </span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* 5. FIXED ANCHORED BOTTOM NAVIGATION BAR (MIRRORING QURAN READING VIEW) */}
      {/* Exact required structure: [ ← ] (Left Button)  [ I'm Done ] (Green Button)  [ → ] (Right Button) */}
      <div className="shrink-0 pt-2 pb-24 sm:pb-28 flex items-center justify-between gap-3 select-none">
        {/* Left Arrow Button: Minimal Arrow Only, Zero Text Labels */}
        <button
          id="azkar-bottom-nav-left-btn"
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`h-13 w-20 sm:w-24 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 ${
            currentIndex > 0
              ? 'bg-[#18112C] border border-purple-400/30 text-white hover:bg-[#251A44]'
              : 'bg-[#18112C]/40 border border-purple-900/20 text-slate-600 cursor-not-allowed'
          }`}
          title="Previous Azkar"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Center Action Button: Prominent Green Button labeled "I'm Done" */}
        <button
          id="azkar-bottom-nav-im-done-btn"
          type="button"
          onClick={handleDone}
          className="flex-1 h-13 rounded-2xl bg-[#52D898] hover:bg-[#46C488] active:bg-[#3CB078] text-[#0A3822] font-black text-sm sm:text-base flex items-center justify-center transition-all shadow-lg active:scale-[0.98] select-none"
          title="Save Progress and Return to Home Dashboard"
        >
          I'm Done
        </button>

        {/* Right Arrow Button: Minimal Arrow Only, Zero Text Labels */}
        <button
          id="azkar-bottom-nav-right-btn"
          type="button"
          onClick={handleNext}
          className="h-13 w-20 sm:w-24 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 font-bold"
          title="Next Azkar"
        >
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Completion Toast feedback */}
      <AnimatePresence>
        {completionToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-28 left-4 right-4 z-40 p-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold text-center shadow-xl border border-emerald-400/50"
          >
            {completionToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
