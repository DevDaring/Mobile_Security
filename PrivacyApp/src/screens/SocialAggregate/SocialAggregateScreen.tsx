import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {Card, Button, RiskBadge} from '../../components';
import {useAppStore} from '../../store';
import {SocialConnectorFactory} from '../../services/socialConnectors';
import {formatDate, getVisibilityIcon, getPlatformIcon} from '../../utils/helpers';
import {PostVisibility} from '../../types';

export const SocialAggregateScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'public' | 'high_risk'>('all');
  const socialAccounts = useAppStore(state => state.socialAccounts);
  const socialPosts = useAppStore(state => state.socialPosts);
  const addSocialPost = useAppStore(state => state.addSocialPost);
  const updateSocialPost = useAppStore(state => state.updateSocialPost);
  const deleteSocialPost = useAppStore(state => state.deleteSocialPost);
  const connectSocialAccount = useAppStore(state => state.connectSocialAccount);

  const handleConnectAccount = async (platform: string) => {
    try {
      setLoading(true);
      const connector = SocialConnectorFactory.getConnector(platform);
      const account = await connector.connect();
      connectSocialAccount(account);

      // Fetch posts
      const posts = await connector.fetchPosts(50);
      posts.forEach(post => addSocialPost(post));

      Alert.alert('Success', `Connected to ${platform} successfully`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeVisibility = (postId: string, newVisibility: PostVisibility) => {
    updateSocialPost(postId, {visibility: newVisibility});
    Alert.alert('Success', 'Post visibility updated');
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this post?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteSocialPost(postId);
          Alert.alert('Success', 'Post deleted');
        },
      },
    ]);
  };

  const filteredPosts = socialPosts.filter(post => {
    if (filter === 'public') return post.visibility === 'public';
    if (filter === 'high_risk') return post.riskLevel === 'high';
    return true;
  });

  const connectedPlatforms = socialAccounts.filter(a => a.connected).map(a => a.platform);
  const notConnectedPlatforms = ['facebook', 'instagram', 'youtube'].filter(
    p => !connectedPlatforms.includes(p as any),
  );

  return (
    <View style={styles.container}>
      {notConnectedPlatforms.length > 0 && (
        <Card style={styles.connectCard}>
          <Text style={styles.connectTitle}>Connect Social Accounts</Text>
          {notConnectedPlatforms.map(platform => (
            <Button
              key={platform}
              title={`Connect ${platform.charAt(0).toUpperCase() + platform.slice(1)}`}
              onPress={() => handleConnectAccount(platform)}
              loading={loading}
              variant="outline"
              style={styles.connectButton}
            />
          ))}
        </Card>
      )}

      <View style={styles.filterContainer}>
        {['all', 'public', 'high_risk'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.activeFilter]}
            onPress={() => setFilter(f as any)}>
            <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
              {f.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.header}>Your Posts ({filteredPosts.length})</Text>

        {filteredPosts.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No posts found. Connect social accounts to see your posts.</Text>
          </Card>
        ) : (
          filteredPosts.map(post => (
            <Card key={post.id}>
              <View style={styles.postHeader}>
                <Text style={styles.platform}>
                  {getPlatformIcon(post.platform)} {post.platform}
                </Text>
                <RiskBadge risk={post.riskLevel} size="small" />
              </View>

              <Text style={styles.date}>{formatDate(post.postedAt)}</Text>
              <Text style={styles.content}>{post.content}</Text>

              <View style={styles.metadata}>
                <Text style={styles.metaItem}>
                  {getVisibilityIcon(post.visibility)} {post.visibility}
                </Text>
                {post.audienceSize && (
                  <Text style={styles.metaItem}>👥 {post.audienceSize} people</Text>
                )}
                {post.location && (
                  <Text style={styles.metaItem}>📍 {post.location}</Text>
                )}
              </View>

              {post.riskReasons && post.riskReasons.length > 0 && (
                <View style={styles.riskReasons}>
                  <Text style={styles.riskTitle}>Privacy Concerns:</Text>
                  {post.riskReasons.map((reason, index) => (
                    <Text key={index} style={styles.riskReason}>
                      • {reason}
                    </Text>
                  ))}
                </View>
              )}

              <View style={styles.actions}>
                <Button
                  title="Make Private"
                  onPress={() => handleChangeVisibility(post.id, 'private')}
                  variant="secondary"
                  size="small"
                  style={styles.actionButton}
                />
                <Button
                  title="Delete"
                  onPress={() => handleDeletePost(post.id)}
                  variant="danger"
                  size="small"
                  style={styles.actionButton}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  connectCard: {
    margin: 16,
    marginBottom: 0,
  },
  connectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  connectButton: {
    marginBottom: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  activeFilter: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platform: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  content: {
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 22,
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    fontSize: 13,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  riskReasons: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  riskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 6,
  },
  riskReason: {
    fontSize: 12,
    color: '#7F1D1D',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});
