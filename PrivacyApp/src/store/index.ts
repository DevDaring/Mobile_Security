/**
 * Zustand Store for Privacy App
 * Manages global application state with local persistence
 */

import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppPermissionAccess,
  SocialPost,
  Nudge,
  AuditLogEntry,
  SocialAccount,
  AppSettings,
  PrivacySummary,
  PrivacyRiskLevel,
  NudgeDeliveryStyle,
} from '../types';

interface AppState {
  // User onboarding
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;

  // Permissions
  permissionAccesses: AppPermissionAccess[];
  addPermissionAccess: (access: AppPermissionAccess) => void;
  updatePermissionAccess: (appName: string, updates: Partial<AppPermissionAccess>) => void;
  markAppAsSafe: (appName: string) => void;

  // Social accounts
  socialAccounts: SocialAccount[];
  connectSocialAccount: (account: SocialAccount) => void;
  disconnectSocialAccount: (platform: string) => void;

  // Social posts
  socialPosts: SocialPost[];
  addSocialPost: (post: SocialPost) => void;
  updateSocialPost: (postId: string, updates: Partial<SocialPost>) => void;
  deleteSocialPost: (postId: string) => void;

  // Nudges
  nudges: Nudge[];
  addNudge: (nudge: Nudge) => void;
  updateNudge: (nudgeId: string, updates: Partial<Nudge>) => void;
  dismissNudge: (nudgeId: string) => void;

  // Audit log
  auditLog: AuditLogEntry[];
  addAuditEntry: (entry: AuditLogEntry) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;

  // Privacy summary
  privacySummary: PrivacySummary;
  updatePrivacySummary: (summary: Partial<PrivacySummary>) => void;

  // Persistence
  loadState: () => Promise<void>;
  saveState: () => Promise<void>;
}

// Default settings
const defaultSettings: AppSettings = {
  nudgeFrequency: 'daily',
  nudgeDeliveryStyle: 'heads_up',
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  timerNudgeDuration: 10,
  timerNudgeEnabled: true,
  audienceNudgeEnabled: true,
  permissionNudgeEnabled: true,
  exposureAnalysisEnabled: true,
  excludedApps: [],
  sensitivityThreshold: 'medium',
};

const defaultPrivacySummary: PrivacySummary = {
  permissionRisk: 'low',
  recentExposures: 0,
  topAccessingApps: [],
  publicPosts: 0,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  hasCompletedOnboarding: false,
  permissionAccesses: [],
  socialAccounts: [],
  socialPosts: [],
  nudges: [],
  auditLog: [],
  settings: defaultSettings,
  privacySummary: defaultPrivacySummary,

  // Onboarding
  setHasCompletedOnboarding: (completed: boolean) => {
    set({hasCompletedOnboarding: completed});
    get().saveState();
  },

  // Permission management
  addPermissionAccess: (access: AppPermissionAccess) => {
    set(state => ({
      permissionAccesses: [...state.permissionAccesses, access],
    }));
    get().saveState();
  },

  updatePermissionAccess: (appName: string, updates: Partial<AppPermissionAccess>) => {
    set(state => ({
      permissionAccesses: state.permissionAccesses.map(access =>
        access.appName === appName ? {...access, ...updates} : access,
      ),
    }));
    get().saveState();
  },

  markAppAsSafe: (appName: string) => {
    set(state => ({
      permissionAccesses: state.permissionAccesses.map(access =>
        access.appName === appName ? {...access, markedSafe: true} : access,
      ),
    }));
    get().addAuditEntry({
      id: Date.now().toString(),
      timestamp: new Date(),
      eventType: 'permission_changed',
      description: `Marked ${appName} as safe`,
      metadata: {appName},
    });
    get().saveState();
  },

  // Social accounts
  connectSocialAccount: (account: SocialAccount) => {
    set(state => ({
      socialAccounts: [
        ...state.socialAccounts.filter(a => a.platform !== account.platform),
        account,
      ],
    }));
    get().saveState();
  },

  disconnectSocialAccount: (platform: string) => {
    set(state => ({
      socialAccounts: state.socialAccounts.filter(a => a.platform !== platform),
    }));
    get().saveState();
  },

  // Social posts
  addSocialPost: (post: SocialPost) => {
    set(state => ({
      socialPosts: [post, ...state.socialPosts],
    }));
    get().saveState();
  },

  updateSocialPost: (postId: string, updates: Partial<SocialPost>) => {
    set(state => ({
      socialPosts: state.socialPosts.map(post =>
        post.id === postId ? {...post, ...updates} : post,
      ),
    }));
    get().addAuditEntry({
      id: Date.now().toString(),
      timestamp: new Date(),
      eventType: 'post_edited',
      description: `Updated post ${postId}`,
      metadata: {postId, updates},
    });
    get().saveState();
  },

  deleteSocialPost: (postId: string) => {
    set(state => ({
      socialPosts: state.socialPosts.filter(post => post.id !== postId),
    }));
    get().addAuditEntry({
      id: Date.now().toString(),
      timestamp: new Date(),
      eventType: 'post_deleted',
      description: `Deleted post ${postId}`,
      metadata: {postId},
    });
    get().saveState();
  },

  // Nudges
  addNudge: (nudge: Nudge) => {
    set(state => ({
      nudges: [nudge, ...state.nudges],
    }));
    get().addAuditEntry({
      id: Date.now().toString(),
      timestamp: new Date(),
      eventType: 'nudge_shown',
      description: nudge.title,
      metadata: {nudgeId: nudge.id, type: nudge.type},
    });
    get().saveState();
  },

  updateNudge: (nudgeId: string, updates: Partial<Nudge>) => {
    set(state => ({
      nudges: state.nudges.map(nudge => (nudge.id === nudgeId ? {...nudge, ...updates} : nudge)),
    }));
    if (updates.status === 'acted') {
      get().addAuditEntry({
        id: Date.now().toString(),
        timestamp: new Date(),
        eventType: 'nudge_acted',
        description: `Acted on nudge ${nudgeId}`,
        metadata: {nudgeId},
      });
    }
    get().saveState();
  },

  dismissNudge: (nudgeId: string) => {
    set(state => ({
      nudges: state.nudges.map(nudge =>
        nudge.id === nudgeId ? {...nudge, status: 'dismissed', respondedAt: new Date()} : nudge,
      ),
    }));
    get().addAuditEntry({
      id: Date.now().toString(),
      timestamp: new Date(),
      eventType: 'nudge_dismissed',
      description: `Dismissed nudge ${nudgeId}`,
      metadata: {nudgeId},
    });
    get().saveState();
  },

  // Audit log
  addAuditEntry: (entry: AuditLogEntry) => {
    set(state => ({
      auditLog: [entry, ...state.auditLog].slice(0, 1000), // Keep last 1000 entries
    }));
    get().saveState();
  },

  // Settings
  updateSettings: (updates: Partial<AppSettings>) => {
    set(state => ({
      settings: {...state.settings, ...updates},
    }));
    get().addAuditEntry({
      id: Date.now().toString(),
      timestamp: new Date(),
      eventType: 'settings_changed',
      description: 'Settings updated',
      metadata: updates,
    });
    get().saveState();
  },

  // Privacy summary
  updatePrivacySummary: (summary: Partial<PrivacySummary>) => {
    set(state => ({
      privacySummary: {...state.privacySummary, ...summary},
    }));
    get().saveState();
  },

  // Persistence
  loadState: async () => {
    try {
      const savedState = await AsyncStorage.getItem('app_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        set({
          hasCompletedOnboarding: parsed.hasCompletedOnboarding || false,
          permissionAccesses: parsed.permissionAccesses || [],
          socialAccounts: parsed.socialAccounts || [],
          socialPosts: parsed.socialPosts || [],
          nudges: parsed.nudges || [],
          auditLog: parsed.auditLog || [],
          settings: {...defaultSettings, ...parsed.settings},
          privacySummary: {...defaultPrivacySummary, ...parsed.privacySummary},
        });
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  },

  saveState: async () => {
    try {
      const state = get();
      const stateToSave = {
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        permissionAccesses: state.permissionAccesses,
        socialAccounts: state.socialAccounts,
        socialPosts: state.socialPosts,
        nudges: state.nudges,
        auditLog: state.auditLog,
        settings: state.settings,
        privacySummary: state.privacySummary,
      };
      await AsyncStorage.setItem('app_state', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  },
}));
