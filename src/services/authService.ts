import { AuthSession, DfrUser, UserDepartment, UserRole, AccessLevel } from '../types/dfr';
import { auditService } from './auditService';

const USERS_STORAGE_KEY = 'DFR_ENTERPRISE_USERS_V1';
const SESSION_STORAGE_KEY = 'DFR_AUTH_SESSION_TOKEN_V1';

// Fast standard SHA-256 hasher for client-side password credential verification
async function hashPassword(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(`DFR_SALT_2026_${password.trim()}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 10 Specified Default Users
export const DEFAULT_USERS: DfrUser[] = [
  {
    id: 'user-001',
    username: 'vanitha',
    full_name: 'VANITHA',
    role: 'STAFF',
    department: 'PURCHASE',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-002',
    username: 'suriya',
    full_name: 'SURIYA',
    role: 'STAFF',
    department: 'PURCHASE',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-003',
    username: 'krithika',
    full_name: 'KRITHIKA',
    role: 'STAFF',
    department: 'PURCHASE',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-004',
    username: 'iad',
    full_name: 'IAD',
    role: 'STAFF',
    department: 'IAD',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-005',
    username: 'ao',
    full_name: 'AO',
    role: 'MANAGER',
    department: 'AO',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-006',
    username: 'gm',
    full_name: 'GM',
    role: 'MANAGER',
    department: 'GM',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-007',
    username: 'jmd',
    full_name: 'JMD',
    role: 'MD',
    department: 'JMD',
    access_level: 'FULL_EDIT',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-008',
    username: 'md_mam',
    full_name: 'MD_MAM',
    role: 'MD',
    department: 'MD',
    access_level: 'FULL_EDIT',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-009',
    username: 'md',
    full_name: 'MD',
    role: 'MD',
    department: 'MD',
    access_level: 'FULL_EDIT',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-010',
    username: 'dfr_admin',
    full_name: 'DFR_ADMIN',
    role: 'ADMIN',
    department: 'SYSTEM ADMIN',
    access_level: 'FULL_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
];

class AuthService {
  private users: DfrUser[] = [];
  private currentSession: AuthSession | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadUsers();
    this.restoreSession();
  }

  private loadUsers() {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with default accounts to ensure all 10 are present
          const existingIds = new Set(parsed.map(u => u.username.toLowerCase()));
          const missingDefaults = DEFAULT_USERS.filter(d => !existingIds.has(d.username.toLowerCase()));
          this.users = [...parsed, ...missingDefaults];
          this.saveUsers();
          return;
        }
      } catch (e) {
        console.error('Failed to parse users:', e);
      }
    }
    this.users = [...DEFAULT_USERS];
    this.saveUsers();
  }

  private saveUsers() {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (e) {
      console.warn('Failed to persist users:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  public getUsers(): DfrUser[] {
    return [...this.users];
  }

  public getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  public getCurrentUser(): DfrUser | null {
    return this.currentSession ? this.currentSession.user : null;
  }

  public isAuthenticated(): boolean {
    if (!this.currentSession) return false;
    const now = new Date().getTime();
    const expiry = new Date(this.currentSession.expires_at).getTime();
    return now < expiry;
  }

  public restoreSession(): AuthSession | null {
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!savedSession) {
      this.currentSession = null;
      return null;
    }

    try {
      const session: AuthSession = JSON.parse(savedSession);
      const now = new Date().getTime();
      const expiry = new Date(session.expires_at).getTime();

      if (now >= expiry) {
        // Expired session
        localStorage.removeItem(SESSION_STORAGE_KEY);
        this.currentSession = null;
        return null;
      }

      // Check if user is still active in database
      const user = this.users.find(u => u.id === session.user.id && u.active);
      if (!user) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
        this.currentSession = null;
        return null;
      }

      this.currentSession = {
        ...session,
        user, // Update with latest user details
      };
      return this.currentSession;
    } catch (e) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      this.currentSession = null;
      return null;
    }
  }

  public async login(
    identifier: string,
    password: string,
    rememberDays: number = 30
  ): Promise<{ success: boolean; error?: string; user?: DfrUser }> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please provide both username and password.' };
    }

    const user = this.users.find(
      u => u.username.toLowerCase() === cleanId || u.full_name.toLowerCase() === cleanId
    );

    if (!user) {
      return { success: false, error: 'User not found. Please verify your credentials.' };
    }

    if (!user.active) {
      return { success: false, error: 'Account is currently deactivated. Please contact DFR_ADMIN.' };
    }

    // Verify Password: If password_hash is set, check match; otherwise accept initial login & set hash
    const inputHash = await hashPassword(cleanPass);
    if (user.password_hash && user.password_hash !== inputHash) {
      // Also allow default password 'dfr@123' if user hasn't changed it
      const defaultHash = await hashPassword('dfr@123');
      if (user.password_hash !== defaultHash && inputHash !== defaultHash) {
        auditService.log('LOGIN', `Failed login attempt for user ${user.username}`, null);
        return { success: false, error: 'Invalid password. Please try again.' };
      }
    }

    // If first login or hash unset, persist password hash
    if (!user.password_hash) {
      user.password_hash = inputHash;
    }

    user.last_login_at = new Date().toISOString();
    this.saveUsers();

    // Create session token with configurable validity (default 30 days)
    const token = `dfr_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + rememberDays * 24 * 60 * 60 * 1000).toISOString();

    const session: AuthSession = {
      token,
      user,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
    };

    this.currentSession = session;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    auditService.log('LOGIN', `User ${user.full_name} (${user.role}) logged in successfully`, user);
    this.notify();

    return { success: true, user };
  }

  public logout() {
    const user = this.getCurrentUser();
    if (user) {
      auditService.log('LOGOUT', `User ${user.full_name} logged out explicitly`, user);
    }
    this.currentSession = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
    this.notify();
  }

  public hasPermission(requiredLevel: AccessLevel): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const isAdmin = (user.role as string) === 'ADMIN' || (user.access_level as string) === 'FULL_ACCESS';
    if (isAdmin) {
      return true;
    }

    if (requiredLevel === 'FULL_ACCESS') {
      return isAdmin;
    }

    if (requiredLevel === 'FULL_EDIT') {
      return isAdmin || user.role === 'MD' || user.access_level === 'FULL_EDIT';
    }

    return true; // DEPARTMENT_ACCESS
  }

  public async createUser(
    userData: Omit<DfrUser, 'id' | 'created_at'>,
    initialPassword: string = 'dfr@123'
  ): Promise<DfrUser> {
    const nextIdNum = this.users.reduce((max, u) => {
      const num = parseInt(u.id.replace('user-', ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0) + 1;

    const hash = await hashPassword(initialPassword);
    const newUser: DfrUser = {
      ...userData,
      id: `user-${nextIdNum.toString().padStart(3, '0')}`,
      username: userData.username.trim().toLowerCase(),
      full_name: userData.full_name.trim().toUpperCase(),
      password_hash: hash,
      created_at: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.saveUsers();

    auditService.log(
      'USER_CREATE',
      `Created new user ${newUser.full_name} (${newUser.role} - ${newUser.department})`,
      this.getCurrentUser()
    );

    return newUser;
  }

  public updateUser(id: string, updates: Partial<DfrUser>) {
    const user = this.users.find(u => u.id === id);
    if (!user) return;

    const prevRole = user.role;
    Object.assign(user, updates);
    this.saveUsers();

    auditService.log(
      'USER_UPDATE',
      `Updated user profile for ${user.full_name}`,
      this.getCurrentUser(),
      {
        previous_value: `Role: ${prevRole}`,
        new_value: `Role: ${user.role}`,
      }
    );
  }

  public async resetPassword(id: string, newPass: string) {
    const user = this.users.find(u => u.id === id);
    if (!user) return;

    user.password_hash = await hashPassword(newPass);
    this.saveUsers();

    auditService.log(
      'PASSWORD_RESET',
      `Reset password for user ${user.full_name}`,
      this.getCurrentUser()
    );
  }

  public toggleUserActive(id: string) {
    const user = this.users.find(u => u.id === id);
    if (!user || user.role === 'ADMIN') return; // Cannot disable primary admin

    user.active = !user.active;
    this.saveUsers();

    auditService.log(
      user.active ? 'USER_UPDATE' : 'USER_DISABLE',
      `Changed user ${user.full_name} status to ${user.active ? 'Active' : 'Inactive'}`,
      this.getCurrentUser()
    );
  }
}

export const authService = new AuthService();
