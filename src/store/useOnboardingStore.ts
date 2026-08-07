import { create } from 'zustand';

interface OnboardingState {
  step: number;
  goal: string;
  phone: string;
  isVerified: boolean;
  setGoal: (goal: string) => void;
  setPhone: (phone: string) => void;
  setVerified: (status: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 1,
  goal: '',
  phone: '',
  isVerified: false,
  setGoal: (goal) => set({ goal }),
  setPhone: (phone) => set({ phone }),
  setVerified: (status) => set({ isVerified: status }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
  reset: () => set({ step: 1, goal: '', phone: '', isVerified: false }),
}));
