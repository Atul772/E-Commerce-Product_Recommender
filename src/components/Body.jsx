import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import ProductCard from './ProductCard';
import FilterPanel from './FilterPanel';
import { useFilter } from '../context/FilterContext';
import Navbar from './Navbar';
import Footer from './Footer';
import PersonalizedRecommendations from './PersonalizedRecommendations';
import products from '../data/products';

function Body() {
  const { addToCart } = useCart();
  const { getFilteredProducts } = useFilter();
  const [quantities, setQuantities] = useState({});
  const [visibleProducts, setVisibleProducts] = useState(8); // Initially show 8 products
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [isFromRecommendations, setIsFromRecommendations] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user came from recommendations
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('source') === 'recommendations') {
      setIsFromRecommendations(true);
    }
  }, [location]);

  // Get filtered and sorted products
  const filteredProducts = getFilteredProducts();
  
  // Sort products by rating (highest first)
  const sortedProducts = filteredProducts.sort((a, b) => b.rating - a.rating);
  
  // Get only the visible subset of products
  const displayedProducts = sortedProducts.slice(0, visibleProducts);
  
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
    // Don't reset quantity or navigate away
    // setQuantities({ ...quantities, [product.id]: 0 });
    // navigate('/cart');
  };

  return (
    <div>
      <Navbar />
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="container mx-auto">
          <h2 id="all-products" className="text-3xl font-bold text-gray-800 text-center mb-8">Our Products</h2>
          
          {/* Show recommendation message if user came from recommendations */}
          {isFromRecommendations && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Viewing all products from your personalized recommendations. Feel free to use the filters to narrow down your selection.
                  </p>
                </div>
              </div>
            </div>
          )}
          
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
          
          {/* Filter Panel - Now above the product grid */}
          <div className={`mb-6 ${isFilterVisible ? 'block' : 'hidden md:block'}`}>
            <FilterPanel isVisible={true} onClose={() => setIsFilterVisible(false)} />
          </div>
          
          {/* Product Count */}
          <div className="mb-4 text-gray-600">
            Showing {displayedProducts.length} of {sortedProducts.length} products
          </div>
          
          {/* Product Grid */}
          {sortedProducts.length === 0 ? (
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h2>
              <p className="text-gray-500 mb-6">Try changing your filter criteria</p>
            </div>
          ) : (
            <>
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
              
              {/* "See More" button - only show if there are more products to load */}
              {visibleProducts < sortedProducts.length && (
                <div className="flex justify-center mt-10">
                  <button 
                    onClick={loadMoreProducts}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-md transition duration-300 flex items-center"
                  >
                    <span>See More Products</span>
                    <svg 
                      className="w-5 h-5 ml-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
          
          {/* Personalized Recommendations Section */}
          <PersonalizedRecommendations />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Body;