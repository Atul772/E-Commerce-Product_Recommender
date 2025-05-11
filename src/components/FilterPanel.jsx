import React, { useState } from 'react';
import { useFilter } from '../context/FilterContext';

const FilterPanel = ({ isVisible, onClose }) => {
  const { 
    minPrice, 
    maxPrice, 
    priceRange, 
    setMinPrice, 
    setMaxPrice, 
    selectedCategories, 
    toggleCategory, 
    allCategories,
    ratingFilter,
    setRatingFilter,
    resetFilters
  } = useFilter();
  
  // Local state to track if the mobile filter details are expanded
  const [expandedSection, setExpandedSection] = useState(null);

  // Format price for display
  const formatPrice = (price) => `$${price}`;

  // Generate ratings stars array (4 to 1)
  const ratingOptions = [4, 3, 2, 1];
  
  // Toggle expanded section
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className={`bg-white shadow-lg rounded-lg p-4 ${isVisible ? 'block' : 'hidden md:block'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <div className="flex space-x-2">
          <button 
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Reset All
          </button>
          <button 
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop horizontal layout */}
      <div className="hidden md:flex gap-8 flex-wrap">
        {/* Price Range Filter */}
        <div className="mb-4 w-auto">
          <h4 className="font-medium text-gray-700 mb-2">Price Range</h4>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">{formatPrice(minPrice)}</span>
            <span className="mx-2">-</span>
            <span className="text-sm text-gray-600">{formatPrice(maxPrice)}</span>
          </div>
          
          <div className="relative h-1 bg-gray-200 rounded-full w-60">
            {/* Lower price slider */}
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={minPrice}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value < maxPrice) {
                  setMinPrice(value);
                }
              }}
              className="absolute w-full h-1 appearance-none bg-transparent pointer-events-auto"
              style={{ zIndex: 1 }}
            />

            {/* Upper price slider */}
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={maxPrice}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value > minPrice) {
                  setMaxPrice(value);
                }
              }}
              className="absolute w-full h-1 appearance-none bg-transparent pointer-events-auto"
              style={{ zIndex: 1 }}
            />

            {/* Colored range */}
            <div 
              className="absolute h-1 bg-blue-500 rounded-full" 
              style={{ 
                left: `${((minPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`, 
                right: `${100 - ((maxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%` 
              }}
            ></div>
          </div>
          
          {/* Price input fields */}
          <div className="flex items-center mt-3 gap-2">
            <div className="w-24">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= priceRange.min && value < maxPrice) {
                    setMinPrice(value);
                  }
                }}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="Min"
              />
            </div>
            <span className="text-gray-400">-</span>
            <div className="w-24">
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value <= priceRange.max && value > minPrice) {
                    setMaxPrice(value);
                  }
                }}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-4 w-auto border-l border-gray-200 pl-8">
          <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
          <div className="flex flex-wrap gap-2">
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 text-sm rounded-full transition duration-300 ${
                  selectedCategories.includes(category) 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="mb-4 w-auto border-l border-gray-200 pl-8">
          <h4 className="font-medium text-gray-700 mb-2">Rating</h4>
          <div className="flex flex-col space-y-2">
            {ratingOptions.map((rating) => (
              <div key={rating} className="flex items-center">
                <input
                  type="radio"
                  id={`rating-desktop-${rating}`}
                  name="rating-desktop"
                  checked={ratingFilter === rating}
                  onChange={() => setRatingFilter(rating)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label 
                  htmlFor={`rating-desktop-${rating}`}
                  className="ml-2 flex items-center text-gray-700 cursor-pointer"
                >
                  {[...Array(rating)].map((_, i) => (
                    <svg 
                      key={i}
                      className="w-4 h-4 text-yellow-400" 
                      fill="currentColor" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-sm">& Up</span>
                </label>
              </div>
            ))}
            {ratingFilter > 0 && (
              <button 
                onClick={() => setRatingFilter(0)}
                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
              >
                Clear Rating
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile accordion layout */}
      <div className="md:hidden space-y-3">
        {/* Price Range Accordion */}
        <div className="border rounded-md overflow-hidden">
          <button
            onClick={() => toggleSection('price')}
            className="w-full px-4 py-2 flex justify-between items-center bg-gray-50"
          >
            <span className="font-medium">Price Range: {formatPrice(minPrice)} - {formatPrice(maxPrice)}</span>
            <svg 
              className={`w-5 h-5 transition-transform ${expandedSection === 'price' ? 'transform rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === 'price' && (
            <div className="px-4 py-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{formatPrice(minPrice)}</span>
                <span className="text-sm text-gray-600">{formatPrice(maxPrice)}</span>
              </div>
              
              <div className="relative h-1 bg-gray-200 rounded-full">
                {/* Lower price slider */}
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={minPrice}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value < maxPrice) {
                      setMinPrice(value);
                    }
                  }}
                  className="absolute w-full h-1 appearance-none bg-transparent pointer-events-auto"
                  style={{ zIndex: 1 }}
                />

                {/* Upper price slider */}
                <input
                  type="range"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={maxPrice}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > minPrice) {
                      setMaxPrice(value);
                    }
                  }}
                  className="absolute w-full h-1 appearance-none bg-transparent pointer-events-auto"
                  style={{ zIndex: 1 }}
                />

                {/* Colored range */}
                <div 
                  className="absolute h-1 bg-blue-500 rounded-full" 
                  style={{ 
                    left: `${((minPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`, 
                    right: `${100 - ((maxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%` 
                  }}
                ></div>
              </div>
              
              {/* Price input fields */}
              <div className="flex items-center mt-4 gap-2">
                <div className="w-full">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= priceRange.min && value < maxPrice) {
                        setMinPrice(value);
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="Min"
                  />
                </div>
                <span className="text-gray-400">-</span>
                <div className="w-full">
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value <= priceRange.max && value > minPrice) {
                        setMaxPrice(value);
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories Accordion */}
        <div className="border rounded-md overflow-hidden">
          <button
            onClick={() => toggleSection('categories')}
            className="w-full px-4 py-2 flex justify-between items-center bg-gray-50"
          >
            <span className="font-medium">Categories</span>
            <svg 
              className={`w-5 h-5 transition-transform ${expandedSection === 'categories' ? 'transform rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === 'categories' && (
            <div className="px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {allCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-3 py-1 text-sm rounded-full transition duration-300 ${
                      selectedCategories.includes(category) 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rating Accordion */}
        <div className="border rounded-md overflow-hidden">
          <button
            onClick={() => toggleSection('rating')}
            className="w-full px-4 py-2 flex justify-between items-center bg-gray-50"
          >
            <span className="font-medium">Rating</span>
            <svg 
              className={`w-5 h-5 transition-transform ${expandedSection === 'rating' ? 'transform rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === 'rating' && (
            <div className="px-4 py-3">
              <div className="space-y-2">
                {ratingOptions.map((rating) => (
                  <div key={rating} className="flex items-center">
                    <input
                      type="radio"
                      id={`rating-mobile-${rating}`}
                      name="rating-mobile"
                      checked={ratingFilter === rating}
                      onChange={() => setRatingFilter(rating)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <label 
                      htmlFor={`rating-mobile-${rating}`}
                      className="ml-2 flex items-center text-gray-700 cursor-pointer"
                    >
                      {[...Array(rating)].map((_, i) => (
                        <svg 
                          key={i}
                          className="w-4 h-4 text-yellow-400" 
                          fill="currentColor" 
                          viewBox="0 0 20 20" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-1 text-sm">& Up</span>
                    </label>
                  </div>
                ))}
                {ratingFilter > 0 && (
                  <button 
                    onClick={() => setRatingFilter(0)}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                  >
                    Clear Rating
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel; 