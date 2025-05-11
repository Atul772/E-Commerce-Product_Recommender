import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useFilter } from '../context/FilterContext';
import { toast } from 'react-toastify';
import Navbar from './Navbar';
import Footer from './Footer';
import ProductCard from './ProductCard';
import FilterPanel from './FilterPanel';
import SearchBasedRecommendations from './SearchBasedRecommendations';
import products from '../data/products';

// Expanded keyword mapping for common search terms
const keywordMapping = {
  // Clothing/Fashion
  "tshirt": ["t-shirt", "tee", "shirt", "top"],
  "shirt": ["t-shirt", "tee", "top", "button-up", "dress shirt"],
  "pants": ["jeans", "trousers", "slacks", "bottoms"],
  "shoes": ["sneakers", "footwear", "boots", "running shoes"],
  "jacket": ["coat", "hoodie", "sweater", "outerwear"],
  // Electronics
  "phone": ["smartphone", "mobile", "cell phone"],
  "laptop": ["computer", "notebook", "pc"],
  "headphones": ["earbuds", "earphones", "headset"],
  // Generic
  "cheap": ["affordable", "budget", "low price", "inexpensive"],
  "sale": ["discount", "deal", "clearance", "reduced"]
};

// Helper function for fuzzy search - calculates similarity between two strings
const calculateSimilarity = (str1, str2) => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Exact match gets highest score
  if (s1 === s2) return 1.0;
  
  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    // Longer overlap = higher score
    const overlapLength = Math.min(s1.length, s2.length);
    const maxLength = Math.max(s1.length, s2.length);
    return overlapLength / maxLength;
  }
  
  // Check for word matches (partial match)
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  let matchCount = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1.includes(word2) || word2.includes(word1)) {
        matchCount++;
      }
    }
  }
  
  if (matchCount > 0) {
    return matchCount / Math.max(words1.length, words2.length) * 0.8; // Partial word match
  }
  
  // No match
  return 0;
};

// Check if a product matches expanded keywords
const productMatchesKeywords = (product, searchTerms) => {
  // Fields to check in the product
  const fieldsToCheck = [
    product.name,
    product.category,
    product.description
  ];
  
  // Check each search term against the product
  for (const term of searchTerms) {
    // Get expanded keywords if they exist
    const expandedTerms = keywordMapping[term.toLowerCase()] || [term];
    
    // Check if any expanded term matches any field
    for (const expandedTerm of expandedTerms) {
      for (const field of fieldsToCheck) {
        if (field.toLowerCase().includes(expandedTerm.toLowerCase())) {
          return true;
        }
      }
    }
  }
  
  return false;
};

const SearchResults = () => {
  const location = useLocation();
  const { addToCart } = useCart();
  const { getFilteredProducts, setSearchTerm } = useFilter();
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [visibleProducts, setVisibleProducts] = useState(8); // Initially show 8 products
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Extract query from URL
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('query')?.toLowerCase() || '';

    // Update search term in FilterContext and local state
    setSearchTerm(query);
    setSearchQuery(query);

    // Reset visible products when search query changes
    setVisibleProducts(8);

    // Perform enhanced search
    if (query) {
      // Split query into terms for better matching
      const searchTerms = query.split(/\s+/).filter(term => term.length > 0);
      
      // First try direct keyword matching
      const keywordMatches = products.filter(product => 
        productMatchesKeywords(product, searchTerms)
      );
      
      if (keywordMatches.length > 0) {
        // If we found matches using keywords, use them
        setSearchResults(keywordMatches);
      } else {
        // Fall back to the original fuzzy search algorithm
        const scoredResults = products.map(product => {
          // Calculate scores for different fields with different weights
          const nameScore = calculateSimilarity(product.name, query) * 0.6; // Name has highest weight
          const categoryScore = calculateSimilarity(product.category, query) * 0.2;
          const descriptionScore = calculateSimilarity(product.description, query) * 0.2;
          
          // Combine scores
          const totalScore = nameScore + categoryScore + descriptionScore;
          
          return {
            product,
            score: totalScore
          };
        });
        
        // Filter products with non-zero scores and sort by score
        const filteredAndSorted = scoredResults
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .map(item => item.product);
        
        setSearchResults(filteredAndSorted);
      }
    } else {
      setSearchResults([]);
    }
  }, [location.search, setSearchTerm]);

  // Apply additional filters to search results when search results or filters change
  useEffect(() => {
    const filtered = getFilteredProducts(searchResults);
    setFilteredResults(filtered);
  }, [searchResults, getFilteredProducts]);
  
  // Get only the visible subset of search results
  const displayedProducts = filteredResults.slice(0, visibleProducts);
  
  // Load more products function
  const loadMoreProducts = () => {
    setVisibleProducts(prev => prev + 8); // Load 8 more products
  };

  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 0;
    if (quantity === 0) {
      toast.error("Please select a quantity");
      return;
    }
    addToCart({ ...product, quantity });
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="bg-gray-100 p-6 flex-grow">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            Search Results for "{new URLSearchParams(location.search).get('query')}"
          </h1>

          {/* Filter Toggle for Mobile */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setIsFilterVisible(!isFilterVisible)}
              className="flex items-center justify-center w-full py-2 px-4 bg-white shadow rounded-md text-gray-700"
            >
              <svg 
                className="w-5 h-5 mr-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
                />
              </svg>
              {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {/* Filter Panel - Now at the top */}
          <div className={`mb-6 ${isFilterVisible ? 'block' : 'hidden md:block'}`}>
            <FilterPanel isVisible={true} onClose={() => setIsFilterVisible(false)} />
          </div>

          {/* Results Count */}
          <div className="mb-4 text-gray-600">
            Showing {displayedProducts.length} of {filteredResults.length} results
            {filteredResults.length !== searchResults.length && 
              ` (filtered from ${searchResults.length} matching products)`
            }
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white p-10 rounded-lg shadow-md text-center">
              <svg 
                className="w-16 h-16 text-gray-400 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Results Found</h2>
              <p className="text-gray-500 mb-6">We couldn't find any products matching your search.</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Browse All Products
              </button>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="bg-white p-10 rounded-lg shadow-md text-center">
              <svg 
                className="w-16 h-16 text-gray-400 mx-auto mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Matching Products</h2>
              <p className="text-gray-500 mb-6">
                We found {searchResults.length} products matching your search term, 
                but none match your current filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  quantity={quantities[product.id] || 0}
                  handleQuantityChange={handleQuantityChange}
                  handleAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
          
          {/* "See More" button - only show if there are more products to load */}
          {visibleProducts < filteredResults.length && (
            <div className="flex justify-center mt-10">
              <button 
                onClick={loadMoreProducts}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-md transition duration-300 flex items-center"
              >
                <span>See More Results</span>
                <svg 
                  className="w-5 h-5 ml-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Search-based Recommendations Section */}
          {searchResults.length > 0 && (
            <SearchBasedRecommendations 
              searchQuery={searchQuery} 
              searchResults={searchResults}
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchResults;