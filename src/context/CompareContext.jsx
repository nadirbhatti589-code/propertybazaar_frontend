import { createContext, useContext, useState, useEffect } from 'react';

const CompareContext = createContext(null);

export const CompareProvider = ({ children }) => {
  const [compareProperties, setCompareProperties] = useState(() => {
    try {
      const saved = localStorage.getItem('propertybazaar_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [compareNotice, setCompareNotice] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('propertybazaar_compare', JSON.stringify(compareProperties));
    } catch {
      // ignore
    }
  }, [compareProperties]);

  const toggleCompare = (property) => {
    const exists = compareProperties.some((p) => p._id === property._id);
    if (exists) {
      setCompareProperties((prev) => prev.filter((p) => p._id !== property._id));
      setCompareNotice('');
    } else {
      if (compareProperties.length >= 4) {
        setCompareNotice('You can compare a maximum of 4 properties at a time.');
        setTimeout(() => setCompareNotice(''), 4000);
        return false;
      }
      setCompareProperties((prev) => [...prev, property]);
      setCompareNotice('');
      return true;
    }
  };

  const removeFromCompare = (propertyId) => {
    setCompareProperties((prev) => prev.filter((p) => p._id !== propertyId));
  };

  const clearCompare = () => {
    setCompareProperties([]);
    setCompareNotice('');
  };

  const isInCompare = (propertyId) => {
    return compareProperties.some((p) => p._id === propertyId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareProperties,
        toggleCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        compareNotice,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
