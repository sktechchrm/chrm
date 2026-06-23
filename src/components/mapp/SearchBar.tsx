import React from 'react';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8">
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 w-5 h-5" />
        <input
          type="text"
          placeholder="অধিকার খুঁজুন... (Search rights...)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-white/50 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 shadow-xl text-base transition-all"
        />
      </div>
    </div>
  );
};

export default SearchBar;