import React, { createContext, useContext, useState, useEffect } from 'react';
import products from '../data/products';

// Create context
const FilterContext = createContext(null);

// Create custom hook for using the filter context
export const useFilter = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};

// Get min and max price from all products
const getMinMaxPrice = () => {
  const prices = products.map(p => p.price);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices))
  };
};

// Get all unique categories
const getAllCategories = () => {
  return ['All', ...new Set(products.map(p => p.category))];
};

export const FilterProvider = ({ children }) => {
  const priceRange = getMinMaxPrice();
  const allCategories = getAllCategories();
  
  // Filter states
  const [minPrice, setMinPrice] = useState(priceRange.min);
  const [maxPrice, setMaxPrice] = useState(priceRange.max);
  const [selectedCategories, setSelectedCategories] = useState(['All']);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  // Update search suggestions when search term changes
  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const lowercaseTerm = searchTerm.toLowerCase();
      const suggestions = products
        .filter(product => 
          product.name.toLowerCase().includes(lowercaseTerm) ||
          product.description.toLowerCase().includes(lowercaseTerm) ||
          product.category.toLowerCase().includes(lowercaseTerm)
        )
        .slice(0, 5) // Limit to 5 suggestions
        .map(product => ({
          id: product.id,
          text: product.name,
          category: product.category
        }));
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchTerm]);

  // Reset all filters
  const resetFilters = () => {
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setSelectedCategories(['All']);
    setRatingFilter(0);
  };

  // Toggle category selection
  const toggleCategory = (category) => {
    if (category === 'All') {
      setSelectedCategories(['All']);
      return;
    }
    
    const newCategories = selectedCategories.includes('All') 
      ? [category] 
      : selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories, category];
    
    if (newCategories.length === 0) {
      setSelectedCategories(['All']);
    } else {
      setSelectedCategories(newCategories);
    }
  };

  // Apply filters to products
  const getFilteredProducts = (productsToFilter = products) => {
    return productsToFilter.filter(product => {
      // Price filter
      const priceMatch = product.price >= minPrice && product.price <= maxPrice;
      
      // Category filter
      const categoryMatch = selectedCategories.includes('All') || 
                           selectedCategories.includes(product.category);
      
      // Rating filter
      const ratingMatch = product.rating >= ratingFilter;
      
      return priceMatch && categoryMatch && ratingMatch;
    });
  };

  const value = {
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
    resetFilters,
    getFilteredProducts,
    searchTerm,
    setSearchTerm,
    searchSuggestions
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext; 