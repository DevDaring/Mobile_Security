import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Card, Button} from '../../components';
import {useAppStore} from '../../store';
import {NudgeEngine} from '../../services/nudgeEngine';
import {PostVisibility, SocialPlatform} from '../../types';

export const ComposerScreen: React.FC<any> = ({navigation}) => {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [visibility, setVisibility] = useState<PostVisibility>('friends');
  const [showAudienceNudge, setShowAudienceNudge] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isPosting, setIsPosting] = useState(false);

  const socialAccounts = useAppStore(state => state.socialAccounts);
  const settings = useAppStore(state => state.settings);
  const addSocialPost = useAppStore(state => state.addSocialPost);
  const addNudge = useAppStore(state => state.addNudge);

  const connectedAccounts = socialAccounts.filter(a => a.connected);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && isPosting) {
      performPost();
    }
  }, [countdown, isPosting]);

  const handlePlatformToggle = (platform: SocialPlatform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handlePostClick = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    if (selectedPlatforms.length === 0) {
      Alert.alert('Error', 'Please select at least one platform');
      return;
    }

    // Show audience nudge if enabled
    if (settings.audienceNudgeEnabled) {
      const audienceSize = visibility === 'public' ? 2500 : 150;
      const nudge = NudgeEngine.createAudienceNudge(audienceSize, visibility, action => {
        if (action === 'continue') {
          startTimerNudge();
        }
      });
      addNudge(nudge);
      setShowAudienceNudge(true);
    } else {
      startTimerNudge();
    }
  };

  const startTimerNudge = () => {
    setShowAudienceNudge(false);
    if (settings.timerNudgeEnabled) {
      setCountdown(settings.timerNudgeDuration);
      setIsPosting(true);
    } else {
      performPost();
    }
  };

  const performPost = () => {
    selectedPlatforms.forEach(platform => {
      const post = {
        id: `${Date.now()}_${Math.random()}`,
        platform,
        content,
        postedAt: new Date(),
        visibility,
        audienceSize: visibility === 'public' ? 2500 : 150,
        riskLevel: visibility === 'public' ? 'medium' : 'low',
      } as any;

      addSocialPost(post);
    });

    Alert.alert('Success', 'Post published successfully!');
    setContent('');
    setSelectedPlatforms([]);
    setIsPosting(false);
    navigation.goBack();
  };

  const handleCancelPosting = () => {
    setCountdown(0);
    setIsPosting(false);
    setShowAudienceNudge(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Text style={styles.title}>Compose Post</Text>

        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={6}
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Select Platforms</Text>
        <View style={styles.platformsContainer}>
          {connectedAccounts.length === 0 ? (
            <Text style={styles.noPlatforms}>
              No connected accounts. Go to Social Feed to connect.
            </Text>
          ) : (
            connectedAccounts.map(account => (
              <TouchableOpacity
                key={account.platform}
                style={[
                  styles.platformChip,
                  selectedPlatforms.includes(account.platform) && styles.selectedPlatform,
                ]}
                onPress={() => handlePlatformToggle(account.platform)}>
                <Text
                  style={[
                    styles.platformText,
                    selectedPlatforms.includes(account.platform) && styles.selectedPlatformText,
                  ]}>
                  {account.platform}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <Text style={styles.label}>Visibility</Text>
        <View style={styles.visibilityContainer}>
          {(['public', 'friends', 'private'] as PostVisibility[]).map(vis => (
            <TouchableOpacity
              key={vis}
              style={[styles.visibilityChip, visibility === vis && styles.selectedVisibility]}
              onPress={() => setVisibility(vis)}>
              <Text
                style={[
                  styles.visibilityText,
                  visibility === vis && styles.selectedVisibilityText,
                ]}>
                {vis}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {showAudienceNudge && (
          <View style={styles.nudgeBox}>
            <Text style={styles.nudgeTitle}>👥 Audience Preview</Text>
            <Text style={styles.nudgeText}>
              This post will be visible to approximately{' '}
              {visibility === 'public' ? '2,500' : '150'} people.
            </Text>
            <View style={styles.nudgeActions}>
              <Button
                title="Continue"
                onPress={startTimerNudge}
                variant="primary"
                size="small"
                style={styles.nudgeButton}
              />
              <Button
                title="Edit"
                onPress={() => setShowAudienceNudge(false)}
                variant="outline"
                size="small"
                style={styles.nudgeButton}
              />
            </View>
          </View>
        )}

        {isPosting && countdown > 0 && (
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>
              ⏱️ Posting in {countdown} seconds...
            </Text>
            <Text style={styles.timerSubtext}>Take a moment to review your post</Text>
            <View style={styles.timerActions}>
              <Button
                title="Post Now"
                onPress={performPost}
                variant="primary"
                size="small"
                style={styles.timerButton}
              />
              <Button
                title="Cancel"
                onPress={handleCancelPosting}
                variant="danger"
                size="small"
                style={styles.timerButton}
              />
            </View>
          </View>
        )}

        {!showAudienceNudge && !isPosting && (
          <Button
            title="Publish Post"
            onPress={handlePostClick}
            disabled={!content.trim() || selectedPlatforms.length === 0}
            style={styles.postButton}
          />
        )}
      </Card>

      <Card>
        <Text style={styles.infoTitle}>Privacy Tips</Text>
        <Text style={styles.infoText}>
          • Public posts can be seen by anyone on the internet{'\n'}
          • Avoid sharing personal information like addresses or phone numbers{'\n'}
          • Consider your audience before posting emotional content{'\n'}
          • Location tags can reveal your home or work address
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
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  noPlatforms: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  platformChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlatform: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  platformText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  selectedPlatformText: {
    color: '#1E40AF',
  },
  visibilityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  visibilityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  selectedVisibility: {
    backgroundColor: '#3B82F6',
  },
  visibilityText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  selectedVisibilityText: {
    color: '#FFFFFF',
  },
  nudgeBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  nudgeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  nudgeText: {
    fontSize: 14,
    color: '#78350F',
    marginBottom: 12,
  },
  nudgeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  nudgeButton: {
    flex: 1,
  },
  timerBox: {
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  timerSubtext: {
    fontSize: 13,
    color: '#1E3A8A',
    marginBottom: 12,
  },
  timerActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  timerButton: {
    flex: 1,
  },
  postButton: {
    marginTop: 8,
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
