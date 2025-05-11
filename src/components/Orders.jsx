import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from './firebase';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import Navbar from './Navbar';
import Footer from './Footer';
import { toast } from 'react-toastify';

const Orders = () => {
  const { userProfile, currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubscribe = () => {}; // Initialize with a no-op function
    
    const fetchOrders = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching orders for user:", currentUser.uid);
        
        const ordersRef = collection(db, 'orders');
        
        // Use onSnapshot for real-time updates
        try {
          // Create the query
          const q = query(
            ordersRef, 
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );
          
          // Set up the real-time listener
          unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData = [];
            
            querySnapshot.forEach((doc) => {
              // Ensure the order data has all required fields
              const data = doc.data();
              ordersData.push({ 
                id: doc.id, 
                ...data,
                // Ensure items is always an array
                items: Array.isArray(data.items) ? data.items : [],
                // Ensure status has a default value
                status: data.status || 'pending'
              });
            });
            
            console.log(`Found ${ordersData.length} orders (real-time update)`);
            setOrders(ordersData);
            setLoading(false);
          }, (error) => {
            console.error("Real-time orders query failed:", error);
            if (error.code === 'permission-denied') {
              toast.error("You don't have permission to access your orders");
            } else if (error.code === 'failed-precondition') {
              toast.error("Missing required index for orders query. Please contact support.");
            } else {
              toast.error("Failed to load your orders");
            }
            setLoading(false);
          });
          
        } catch (queryError) {
          console.error("Failed to set up real-time listener:", queryError);
          toast.error("Failed to load your orders");
          setLoading(false);
        }
        
      } catch (error) {
        console.error('Error in fetchOrders:', error);
        
        if (error.code === 'permission-denied') {
          toast.error("You don't have permission to access your orders");
        } else {
          toast.error('Failed to load your orders');
        }
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Clean up the subscription when the component unmounts
    return () => {
      console.log("Cleaning up Orders component - unsubscribing from Firestore");
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Calculate order totals
  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Update the handleCancelOrder function to show different messages based on status
  const handleCancelOrder = async (orderId) => {
    if (!currentUser?.uid) {
      toast.error("Please sign in to cancel your order");
      return;
    }

    try {
      setCancellingOrder(orderId);
      
      // Get the order to check if it's eligible for cancellation
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        toast.error("Order not found");
        return;
      }
      
      const orderData = orderDoc.data();
      
      // Handle different statuses
      if (orderData.status === 'delivered') {
        toast.error("Cannot cancel a delivered order");
        return;
      } else if (orderData.status === 'shipped') {
        toast.info("Order cannot be cancelled after shipping. Please return the order at your doorstep when received.");
        return;
      } else if (orderData.status === 'out for delivery') {
        toast.info("Order cannot be cancelled when out for delivery. Please return the order at your doorstep when received.");
        return;
      } else if (orderData.status === 'cancelled') {
        toast.info("This order is already cancelled");
        return;
      }
      
      // At this point, the order is either 'pending' or 'processing', both of which can be cancelled
      console.log(`Cancelling order ${orderId} with status: ${orderData.status}`);
      
      // Update the order status in Firestore for pending/processing orders
      await updateDoc(orderRef, {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: currentUser.uid
      });
      
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setCancellingOrder(null);
    }
  };

  // Change the canCancelOrder function to show the button for more statuses
  const canCancelOrder = (status) => {
    // Show cancel button for all statuses except delivered and already cancelled
    return status !== 'delivered' && status !== 'cancelled';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Orders</h1>
          
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="flex justify-center mb-6">
                <svg 
                  className="w-20 h-20 text-gray-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-3">No Orders Yet</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <button 
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">ORDER PLACED</p>
                        <p className="text-sm">{formatDate(order.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">TOTAL</p>
                        <p className="text-sm font-medium">${calculateOrderTotal(order.items).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">STATUS</p>
                        <p className="text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                              order.status === 'out for delivery' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'}`}
                          >
                            {order.status === 'delivered' ? 'Delivered' : 
                              order.status === 'shipped' ? 'Shipped' : 
                              order.status === 'processing' ? 'Processing' : 
                              order.status === 'out for delivery' ? 'Out for Delivery' :
                              order.status === 'cancelled' ? 'Cancelled' :
                              'Pending'}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">ORDER ID</p>
                        <p className="text-sm font-mono">{order.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 py-2 border-b border-gray-100">
                          <div className="flex-shrink-0 w-16 h-16">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div className="flex-grow">
                            <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Order Actions */}
                  <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
                    {canCancelOrder(order.status) && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrder === order.id}
                        className={`text-red-600 hover:text-red-800 text-sm font-medium ${
                          cancellingOrder === order.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {cancellingOrder === order.id ? 'Processing...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Orders; 