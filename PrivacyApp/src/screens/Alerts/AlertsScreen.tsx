import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {Card, Button} from '../../components';
import {useAppStore} from '../../store';
import {formatDateTime} from '../../utils/helpers';
import {Nudge} from '../../types';

export const AlertsScreen: React.FC = () => {
  const nudges = useAppStore(state => state.nudges);
  const updateNudge = useAppStore(state => state.updateNudge);
  const dismissNudge = useAppStore(state => state.dismissNudge);

  const handleSnooze = (nudgeId: string) => {
    updateNudge(nudgeId, {status: 'snoozed'});
  };

  const handleDismiss = (nudgeId: string) => {
    dismissNudge(nudgeId);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      shown: '#3B82F6',
      acted: '#10B981',
      dismissed: '#6B7280',
      snoozed: '#F59E0B',
    };

    return (
      <View style={[styles.statusBadge, {backgroundColor: colors[status as keyof typeof colors] || '#6B7280'}]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  const getNudgeIcon = (type: string): string => {
    switch (type) {
      case 'permission_access':
        return '🔐';
      case 'audience':
        return '👥';
      case 'timer':
        return '⏱️';
      case 'exposure':
        return '⚠️';
      default:
        return '📢';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Privacy Alerts</Text>
        <Text style={styles.subtitle}>
          Review nudges and alerts about your privacy
        </Text>
      </View>

      {nudges.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            No alerts yet. You'll see privacy nudges here.
          </Text>
        </Card>
      ) : (
        nudges.map(nudge => (
          <Card key={nudge.id}>
            <View style={styles.nudgeHeader}>
              <View style={styles.nudgeTitle}>
                <Text style={styles.nudgeIcon}>{getNudgeIcon(nudge.type)}</Text>
                <View style={styles.nudgeTitleText}>
                  <Text style={styles.title}>{nudge.title}</Text>
                  <Text style={styles.timestamp}>{formatDateTime(nudge.createdAt)}</Text>
                </View>
              </View>
              {getStatusBadge(nudge.status)}
            </View>

            <Text style={styles.message}>{nudge.message}</Text>

            {nudge.data?.apps && (
              <View style={styles.appsContainer}>
                <Text style={styles.appsLabel}>Example apps:</Text>
                {nudge.data.apps.slice(0, 3).map((app: string, index: number) => (
                  <Text key={index} style={styles.appName}>
                    • {app}
                  </Text>
                ))}
                {nudge.data.apps.length > 3 && (
                  <Text style={styles.moreApps}>and {nudge.data.apps.length - 3} others</Text>
                )}
              </View>
            )}

            {nudge.status === 'shown' && (
              <View style={styles.actions}>
                <Button
                  title="Snooze"
                  onPress={() => handleSnooze(nudge.id)}
                  variant="secondary"
                  size="small"
                  style={styles.actionButton}
                />
                <Button
                  title="Dismiss"
                  onPress={() => handleDismiss(nudge.id)}
                  variant="outline"
                  size="small"
                  style={styles.actionButton}
                />
              </View>
            )}
          </Card>
        ))
      )}

      <Card>
        <Text style={styles.infoTitle}>About Privacy Nudges</Text>
        <Text style={styles.infoText}>
          Privacy nudges help you make informed decisions about your data sharing. They're based on
          peer-reviewed research showing that timely reminders increase awareness and lead to better
          privacy choices.{'\n\n'}
          You can customize nudge frequency and style in Settings.
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  nudgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nudgeTitle: {
    flexDirection: 'row',
    flex: 1,
  },
  nudgeIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  nudgeTitleText: {
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  appsContainer: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  appsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  appName: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 2,
  },
  moreApps: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
});
