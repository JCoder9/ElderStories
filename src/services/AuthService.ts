import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';

export interface UserProfile {
  uid: string;
  email: string;
  isAdmin: boolean;
  isApproved: boolean;
  displayName?: string;
  personalApiKey?: string; // For non-approved users
  createdAt: string;
  approvedAt?: string;
  monthlyUsage: number; // Transcription count this month
  totalCost: number; // Running cost in USD
  lastResetDate: string; // For monthly reset
}

const MONTHLY_COST_LIMIT = 20; // $20 USD cap

class AuthService {
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;

  /**
   * Initialize auth listener
   */
  initialize(onUserChanged: (user: User | null, profile: UserProfile | null) => void): void {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      
      if (user) {
        // Load user profile from Firestore
        this.userProfile = await this.loadUserProfile(user.uid);
        onUserChanged(user, this.userProfile);
      } else {
        this.userProfile = null;
        onUserChanged(null, null);
      }
    });
  }

  /**
   * Sign up new user
   */
  async signUp(email: string, password: string, displayName?: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: userCredential.user.uid,
        email,
        isAdmin: false,
        isApproved: false, // Requires admin approval
        displayName,
        createdAt: new Date().toISOString(),
        monthlyUsage: 0,
        totalCost: 0,
        lastResetDate: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userProfile);
      console.log('User created:', email);
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Signed in:', email);
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.userProfile = null;
      console.log('Signed out');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Load user profile from Firestore
   */
  private async loadUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        
        // Check if we need to reset monthly usage
        const lastReset = new Date(profile.lastResetDate);
        const now = new Date();
        
        if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
          // Reset monthly usage
          profile.monthlyUsage = 0;
          profile.totalCost = 0;
          profile.lastResetDate = now.toISOString();
          
          await setDoc(docRef, profile);
          console.log('Monthly usage reset for', profile.email);
        }
        
        return profile;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser) throw new Error('No user signed in');
    
    try {
      const docRef = doc(db, 'users', this.currentUser.uid);
      await setDoc(docRef, updates, { merge: true });
      
      // Update local cache
      if (this.userProfile) {
        this.userProfile = { ...this.userProfile, ...updates };
      }
      
      console.log('Profile updated');
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Check if user can use shared API key
   */
  canUseSharedApiKey(): boolean {
    if (!this.userProfile) return false;
    
    // Admin or approved users can use shared key
    if (this.userProfile.isAdmin || this.userProfile.isApproved) {
      // Check monthly cost limit
      return this.userProfile.totalCost < MONTHLY_COST_LIMIT;
    }
    
    return false;
  }

  /**
   * Check if monthly limit exceeded
   */
  isMonthlyLimitExceeded(): boolean {
    if (!this.userProfile) return true;
    return this.userProfile.totalCost >= MONTHLY_COST_LIMIT;
  }

  /**
   * Get user's personal API key (for non-approved users)
   */
  getPersonalApiKey(): string | undefined {
    return this.userProfile?.personalApiKey;
  }

  /**
   * Track transcription usage
   */
  async trackTranscription(durationMinutes: number): Promise<void> {
    if (!this.currentUser || !this.userProfile) return;
    
    // Calculate cost: $0.006 per minute
    const cost = durationMinutes * 0.006;
    
    const updates: Partial<UserProfile> = {
      monthlyUsage: (this.userProfile.monthlyUsage || 0) + 1,
      totalCost: (this.userProfile.totalCost || 0) + cost,
    };
    
    await this.updateUserProfile(updates);
    console.log(`Tracked: ${durationMinutes} mins, $${cost.toFixed(4)}`);
  }

  /**
   * Get current user profile
   */
  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.userProfile?.isAdmin === true;
  }

  /**
   * Check if current user is approved
   */
  isApproved(): boolean {
    return this.userProfile?.isApproved === true;
  }

  /**
   * Get current auth user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Get remaining budget
   */
  getRemainingBudget(): number {
    if (!this.userProfile) return 0;
    return Math.max(0, MONTHLY_COST_LIMIT - this.userProfile.totalCost);
  }
}

export default new AuthService();
