// src/hooks/useDebouncedPersist.ts
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useDebouncedPersist(visited: string[], wish: string[], delay = 250) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      AsyncStorage.multiSet([
        ['visitedCountries', JSON.stringify(visited)],
        ['wantToVisitCountries', JSON.stringify(wish)],
      ]).catch(() => {});
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [visited, wish, delay]);
}
