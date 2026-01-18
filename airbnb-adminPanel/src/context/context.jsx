import React, { createContext, useState } from 'react';

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, selectedDate, setSelectedDate }}>
      {children}
    </SearchContext.Provider>
  );
};
