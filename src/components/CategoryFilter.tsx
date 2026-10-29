import React from 'react';
import { CategoryId } from '../types/card';
import { CATEGORIES } from '../data/defaultCards';
import { soundFX } from '../utils/soundEffects';

interface CategoryFilterProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (id: CategoryId | 'all') => void;
  cardCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  cardCounts,
}) => {
  const allCount = Object.values(cardCounts).reduce((a, b) => a + b, 0);

  const handleClick = (id: CategoryId | 'all') => {
    soundFX.playClick();
    onSelectCategory(id);
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
      {/* 'All' button */}
      <button
        onClick={() => handleClick('all')}
        className={`shrink-0 py-2.5 px-4 rounded-2xl font-jua text-base sm:text-lg transition-all flex items-center gap-1.5 border-3 ${
          selectedCategory === 'all'
            ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-md scale-105'
            : 'bg-white border-amber-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
        }`}
      >
        <span>🌈</span>
        <span>모두 보기</span>
        <span className="text-xs bg-amber-100/90 text-amber-900 font-bold px-2 py-0.5 rounded-full ml-0.5">
          {allCount}
        </span>
      </button>

      {/* Individual category buttons */}
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const count = cardCounts[cat.id] || 0;

        return (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.id)}
            className={`shrink-0 py-2.5 px-4 rounded-2xl font-jua text-base sm:text-lg transition-all flex items-center gap-1.5 border-3 ${
              isSelected
                ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-md scale-105'
                : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            {count > 0 && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ml-0.5 ${
                  isSelected ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
