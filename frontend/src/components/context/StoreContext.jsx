import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { food_list as initialFoodList } from "../../assets/assets";
import { fetchFoodFromAPI } from "../../utils/mealdbAPI";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const enrichFoods = (list) => {
    return list.map((item, idx) => ({
      ...item,
      rating: item.rating ?? (Math.floor(Math.random() * 3) + 3), // 3-5
      quantity: item.quantity ?? (Math.floor(Math.random() * 50) + 1),
      createdAt: item.createdAt ?? new Date(Date.now() - idx * 86400000).toISOString(),
    }));
  };

  const [foodList, setFoodList] = useState(enrichFoods(initialFoodList));
  const [filteredFoodList, setFilteredFoodList] = useState(enrichFoods(initialFoodList));
  const [isLoadingAPI, setIsLoadingAPI] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [role, setRole] = useState("user");

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = foodList.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(url + "/api/food/list");
      // Backend food list can be merged with initial list if available
    } catch (error) {
      console.log("Backend food list not available, using default");
    }
  };

  const loadCartData = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/cart/get",
        {},
        { headers: { token } }
      );
      setCartItems(response.data.cartData || {});
    } catch (error) {
      console.log("Cart data fetch failed");
    }
  };

  // Fetch additional food items from TheMealDB API
  const loadAdditionalFoods = async () => {
    try {
      setIsLoadingAPI(true);
      const apiFoods = await fetchFoodFromAPI(15); // Fetch 15 additional items
      
      if (apiFoods && apiFoods.length > 0) {
        const enrichedBase = enrichFoods(initialFoodList);
        const enrichedApi = enrichFoods(apiFoods);
        const combinedFoodList = [...enrichedBase, ...enrichedApi];
        setFoodList(combinedFoodList);
        setFilteredFoodList(combinedFoodList);
        console.log(`✓ Food list updated: ${initialFoodList.length} base + ${apiFoods.length} API = ${combinedFoodList.length} total`);
      } else {
        const enrichedBase = enrichFoods(initialFoodList);
        setFoodList(enrichedBase);
        setFilteredFoodList(enrichedBase);
      }
    } catch (error) {
      console.error("Error loading additional foods:", error);
      const enrichedBase = enrichFoods(initialFoodList);
      setFoodList(enrichedBase);
      setFilteredFoodList(enrichedBase);
    } finally {
      setIsLoadingAPI(false);
    }
  };

  // Set filtered food list (for search and filters)
  const setSearchFilters = (filtered) => {
    setFilteredFoodList(filtered);
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      await loadAdditionalFoods(); // Load API foods on mount
      if (localStorage.getItem("token")) {
        const savedToken = localStorage.getItem("token");
        setToken(savedToken);
        const savedRole = localStorage.getItem("role");
        if (savedRole) setRole(savedRole);
        const savedUserInfo = localStorage.getItem("userInfo");
        if (savedUserInfo) setUserInfo(JSON.parse(savedUserInfo));
        await loadCartData(savedToken);
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list: filteredFoodList, // Use filtered list for display
    allFoods: foodList, // Keep all foods for reference
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    role,
    setRole,
    userInfo,
    setUserInfo,
    setSearchFilters, // Function to update filters
    isLoadingAPI, // Loading state for API calls
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
