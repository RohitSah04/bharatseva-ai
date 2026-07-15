import { create } from 'zustand'

export const useChatStore = create((set) => ({
  messages: [],
  loading: false,
  error: null,

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearChat: () => set({ messages: [], error: null }),
}))
