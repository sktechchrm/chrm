import React from 'react';
import type { AppStats } from './index';

interface StatsCardProps {
  stats: AppStats;
  onClickCategories: () => void;
  onClickRights: () => void;
  onClickSections: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
  stats,
  onClickCategories,
  onClickRights,
  onClickSections,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-emerald-100">
        <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">

          {/* ── Categories ── */}
          <button
            onClick={onClickCategories}
            className="group flex flex-col items-center transform hover:scale-105 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-300 rounded-xl p-2"
            title="Click to expand all categories"
          >
            <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2 group-hover:text-emerald-700 transition-colors">
              {stats.categories}
            </div>
            <div className="text-xs md:text-sm text-gray-600 font-medium group-hover:text-emerald-600 transition-colors">
              বিভাগ
            </div>
            <div className="text-xs text-gray-400 group-hover:text-emerald-400 transition-colors">
              Categories
            </div>
            <div className="mt-1 text-xs text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              ↓ সব দেখুন
            </div>
          </button>

          {/* ── Rights ── */}
          <button
            onClick={onClickRights}
            className="group flex flex-col items-center transform hover:scale-105 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-300 rounded-xl p-2"
            title="Click to expand all rights"
          >
            <div className="text-3xl md:text-4xl font-bold text-teal-600 mb-2 group-hover:text-teal-700 transition-colors">
              {stats.rights}+
            </div>
            <div className="text-xs md:text-sm text-gray-600 font-medium group-hover:text-teal-600 transition-colors">
              অধিকার
            </div>
            <div className="text-xs text-gray-400 group-hover:text-teal-400 transition-colors">
              Rights
            </div>
            <div className="mt-1 text-xs text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              ↓ সব দেখুন
            </div>
          </button>

          {/* ── Sections ── */}
          <button
            onClick={onClickSections}
            className="group flex flex-col items-center transform hover:scale-105 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-300 rounded-xl p-2"
            title="Click to view all sections"
          >
            <div className="text-3xl md:text-4xl font-bold text-cyan-600 mb-2 group-hover:text-cyan-700 transition-colors">
              {stats.sections}
            </div>
            <div className="text-xs md:text-sm text-gray-600 font-medium group-hover:text-cyan-600 transition-colors">
              ধারা
            </div>
            <div className="text-xs text-gray-400 group-hover:text-cyan-400 transition-colors">
              Sections
            </div>
            <div className="mt-1 text-xs text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              ↓ তালিকা দেখুন
            </div>
          </button>

        </div>
      </div>
    </div>
  );
};

export default StatsCard;