import React, { useEffect, useState } from 'react';
import { useCart } from './CartContext';
import { toast } from 'react-toastify';
import productsData from '../data/products';
import SimilarProductsModal from './SimilarProductsModal';
import { useRecommendation } from '../context/RecommendationContext';

// Use the imported products as default
const TopProductsScroll = ({ products = productsData }) => {
  const { addToCart } = useCart();
  const { addToViewed } = useRecommendation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // For debugging
  useEffect(() => {
    console.log('TopProductsScroll rendered - THIS SHOULD APPEAR ONLY ONCE');
  }, []);

  // Get the top rated products for the featured section (limit to 8)
  const topRatedProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  // Keep track of featured product IDs to avoid duplicates
  const featuredProductIds = new Set(topRatedProducts.map(p => p.id));
  
  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];
  
  // Get one representative product from each category (the highest rated) that's not already in featured products
  const categoryProducts = categories.flatMap(category => {
    // Get the highest rated product for this category that's not in featured products
    return [...products]
      .filter(product => product.category === category && !featuredProductIds.has(product.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 1);
  }).filter(product => product); // Filter out any undefined values
  
  // If we don't have enough categories, add more products
  if (categoryProducts.length < 8) {
    // Add more products that are not already in featured or category lists
    const remainingSlots = 8 - categoryProducts.length;
    const existingIds = new Set([...featuredProductIds, ...categoryProducts.map(p => p.id)]);
    
    const additionalProducts = [...products]
      .filter(p => !existingIds.has(p.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, remainingSlots);
      
    categoryProducts.push(...additionalProducts);
  }

  const handleQuickAdd = (product) => {
    addToCart({ ...product, quantity: 1 });
    toast.success(`Added ${product.name} to cart`);
  };

  const handleQuickView = (product) => {
    // Record this product as viewed
    addToViewed(product);
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    // First close the modal
    setShowModal(false);
    // Then reset the selected product after a short delay to avoid visual glitches
    setTimeout(() => {
      setSelectedProduct(null);
    }, 100);
  };

  return (
    <div className="product-rows-container">
      {/* FEATURED PRODUCTS ROW */}
      <div className="mb-10">
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
        </div>

        <div className="relative">
          <button 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-100 hidden md:block"
            onClick={() => {
              document.getElementById('featured-products-container')?.scrollBy({ left: -300, behavior: 'smooth' });
            }}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div 
            id="featured-products-container"
            className="flex overflow-x-auto pb-4 pt-2 -mx-4 px-4 scrollbar-hide snap-x scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {topRatedProducts.map(product => (
              <div 
                key={product.id} 
                className="flex-shrink-0 w-72 mx-2 snap-start first:ml-0 last:mr-0"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  {!product.inStock && (
                    <div className="absolute bg-red-500 text-white px-2 py-1 m-2 rounded text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                  
                  <div className="relative h-52 overflow-hidden group">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain bg-white cursor-pointer"
                      onClick={() => handleQuickView(product)}
                    />
                    <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-md text-xs font-medium">
                      {product.category}
                    </div>
                    {/* Quick view overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        className="bg-white text-gray-800 px-4 py-2 rounded-md font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                        onClick={() => handleQuickView(product)}
                      >
                        Quick View
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 
                        className="text-lg font-medium text-gray-800 line-clamp-1 cursor-pointer hover:text-blue-600"
                        onClick={() => handleQuickView(product)}
                      >
                        {product.name}
                      </h3>
                      <span className="font-bold text-blue-600">${product.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-500">({product.rating})</span>
                    </div>
                    
                    <button 
                      onClick={() => handleQuickAdd(product)}
                      disabled={!product.inStock}
                      className={`w-full py-2 rounded-md text-white font-medium transition duration-300 ${
                        product.inStock ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {product.inStock ? 'Quick Add' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-100 hidden md:block"
            onClick={() => {
              document.getElementById('featured-products-container')?.scrollBy({ left: 300, behavior: 'smooth' });
            }}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* SHOP BY CATEGORY ROW */}
      <div className="mb-10">
        <div className="flex items-center justify-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
        </div>

        <div className="relative">
          <button 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-100 hidden md:block"
            onClick={() => {
              document.getElementById('category-products-container')?.scrollBy({ left: -300, behavior: 'smooth' });
            }}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div 
            id="category-products-container"
            className="flex overflow-x-auto pb-4 pt-2 -mx-4 px-4 scrollbar-hide snap-x scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categoryProducts.map(product => (
              <div 
                key={product.id} 
                className="flex-shrink-0 w-72 mx-2 snap-start first:ml-0 last:mr-0"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  {!product.inStock && (
                    <div className="absolute bg-red-500 text-white px-2 py-1 m-2 rounded text-xs font-medium">
                      Out of Stock
                    </div>
                  )}
                  
                  <div className="relative h-52 overflow-hidden group">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain bg-white cursor-pointer"
                      onClick={() => handleQuickView(product)}
                    />
                    <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-md text-xs font-medium">
                      {product.category}
                    </div>
                    {/* Quick view overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        className="bg-white text-gray-800 px-4 py-2 rounded-md font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                        onClick={() => handleQuickView(product)}
                      >
                        Quick View
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 
                        className="text-lg font-medium text-gray-800 line-clamp-1 cursor-pointer hover:text-blue-600"
                        onClick={() => handleQuickView(product)}
                      >
                        {product.name}
                      </h3>
                      <span className="font-bold text-blue-600">${product.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-500">({product.rating})</span>
                    </div>
                    
                    <button 
                      onClick={() => handleQuickAdd(product)}
                      disabled={!product.inStock}
                      className={`w-full py-2 rounded-md text-white font-medium transition duration-300 ${
                        product.inStock ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {product.inStock ? 'Quick Add' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 hover:bg-gray-100 hidden md:block"
            onClick={() => {
              document.getElementById('category-products-container')?.scrollBy({ left: 300, behavior: 'smooth' });
            }}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Product Modal */}
      <SimilarProductsModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        product={selectedProduct}
      />
    </div>
  );
};

export default TopProductsScroll;