import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const useAppStore = create(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 }), false, 'increment'),
        decrement: () => set((state) => ({ count: state.count - 1 }), false, 'decrement'),
        reset: () => set({ count: 0 }, false, 'reset'),
      }),
      { name: 'app-store' }
    )
  )
)

export default useAppStore
