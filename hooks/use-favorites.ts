'use client'

import { useState, useEffect, useCallback } from 'react'

const FAVORITES_KEY = 'crypto-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setFavorites(new Set(parsed))
        }
      }
    } catch (error) {
      console.error('Failed to load favorites:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]))
      } catch (error) {
        console.error('Failed to save favorites:', error)
      }
    }
  }, [favorites, isLoaded])

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(symbol)) {
        next.delete(symbol)
      } else {
        next.add(symbol)
      }
      return next
    })
  }, [])

  const addFavorite = useCallback((symbol: string) => {
    setFavorites(prev => new Set([...prev, symbol]))
  }, [])

  const removeFavorite = useCallback((symbol: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      next.delete(symbol)
      return next
    })
  }, [])

  const isFavorite = useCallback((symbol: string) => {
    return favorites.has(symbol)
  }, [favorites])

  return {
    favorites,
    isLoaded,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isFavorite,
  }
}
