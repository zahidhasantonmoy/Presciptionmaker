import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isConfigured: boolean;
  passcodeHash: string | null;
  isAuthenticated: boolean;
  securityEnabled: boolean;

  // Actions
  setupMasterPasscode: (passcode: string) => void;
  verifyPasscode: (passcode: string) => boolean;
  lock: () => void;
  changePasscode: (oldPasscode: string, newPasscode: string) => boolean;
  resetToDefaultPasscode: () => void;
  isUsingDefaultPasscode: () => boolean;
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

export const DEFAULT_PASSCODE = '2580';
const DEFAULT_HASH = hashString(DEFAULT_PASSCODE);

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isConfigured: true,
      passcodeHash: DEFAULT_HASH,
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
        const trimmed = passcode.trim();
        const currentHash = get().passcodeHash || DEFAULT_HASH;
        const inputHash = hashString(trimmed);
        if (inputHash === currentHash) {
          set({ isAuthenticated: true, isConfigured: true });
          return true;
        }
        return false;
      },

      lock: () => {
        set({ securityEnabled: true, isAuthenticated: false });
      },

      changePasscode: (oldPasscode: string, newPasscode: string) => {
        const currentHash = get().passcodeHash || DEFAULT_HASH;
        if (hashString(oldPasscode.trim()) !== currentHash) {
          return false;
        }
        const trimmedNew = newPasscode.trim();
        if (trimmedNew.length < 4) {
          return false;
        }
        const newHash = hashString(trimmedNew);
        set({
          passcodeHash: newHash,
          isConfigured: true,
          isAuthenticated: true,
        });
        return true;
      },

      resetToDefaultPasscode: () => {
        set({
          passcodeHash: DEFAULT_HASH,
          isConfigured: true,
          isAuthenticated: true,
        });
      },

      isUsingDefaultPasscode: () => {
        const currentHash = get().passcodeHash || DEFAULT_HASH;
        return currentHash === DEFAULT_HASH;
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
