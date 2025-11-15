/**
 * Nudge Engine
 * Creates and manages privacy nudges based on user behavior and settings
 */

import {Nudge, AppPermissionAccess, AppSettings, SocialPost} from '../types';
import {generateId, isInQuietHours} from '../utils/helpers';
import {PermissionsService} from './permissionsService';

export class NudgeEngine {
  /**
   * Check if nudges should be shown based on settings
   */
  static shouldShowNudge(settings: AppSettings): boolean {
    if (!settings.permissionNudgeEnabled) {
      return false;
    }

    if (
      settings.quietHoursEnabled &&
      settings.quietHoursStart &&
      settings.quietHoursEnd
    ) {
      if (isInQuietHours(settings.quietHoursStart, settings.quietHoursEnd)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create a permission access nudge
   * Based on AppOps study findings
   */
  static createPermissionNudge(
    accesses: AppPermissionAccess[],
    settings: AppSettings,
    onAction: (action: string) => void,
  ): Nudge | null {
    if (!this.shouldShowNudge(settings)) {
      return null;
    }

    const recentAccesses = PermissionsService.countRecentAccesses(accesses, 4);
    const topApps = PermissionsService.getTopAccessingApps(accesses, 3);

    if (topApps.length === 0) {
      return null;
    }

    const otherAppsCount = Math.max(0, topApps.length - 3);

    return {
      id: generateId(),
      type: 'permission_access',
      title: 'Apps Accessing Your Data',
      message: `In the last 4 days, ${topApps.length} apps accessed your sensitive data ${recentAccesses} times.`,
      status: 'shown',
      createdAt: new Date(),
      deliveryStyle: settings.nudgeDeliveryStyle,
      data: {
        apps: topApps,
        accessCount: recentAccesses,
      },
      actions: [
        {
          id: 'view_details',
          label: 'Show Me More',
          type: 'primary',
          action: () => onAction('view_details'),
        },
        {
          id: 'change_settings',
          label: 'Change Settings',
          type: 'secondary',
          action: () => onAction('change_settings'),
        },
        {
          id: 'dismiss',
          label: 'Keep Sharing',
          type: 'dismiss',
          action: () => onAction('dismiss'),
        },
      ],
    };
  }

  /**
   * Create an audience nudge for composer
   * Based on Facebook field trial findings
   */
  static createAudienceNudge(
    audienceSize: number,
    visibility: string,
    onAction: (action: string) => void,
  ): Nudge {
    return {
      id: generateId(),
      type: 'audience',
      title: 'Who Can See This?',
      message: `This post will be ${visibility}. Approximately ${audienceSize} people can see it.`,
      status: 'shown',
      createdAt: new Date(),
      deliveryStyle: 'heads_up',
      data: {
        audienceSize,
        visibility,
      },
      actions: [
        {
          id: 'continue',
          label: 'Continue Posting',
          type: 'primary',
          action: () => onAction('continue'),
        },
        {
          id: 'change_audience',
          label: 'Change Audience',
          type: 'secondary',
          action: () => onAction('change_audience'),
        },
        {
          id: 'cancel',
          label: 'Cancel',
          type: 'dismiss',
          action: () => onAction('cancel'),
        },
      ],
    };
  }

  /**
   * Create exposure warning nudges
   */
  static createExposureNudge(
    exposureType: string,
    post: SocialPost,
    onAction: (action: string) => void,
  ): Nudge {
    let message = '';
    let title = '';

    switch (exposureType) {
      case 'public_post':
        title = 'Public Post Detected';
        message =
          'This post is visible to everyone on the internet. Consider making it friends-only.';
        break;
      case 'location_tagged':
        title = 'Location Shared';
        message = 'You shared your location in this post. This could reveal your home or work.';
        break;
      case 'pii_detected':
        title = 'Personal Information Detected';
        message =
          'This post may contain personal information like email or phone number.';
        break;
      case 'high_emotion':
        title = 'Emotional Post';
        message =
          'This post contains strong emotional language. You may want to review before sharing.';
        break;
      default:
        title = 'Privacy Alert';
        message = 'This post may have privacy concerns.';
    }

    return {
      id: generateId(),
      type: 'exposure',
      title,
      message,
      status: 'shown',
      createdAt: new Date(),
      deliveryStyle: 'heads_up',
      data: {
        postId: post.id,
        exposureType,
      },
      actions: [
        {
          id: 'review',
          label: 'Review Post',
          type: 'primary',
          action: () => onAction('review'),
        },
        {
          id: 'make_private',
          label: 'Make Private',
          type: 'secondary',
          action: () => onAction('make_private'),
        },
        {
          id: 'dismiss',
          label: 'Dismiss',
          type: 'dismiss',
          action: () => onAction('dismiss'),
        },
      ],
    };
  }

  /**
   * Analyze posts and create exposure nudges
   */
  static analyzePostsForNudges(
    posts: SocialPost[],
    onAction: (action: string) => void,
  ): Nudge[] {
    const nudges: Nudge[] = [];

    posts.forEach(post => {
      // Check for public posts
      if (post.visibility === 'public' && post.riskLevel === 'high') {
        nudges.push(this.createExposureNudge('public_post', post, onAction));
      }

      // Check for location tags
      if (post.location) {
        nudges.push(this.createExposureNudge('location_tagged', post, onAction));
      }

      // Check for PII (simplified - would use better detection in production)
      if (post.riskReasons?.includes('pii')) {
        nudges.push(this.createExposureNudge('pii_detected', post, onAction));
      }

      // Check for emotional content
      if (post.riskReasons?.includes('emotion')) {
        nudges.push(this.createExposureNudge('high_emotion', post, onAction));
      }
    });

    return nudges.slice(0, 5); // Limit to top 5 nudges
  }

  /**
   * Calculate personalized nudge priority
   * Higher score = higher priority
   */
  static calculateNudgePriority(
    nudge: Nudge,
    userHistory: {dismissedCount: number; actedCount: number},
  ): number {
    let priority = 5; // Base priority

    // Increase priority for exposure nudges
    if (nudge.type === 'exposure') {
      priority += 3;
    }

    // Decrease priority if user frequently dismisses
    if (userHistory.dismissedCount > userHistory.actedCount * 2) {
      priority -= 2;
    }

    // Increase for permission nudges if many accesses
    if (nudge.type === 'permission_access' && nudge.data?.accessCount > 50) {
      priority += 2;
    }

    return priority;
  }

  /**
   * Determine if user should see a daily summary
   */
  static shouldShowDailySummary(
    lastShownDate: Date | null,
    frequency: 'daily' | 'weekly' | 'biweekly',
  ): boolean {
    if (!lastShownDate) return true;

    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    switch (frequency) {
      case 'daily':
        return diffDays >= 1;
      case 'weekly':
        return diffDays >= 7;
      case 'biweekly':
        return diffDays >= 14;
      default:
        return false;
    }
  }
}
