import React, { createContext, useContext, useState, useEffect } from "react";
import { getAllCategories } from "../api/news";

// Create context with a default value (prevents destructuring errors)
const CategoriesContext = createContext({
  categories: [],
  loading: false,
  error: null,
});

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllCategories()
      .then((data) => {
        // data: [{ name: "കേരളം", count: 5 }, ...]
        const names = data.map((cat) => cat.name);
        setCategories(names);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        // Fallback categories
        setCategories([
          "പ്രാദേശികം",
          "മലബാര്‍",
          "കേരളം",
          "ദേശീയം",
          "വിദേശം",
          "ചരമം",
          "കല",
          "സാംസ്‌കാരികം",
          "വിദ്യാഭ്യാസം",
          "വിനോദം",
          "യാത്ര",
          "സാമ്പത്തികം",
        ]);
        setLoading(false);
      });
  }, []);

  const value = { categories, loading, error };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

// Custom hook with guard (throws if used outside provider)
export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
};