/**
 * Permissions Service
 * Handles permission checking and monitoring
 */

import {Platform} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';
import {AppPermissionAccess, PermissionType} from '../types';
import {generateId} from '../utils/helpers';

// Map permission types to actual platform permissions
const PERMISSION_MAP: Record<PermissionType, {ios: Permission; android: Permission}> = {
  location: {
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
  },
  camera: {
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  },
  microphone: {
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
  },
  contacts: {
    ios: PERMISSIONS.IOS.CONTACTS,
    android: PERMISSIONS.ANDROID.READ_CONTACTS,
  },
  storage: {
    ios: PERMISSIONS.IOS.MEDIA_LIBRARY,
    android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
  },
  notifications: {
    ios: PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY,
    android: PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
  },
};

export class PermissionsService {
  /**
   * Check if a permission is granted
   */
  static async checkPermission(type: PermissionType): Promise<boolean> {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSION_MAP[type].ios
          : PERMISSION_MAP[type].android;

      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error(`Error checking ${type} permission:`, error);
      return false;
    }
  }

  /**
   * Request a permission from the user
   */
  static async requestPermission(type: PermissionType): Promise<boolean> {
    try {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSION_MAP[type].ios
          : PERMISSION_MAP[type].android;

      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      return false;
    }
  }

  /**
   * Request multiple permissions at once
   */
  static async requestMultiplePermissions(
    types: PermissionType[],
  ): Promise<Record<PermissionType, boolean>> {
    const results: Record<PermissionType, boolean> = {} as any;

    for (const type of types) {
      results[type] = await this.requestPermission(type);
    }

    return results;
  }

  /**
   * Generate mock permission access data for demonstration
   * In a real app, this would come from OS-level monitoring (limited on modern Android/iOS)
   */
  static generateMockPermissionData(): AppPermissionAccess[] {
    const apps = [
      'Instagram',
      'Facebook',
      'Google Maps',
      'WhatsApp',
      'Snapchat',
      'TikTok',
      'Twitter',
      'Spotify',
    ];

    const permissions: PermissionType[] = [
      'location',
      'contacts',
      'camera',
      'microphone',
      'storage',
    ];

    const mockData: AppPermissionAccess[] = [];

    apps.forEach(app => {
      const numPermissions = Math.floor(Math.random() * 3) + 1;
      const selectedPermissions = permissions
        .sort(() => 0.5 - Math.random())
        .slice(0, numPermissions);

      selectedPermissions.forEach(permission => {
        const accessCount = Math.floor(Math.random() * 50) + 1;
        const history: Date[] = [];

        for (let i = 0; i < Math.min(accessCount, 10); i++) {
          const daysAgo = Math.floor(Math.random() * 7);
          const date = new Date();
          date.setDate(date.getDate() - daysAgo);
          history.push(date);
        }

        mockData.push({
          appName: app,
          permissionType: permission,
          lastAccessed: history[0],
          accessCount,
          accessHistory: history.sort((a, b) => b.getTime() - a.getTime()),
          markedSafe: false,
        });
      });
    });

    return mockData.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
  }

  /**
   * Analyze permission accesses and determine top offenders
   */
  static getTopAccessingApps(
    accesses: AppPermissionAccess[],
    limit: number = 3,
  ): string[] {
    const appAccessCounts: Record<string, number> = {};

    accesses.forEach(access => {
      if (!access.markedSafe) {
        appAccessCounts[access.appName] =
          (appAccessCounts[access.appName] || 0) + access.accessCount;
      }
    });

    return Object.entries(appAccessCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([appName]) => appName);
  }

  /**
   * Get sensitive permission accesses (location, contacts, camera, microphone)
   */
  static getSensitiveAccesses(accesses: AppPermissionAccess[]): AppPermissionAccess[] {
    const sensitiveTypes: PermissionType[] = ['location', 'contacts', 'camera', 'microphone'];
    return accesses.filter(access => sensitiveTypes.includes(access.permissionType));
  }

  /**
   * Count total accesses in the last N days
   */
  static countRecentAccesses(accesses: AppPermissionAccess[], days: number = 7): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return accesses.reduce((total, access) => {
      const recentAccesses = access.accessHistory.filter(date => date >= cutoffDate);
      return total + recentAccesses.length;
    }, 0);
  }
}
