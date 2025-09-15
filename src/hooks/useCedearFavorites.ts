import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cedear_favorites';

export function useCedearFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  const saveFavorites = useCallback((newFavorites: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, []);

  const addFavorite = useCallback((symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    setFavorites(prev => {
      if (!prev.includes(upperSymbol)) {
        const newFavorites = [...prev, upperSymbol];
        saveFavorites(newFavorites);
        return newFavorites;
      }
      return prev;
    });
  }, [saveFavorites]);

  const removeFavorite = useCallback((symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    setFavorites(prev => {
      const newFavorites = prev.filter(fav => fav !== upperSymbol);
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  const toggleFavorite = useCallback((symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    if (favorites.includes(upperSymbol)) {
      removeFavorite(upperSymbol);
    } else {
      addFavorite(upperSymbol);
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback((symbol: string) => {
    return favorites.includes(symbol.toUpperCase());
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    saveFavorites([]);
  }, [saveFavorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites
  };
}