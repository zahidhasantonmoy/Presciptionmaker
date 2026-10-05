import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isConfigured: boolean; // Has a master passcode been set?
  passcodeHash: string | null;
  isAuthenticated: boolean;
  securityEnabled: boolean; // If false, bypass lock screen
  
  // Actions
  setupMasterPasscode: (passcode: string) => void;
  verifyPasscode: (passcode: string) => boolean;
  lock: () => void;
  changePasscode: (oldPasscode: string, newPasscode: string) => boolean;
  toggleSecurity: (enabled: boolean) => void;
}

// Simple hashing for client-side storage
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return btoa(`salt_${hash}_hash`);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isConfigured: false,
      passcodeHash: null,
      isAuthenticated: false,
      securityEnabled: true,

      setupMasterPasscode: (passcode: string) => {
        const hash = hashString(passcode.trim());
        set({
          isConfigured: true,
          passcodeHash: hash,
          isAuthenticated: true,
          securityEnabled: true,
        });
      },

      verifyPasscode: (passcode: string) => {
        const currentHash = get().passcodeHash;
        if (!currentHash) return false;

        const inputHash = hashString(passcode.trim());
        if (inputHash === currentHash) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      lock: () => {
        set({ isAuthenticated: false });
      },

      changePasscode: (oldPasscode: string, newPasscode: string) => {
        const currentHash = get().passcodeHash;
        if (!currentHash || hashString(oldPasscode.trim()) !== currentHash) {
          return false;
        }
        const newHash = hashString(newPasscode.trim());
        set({
          passcodeHash: newHash,
          isAuthenticated: true,
        });
        return true;
      },

      toggleSecurity: (enabled: boolean) => {
        if (!enabled) {
          set({ securityEnabled: false, isAuthenticated: true });
        } else {
          set({ securityEnabled: true });
        }
      },
    }),
    {
      name: 'hub_personal_auth_storage',
    }
  )
);
