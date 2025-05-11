import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useRecommendation } from '../context/RecommendationContext';
import SimilarProductsModal from './SimilarProductsModal';

const ProductCard = ({ product, quantity, handleQuantityChange, handleAddToCart }) => {
  const { id, name, price, image, description, rating, inStock, category } = product;
  const [showViewCart, setShowViewCart] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { addToViewed } = useRecommendation();

  const handleAddToCartClick = () => {
    handleAddToCart(product);
    setShowViewCart(true);
  };

  const handleQuickView = () => {
    // Record this product as viewed
    addToViewed(product);
    
    // Show product modal
    setShowModal(true);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1">
        {/* Product Badge */}
        {!inStock && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 m-2 rounded-md text-xs font-medium z-10">
            Out of Stock
          </div>
        )}
        
        {/* Product Image with Category Badge */}
        <div className="relative h-56 overflow-hidden group">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-contain bg-white transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-md text-xs font-medium">
            {category}
          </div>
          
          {/* Quick view overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              className="bg-white text-gray-800 px-4 py-2 rounded-md font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
              onClick={handleQuickView}
            >
              Quick View
            </button>
          </div>
        </div>
        
        {/* Product Details */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="text-lg font-medium text-gray-800 mb-1 line-clamp-1 cursor-pointer hover:text-blue-600"
              onClick={handleQuickView}>
            {name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-500">({rating})</span>
          </div>
          
          {/* Description */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
          
          {/* Price and Actions */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-xl font-bold text-gray-800">${price.toFixed(2)}</div>
            
            {/* Quantity Selector */}
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => handleQuantityChange(id, -1)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-r"
                disabled={!inStock || (quantity || 0) <= 0}
              >
                -
              </button>
              <span className="w-8 h-8 flex items-center justify-center text-gray-800">
                {quantity || 0}
              </span>
              <button
                onClick={() => handleQuantityChange(id, 1)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 border-l"
                disabled={!inStock}
              >
                +
              </button>
            </div>
          </div>
          
          {/* Add to Cart & View Cart Buttons */}
          <div className="flex flex-col space-y-2">
            <button 
              onClick={handleAddToCartClick}
              disabled={!inStock || (quantity || 0) === 0}
              className={`w-full py-2 rounded-md text-white font-medium transition duration-300 ${
                inStock && (quantity || 0) > 0
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {!inStock 
                ? 'Out of Stock' 
                : (quantity || 0) === 0 
                  ? 'Add to Cart' 
                  : `Add ${quantity} to Cart`}
            </button>
            
            {showViewCart && (
              <button 
                onClick={() => navigate('/cart')}
                className="w-full py-2 border border-blue-600 rounded-md text-blue-600 font-medium hover:bg-blue-50 transition duration-300"
              >
                View Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Modal */}
      <SimilarProductsModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        product={product}
      />
    </>
  );
};

export default ProductCard; 