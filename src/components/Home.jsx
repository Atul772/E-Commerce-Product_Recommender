import React from 'react';
import Navbar from './Navbar';
import Landing from './Landing';
import TopProductsScroll from './TopProductsScroll';
import PersonalizedRecommendations from './PersonalizedRecommendations';
import Footer from './Footer';

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Landing />
      <div className="p-6 bg-gray-100 flex-grow">
        <div className="container mx-auto">
          <TopProductsScroll />
          <PersonalizedRecommendations title="For You" />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;