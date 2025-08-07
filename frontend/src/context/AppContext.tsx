import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface Subscription {
  id: string;
  plan: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  zipCode?: string;
  hasPremium?: boolean;
  subscription?: Subscription | null;
}

interface Match {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  compatibility: number;
  photo: string;
}

interface AppState {
  user: User | null;
  currentStep: number;
  personalityAnswers: Record<string, unknown>;
  compatibilityAnswers: Record<string, unknown>;
  hasPayment: boolean;
  hasPremium: boolean;
  subscription: Subscription | null;
  currentMatch: Match | null;
  acceptedMatch: Match | null;
  rejectedMatches: Match[];
  dailyMatchCount: number;
  lastMatchDate: string;
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
  }>;
}

type AppAction = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_PERSONALITY_ANSWERS'; payload: Record<string, unknown> }
  | { type: 'SET_COMPATIBILITY_ANSWERS'; payload: Record<string, unknown> }
  | { type: 'SET_PAYMENT_STATUS'; payload: boolean }
  | { type: 'SET_PREMIUM_STATUS'; payload: { hasPremium: boolean; subscription: Subscription | null } }
  | { type: 'SET_MATCH'; payload: Match }
  | { type: 'ACCEPT_MATCH'; payload: Match }
  | { type: 'REJECT_MATCH'; payload: Match }
  | { type: 'RESET_DAILY_MATCHES' }
  | { type: 'ADD_MESSAGE'; payload: { senderId: string; content: string; } };

const initialState: AppState = {
  user: null,
  currentStep: 0,
  personalityAnswers: {},
  compatibilityAnswers: {},
  hasPayment: false,
  hasPremium: false,
  subscription: null,
  currentMatch: null,
  acceptedMatch: null,
  rejectedMatches: [],
  dailyMatchCount: 0,
  lastMatchDate: new Date().toDateString(),
  messages: []
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        hasPremium: action.payload?.hasPremium || false,
        subscription: action.payload?.subscription || null
      };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_PERSONALITY_ANSWERS':
      return { ...state, personalityAnswers: action.payload };
    case 'SET_COMPATIBILITY_ANSWERS':
      return { ...state, compatibilityAnswers: action.payload };
    case 'SET_PAYMENT_STATUS':
      return { ...state, hasPayment: action.payload };
    case 'SET_PREMIUM_STATUS':
      return { ...state, hasPremium: action.payload.hasPremium, subscription: action.payload.subscription };
    case 'SET_MATCH':
      return { ...state, currentMatch: action.payload };
    case 'ACCEPT_MATCH':
      return { 
        ...state, 
        acceptedMatch: action.payload,
        currentMatch: null,
        dailyMatchCount: state.dailyMatchCount + 1,
        lastMatchDate: new Date().toDateString()
      };
    case 'REJECT_MATCH':
      {
        const today = new Date().toDateString();
        const isNewDay = state.lastMatchDate !== today;
        
        return { 
          ...state, 
          rejectedMatches: [...state.rejectedMatches, action.payload],
          currentMatch: null,
          dailyMatchCount: isNewDay ? 1 : state.dailyMatchCount + 1,
          lastMatchDate: today
        };
      }
    case 'RESET_DAILY_MATCHES':
      return {
        ...state,
        dailyMatchCount: 0,
        lastMatchDate: new Date().toDateString(),
        rejectedMatches: []
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            senderId: action.payload.senderId,
            content: action.payload.content,
            timestamp: new Date()
          }
        ]
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}