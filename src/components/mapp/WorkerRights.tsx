import React, { useState, useMemo, useEffect } from 'react';
import Header from './Header';
import SearchBar from './SearchBar';
import StatsCard from './StatsCard';
import CategoryCard from './CategoryCard';
import EmptyState from './EmptyState';
import Footer from './Footer';
import { laborRightsData } from './laborRightsData';
import { calculateStats, filterCategories } from './helpers';
import { FaTimes, FaBookOpen } from 'react-icons/fa';

// ── Collect all unique section references from data ────────────────────────
const ALL_SECTIONS: { ref: string; title: string; category: string }[] = [];
laborRightsData.forEach(cat => {
  cat.rights.forEach(right => {
    if (right.reference) {
      ALL_SECTIONS.push({
        ref:      right.reference,
        title:    right.title,
        category: cat.category,
      });
    }
  });
});

// ── Sections Modal ─────────────────────────────────────────────────────────
interface SectionsModalProps { onClose: () => void; }

const SectionsModal: React.FC<SectionsModalProps> = ({ onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
          <div className="flex items-center gap-3">
            <FaBookOpen className="w-5 h-5" />
            <div>
              <h2 className="font-bold text-lg leading-tight">সকল ধারা তালিকা</h2>
              <p className="text-cyan-100 text-xs">All Sections — Bangladesh Labor Law 2006</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Close"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Section count badge */}
        <div className="px-6 py-2 bg-cyan-50 border-b border-cyan-100 text-xs text-cyan-700 font-medium">
          মোট {ALL_SECTIONS.length} টি ধারা রেফারেন্স · {laborRightsData.length} টি বিভাগ
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
          {ALL_SECTIONS.map((s, i) => (
            <div key={i} className="px-6 py-3 hover:bg-cyan-50 transition-colors">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 min-w-[24px] text-xs font-bold text-cyan-600 bg-cyan-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-cyan-700 truncate">{s.ref}</p>
                  <p className="text-sm text-gray-800 mt-0.5 leading-snug">{s.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};


// ── Main Component ─────────────────────────────────────────────────────────
const WorkerRights: React.FC = () => {
  const [searchQuery, setSearchQuery]           = useState<string>('');
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);
  const [expandedRight, setExpandedRight]       = useState<number | null>(null);
  const [allCategoriesOpen, setAllCategoriesOpen] = useState<boolean>(false);
  const [allRightsOpen, setAllRightsOpen]         = useState<boolean>(false);
  const [showSectionsModal, setShowSectionsModal] = useState<boolean>(false);

  // ── Filter ──────────────────────────────────────────────────────────────
  const filteredCategories = useMemo(
    () => filterCategories(laborRightsData, searchQuery),
    [searchQuery]
  );

  // ── Stats: reactive to search ────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!searchQuery.trim()) return calculateStats(laborRightsData);
    return calculateStats(filteredCategories);
  }, [filteredCategories, searchQuery]);

  // ── Auto-expand on search ────────────────────────────────────────────────
  useEffect(() => {
    if (searchQuery.trim()) {
      setAllCategoriesOpen(true);
      setAllRightsOpen(false);
      setExpandedCategory(null);
    } else {
      setAllCategoriesOpen(false);
      setAllRightsOpen(false);
      setExpandedCategory(null);
      setExpandedRight(null);
    }
  }, [searchQuery]);

  // ── Stat button handlers ─────────────────────────────────────────────────
  const handleClickCategories = () => {
    // Toggle: open all categories, collapse rights
    const next = !allCategoriesOpen;
    setAllCategoriesOpen(next);
    setAllRightsOpen(false);
    setExpandedCategory(null);
    setExpandedRight(null);
    // Scroll to first category card
    if (next) setTimeout(() => {
      document.getElementById('categories-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleClickRights = () => {
    // Toggle: open all categories AND all rights
    const next = !allRightsOpen;
    setAllRightsOpen(next);
    setAllCategoriesOpen(next);
    setExpandedCategory(null);
    setExpandedRight(null);
    if (next) setTimeout(() => {
      document.getElementById('categories-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleClickSections = () => {
    setShowSectionsModal(true);
  };

  // ── Individual toggles ───────────────────────────────────────────────────
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setExpandedRight(null);
  };

  const handleCategoryToggle = (categoryId: number): void => {
    // If all-open mode is on, clicking one collapses the rest
    if (allCategoriesOpen || allRightsOpen) {
      setAllCategoriesOpen(false);
      setAllRightsOpen(false);
      setExpandedCategory(categoryId);
    } else {
      setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    }
    setExpandedRight(null);
  };

  const handleRightToggle = (rightId: number): void => {
    setExpandedRight(expandedRight === rightId ? null : rightId);
  };

  // ── Resolve whether a category is expanded ───────────────────────────────
  const isCategoryExpanded = (categoryId: number): boolean => {
    if (allCategoriesOpen || allRightsOpen) return true;
    if (searchQuery.trim()) return true;
    return expandedCategory === categoryId;
  };

  // ── Resolve whether a right is expanded ─────────────────────────────────
  const isRightExpanded = (rightId: number): boolean => {
    if (allRightsOpen) return true;
    return expandedRight === rightId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Header />

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <StatsCard
        stats={stats}
        onClickCategories={handleClickCategories}
        onClickRights={handleClickRights}
        onClickSections={handleClickSections}
      />

      <div
        id="categories-list"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
      >
        {filteredCategories.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4 md:space-y-5">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isExpanded={isCategoryExpanded(category.id)}
                expandedRight={allRightsOpen ? -1 : expandedRight}
                onToggleCategory={() => handleCategoryToggle(category.id)}
                onToggleRight={handleRightToggle}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />

      {/* Sections Modal */}
      {showSectionsModal && (
        <SectionsModal onClose={() => setShowSectionsModal(false)} />
      )}
    </div>
  );
};

export default WorkerRights;