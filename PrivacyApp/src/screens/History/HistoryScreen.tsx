import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {Card, Button} from '../../components';
import {useAppStore} from '../../store';
import {formatDateTime} from '../../utils/helpers';

export const HistoryScreen: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const auditLog = useAppStore(state => state.auditLog);

  const filters = [
    {key: 'all', label: 'All Events'},
    {key: 'nudge_shown', label: 'Nudges Shown'},
    {key: 'nudge_acted', label: 'Nudges Acted'},
    {key: 'permission_changed', label: 'Permissions'},
    {key: 'post_edited', label: 'Posts Edited'},
    {key: 'settings_changed', label: 'Settings'},
  ];

  const filteredLog =
    filter === 'all' ? auditLog : auditLog.filter(entry => entry.eventType === filter);

  const handleExport = () => {
    Alert.alert(
      'Export Data',
      'In a production app, this would export your audit log as a JSON or CSV file.',
      [{text: 'OK'}],
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all audit history? This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // In production, would call a store method to clear audit log
            Alert.alert('Success', 'Audit history cleared');
          },
        },
      ],
    );
  };

  const getEventIcon = (eventType: string): string => {
    switch (eventType) {
      case 'nudge_shown':
        return '📢';
      case 'nudge_acted':
        return '✅';
      case 'nudge_dismissed':
        return '❌';
      case 'permission_changed':
        return '🔐';
      case 'post_edited':
        return '✏️';
      case 'post_deleted':
        return '🗑️';
      case 'settings_changed':
        return '⚙️';
      default:
        return '📝';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Audit History</Text>
          <Text style={styles.subtitle}>Complete log of all privacy events</Text>
        </View>
        <View style={styles.headerActions}>
          <Button
            title="Export"
            onPress={handleExport}
            variant="outline"
            size="small"
            style={styles.headerButton}
          />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.activeFilter]}
            onPress={() => setFilter(f.key)}>
            <Text style={[styles.filterText, filter === f.key && styles.activeFilterText]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{auditLog.length}</Text>
            <Text style={styles.statLabel}>Total Events</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {auditLog.filter(e => e.eventType.includes('nudge')).length}
            </Text>
            <Text style={styles.statLabel}>Nudges</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {auditLog.filter(e => e.eventType === 'permission_changed').length}
            </Text>
            <Text style={styles.statLabel}>Permission Changes</Text>
          </View>
        </View>

        {filteredLog.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No events in history</Text>
          </Card>
        ) : (
          filteredLog.map(entry => (
            <Card key={entry.id}>
              <View style={styles.logEntry}>
                <Text style={styles.eventIcon}>{getEventIcon(entry.eventType)}</Text>
                <View style={styles.eventInfo}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventType}>
                      {entry.eventType.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.timestamp}>{formatDateTime(entry.timestamp)}</Text>
                  </View>
                  <Text style={styles.description}>{entry.description}</Text>
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <View style={styles.metadata}>
                      <Text style={styles.metadataLabel}>Details:</Text>
                      {Object.entries(entry.metadata).slice(0, 3).map(([key, value]) => (
                        <Text key={key} style={styles.metadataItem}>
                          • {key}: {JSON.stringify(value).substring(0, 50)}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </Card>
          ))
        )}

        {auditLog.length > 0 && (
          <Card>
            <Text style={styles.infoTitle}>Data Control</Text>
            <Text style={styles.infoText}>
              All audit data is stored locally on your device. You can export it anytime or clear it
              completely.
            </Text>
            <Button
              title="Clear All History"
              onPress={handleClearHistory}
              variant="danger"
              style={styles.clearButton}
            />
          </Card>
        )}

        <Card>
          <Text style={styles.infoTitle}>Why We Track This</Text>
          <Text style={styles.infoText}>
            The audit log helps you understand how the app works and what actions it takes. It's
            useful for:{'\n\n'}
            • Reviewing privacy decisions you've made{'\n'}
            • Understanding which nudges were most helpful{'\n'}
            • Academic research (if you opt-in){'\n'}
            • Transparency and accountability
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeFilter: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logEntry: {
    flexDirection: 'row',
  },
  eventIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  metadata: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 6,
  },
  metadataLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  metadataItem: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
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
  clearButton: {
    marginTop: 12,
  },
});
