
import { User } from '../types';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const CURRENT_USER_KEY = 'askdata_session';

export class AuthService {
  // ── Google OAuth ──────────────────────────────────────────────────────────
  static async signInWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    const user: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email || 'User',
      avatar: firebaseUser.photoURL || undefined,
      plan: 'free',
      isSubscriptionActive: false,
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-change'));
    return user;
  }

  // ── Email/Name (legacy local) sign-up ─────────────────────────────────────
  static async signup(email: string, name: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const USERS_KEY = 'askdata_users_db';
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (users.find((u: User) => u.email === email)) {
      throw new Error('An account with this email already exists');
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      plan: 'free',
      isSubscriptionActive: false,
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return this.loginWithEmail(email);
  }

  static async loginWithEmail(email: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const USERS_KEY = 'askdata_users_db';
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: User) => u.email === email);
    if (!user) throw new Error('No account found. Please sign up first.');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-change'));
    return user;
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  static async logout() {
    try { await signOut(auth); } catch (_) {}
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new Event('auth-change'));
  }

  // ── Session ───────────────────────────────────────────────────────────────
  static getCurrentUser(): User | null {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson);
  }

  /** Call once in App root to keep session in sync with Firebase state */
  static listenToAuthState() {
    onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        const current = this.getCurrentUser();
        // Only clear if it was a Google session (has uid-like id length)
        if (current && current.id.length > 10) {
          localStorage.removeItem(CURRENT_USER_KEY);
          window.dispatchEvent(new Event('auth-change'));
        }
      }
    });
  }

  // ── Pro plan upgrade ──────────────────────────────────────────────────────
  static upgradeToPro(userId: string) {
    const USERS_KEY = 'askdata_users_db';
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const userIndex = users.findIndex((u: User) => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].plan = 'pro';
      users[userIndex].isSubscriptionActive = true;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.plan = 'pro';
      currentUser.isSubscriptionActive = true;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      window.dispatchEvent(new Event('auth-change'));
    }
  }
}

