/**
 * Utility helper functions
 */

import {PrivacyRiskLevel} from '../types';
import {format, formatDistance} from 'date-fns';

export const formatDate = (date: Date): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatDateTime = (date: Date): string => {
  return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

export const formatRelativeTime = (date: Date): string => {
  return formatDistance(new Date(date), new Date(), {addSuffix: true});
};

export const getRiskColor = (risk: PrivacyRiskLevel): string => {
  switch (risk) {
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

export const getRiskLabel = (risk: PrivacyRiskLevel): string => {
  switch (risk) {
    case 'high':
      return 'High Risk';
    case 'medium':
      return 'Medium Risk';
    case 'low':
      return 'Low Risk';
    default:
      return 'Unknown';
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const isInQuietHours = (
  quietHoursStart: string,
  quietHoursEnd: string,
): boolean => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = quietHoursStart.split(':').map(Number);
  const [endHour, endMin] = quietHoursEnd.split(':').map(Number);

  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  if (startTime < endTime) {
    return currentTime >= startTime && currentTime < endTime;
  } else {
    // Quiet hours span midnight
    return currentTime >= startTime || currentTime < endTime;
  }
};

export const calculatePrivacyRisk = (
  publicPosts: number,
  sensitiveAccesses: number,
): PrivacyRiskLevel => {
  const riskScore = publicPosts * 2 + sensitiveAccesses;

  if (riskScore >= 10) return 'high';
  if (riskScore >= 5) return 'medium';
  return 'low';
};

export const detectPII = (text: string): boolean => {
  // Simple PII detection - email and phone patterns
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;

  return emailRegex.test(text) || phoneRegex.test(text);
};

export const detectHighEmotion = (text: string): boolean => {
  // Simple emotion detection based on common angry/distressed words
  const emotionalWords = [
    'hate',
    'angry',
    'furious',
    'terrible',
    'awful',
    'worst',
    'horrible',
    'disgusting',
  ];

  const lowerText = text.toLowerCase();
  return emotionalWords.some(word => lowerText.includes(word));
};

export const getVisibilityIcon = (visibility: string): string => {
  switch (visibility) {
    case 'public':
      return '🌍';
    case 'friends':
      return '👥';
    case 'custom':
      return '🔧';
    case 'private':
      return '🔒';
    default:
      return '❓';
  }
};

export const getPlatformIcon = (platform: string): string => {
  switch (platform) {
    case 'facebook':
      return '📘';
    case 'instagram':
      return '📷';
    case 'youtube':
      return '▶️';
    default:
      return '📱';
  }
};

export const getPermissionIcon = (permission: string): string => {
  switch (permission) {
    case 'location':
      return '📍';
    case 'contacts':
      return '📇';
    case 'camera':
      return '📷';
    case 'microphone':
      return '🎤';
    case 'storage':
      return '💾';
    case 'notifications':
      return '🔔';
    default:
      return '🔐';
  }
};
