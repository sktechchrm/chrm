import React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Category } from './index';
import RightItem from './RightItem';

interface CategoryCardProps {
  category: Category;
  isExpanded: boolean;
  expandedRight: number | null;
  onToggleCategory: () => void;
  onToggleRight: (rightId: number) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  isExpanded,
  expandedRight,
  onToggleCategory,
  onToggleRight,
}) => {
  const Icon = category.icon;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
      {/* Category Header */}
      <button
        onClick={onToggleCategory}
        className="w-full px-4 md:px-6 py-5 md:py-6 flex items-center justify-between transition-all duration-300 hover:bg-gray-50 group"
        style={{
          borderLeft: `6px solid ${category.color}`,
        }}
      >
        <div className="flex items-center gap-3 md:gap-4">
          <div
            className="p-3 md:p-4 rounded-xl shadow-md transform group-hover:scale-110 transition-transform"
            style={{ backgroundColor: `${category.color}15` }}
          >
            <Icon
              style={{ color: category.color }}
              className="w-6 h-6 md:w-7 md:h-7"
            />
          </div>
          <div className="text-left">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
              {category.category}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              {category.rights.length} টি অধিকার
            </p>
          </div>
        </div>
        {isExpanded ? (
          <FaChevronUp className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
        ) : (
          <FaChevronDown className="w-5 h-5 md:w-6 md:h-6 text-gray-400 group-hover:text-emerald-600 transition-colors" />
        )}
      </button>

      {/* Rights List */}
      {isExpanded && (
        <div className="border-t border-gray-100">
          {category.rights.map((right) => (
            <RightItem
              key={right.id}
              right={right}
              isExpanded={expandedRight === -1 || expandedRight === right.id}
              onToggle={() => onToggleRight(right.id)}
              categoryColor={category.color}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;