import React, { useState, useEffect } from "react";
import Navbar from "./Navbar"; // Ensure Navbar is imported
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { db } from "./firebase";
import { collection, doc, addDoc, deleteDoc, getDocs, query, where, updateDoc } from "firebase/firestore";

const Profile = () => {
  const { userProfile, currentUser, refreshUserProfile } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    isDefault: false
  });

  // Set initial name when userProfile loads
  useEffect(() => {
    if (userProfile?.name) {
      setNewName(userProfile.name);
    }
  }, [userProfile]);

  // Load addresses from Firebase
  useEffect(() => {
    const loadAddresses = async () => {
      if (!userProfile?.email) return;

      try {
        const addressesRef = collection(db, "addresses");
        const q = query(addressesRef, where("userEmail", "==", userProfile.email));
        const querySnapshot = await getDocs(q);
        
        const loadedAddresses = [];
        querySnapshot.forEach((doc) => {
          loadedAddresses.push({ id: doc.id, ...doc.data() });
        });
        
        setAddresses(loadedAddresses);
      } catch (error) {
        console.error("Error loading addresses:", error);
        toast.error("Failed to load addresses");
      }
    };

    loadAddresses();
  }, [userProfile?.email]);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    
    if (!currentUser?.uid) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    try {
      // Update the user document in Firestore
      const userRef = doc(db, "Users", currentUser.uid);
      await updateDoc(userRef, {
        name: newName.trim(),
        updatedAt: new Date().toISOString()
      });
      
      // Refresh the user profile in the context
      await refreshUserProfile();
      
      setIsEditingName(false);
      toast.success("Name updated successfully");
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name");
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!userProfile?.email) {
      toast.error("Please sign in to add addresses");
      return;
    }

    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode || !newAddress.country) {
      toast.error("Please fill in all address fields");
      return;
    }

    try {
      const addressesRef = collection(db, "addresses");
      const addressData = {
        ...newAddress,
        userEmail: userProfile.email,
        createdAt: new Date().toISOString()
      };

      // If this is the first address or marked as default, update all other addresses to not be default
      if (addressData.isDefault || addresses.length === 0) {
        const batch = [];
        addresses.forEach(async (addr) => {
          if (addr.isDefault) {
            const addrRef = doc(db, "addresses", addr.id);
            batch.push(updateDoc(addrRef, { isDefault: false }));
          }
        });
        await Promise.all(batch);
      }

      // Add the new address using addDoc instead of setDoc
      const docRef = await addDoc(addressesRef, addressData);
      
      setAddresses(prev => [...prev, { id: docRef.id, ...addressData }]);
      setNewAddress({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        isDefault: false
      });
      setIsAddingAddress(false);
      toast.success("Address added successfully");
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteDoc(doc(db, "addresses", addressId));
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      toast.info("Address deleted");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      // Update all addresses to not be default
      const batch = addresses.map(async (addr) => {
        const addrRef = doc(db, "addresses", addr.id);
        await updateDoc(addrRef, { isDefault: addr.id === addressId });
      });
      await Promise.all(batch);

      // Update local state
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })));
      toast.success("Default address updated");
    } catch (error) {
      console.error("Error updating default address:", error);
      toast.error("Failed to update default address");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar /> {/* Navbar remains at the top */}
      <div className="flex-grow bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">My Profile</h1>
            <div className="border-t border-gray-300 pt-4">
              <p className="text-lg font-semibold text-gray-700 mb-4">User Information:</p>
              {userProfile ? (
                <>
                  <div className="flex items-center mb-4">
                    <p className="text-gray-800 text-lg mr-2"><strong>Name:</strong> {userProfile.name}</p>
                    <button 
                      onClick={() => setIsEditingName(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm ml-2"
                    >
                      Edit
                    </button>
                  </div>
                  
                  {isEditingName && (
                    <form onSubmit={handleUpdateName} className="mb-4 p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="p-2 border rounded-md mr-2 flex-grow"
                          placeholder="Enter your name"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingName(false);
                              setNewName(userProfile.name);
                            }}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                  
                  <p className="text-gray-800 text-lg"><strong>Email:</strong> {userProfile.email}</p>
                </>
              ) : (
                <div className="animate-pulse">
                  <p className="bg-gray-200 h-4 w-3/4 rounded mb-2"></p>
                  <p className="bg-gray-200 h-4 w-1/2 rounded"></p>
                </div>
              )}
            </div>
          </div>

          {/* Address Management Section */}
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Addresses</h2>
              <button
                onClick={() => setIsAddingAddress(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Add New Address
              </button>
            </div>

            {/* Add Address Form */}
            {isAddingAddress && (
              <form onSubmit={handleAddAddress} className="mb-6 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                    className="p-2 border rounded-md"
                  />
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="isDefault">Set as default address</label>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Address List */}
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{address.street}</p>
                      <p>{address.city}, {address.state} {address.zipCode}</p>
                      <p>{address.country}</p>
                      {address.isDefault && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-2">
                          Default Address
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(address.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {addresses.length === 0 && (
                <p className="text-gray-500 text-center py-4">No addresses added yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;