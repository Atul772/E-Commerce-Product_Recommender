import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../components/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import products from '../data/products';
import { useCart } from '../components/CartContext';

const RecommendationContext = createContext();

export const useRecommendation = () => {
  return useContext(RecommendationContext);
};

export const RecommendationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { cart } = useCart();
  const [viewedProducts, setViewedProducts] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [recommendations, setRecommendations] = useState({
    forYou: [],
    trending: [],
  });

  // Load order history when user changes
  useEffect(() => {
    const fetchOrderHistory = async () => {
      if (!currentUser?.uid) {
        setOrderHistory([]);
        return;
      }

      try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const orders = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.items && Array.isArray(data.items)) {
            orders.push(...data.items);
          }
        });
        
        setOrderHistory(orders);
      } catch (error) {
        console.error('Error fetching order history:', error);
      }
    };

    fetchOrderHistory();
  }, [currentUser]);

  // Add a product to viewed products list - can be called from quick view or any interaction
  const addToViewed = (product) => {
    if (!product) return;
    
    setViewedProducts(prev => {
      // Check if product already exists in the viewed list
      const exists = prev.some(item => item.id === product.id);
      
      if (exists) {
        // Move it to the front of the list if it exists
        return [
          product,
          ...prev.filter(item => item.id !== product.id)
        ];
      } else {
        // Add to front, keep max 20 items
        const newList = [product, ...prev];
        return newList.slice(0, 20);
      }
    });
  };

  // Generate recommendations based on viewed products, order history, and cart
  useEffect(() => {
    const generateRecommendations = () => {
      // Get categories user is interested in
      const interestCategories = new Set();
      const interestIds = new Set();
      
      // Add from viewed products
      viewedProducts.forEach(product => {
        interestCategories.add(product.category);
        interestIds.add(product.id);
      });
      
      // Add from order history
      orderHistory.forEach(item => {
        interestCategories.add(item.category);
        interestIds.add(item.id);
      });
      
      // Add from cart items
      cart.forEach(item => {
        interestCategories.add(item.category);
        interestIds.add(item.id);
      });
      
      // Convert to array
      const categories = Array.from(interestCategories);
      const excludeIds = Array.from(interestIds);
      
      // Generate "For You" recommendations
      let forYouRecs = [];
      
      // If we have categories of interest, recommend products from those categories
      if (categories.length > 0) {
        forYouRecs = products
          .filter(product => 
            categories.includes(product.category) && 
            !excludeIds.includes(product.id) &&
            product.inStock
          )
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 8);
      } else {
        // If no history, recommend top-rated products
        forYouRecs = products
          .filter(product => product.inStock)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 8);
      }
      
      // Generate trending/popular recommendations (top rated products)
      const trendingRecs = products
        .filter(product => product.inStock)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 8);
      
      setRecommendations({
        forYou: forYouRecs,
        trending: trendingRecs
      });
    };
    
    generateRecommendations();
  }, [viewedProducts, orderHistory, cart]);

  // Get similar products based on a given product (for "You might also like" in quick view)
  const getSimilarProducts = (product, limit = 4) => {
    if (!product) return [];
    
    // Get products in the same category
    const sameCategory = products.filter(p => 
      p.id !== product.id && 
      p.category === product.category &&
      p.inStock
    );
    
    // Sort by rating
    return sameCategory
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  };
  
  // Get search-based recommendations
  const getSearchRecommendations = (searchQuery, searchResults, limit = 8) => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    // Extract search categories from results
    const searchCategories = new Set();
    const searchIds = new Set();
    
    searchResults.forEach(product => {
      searchCategories.add(product.category);
      searchIds.add(product.id);
    });
    
    // Get products from categories found in search results but not in the results themselves
    const categoryRecs = products
      .filter(product => 
        searchCategories.size > 0 && 
        searchCategories.has(product.category) && 
        !searchIds.has(product.id) &&
        product.inStock
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
    
    // If we don't have enough category-based recommendations, add some based on user history
    if (categoryRecs.length < limit) {
      const remainingLimit = limit - categoryRecs.length;
      const categoryIds = new Set(categoryRecs.map(product => product.id));
      
      // Add products from user's interest categories
      const interestCategories = new Set();
      
      // Add from viewed products, order history, and cart
      [...viewedProducts, ...orderHistory, ...cart].forEach(item => {
        if (item && item.category) {
          interestCategories.add(item.category);
        }
      });
      
      const historyRecs = products
        .filter(product => 
          !searchIds.has(product.id) &&
          !categoryIds.has(product.id) &&
          interestCategories.has(product.category) &&
          product.inStock
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, remainingLimit);
      
      return [...categoryRecs, ...historyRecs];
    }
    
    return categoryRecs;
  };

  const value = {
    viewedProducts,
    addToViewed,
    recommendations,
    getSimilarProducts,
    getSearchRecommendations
  };

  return (
    <RecommendationContext.Provider value={value}>
      {children}
    </RecommendationContext.Provider>
  );
}; 