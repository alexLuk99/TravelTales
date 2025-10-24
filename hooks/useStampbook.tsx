import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useDebouncedPersist } from './useDebouncedPersist';

type StampbookContextValue = {
  visitedCountries: string[];
  wantToVisitCountries: string[];
  toggleVisited: (code3: string) => void;
  toggleWishlist: (code3: string) => void;
  hydrated: boolean;
};

const StampbookContext = createContext<StampbookContextValue | undefined>(undefined);

export function StampbookProvider({ children }: { children: ReactNode }) {
  const [visitedCountries, setVisitedCountries] = useState<string[]>([]);
  const [wantToVisitCountries, setWantToVisitCountries] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const entries = await AsyncStorage.multiGet(['visitedCountries', 'wantToVisitCountries']);
        if (cancelled) return;
        const visitedRaw = entries.find(([key]) => key === 'visitedCountries')?.[1];
        const wishRaw = entries.find(([key]) => key === 'wantToVisitCountries')?.[1];

        if (visitedRaw) {
          setVisitedCountries(JSON.parse(visitedRaw));
        }
        if (wishRaw) {
          setWantToVisitCountries(JSON.parse(wishRaw));
        }
      } catch (error) {
        console.warn('Failed to restore stampbook state', error);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useDebouncedPersist(visitedCountries, wantToVisitCountries);

  const toggleVisited = useCallback((code3: string) => {
    setVisitedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(code3)) {
        next.delete(code3);
      } else {
        next.add(code3);
      }
      return Array.from(next);
    });
    setWantToVisitCountries((prev) => (prev.includes(code3) ? prev.filter((c) => c !== code3) : prev));
  }, []);

  const toggleWishlist = useCallback((code3: string) => {
    setWantToVisitCountries((prev) => {
      const next = new Set(prev);
      if (next.has(code3)) {
        next.delete(code3);
      } else {
        next.add(code3);
      }
      return Array.from(next);
    });
    setVisitedCountries((prev) => (prev.includes(code3) ? prev.filter((c) => c !== code3) : prev));
  }, []);

  const value = useMemo<StampbookContextValue>(
    () => ({
      visitedCountries,
      wantToVisitCountries,
      toggleVisited,
      toggleWishlist,
      hydrated,
    }),
    [visitedCountries, wantToVisitCountries, toggleVisited, toggleWishlist, hydrated],
  );

  return <StampbookContext.Provider value={value}>{children}</StampbookContext.Provider>;
}

export function useStampbook() {
  const ctx = useContext(StampbookContext);
  if (!ctx) {
    throw new Error('useStampbook must be used within a StampbookProvider');
  }
  return ctx;
}

