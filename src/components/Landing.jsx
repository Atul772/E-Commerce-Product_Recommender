import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gray-100">
      {/* Existing Landing content */}
      <header className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-r from-blue-400 to-purple-600 text-white">
        <h2 className="text-4xl font-extrabold mb-4">Find Everything You Need</h2>
        <p className="text-lg mb-6">Discover the best suggestions for all your favorite products.</p>
        <button 
          onClick={() => navigate('/products')}
          className="px-6 py-3 bg-white text-green-600 rounded-md hover:bg-gray-200 transition-colors duration-300"
        >
          Shop Now
        </button>
      </header>
    </div>
  );
};

export default Landing;