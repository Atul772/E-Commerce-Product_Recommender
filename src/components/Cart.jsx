import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import Navbar from './Navbar';
import Footer from './Footer';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { userProfile, currentUser, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressInfo, setAddressInfo] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);

  // Parse profile address into component parts if it exists
  useEffect(() => {
    if (userProfile?.address) {
      try {
        // Try to parse stored address if it's in JSON format
        const addressObj = typeof userProfile.address === 'string' && userProfile.address.startsWith('{') 
          ? JSON.parse(userProfile.address)
          : null;
          
        if (addressObj && addressObj.street) {
          setAddressInfo({
            street: addressObj.street || '',
            city: addressObj.city || '',
            state: addressObj.state || '',
            zipCode: addressObj.zipCode || '',
            country: addressObj.country || ''
          });
        } else {
          // If address is not in structured format, put it all in street field
          setAddressInfo({
            street: userProfile.address || '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          });
        }
      } catch (error) {
        console.error('Error parsing address:', error);
        // Fallback to simple string if parsing fails
        setAddressInfo({
          street: userProfile.address || '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        });
      }
    }
  }, [userProfile]);

  // Reset checkout form when user changes
  useEffect(() => {
    setShowCheckoutForm(false);
    setShowAddressForm(false);
  }, [currentUser]);

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setAddressInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
    const item = cart.find(item => item.id === productId);
    if (item) {
      toast.success(`Updated quantity of ${item.name} to ${newQuantity}`);
    }
  };

  const handleRemoveItem = (productId) => {
    const item = cart.find(item => item.id === productId);
    if (item) {
      removeFromCart(productId);
      toast.success(`Removed ${item.name} from cart`);
    }
  };

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      toast.error("Please sign in to checkout");
      navigate('/signin');
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setShowCheckoutForm(true);
  };

  const handleSaveAddress = async () => {
    // Check if all required fields are filled
    if (!addressInfo.street || !addressInfo.city || !addressInfo.state || !addressInfo.zipCode || !addressInfo.country) {
      toast.error("Please fill all address fields");
      return;
    }

    try {
      // Save structured address to user profile if it's set as default
      if (isDefaultAddress && currentUser?.uid) {
        const userRef = doc(db, "Users", currentUser.uid);
        await updateDoc(userRef, {
          address: JSON.stringify(addressInfo)
        });
        
        toast.success("Address saved to your profile");
        refreshUserProfile();
      }
      
      setShowAddressForm(false);
      setUseProfileAddress(false); // Switch to using the new address
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    }
  };

  const handleUpdateProfile = () => {
    navigate('/profile');
  };

  const handleCheckout = async () => {
    if (!currentUser?.uid) {
      toast.error("Please sign in to checkout");
      navigate('/signin');
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Get the appropriate address to use
    let deliveryAddress;
    if (useProfileAddress && userProfile?.address) {
      // Use profile address
      deliveryAddress = userProfile.address;
    } else {
      // Use the address from the form
      if (!addressInfo.street || !addressInfo.city || !addressInfo.state || !addressInfo.zipCode || !addressInfo.country) {
        toast.error("Please provide a complete shipping address");
        return;
      }
      
      deliveryAddress = JSON.stringify(addressInfo);
    }

    setIsProcessing(true);
    
    try {
      // Prepare order data
      const orderData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userProfile?.name || 'Guest',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total: cartTotal,
        status: 'pending',
        paymentMethod,
        shippingAddress: deliveryAddress,
        createdAt: serverTimestamp()
      };

      // Create order in Firestore
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      console.log("Order created with ID:", orderRef.id);
      
      toast.success("Order placed successfully!");
      clearCart();
      navigate(`/orders`);
    } catch (error) {
      console.error("Error creating order:", error);
      
      // More detailed error handling
      if (error.code === 'permission-denied') {
        toast.error("You don't have permission to place orders. Please check your account settings.");
      } else if (error.code === 'unavailable') {
        toast.error("The service is currently unavailable. Please try again later.");
      } else if (error.code === 'resource-exhausted') {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Format address for display
  const formatAddress = (addressObj) => {
    if (typeof addressObj === 'string') {
      try {
        addressObj = JSON.parse(addressObj);
      } catch {
        return addressObj; // Return as is if not parseable
      }
    }
    
    if (!addressObj) return 'No address available';
    
    const parts = [];
    if (addressObj.street) parts.push(addressObj.street);
    if (addressObj.city) parts.push(addressObj.city);
    if (addressObj.state) {
      if (addressObj.zipCode) {
        parts.push(`${addressObj.state}, ${addressObj.zipCode}`);
      } else {
        parts.push(addressObj.state);
      }
    } else if (addressObj.zipCode) {
      parts.push(addressObj.zipCode);
    }
    if (addressObj.country) parts.push(addressObj.country);
    
    return parts.join(', ');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Shopping Cart</h1>
          
          {!currentUser ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex justify-center mb-6">
                <svg 
                  className="w-24 h-24 text-gray-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-3">Sign in to view your cart</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">You need to sign in to access your personal shopping cart. Your cart items will be saved to your account.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => navigate('/signin')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition duration-300 shadow-sm"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/signup')}
                  className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-md hover:bg-gray-50 transition duration-300 shadow-sm"
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <svg 
                    className="w-24 h-24 text-gray-300" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                    />
                  </svg>
                  <div className="absolute -top-2 -right-2">
                    <svg 
                      className="w-8 h-8 text-red-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 9l-6 6M9 9l6 6" />
                    </svg>
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-3">Your cart is empty</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added any products to your cart yet. Browse our collection and find something you'll love!</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => navigate('/')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition duration-300 shadow-sm"
                >
                  Continue Shopping
                </button>
                {userProfile ? (
                  <button 
                    onClick={() => navigate('/profile')}
                    className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-md hover:bg-gray-50 transition duration-300 shadow-sm"
                  >
                    View Saved Items
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/signin')}
                    className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-md hover:bg-gray-50 transition duration-300 shadow-sm"
                  >
                    Sign In to Account
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Shopping Cart ({cart.reduce((total, item) => total + item.quantity, 0)} items)</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {cart.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-16 w-16">
                                    <img 
                                      className="h-16 w-16 object-cover rounded-md" 
                                      src={item.image} 
                                      alt={item.name} 
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                    <div className="text-sm text-gray-500">{item.category}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center border rounded-md">
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 border-r"
                                    disabled={item.quantity <= 1}
                                  >
                                    -
                                  </button>
                                  <span className="px-3 py-1 text-gray-800">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 border-l"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${(cartTotal * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${(cartTotal + cartTotal * 0.1).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {!showCheckoutForm ? (
                    <button
                      onClick={handleProceedToCheckout}
                      className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 shadow-sm"
                    >
                      Proceed to Checkout
                    </button>
                  ) : (
                    <div className="space-y-4">
                      {/* Address Section */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-medium text-gray-800">Shipping Address</h3>
                          {!showAddressForm && (
                            <button 
                              onClick={() => setShowAddressForm(true)}
                              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Add New Address
                            </button>
                          )}
                        </div>
                        
                        {showAddressForm ? (
                          <div className="border rounded-lg p-4 mb-4">
                            <h2 className="text-xl font-bold mb-4">My Addresses</h2>
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                  type="text"
                                  name="street"
                                  value={addressInfo.street}
                                  onChange={handleAddressInputChange}
                                  placeholder="Street Address"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                
                                <input
                                  type="text"
                                  name="city"
                                  value={addressInfo.city}
                                  onChange={handleAddressInputChange}
                                  placeholder="City"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                  type="text"
                                  name="state"
                                  value={addressInfo.state}
                                  onChange={handleAddressInputChange}
                                  placeholder="State"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                
                                <input
                                  type="text"
                                  name="zipCode"
                                  value={addressInfo.zipCode}
                                  onChange={handleAddressInputChange}
                                  placeholder="ZIP Code"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              
                              <input
                                type="text"
                                name="country"
                                value={addressInfo.country}
                                onChange={handleAddressInputChange}
                                placeholder="Country"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              
                              <div className="flex items-center mt-2">
                                <input
                                  type="checkbox"
                                  id="defaultAddress"
                                  checked={isDefaultAddress}
                                  onChange={() => setIsDefaultAddress(!isDefaultAddress)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="defaultAddress" className="ml-2 text-sm text-gray-700">
                                  Set as default address
                                </label>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={handleSaveAddress}
                                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300"
                                >
                                  Save Address
                                </button>
                                <button
                                  onClick={() => setShowAddressForm(false)}
                                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition duration-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4">
                            {userProfile?.address ? (
                              <div className="mb-4">
                                <div className="flex items-center mb-2">
                                  <input
                                    type="radio"
                                    id="profileAddress"
                                    name="addressType"
                                    checked={useProfileAddress}
                                    onChange={() => setUseProfileAddress(true)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  />
                                  <label htmlFor="profileAddress" className="ml-2 text-sm text-gray-700 font-medium">
                                    Use my profile address
                                  </label>
                                </div>
                                
                                {useProfileAddress && (
                                  <div className="ml-6 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm">
                                    {formatAddress(userProfile.address)}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                                <p className="text-sm text-yellow-700">
                                  You don't have an address saved in your profile.
                                </p>
                                <div className="mt-2 flex space-x-2">
                                  <button 
                                    onClick={handleUpdateProfile}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    Update Profile
                                  </button>
                                  <span className="text-gray-500">or</span>
                                  <button 
                                    onClick={() => setShowAddressForm(true)}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    Add New Address
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Payment Method Section */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Method
                        </label>
                        <div className="space-y-2 border rounded-md p-3">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="card"
                              name="paymentMethod"
                              value="card"
                              checked={paymentMethod === 'card'}
                              onChange={() => setPaymentMethod('card')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="card" className="ml-2 text-sm text-gray-700">
                              Credit/Debit Card
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="paypal"
                              name="paymentMethod"
                              value="paypal"
                              checked={paymentMethod === 'paypal'}
                              onChange={() => setPaymentMethod('paypal')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="paypal" className="ml-2 text-sm text-gray-700">
                              PayPal
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="cod"
                              name="paymentMethod"
                              value="cod"
                              checked={paymentMethod === 'cod'}
                              onChange={() => setPaymentMethod('cod')}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="cod" className="ml-2 text-sm text-gray-700">
                              Cash on Delivery
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="pt-4 space-y-2">
                        <button
                          onClick={handleCheckout}
                          disabled={isProcessing}
                          className={`w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 ${
                            isProcessing ? 'opacity-75 cursor-not-allowed' : ''
                          }`}
                        >
                          {isProcessing ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </span>
                          ) : (
                            'Place Order'
                          )}
                        </button>
                        
                        <button
                          onClick={() => setShowCheckoutForm(false)}
                          className="w-full py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition duration-300"
                        >
                          Go Back
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <button 
                      onClick={() => navigate('/')}
                      className="w-full py-2 text-blue-600 font-medium hover:text-blue-800 transition duration-300"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart; 