import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Token {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  liquidity: number;
  holders?: number;
  logo?: string;
  chain: string;
  category?: 'new' | 'final-stretch' | 'migrated';
  isFavorite?: boolean;
}

interface TokensState {
  tokens: Token[];
  loading: boolean;
  error: string | null;
  selectedToken: Token | null;
}

const initialState: TokensState = {
  tokens: [],
  loading: false,
  error: null,
  selectedToken: null,
};

const tokensSlice = createSlice({
  name: 'tokens',
  initialState,
  reducers: {
    setTokens: (state, action: PayloadAction<Token[]>) => {
      state.tokens = action.payload;
    },
    addNewToken: (state, action: PayloadAction<Token>) => {
      // Check if token already exists
      const exists = state.tokens.some((t) => t.id === action.payload.id);
      if (!exists) {
        // Add new token to the beginning of the list
        state.tokens.unshift(action.payload);
      }
    },
    updateTokenPrice: (state, action: PayloadAction<{ id: string; price: number; priceChange24h: number }>) => {
      const token = state.tokens.find((t) => t.id === action.payload.id);
      if (token) {
        token.price = action.payload.price;
        token.priceChange24h = action.payload.priceChange24h;
      }
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const token = state.tokens.find((t) => t.id === action.payload);
      if (token) {
        token.isFavorite = !token.isFavorite;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedToken: (state, action: PayloadAction<Token | null>) => {
      state.selectedToken = action.payload;
    },
  },
});

export const { setTokens, addNewToken, updateTokenPrice, toggleFavorite, setLoading, setError, setSelectedToken } = tokensSlice.actions;
export default tokensSlice.reducer;
