/**
 * Type definitions for Privacy App
 */

export type PermissionType =
  | 'location'
  | 'contacts'
  | 'camera'
  | 'microphone'
  | 'storage'
  | 'notifications';

export type PrivacyRiskLevel = 'low' | 'medium' | 'high';

export type PostVisibility = 'public' | 'friends' | 'custom' | 'private';

export type SocialPlatform = 'facebook' | 'instagram' | 'youtube';

export type NudgeType = 'permission_access' | 'audience' | 'timer' | 'exposure';

export type NudgeStatus = 'shown' | 'acted' | 'dismissed' | 'snoozed';

export type NudgeDeliveryStyle = 'heads_up' | 'full_screen' | 'notification';

export interface AppPermissionAccess {
  appName: string;
  appIcon?: string;
  permissionType: PermissionType;
  lastAccessed: Date;
  accessCount: number;
  accessHistory: Date[];
  markedSafe: boolean;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  mediaUrls?: string[];
  postedAt: Date;
  visibility: PostVisibility;
  audienceSize?: number;
  tags?: string[];
  location?: string;
  mentions?: string[];
  riskLevel: PrivacyRiskLevel;
  riskReasons?: string[];
}

export interface Nudge {
  id: string;
  type: NudgeType;
  title: string;
  message: string;
  status: NudgeStatus;
  createdAt: Date;
  respondedAt?: Date;
  deliveryStyle: NudgeDeliveryStyle;
  data?: any;
  actions: NudgeAction[];
}

export interface NudgeAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'dismiss';
  action: () => void;
}

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType:
    | 'nudge_shown'
    | 'nudge_acted'
    | 'nudge_dismissed'
    | 'permission_changed'
    | 'post_edited'
    | 'post_deleted'
    | 'settings_changed';
  description: string;
  metadata?: Record<string, any>;
}

export interface SocialAccount {
  platform: SocialPlatform;
  connected: boolean;
  username?: string;
  userId?: string;
  accessToken?: string;
  permissions: string[];
  connectedAt?: Date;
}

export interface AppSettings {
  nudgeFrequency: 'daily' | 'weekly' | 'biweekly';
  nudgeDeliveryStyle: NudgeDeliveryStyle;
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string;
  timerNudgeDuration: number; // seconds
  timerNudgeEnabled: boolean;
  audienceNudgeEnabled: boolean;
  permissionNudgeEnabled: boolean;
  exposureAnalysisEnabled: boolean;
  excludedApps: string[];
  sensitivityThreshold: PrivacyRiskLevel;
}

export interface PrivacySummary {
  permissionRisk: PrivacyRiskLevel;
  recentExposures: number;
  topAccessingApps: string[];
  publicPosts: number;
  lastScanDate?: Date;
}

export interface ExposureAnalysis {
  postId: string;
  riskType: 'public_post' | 'location_tagged' | 'pii_detected' | 'high_emotion' | 'tagged_photo';
  severity: PrivacyRiskLevel;
  description: string;
  suggestion: string;
  canAutoFix: boolean;
}
