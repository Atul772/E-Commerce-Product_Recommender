// src/components/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const { currentUser } = useAuth();

  // Load cart when user changes
  useEffect(() => {
    const loadCart = async () => {
      // Clear cart on logout
      if (!currentUser) {
        setCart([]);
        setCartTotal(0);
        localStorage.removeItem('cart');
        return;
      }

      try {
        // Try to load cart from Firestore first
        const cartDocRef = doc(db, "carts", currentUser.uid);
        const cartDoc = await getDoc(cartDocRef);
        
        if (cartDoc.exists() && cartDoc.data().items) {
          const loadedCart = cartDoc.data().items;
          setCart(loadedCart);
          
          // Calculate total
          const total = loadedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          setCartTotal(total);
          
          // Also update localStorage for fallback
          localStorage.setItem('cart', JSON.stringify(loadedCart));
        } else {
          // If no cart in Firestore, try localStorage as fallback for first-time setup
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            setCart(parsedCart);
            
            // Calculate total
            const total = parsedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            setCartTotal(total);
            
            // Save to Firestore for future
            await setDoc(cartDocRef, { 
              items: parsedCart,
              updatedAt: new Date()
            });
          } else {
            // No cart anywhere, start fresh
            setCart([]);
            setCartTotal(0);
            
            // Initialize empty cart in Firestore
            await setDoc(cartDocRef, { 
              items: [],
              updatedAt: new Date()
            });
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback to localStorage if Firestore fails
        try {
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            setCart(parsedCart);
            const total = parsedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            setCartTotal(total);
          } else {
            setCart([]);
            setCartTotal(0);
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
          setCart([]);
          setCartTotal(0);
        }
      }
    };

    loadCart();
  }, [currentUser]);

  // Save cart whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      if (!currentUser || cart.length === 0) return;

      try {
        // Save to Firestore
        const cartDocRef = doc(db, "carts", currentUser.uid);
        await updateDoc(cartDocRef, { 
          items: cart,
          updatedAt: new Date()
        });
        
        // Also update localStorage as backup
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Calculate total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setCartTotal(total);
      } catch (error) {
        console.error('Error saving cart to Firestore:', error);
        // Still try to save to localStorage as fallback
        try {
          localStorage.setItem('cart', JSON.stringify(cart));
        } catch (localError) {
          console.error('Error saving to localStorage:', localError);
        }
      }
    };

    saveCart();
  }, [cart, currentUser]);

  const addToCart = (product) => {
    if (!product || !product.id) {
      toast.error("Invalid product");
      return;
    }

    if (!currentUser) {
      toast.error("Please sign in to add items to your cart");
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      } else {
        // Add new item if it doesn't exist
        const newItem = { ...product, quantity: product.quantity || 1 };
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item.id !== productId);
      return updatedCart;
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = async () => {
    setCart([]);
    setCartTotal(0);
    
    if (currentUser) {
      try {
        // Clear in Firestore
        const cartDocRef = doc(db, "carts", currentUser.uid);
        await updateDoc(cartDocRef, { 
          items: [],
          updatedAt: new Date()
        });
      } catch (error) {
        console.error("Error clearing cart in Firestore:", error);
      }
    }
    
    // Also clear localStorage
    localStorage.removeItem('cart');
    toast.success("Cart cleared");
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cart,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
