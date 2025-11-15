import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Image} from 'react-native';
import {Button} from '../../components';
import {useAppStore} from '../../store';
import {PermissionsService} from '../../services/permissionsService';

interface OnboardingScreenProps {
  navigation: any;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({navigation}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const setHasCompletedOnboarding = useAppStore(state => state.setHasCompletedOnboarding);

  const steps = [
    {
      title: 'Welcome to Privacy Guard',
      description:
        'Take control of your digital privacy. Manage app permissions, monitor social media posts, and get intelligent nudges to prevent regrettable disclosures.',
      emoji: '🛡️',
    },
    {
      title: 'Your Privacy, Your Data',
      description:
        'All data is processed locally on your device. We never send your information to external servers without your explicit consent.',
      emoji: '🔒',
    },
    {
      title: 'Smart Privacy Nudges',
      description:
        'Get personalized alerts when apps access sensitive data or when you\'re about to post something publicly. Based on peer-reviewed research.',
      emoji: '💡',
    },
    {
      title: 'App Permissions',
      description:
        'We\'ll need permission to monitor app usage and access your device features. You can customize these later in Settings.',
      emoji: '🔐',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      // Request basic permissions
      await PermissionsService.requestMultiplePermissions([
        'location',
        'camera',
        'microphone',
      ]);

      // Generate mock permission data for demonstration
      const mockData = PermissionsService.generateMockPermissionData();
      const addPermissionAccess = useAppStore.getState().addPermissionAccess;

      mockData.forEach(access => {
        addPermissionAccess(access);
      });

      // Mark onboarding as complete
      setHasCompletedOnboarding(true);

      // Navigate to main app
      navigation.replace('Main');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const step = steps[currentStep];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.stepIndicator}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentStep === index && styles.activeDot]}
            />
          ))}
        </View>

        <View style={styles.stepContent}>
          <Text style={styles.emoji}>{step.emoji}</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </View>

        {currentStep === steps.length - 1 && (
          <View style={styles.permissionsInfo}>
            <Text style={styles.permissionsTitle}>Permissions We Need:</Text>
            <Text style={styles.permissionItem}>📍 Location - Monitor location access</Text>
            <Text style={styles.permissionItem}>📷 Camera - Monitor camera usage</Text>
            <Text style={styles.permissionItem}>🎤 Microphone - Monitor mic access</Text>
            <Text style={styles.note}>
              You can grant or deny each permission individually
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 && (
          <Button
            title="Back"
            onPress={() => setCurrentStep(currentStep - 1)}
            variant="outline"
            style={styles.backButton}
          />
        )}
        <Button
          title={currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          loading={loading}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#3B82F6',
    width: 30,
  },
  stepContent: {
    alignItems: 'center',
    marginTop: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  permissionsInfo: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  permissionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  permissionItem: {
    fontSize: 15,
    color: '#4B5563',
    marginVertical: 6,
  },
  note: {
    fontSize: 13,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  backButton: {
    flex: 1,
    marginRight: 12,
  },
  nextButton: {
    flex: 2,
  },
});
