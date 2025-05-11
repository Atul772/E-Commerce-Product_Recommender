import React, { useState, useEffect, useRef } from 'react';
import { useRecommendation } from '../context/RecommendationContext';
import { useCart } from './CartContext';
import { toast } from 'react-toastify';

// Simple product card to avoid circular dependencies
const SimilarProductCard = ({ product, handleClick }) => {
  const { id, name, price, image, description, rating, inStock, category } = product;
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer"
      onClick={() => handleClick(product)}
    >
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-contain bg-white" 
        />
        {!inStock && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 m-2 rounded-md text-xs font-medium">
            Out of Stock
          </div>
        )}
        <div className="absolute top-0 left-0 bg-blue-600 text-white px-2 py-1 m-2 rounded-md text-xs font-medium">
          {category}
        </div>
      </div>
      
      {/* Product Details */}
      <div className="p-3">
        <h3 className="text-md font-medium text-gray-800 line-clamp-1">{name}</h3>
        <div className="flex items-center mt-1 mb-1">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-1 text-xs text-gray-500">({rating})</span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{description}</p>
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-gray-800">${price.toFixed(2)}</div>
          <button 
            className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md hover:bg-blue-700"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const SimilarProductsModal = ({ isOpen, onClose, product }) => {
  const { getSimilarProducts, addToViewed } = useRecommendation();
  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({});
  const [selectedSimilarProduct, setSelectedSimilarProduct] = useState(null);
  // Keep track of the original product
  const originalProductRef = useRef(product);

  // Record this product as viewed and keep track of the original product
  useEffect(() => {
    if (isOpen && product) {
      addToViewed(product);
      originalProductRef.current = product;
    }
  }, [isOpen, product, addToViewed]);

  // Reset quantities and selected similar product when modal opens/closes or original product changes
  useEffect(() => {
    if (isOpen) {
      setQuantities({});
      setSelectedSimilarProduct(null);
    }
  }, [isOpen, product]);

  // Get similar products based on the original product, not the selected similar product
  const similarProducts = product ? getSimilarProducts(product, 4) : [];

  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.max(0, currentQuantity + change);
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleAddToCart = (prod) => {
    const productToAdd = prod || product;
    const quantity = quantities[productToAdd.id] || 0;
    if (quantity === 0) {
      toast.error("Please select a quantity");
      return;
    }
    addToCart({ ...productToAdd, quantity });
    toast.success(`Added ${quantity} ${productToAdd.name} to cart`);
    if (prod) {
      // If adding a similar product, switch view to that product
      setSelectedSimilarProduct(null);
    } else {
      // Close modal if adding the main product
      handleCloseModal();
    }
  };

  const handleSimilarProductClick = (similarProduct) => {
    addToViewed(similarProduct);
    setSelectedSimilarProduct(similarProduct);
    setQuantities(prev => ({ ...prev, [similarProduct.id]: prev[similarProduct.id] || 0 }));
  };

  const handleCloseModal = () => {
    // Reset the selectedSimilarProduct before closing
    setSelectedSimilarProduct(null);
    // Delay closing to avoid flickering
    setTimeout(() => {
      onClose();
    }, 10);
  };

  if (!isOpen || !product) return null;

  // If a similar product is selected, show its details
  const displayProduct = selectedSimilarProduct || product;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Product Details</h2>
          <button 
            onClick={handleCloseModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Product Details */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Product Image */}
            <div className="flex-shrink-0 w-full md:w-1/3">
              <img 
                src={displayProduct.image} 
                alt={displayProduct.name} 
                className="w-full h-auto object-contain max-h-80"
              />
            </div>
            
            {/* Product Info */}
            <div className="flex-grow">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{displayProduct.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(displayProduct.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20" 
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-gray-600">({displayProduct.rating})</span>
              </div>
              
              {/* Price */}
              <div className="text-3xl font-bold text-gray-800 mb-4">${displayProduct.price.toFixed(2)}</div>
              
              {/* Description */}
              <p className="text-gray-600 mb-4">{displayProduct.description}</p>
              
              {/* Category Badge */}
              <div className="mb-4">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {displayProduct.category}
                </span>
                <span className={`ml-2 inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  displayProduct.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {displayProduct.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              
              {/* Add to Cart Section */}
              <div className="mt-6">
                <div className="flex items-center mb-4">
                  <span className="text-gray-700 mr-3">Quantity:</span>
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => handleQuantityChange(displayProduct.id, -1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      disabled={!displayProduct.inStock || (quantities[displayProduct.id] || 0) <= 0}
                    >
                      -
                    </button>
                    <span className="w-10 h-10 flex items-center justify-center text-gray-800">
                      {quantities[displayProduct.id] || 0}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(displayProduct.id, 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                      disabled={!displayProduct.inStock}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleAddToCart(selectedSimilarProduct)}
                  disabled={!displayProduct.inStock || (quantities[displayProduct.id] || 0) === 0}
                  className={`w-full py-3 rounded-md text-white font-medium transition duration-300 ${
                    displayProduct.inStock && (quantities[displayProduct.id] || 0) > 0 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {!displayProduct.inStock 
                    ? 'Out of Stock' 
                    : (quantities[displayProduct.id] || 0) === 0 
                      ? 'Add to Cart' 
                      : `Add ${quantities[displayProduct.id]} to Cart`
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <div className="mt-8 px-6 pb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarProducts.map(similarProduct => (
                <SimilarProductCard
                  key={similarProduct.id}
                  product={similarProduct}
                  handleClick={handleSimilarProductClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarProductsModal; 