import React, { useState, useContext } from 'react';
import './SearchBar.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../context/StoreContext';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: 'all',
    category: 'all',
    type: 'all',
    rating: 'all',
    sortBy: 'none'
  });
  
  const { setSearchFilters, food_list } = useContext(StoreContext);

  // Get unique categories
  const categories = ['all', ...new Set(food_list?.map(item => item.category) || [])];

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(value, filters);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    applyFilters(searchTerm, newFilters);
  };

  const applyFilters = (search, currentFilters) => {
    let filtered = food_list || [];

    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category filter
    if (currentFilters.category !== 'all') {
      filtered = filtered.filter(item => item.category === currentFilters.category);
    }

    // Price range filter
    if (currentFilters.priceRange !== 'all') {
      filtered = filtered.filter(item => {
        switch (currentFilters.priceRange) {
          case 'under-1000':
            return item.price < 1000;
          case '1000-1500':
            return item.price >= 1000 && item.price < 1500;
          case '1500-2000':
            return item.price >= 1500 && item.price < 2000;
          case 'above-2000':
            return item.price >= 2000;
          default:
            return true;
        }
      });
    }

    // Rating filter (minimum)
    if (currentFilters.rating !== 'all') {
      const min = parseInt(currentFilters.rating, 10);
      filtered = filtered.filter(item => (item.rating || 0) >= min);
    }

    // Type filter (vegetarian/non-veg) - based on category
    if (currentFilters.type !== 'all') {
      const vegCategories = ['Salad', 'Deserts', 'Pure Veg', 'Pasta', 'Noodles'];
      filtered = filtered.filter(item => {
        if (currentFilters.type === 'veg') {
          return vegCategories.includes(item.category);
        } else {
          return !vegCategories.includes(item.category);
        }
      });
    }

    // Sorting
    switch (currentFilters.sortBy) {
      case 'price-high':
        filtered = filtered.slice().sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        filtered = filtered.slice().sort((a, b) => a.price - b.price);
        break;
      case 'type':
        const vegCategories = ['Salad', 'Deserts', 'Pure Veg', 'Pasta', 'Noodles'];
        filtered = filtered.slice().sort((a, b) => {
          const aVeg = vegCategories.includes(a.category) ? 0 : 1;
          const bVeg = vegCategories.includes(b.category) ? 0 : 1;
          if (aVeg !== bVeg) return aVeg - bVeg;
          return a.name.localeCompare(b.name);
        });
        break;
      case 'quantity':
        filtered = filtered.slice().sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
        break;
      case 'category':
        filtered = filtered.slice().sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'new-arrivals':
        filtered = filtered.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setSearchFilters(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ priceRange: 'all', category: 'all', type: 'all' });
    setSearchFilters(food_list);
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar-wrapper">
        <div className="search-input-group">
          <img src={assets.search_icon} alt="search" className="search-icon" />
          <input
            type="text"
            placeholder="Search foods, categories..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
            tabIndex={-1}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => {
                setSearchTerm('');
                setSearchFilters(food_list);
              }}
            >
              ✕
            </button>
          )}
        </div>

        <button
          className="filter-toggle"
          tabIndex={-1}
          onClick={() => setShowFilters(!showFilters)}
          title="Toggle filters"
        >
          ⚙️ Filter
        </button>
      </div>

      {showFilters && (
        <div className="filters-dropdown">
          <div className="filter-group">
            <label>Price Range (₹)</label>
            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            >
              <option value="all">All Prices</option>
              <option value="under-1000">Under ₹1000</option>
              <option value="1000-1500">₹1000 - ₹1500</option>
              <option value="1500-2000">₹1500 - ₹2000</option>
              <option value="above-2000">Above ₹2000</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Items</option>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Minimum Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
            >
              <option value="all">All Ratings</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="none">Default</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="type">Type (Veg first)</option>
              <option value="quantity">Quantity (High to Low)</option>
              <option value="category">Category (A-Z)</option>
              <option value="new-arrivals">New Arrivals</option>
            </select>
          </div>

          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
