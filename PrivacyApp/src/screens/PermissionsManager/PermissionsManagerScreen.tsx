import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking} from 'react-native';
import {Card, Button} from '../../components';
import {useAppStore} from '../../store';
import {getPermissionIcon, formatRelativeTime} from '../../utils/helpers';
import {PermissionType} from '../../types';

export const PermissionsManagerScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<PermissionType | 'all'>('all');
  const permissionAccesses = useAppStore(state => state.permissionAccesses);
  const markAppAsSafe = useAppStore(state => state.markAppAsSafe);

  const filters: Array<PermissionType | 'all'> = [
    'all',
    'location',
    'contacts',
    'camera',
    'microphone',
    'storage',
  ];

  const filteredAccesses =
    selectedFilter === 'all'
      ? permissionAccesses
      : permissionAccesses.filter(access => access.permissionType === selectedFilter);

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  const handleMarkSafe = (appName: string) => {
    markAppAsSafe(appName);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, selectedFilter === filter && styles.activeFilterChip]}
            onPress={() => setSelectedFilter(filter)}>
            <Text style={[styles.filterText, selectedFilter === filter && styles.activeFilterText]}>
              {filter === 'all' ? '📊 All' : `${getPermissionIcon(filter)} ${filter}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content}>
        <Text style={styles.header}>App Permissions</Text>
        <Text style={styles.subheader}>
          Monitor which apps access your sensitive data and how often
        </Text>

        {filteredAccesses.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No permission accesses recorded</Text>
          </Card>
        ) : (
          filteredAccesses.map((access, index) => (
            <Card key={index}>
              <View style={styles.accessCard}>
                <View style={styles.accessHeader}>
                  <View style={styles.accessInfo}>
                    <Text style={styles.appName}>{access.appName}</Text>
                    <Text style={styles.permissionType}>
                      {getPermissionIcon(access.permissionType)} {access.permissionType}
                    </Text>
                  </View>
                  {access.markedSafe && (
                    <View style={styles.safeBadge}>
                      <Text style={styles.safeText}>✓ Safe</Text>
                    </View>
                  )}
                </View>

                <View style={styles.accessStats}>
                  <Text style={styles.statText}>
                    Last accessed: {formatRelativeTime(access.lastAccessed)}
                  </Text>
                  <Text style={styles.statText}>
                    Total accesses (7 days): {access.accessCount}
                  </Text>
                </View>

                <View style={styles.actions}>
                  {!access.markedSafe && (
                    <Button
                      title="Mark as Safe"
                      onPress={() => handleMarkSafe(access.appName)}
                      variant="outline"
                      size="small"
                      style={styles.actionButton}
                    />
                  )}
                  <Button
                    title="Open Settings"
                    onPress={handleOpenSettings}
                    variant="secondary"
                    size="small"
                    style={styles.actionButton}
                  />
                </View>
              </View>
            </Card>
          ))
        )}

        <Card>
          <Text style={styles.infoTitle}>Understanding Permissions</Text>
          <Text style={styles.infoText}>
            📍 Location: Apps can track where you go{'\n'}
            📇 Contacts: Apps can read your contact list{'\n'}
            📷 Camera: Apps can take photos and videos{'\n'}
            🎤 Microphone: Apps can record audio{'\n'}
            💾 Storage: Apps can read/write files
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
  activeFilterChip: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subheader: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  accessCard: {},
  accessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  accessInfo: {},
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  permissionType: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  safeBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  safeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  accessStats: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  statText: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
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
