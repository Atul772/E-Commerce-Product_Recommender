import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Body from './components/Body';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import Cart from './components/Cart';
import Orders from './components/Orders';
import SearchResults from './components/SearchResults';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './components/CartContext';
import { FilterProvider } from './context/FilterContext';
import { RecommendationProvider } from './context/RecommendationContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <FilterProvider>
            <RecommendationProvider>
              <Routes>
                <Route path="/" element={<Body />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/search" element={<SearchResults />} />
              </Routes>
            </RecommendationProvider>
          </FilterProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 