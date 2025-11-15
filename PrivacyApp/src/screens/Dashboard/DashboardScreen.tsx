import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl} from 'react-native';
import {Card, Button, RiskBadge} from '../../components';
import {useAppStore} from '../../store';
import {PermissionsService} from '../../services/permissionsService';
import {NudgeEngine} from '../../services/nudgeEngine';
import {getRiskColor, getVisibilityIcon, getPlatformIcon} from '../../utils/helpers';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({navigation}) => {
  const [refreshing, setRefreshing] = useState(false);
  const permissionAccesses = useAppStore(state => state.permissionAccesses);
  const socialPosts = useAppStore(state => state.socialPosts);
  const privacySummary = useAppStore(state => state.privacySummary);
  const updatePrivacySummary = useAppStore(state => state.updatePrivacySummary);
  const settings = useAppStore(state => state.settings);
  const addNudge = useAppStore(state => state.addNudge);

  useEffect(() => {
    calculatePrivacySummary();
  }, [permissionAccesses, socialPosts]);

  const calculatePrivacySummary = () => {
    const topApps = PermissionsService.getTopAccessingApps(permissionAccesses, 3);
    const publicPosts = socialPosts.filter(post => post.visibility === 'public').length;
    const sensitiveAccesses = PermissionsService.getSensitiveAccesses(permissionAccesses);

    const permissionRisk =
      sensitiveAccesses.length > 20 ? 'high' : sensitiveAccesses.length > 10 ? 'medium' : 'low';

    updatePrivacySummary({
      permissionRisk,
      recentExposures: socialPosts.filter(p => p.riskLevel === 'high').length,
      topAccessingApps: topApps,
      publicPosts,
      lastScanDate: new Date(),
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    calculatePrivacySummary();
    setRefreshing(false);
  };

  const handleRunScan = () => {
    navigation.navigate('ExposureAnalyzer');
  };

  const handleShowPermissions = () => {
    navigation.navigate('PermissionsManager');
  };

  const handleCompose = () => {
    navigation.navigate('Composer');
  };

  const recentPosts = socialPosts.slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Dashboard</Text>
        <Text style={styles.headerSubtitle}>Your privacy at a glance</Text>
      </View>

      {/* Privacy Score Card */}
      <Card>
        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.cardTitle}>Privacy Score</Text>
            <RiskBadge risk={privacySummary.permissionRisk} />
          </View>
          <Text style={styles.scoreDescription}>
            Based on your app permissions and social media activity
          </Text>
        </View>
      </Card>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <TouchableOpacity
          style={styles.summaryCard}
          onPress={() => navigation.navigate('ExposureAnalyzer')}>
          <Text style={styles.summaryValue}>{privacySummary.recentExposures}</Text>
          <Text style={styles.summaryLabel}>Recent Exposures</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.summaryCard}
          onPress={() => navigation.navigate('SocialAggregate')}>
          <Text style={styles.summaryValue}>{privacySummary.publicPosts}</Text>
          <Text style={styles.summaryLabel}>Public Posts</Text>
        </TouchableOpacity>
      </View>

      {/* Top Accessing Apps */}
      <Card>
        <Text style={styles.cardTitle}>Top Apps Accessing Your Data</Text>
        {privacySummary.topAccessingApps.length > 0 ? (
          <View style={styles.appsList}>
            {privacySummary.topAccessingApps.map((app, index) => (
              <View key={index} style={styles.appItem}>
                <Text style={styles.appIcon}>📱</Text>
                <Text style={styles.appName}>{app}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No data available</Text>
        )}
        <Button
          title="View All Permissions"
          onPress={handleShowPermissions}
          variant="outline"
          size="small"
          style={styles.cardButton}
        />
      </Card>

      {/* Recent Posts Preview */}
      {recentPosts.length > 0 && (
        <Card>
          <Text style={styles.cardTitle}>Recent Social Media Posts</Text>
          {recentPosts.map(post => (
            <View key={post.id} style={styles.postPreview}>
              <View style={styles.postHeader}>
                <Text style={styles.postPlatform}>
                  {getPlatformIcon(post.platform)} {post.platform}
                </Text>
                <Text style={styles.postVisibility}>{getVisibilityIcon(post.visibility)}</Text>
              </View>
              <Text style={styles.postContent} numberOfLines={2}>
                {post.content}
              </Text>
              {post.riskLevel !== 'low' && (
                <RiskBadge risk={post.riskLevel} size="small" />
              )}
            </View>
          ))}
          <Button
            title="View All Posts"
            onPress={() => navigation.navigate('SocialAggregate')}
            variant="outline"
            size="small"
            style={styles.cardButton}
          />
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actions}>
          <Button
            title="Run Privacy Scan"
            onPress={handleRunScan}
            variant="primary"
            style={styles.actionButton}
          />
          <Button
            title="Compose Post"
            onPress={handleCompose}
            variant="secondary"
            style={styles.actionButton}
          />
          <Button
            title="View Alerts"
            onPress={() => navigation.navigate('Alerts')}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  scoreCard: {
    marginBottom: 8,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  appsList: {
    marginBottom: 12,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },
  appIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  appName: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  cardButton: {
    marginTop: 8,
  },
  postPreview: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  postPlatform: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  postVisibility: {
    fontSize: 16,
  },
  postContent: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 8,
  },
  actions: {
    gap: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
});
