import React from 'react';
import { FaChevronDown, FaChevronUp, FaBalanceScale } from 'react-icons/fa';
import { LaborRight } from './index';

interface RightItemProps {
  right: LaborRight;
  isExpanded: boolean;
  onToggle: () => void;
  categoryColor: string;
}

const RightItem: React.FC<RightItemProps> = ({
  right,
  isExpanded,
  onToggle,
  categoryColor,
}) => {
  return (
    <div className="border-t border-gray-100 first:border-t-0">
      <button
        onClick={onToggle}
        className="w-full px-4 md:px-6 py-4 md:py-5 flex items-start justify-between hover:bg-gray-50 transition-colors duration-200 text-left group"
      >
        <div className="flex-1 pr-4">
          <h3 className="font-semibold text-gray-800 text-base md:text-lg mb-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {right.title}
          </h3>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-3">
            {right.details}
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
            <FaBalanceScale className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="text-xs md:text-sm font-medium text-emerald-700">
              {right.reference}
            </span>
          </div>
        </div>
        {isExpanded ? (
          <FaChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1 group-hover:text-emerald-600 transition-colors" />
        ) : (
          <FaChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1 group-hover:text-emerald-600 transition-colors" />
        )}
      </button>

      {isExpanded && right.provisions && (
        <div className="px-4 md:px-6 pb-5 pt-2">
          <div
            className="rounded-xl p-4 md:p-5 border-2 transition-all"
            style={{
              backgroundColor: `${categoryColor}08`,
              borderColor: `${categoryColor}30`,
            }}
          >
            <h4 className="font-semibold text-gray-800 mb-4 text-sm md:text-base flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: categoryColor }}
              ></div>
              বিস্তারিত বিধান:
            </h4>
            <ul className="space-y-3">
              {right.provisions.map((provision, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm md:text-base text-gray-700 leading-relaxed"
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: categoryColor }}
                  ></span>
                  <span>{provision.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightItem;