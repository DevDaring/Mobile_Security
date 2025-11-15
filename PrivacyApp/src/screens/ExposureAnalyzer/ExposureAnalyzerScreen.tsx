import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import {Card, Button, RiskBadge} from '../../components';
import {useAppStore} from '../../store';
import {ExposureAnalysis} from '../../types';
import {detectPII, detectHighEmotion} from '../../utils/helpers';

export const ExposureAnalyzerScreen: React.FC = () => {
  const [exposures, setExposures] = useState<ExposureAnalysis[]>([]);
  const [scanning, setScanning] = useState(false);
  const socialPosts = useAppStore(state => state.socialPosts);
  const updateSocialPost = useAppStore(state => state.updateSocialPost);

  useEffect(() => {
    runScan();
  }, [socialPosts]);

  const runScan = () => {
    setScanning(true);
    const foundExposures: ExposureAnalysis[] = [];

    socialPosts.forEach(post => {
      // Check for public posts
      if (post.visibility === 'public') {
        foundExposures.push({
          postId: post.id,
          riskType: 'public_post',
          severity: 'medium',
          description: 'This post is publicly visible to everyone',
          suggestion: 'Consider changing visibility to friends-only',
          canAutoFix: true,
        });
      }

      // Check for location tags
      if (post.location) {
        foundExposures.push({
          postId: post.id,
          riskType: 'location_tagged',
          severity: 'high',
          description: `Location shared: ${post.location}`,
          suggestion: 'Remove location tag to protect your privacy',
          canAutoFix: true,
        });
      }

      // Check for PII
      if (detectPII(post.content)) {
        foundExposures.push({
          postId: post.id,
          riskType: 'pii_detected',
          severity: 'high',
          description: 'Post may contain personal information (email/phone)',
          suggestion: 'Remove or obscure personal information',
          canAutoFix: false,
        });
      }

      // Check for high emotion
      if (detectHighEmotion(post.content)) {
        foundExposures.push({
          postId: post.id,
          riskType: 'high_emotion',
          severity: 'medium',
          description: 'Post contains strong emotional language',
          suggestion: 'Review post to avoid potential regret',
          canAutoFix: false,
        });
      }
    });

    setExposures(foundExposures);
    setTimeout(() => setScanning(false), 1000);
  };

  const handleFix = (exposure: ExposureAnalysis) => {
    if (exposure.riskType === 'public_post') {
      updateSocialPost(exposure.postId, {visibility: 'friends'});
      Alert.alert('Fixed', 'Post visibility changed to friends-only');
      runScan();
    } else if (exposure.riskType === 'location_tagged') {
      updateSocialPost(exposure.postId, {location: undefined});
      Alert.alert('Fixed', 'Location tag removed');
      runScan();
    }
  };

  const getRiskIcon = (riskType: string): string => {
    switch (riskType) {
      case 'public_post':
        return '🌍';
      case 'location_tagged':
        return '📍';
      case 'pii_detected':
        return '🔑';
      case 'high_emotion':
        return '😤';
      default:
        return '⚠️';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.title}>Privacy Exposure Analysis</Text>
        <Text style={styles.subtitle}>
          Scanning {socialPosts.length} posts for privacy risks...
        </Text>

        <View style={styles.stats}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{exposures.length}</Text>
            <Text style={styles.statLabel}>Exposures Found</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, styles.highRisk]}>
              {exposures.filter(e => e.severity === 'high').length}
            </Text>
            <Text style={styles.statLabel}>High Risk</Text>
          </View>
        </View>

        <Button
          title="Run Scan Again"
          onPress={runScan}
          loading={scanning}
          variant="primary"
          style={styles.scanButton}
        />
      </Card>

      {exposures.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>
            ✅ No privacy exposures detected! Your posts look good.
          </Text>
        </Card>
      ) : (
        exposures.map((exposure, index) => {
          const post = socialPosts.find(p => p.id === exposure.postId);
          if (!post) return null;

          return (
            <Card key={index}>
              <View style={styles.exposureHeader}>
                <Text style={styles.exposureIcon}>{getRiskIcon(exposure.riskType)}</Text>
                <View style={styles.exposureInfo}>
                  <Text style={styles.exposureType}>
                    {exposure.riskType.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <RiskBadge risk={exposure.severity} size="small" />
                </View>
              </View>

              <Text style={styles.postSnippet} numberOfLines={2}>
                {post.content}
              </Text>

              <View style={styles.exposureDetails}>
                <Text style={styles.description}>⚠️ {exposure.description}</Text>
                <Text style={styles.suggestion}>💡 {exposure.suggestion}</Text>
              </View>

              {exposure.canAutoFix && (
                <Button
                  title="Fix Automatically"
                  onPress={() => handleFix(exposure)}
                  variant="primary"
                  size="small"
                  style={styles.fixButton}
                />
              )}
            </Card>
          );
        })
      )}

      <Card>
        <Text style={styles.infoTitle}>About Privacy Exposure Analysis</Text>
        <Text style={styles.infoText}>
          This tool scans your posts for potential privacy risks including:{'\n\n'}
          🌍 Public posts visible to everyone{'\n'}
          📍 Location tags that reveal your whereabouts{'\n'}
          🔑 Personal information like emails or phone numbers{'\n'}
          😤 Emotional content you might regret later
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  highRisk: {
    color: '#EF4444',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  scanButton: {
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '500',
  },
  exposureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  exposureIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  exposureInfo: {
    flex: 1,
    gap: 4,
  },
  exposureType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  postSnippet: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#D1D5DB',
  },
  exposureDetails: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 6,
  },
  suggestion: {
    fontSize: 13,
    color: '#991B1B',
  },
  fixButton: {
    marginTop: 4,
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
