import React, { createContext, useState, useContext, useEffect } from "react";
import { fetchData, postData, deleteDataById } from "../config/ServiceApi/serviceApi";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  // Helper to check auth
  const getToken = () => localStorage.getItem("token");

  const refreshWishlist = async () => {
    const token = getToken();
    if (token) {
      try {
        const data = await fetchData("wishlist", token);
        // Backend returns schema { items: [{ itemId, type, addedAt }] }
        // We need to map this to the format expected by the UI (Listing objects)
        // Ensure we handle cases where itemId might be null if listing was deleted
        const formattedItems = data.items
          .filter(item => item.itemId !== null)
          .map(item => item.itemId);

        setWishlist(formattedItems);
      } catch (error) {
        console.error("Failed to sync wishlist from backend", error);
        // Fallback or empty? Better to show empty if error to avoid confusion
      }
    } else {
      // Guest mode: use local storage
      const saved = localStorage.getItem("wishlist");
      setWishlist(saved ? JSON.parse(saved) : []);
    }
  };

  // Initial load
  useEffect(() => {
    refreshWishlist();
  }, []);

  // Persistence for Guest Mode
  useEffect(() => {
    const token = getToken();
    if (!token) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

  const addToWishlist = async (item) => {
    // 1. Optimistic Update
    setWishlist((prev) => {
      // Prevent duplicates
      if (prev.some((i) => i._id === item._id)) return prev;
      return [...prev, item];
    });

    // 2. Side Effect
    const token = getToken();
    if (token) {
      try {
        await postData("wishlist", { itemId: item._id, type: "property" }, token);
      } catch (error) {
        console.error("Failed to add to backend wishlist", error);
        // Rollback on error?
        setWishlist((prev) => prev.filter((i) => i._id !== item._id));
      }
    }
  };

  const removeFromWishlist = async (itemId) => {
    // 1. Optimistic Update
    setWishlist((prev) => prev.filter((item) => item._id !== itemId));

    // 2. Side Effect
    const token = getToken();
    if (token) {
      try {
        await deleteDataById("wishlist", token, itemId);
      } catch (error) {
        console.error("Failed to remove from backend wishlist", error);
        // Rollback?
        // We'd need to know the deleted item to add it back. simpler to just refresh or ignore.
        refreshWishlist();
      }
    }
  };

  const mergeLocalToBackend = async () => {
    const token = getToken();
    const localWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

    if (token && localWishlist.length > 0) {
      try {
        // We can do this in parallel
        await Promise.all(
          localWishlist.map((item) =>
            postData("wishlist", { itemId: item._id, type: "property" }, token)
          )
        );
        // Clear local storage after successful sync
        localStorage.removeItem("wishlist");
      } catch (error) {
        console.error("Failed to merge wishlist", error);
      }
    }

    // Always refresh from backend source of truth after login
    if (token) {
      await refreshWishlist();
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
    // If guest, clear local storage
    if (!getToken()) {
      localStorage.removeItem("wishlist");
    }
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, mergeLocalToBackend, clearWishlist, refreshWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
