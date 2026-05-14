import { User } from '../types';

const USERS_KEY = 'askdata_users_db';
const CURRENT_USER_KEY = 'askdata_session';

export class AuthService {
  // ── Google OAuth (via @react-oauth/google credential) ─────────────────────
  static loginWithGoogleCredential(credential: string): User {
    // The credential is a JWT — decode its payload (base64)
    const payload = JSON.parse(atob(credential.split('.')[1]));

    const user: User = {
      id: payload.sub,
      email: payload.email || '',
      name: payload.name || payload.email || 'User',
      avatar: payload.picture || undefined,
      plan: 'free',
      isSubscriptionActive: false,
    };

    // Persist the session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-change'));
    return user;
  }

  // ── Email/Name (local) sign-up ─────────────────────────────────────────────
  static async signup(email: string, name: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
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
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: User) => u.email === email);
    if (!user) throw new Error('No account found. Please sign up first.');
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('auth-change'));
    return user;
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  static logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new Event('auth-change'));
  }

  // ── Session ────────────────────────────────────────────────────────────────
  static getCurrentUser(): User | null {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) return null;
    return JSON.parse(userJson);
  }

  // ── Pro plan upgrade ───────────────────────────────────────────────────────
  static upgradeToPro(userId: string) {
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
