import { create } from 'zustand'

export const useMerkle = create((set) => ({
    members: [] as bigint[],
    updateMembers: (newMembers: any) => set({ members: newMembers }),
}))