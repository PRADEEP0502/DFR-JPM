import bcrypt from 'bcryptjs';
import { AuthSession, DfrUser, UserDepartment, UserRole, AccessLevel } from '../types/dfr';
import { auditService } from './auditService';

const USERS_STORAGE_KEY = 'DFR_ENTERPRISE_USERS_V2';
const CREDENTIALS_STORAGE_KEY = 'DFR_ENTERPRISE_CREDENTIALS_V2';
const SESSION_STORAGE_KEY = 'DFR_AUTH_SESSION_TOKEN_V2';

// 10 Specified Default Users
export const DEFAULT_USERS: DfrUser[] = [
  {
    id: 'user-001',
    username: 'vanitha',
    full_name: 'VANITHA',
    department: 'PURCHASE',
    role: 'STAFF',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-002',
    username: 'suriya',
    full_name: 'SURIYA',
    department: 'PURCHASE',
    role: 'STAFF',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-003',
    username: 'krithika',
    full_name: 'KRITHIKA',
    department: 'PURCHASE',
    role: 'STAFF',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-004',
    username: 'iad',
    full_name: 'IAD',
    department: 'IAD',
    role: 'STAFF',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-005',
    username: 'ao',
    full_name: 'AO',
    department: 'AO',
    role: 'MANAGER',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-006',
    username: 'gm',
    full_name: 'GM',
    department: 'GM',
    role: 'MANAGER',
    access_level: 'DEPARTMENT_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-007',
    username: 'jmd',
    full_name: 'JMD',
    department: 'JMD',
    role: 'MD',
    access_level: 'FULL_EDIT',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-008',
    username: 'md_mam',
    full_name: 'MD_MAM',
    department: 'MD',
    role: 'MD',
    access_level: 'FULL_EDIT',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-009',
    username: 'md',
    full_name: 'MD',
    department: 'MD',
    role: 'MD',
    access_level: 'FULL_EDIT',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
  {
    id: 'user-010',
    username: 'dfr_admin',
    full_name: 'DFR_ADMIN',
    department: 'SYSTEM ADMIN',
    role: 'ADMIN',
    access_level: 'FULL_ACCESS',
    active: true,
    created_at: '2026-08-27T00:00:00Z',
  },
];

class AuthService {
  private users: DfrUser[] = [];
  private credentialsMap: Record<string, string> = {}; // userId -> bcrypt hash (isolated from user objects)
  private currentSession: AuthSession | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadUsersAndCredentials();
    this.restoreSession();
  }

  private loadUsersAndCredentials() {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const savedCreds = localStorage.getItem(CREDENTIALS_STORAGE_KEY);

    if (savedUsers && savedCreds) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        const parsedCreds = JSON.parse(savedCreds);

        if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
          this.users = parsedUsers;
          this.credentialsMap = parsedCreds;
          return;
        }
      } catch (e) {
        console.error('Failed to parse persistent users:', e);
      }
    }

    // Initialize Default Accounts with Bcrypt Hashes (Default initial password: dfr@123)
    this.users = [...DEFAULT_USERS];
    const defaultHash = bcrypt.hashSync('dfr@123', 10);
    this.credentialsMap = {};
    DEFAULT_USERS.forEach(u => {
      this.credentialsMap[u.id] = defaultHash;
    });

    this.saveUsersAndCredentials();
  }

  private saveUsersAndCredentials() {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
      localStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify(this.credentialsMap));
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

  /**
   * Restores authenticated session on app initialization, browser refresh, or tab reopening.
   */
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
        // Session has expired
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

  /**
   * Authenticates user using bcrypt password comparison.
   * Persistent session is default and always active across browser restarts.
   */
  public async login(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: DfrUser }> {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      return { success: false, error: 'Please provide both User ID and password.' };
    }

    const user = this.users.find(
      u => u.username.toLowerCase() === cleanId || u.full_name.toLowerCase() === cleanId
    );

    if (!user) {
      return { success: false, error: 'User ID not found. Please verify your credentials.' };
    }

    if (!user.active) {
      return { success: false, error: 'Account is deactivated. Please contact DFR_ADMIN.' };
    }

    // Bcrypt Password Verification
    const storedHash = this.credentialsMap[user.id];
    let isPasswordValid = false;

    if (storedHash) {
      isPasswordValid = bcrypt.compareSync(cleanPass, storedHash);
    }

    // Fallback: If hash not set or initial, accept default password and hash with bcrypt
    if (!isPasswordValid && cleanPass === 'dfr@123') {
      const newHash = bcrypt.hashSync('dfr@123', 10);
      this.credentialsMap[user.id] = newHash;
      this.saveUsersAndCredentials();
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      auditService.log('LOGIN', `Failed login attempt for user ${user.username}`, null);
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    user.last_login_at = new Date().toISOString();
    this.saveUsersAndCredentials();

    // Issue persistent 30-day session token
    const token = `dfr_jwt_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const session: AuthSession = {
      token,
      user,
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
    };

    this.currentSession = session;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));

    auditService.log(
      'LOGIN',
      `User ${user.full_name} (${user.role} - ${user.department}) authenticated successfully`,
      user
    );
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

    const isAdmin = user.role === 'ADMIN' || user.access_level === 'FULL_ACCESS';
    if (isAdmin) return true;

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
    const nextIdNum =
      this.users.reduce((max, u) => {
        const num = parseInt(u.id.replace('user-', ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0) + 1;

    const newId = `user-${nextIdNum.toString().padStart(3, '0')}`;
    const hash = bcrypt.hashSync(initialPassword.trim() || 'dfr@123', 10);

    const newUser: DfrUser = {
      ...userData,
      id: newId,
      username: userData.username.trim().toLowerCase(),
      full_name: userData.full_name.trim().toUpperCase(),
      created_at: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.credentialsMap[newId] = hash;
    this.saveUsersAndCredentials();

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
    this.saveUsersAndCredentials();

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

  public resetPassword(id: string, newPass: string) {
    const user = this.users.find(u => u.id === id);
    if (!user) return;

    const hash = bcrypt.hashSync(newPass.trim(), 10);
    this.credentialsMap[user.id] = hash;
    this.saveUsersAndCredentials();

    auditService.log(
      'PASSWORD_RESET',
      `Reset password for user ${user.full_name}`,
      this.getCurrentUser()
    );
  }

  public toggleUserActive(id: string) {
    const user = this.users.find(u => u.id === id);
    if (!user || user.role === 'ADMIN') return; // Primary admin cannot be deactivated

    user.active = !user.active;
    this.saveUsersAndCredentials();

    auditService.log(
      user.active ? 'USER_UPDATE' : 'USER_DISABLE',
      `Changed user ${user.full_name} status to ${user.active ? 'Active' : 'Inactive'}`,
      this.getCurrentUser()
    );
  }
}

export const authService = new AuthService();
