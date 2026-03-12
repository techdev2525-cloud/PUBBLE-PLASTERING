// SearchBar Component
import React, { useState, useRef, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";

export default function SearchBar({
  placeholder = "Search...",
  value = "",
  onChange,
  onSearch,
  onClear,
  suggestions = [],
  onSuggestionSelect,
  loading = false,
  autoFocus = false,
  className = "",
  size = "md",
  showButton = false,
  buttonText = "Search",
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  const sizes = {
    sm: {
      wrapper: "h-10",
      input: "text-sm pl-9 pr-3",
      icon: "left-3 w-4 h-4",
    },
    md: {
      wrapper: "h-12",
      input: "text-base pl-10 pr-4",
      icon: "left-3 w-5 h-5",
    },
    lg: {
      wrapper: "h-14",
      input: "text-lg pl-12 pr-5",
      icon: "left-4 w-6 h-6",
    },
  };

  const currentSize = sizes[size] || sizes.md;

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show suggestions when focused and has suggestions
  useEffect(() => {
    if (isFocused && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [isFocused, suggestions]);

  const handleInputChange = (e) => {
    onChange?.(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch?.(value);
      setShowSuggestions(false);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    onChange?.("");
    onClear?.();
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className={`relative flex items-center ${currentSize.wrapper}`}>
        {/* Search Icon */}
        <FiSearch
          className={`absolute ${currentSize.icon} text-concrete-400 pointer-events-none`}
        />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`
            w-full h-full rounded-lg
            border-2 border-concrete-200
            bg-white
            ${currentSize.input}
            ${showButton ? "rounded-r-none border-r-0" : ""}
            focus:border-primary-500 focus:outline-none
            transition-colors duration-200
            placeholder:text-concrete-400
          `}
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-10">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Clear Button */}
        {value && !loading && (
          <button
            onClick={handleClear}
            className={`
              absolute ${showButton ? "right-3" : "right-3"}
              p-1 rounded-full
              text-concrete-400 hover:text-concrete-600
              hover:bg-concrete-100
              transition-colors
            `}
          >
            <FiX className="w-4 h-4" />
          </button>
        )}

        {/* Search Button */}
        {showButton && (
          <button
            onClick={() => onSearch?.(value)}
            className="
              h-full px-5
              bg-primary-500 hover:bg-primary-600
              text-white font-semibold
              rounded-r-lg
              transition-colors duration-200
            "
          >
            {buttonText}
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="
          absolute top-full left-0 right-0 z-50 mt-1
          bg-white rounded-lg shadow-lg border border-concrete-200
          max-h-64 overflow-y-auto
        "
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id || index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="
                w-full px-4 py-3 text-left
                hover:bg-concrete-50
                border-b border-concrete-100 last:border-0
                transition-colors
              "
            >
              {typeof suggestion === "string" ? (
                <span className="text-concrete-700">{suggestion}</span>
              ) : (
                <div>
                  <p className="text-concrete-800 font-medium">
                    {suggestion.title}
                  </p>
                  {suggestion.subtitle && (
                    <p className="text-sm text-concrete-500">
                      {suggestion.subtitle}
                    </p>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Search with Filters
export function SearchWithFilters({
  value,
  onChange,
  onSearch,
  filters,
  activeFilter,
  onFilterChange,
  placeholder = "Search...",
}) {
  return (
    <div className="space-y-4">
      {/* Filter Pills */}
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange(null)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${
                !activeFilter
                  ? "bg-primary-500 text-white"
                  : "bg-concrete-100 text-concrete-600 hover:bg-concrete-200"
              }
            `}
          >
            All
          </button>
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  activeFilter === filter.id
                    ? "bg-primary-500 text-white"
                    : "bg-concrete-100 text-concrete-600 hover:bg-concrete-200"
                }
              `}
            >
              {filter.label}
              {filter.count !== undefined && (
                <span className="ml-1 opacity-70">({filter.count})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <SearchBar
        value={value}
        onChange={onChange}
        onSearch={onSearch}
        placeholder={placeholder}
        size="lg"
        showButton
      />
    </div>
  );
}

// Inline Search for Tables
export function TableSearch({ value, onChange, placeholder = "Search..." }) {
  return (
    <SearchBar
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size="sm"
      className="max-w-xs"
    />
  );
}
