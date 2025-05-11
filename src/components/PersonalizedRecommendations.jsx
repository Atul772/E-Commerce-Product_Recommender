import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecommendation } from '../context/RecommendationContext';
import { useCart } from './CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import SimilarProductsModal from './SimilarProductsModal';

// Simple product card to avoid circular dependencies
const ProductCardSimple = ({ product, quantity, handleQuantityChange, handleAddToCart, onQuickView }) => {
  const { id, name, price, image, description, rating, inStock, category } = product;
  const [showViewCart, setShowViewCart] = useState(false);
  const navigate = useNavigate();

  const handleAddToCartClick = () => {
    handleAddToCart(product);
    setShowViewCart(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
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
          className="w-full h-full object-contain bg-white cursor-pointer" 
          onClick={() => onQuickView(product)}
        />
        <div className="absolute top-0 left-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-md text-xs font-medium">
          {category}
        </div>
        
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            className="bg-white text-gray-800 px-4 py-2 rounded-md font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            onClick={() => onQuickView(product)}
          >
            Quick View
          </button>
        </div>
      </div>
      
      {/* Product Details */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-lg font-medium text-gray-800 mb-1 line-clamp-1 cursor-pointer hover:text-blue-600"
            onClick={() => onQuickView(product)}>
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
  );
};

const PersonalizedRecommendations = ({ title }) => {
  const { recommendations } = useRecommendation();
  const { addToCart } = useCart();
  const { addToViewed } = useRecommendation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Get personalized recommendations
  const forYouProducts = recommendations.forYou;
  
  // Return early if no recommendations
  if (forYouProducts.length === 0) {
    return null;
  }

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
    <div className="mt-12 mb-8 bg-gray-50 py-8 px-4 rounded-lg shadow-inner">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        {title || (currentUser ? "Recommended For You" : "Top Picks For You")}
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        {currentUser 
          ? "Products picked just for you based on your preferences" 
          : "Popular products you might be interested in"}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {forYouProducts.slice(0, 8).map((product) => (
          <ProductCardSimple
            key={product.id}
            product={product}
            quantity={quantities[product.id] || 0}
            handleQuantityChange={handleQuantityChange}
            handleAddToCart={handleAddToCart}
            onQuickView={handleQuickView}
          />
        ))}
      </div>
      
      {forYouProducts.length > 8 && (
        <div className="flex justify-center mt-8">
          <button 
            onClick={() => navigate('/products?source=recommendations')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-md transition duration-300 flex items-center"
          >
            <span>See More Recommendations</span>
            <svg 
              className="w-5 h-5 ml-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
        </div>
      )}

      {/* Product Modal */}
      <SimilarProductsModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        product={selectedProduct}
      />
    </div>
  );
};

export default PersonalizedRecommendations; 