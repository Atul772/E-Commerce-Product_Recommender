import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import { CartProvider } from "./CartContext"; // Import CartProvider
import { FilterProvider } from "../context/FilterContext"; // Import FilterProvider
import { RecommendationProvider } from "../context/RecommendationContext"; // Import RecommendationProvider

import Profile from "./Profile";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import Home from "./Home";
import Body from "./Body"; // Import Body directly
import Cart from "./Cart"; // Import Cart component
import Orders from "./Orders"; // Import Orders component
import SearchResults from "./SearchResults"; // Import SearchResults component

function App() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        isAuthenticated: !!user,
        isLoading: false,
      });
    });

    return () => unsubscribe();
  }, []);

  if (authState.isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <CartProvider> {/* Wrap everything with CartProvider */}
      <FilterProvider> {/* Add FilterProvider here */}
        <RecommendationProvider> {/* Add RecommendationProvider here */}
          <Router>
            <ToastContainer />
            <Routes>
              {/* Default route - Home shows landing page, Body shows products */}
              <Route
                path="/"
                element={authState.isAuthenticated ? <Home /> : <Navigate to="/signin" replace />}
              />
              <Route
                path="/products"
                element={authState.isAuthenticated ? <Body /> : <Navigate to="/signin" replace />}
              />

              {/* Authentication Routes */}
              <Route
                path="/signin"
                element={authState.isAuthenticated ? <Navigate to="/" replace /> : <SignIn />}
              />
              <Route
                path="/signup"
                element={authState.isAuthenticated ? <Navigate to="/" replace /> : <SignUp />}
              />

              {/* Search Results Route */}
              <Route
                path="/search"
                element={authState.isAuthenticated ? <SearchResults /> : <Navigate to="/signin" replace />}
              />

              {/* Cart and Orders Routes */}
              <Route
                path="/cart"
                element={authState.isAuthenticated ? <Cart /> : <Navigate to="/signin" replace />}
              />
              <Route
                path="/orders"
                element={authState.isAuthenticated ? <Orders /> : <Navigate to="/signin" replace />}
              />

              <Route 
                path="/profile" 
                element={authState.isAuthenticated ? <Profile /> : <Navigate to="/signin" replace />} 
              />

              {/* Catch-all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </RecommendationProvider>
      </FilterProvider>
    </CartProvider>
  );
}

export default App;
