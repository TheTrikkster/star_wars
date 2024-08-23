import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type EnemyInfo<T extends Record<string, string | number | string[]>> = T;

interface SearchState {
  selected: string;
  enemyInfo: EnemyInfo<Record<string, string | number | string[]>>[];
  pages: number;
  currentPage: number;
  loading: boolean;
  searchParam: string | null;
  searchInput: string;
  translateToWookiee: boolean;
}

const initialState: SearchState = {
  selected: 'people',
  enemyInfo: [],
  pages: 0,
  currentPage: 1,
  loading: true,
  searchParam: null,
  searchInput: '',
  translateToWookiee: false,
};

export const searchSlice = createSlice({
  name: 'recherche',
  initialState,
  reducers: {
    setSelected: (state, action: PayloadAction<string>) => {
      state.selected = action.payload;
    },
    setEnemyInfo: (
      state,
      action: PayloadAction<
        EnemyInfo<Record<string, string | number | string[]>>[]
      >,
    ) => {
      state.enemyInfo = action.payload;
    },
    setPages: (state, action: PayloadAction<number>) => {
      state.pages = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSearchParam: (state, action: PayloadAction<string | null>) => {
      state.searchParam = action.payload;
    },
    setSearchInput: (state, action: PayloadAction<string>) => {
      state.searchInput = action.payload;
    },
    setTranslateToWookiee: (state, action: PayloadAction<boolean>) => {
      state.translateToWookiee = action.payload;
    },
  },
});

export const {
  setSelected,
  setEnemyInfo,
  setPages,
  setCurrentPage,
  setLoading,
  setSearchParam,
  setSearchInput,
  setTranslateToWookiee,
} = searchSlice.actions;

export default searchSlice.reducer;
