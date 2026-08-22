import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebase';
import { logger } from '../utils/logger';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export class AuthService {
  /**
   * Trigger Google Sign-In popup flow.
   */
  public async signInWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return this.mapUser(result.user);
    } catch (error: unknown) {
      logger.error('Google sign-in error:', error);
      throw error;
    }
  }

  /**
   * Sign out current user.
   */
  public async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      logger.error('Sign-out error:', error);
      throw error;
    }
  }

  /**
   * Listen for authentication state changes.
   */
  public onAuthChange(callback: (user: UserProfile | null) => void): () => void {
    return onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        callback(this.mapUser(user));
      } else {
        callback(null);
      }
    });
  }

  private mapUser(user: User): UserProfile {
    return {
      uid: user.uid,
      displayName: user.displayName || user.email?.split('@')[0] || 'Learner',
      email: user.email,
      photoURL: user.photoURL,
      isAnonymous: user.isAnonymous
    };
  }
}

export const authService = new AuthService();
