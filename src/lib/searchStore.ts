import { create } from 'zustand';

interface SearchStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchVisible: boolean;
  setSearchVisible: (visible: boolean) => void;
  resetSearch: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchQuery: '',
  isSearchVisible: false,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchVisible: (visible) => set({ isSearchVisible: visible }),
  resetSearch: () => set({ searchQuery: '', isSearchVisible: false }),
}));
