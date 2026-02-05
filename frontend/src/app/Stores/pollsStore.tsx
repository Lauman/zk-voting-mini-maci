import { create } from 'zustand'

export const usePolls = create((set) => ({
    polls: [] as bigint[],
    addPoll: (poll: bigint) => set((state: { polls: any }) => ({ polls: [...state.polls, poll] })),
    updatePolls: (newPolls: any) => set({ polls: newPolls }),
}))