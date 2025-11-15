import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Card} from '../../components';
import {useAppStore} from '../../store';
import {NudgeDeliveryStyle, PrivacyRiskLevel} from '../../types';

export const SettingsScreen: React.FC = () => {
  const settings = useAppStore(state => state.settings);
  const updateSettings = useAppStore(state => state.updateSettings);

  const handleToggle = (key: string, value: boolean) => {
    updateSettings({[key]: value});
  };

  const handleValueChange = (key: string, value: any) => {
    updateSettings({[key]: value});
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionHeader}>Nudge Preferences</Text>

      <Card>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Permission Nudges</Text>
            <Text style={styles.settingDescription}>
              Get alerts when apps access sensitive data
            </Text>
          </View>
          <Switch
            value={settings.permissionNudgeEnabled}
            onValueChange={v => handleToggle('permissionNudgeEnabled', v)}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Audience Nudges</Text>
            <Text style={styles.settingDescription}>
              Preview who can see your posts before publishing
            </Text>
          </View>
          <Switch
            value={settings.audienceNudgeEnabled}
            onValueChange={v => handleToggle('audienceNudgeEnabled', v)}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Timer Nudge</Text>
            <Text style={styles.settingDescription}>
              Brief pause before posting to encourage reflection
            </Text>
          </View>
          <Switch
            value={settings.timerNudgeEnabled}
            onValueChange={v => handleToggle('timerNudgeEnabled', v)}
          />
        </View>

        {settings.timerNudgeEnabled && (
          <View style={styles.subSetting}>
            <Text style={styles.subSettingLabel}>Timer Duration</Text>
            <View style={styles.optionButtons}>
              {[5, 10, 15].map(duration => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.optionButton,
                    settings.timerNudgeDuration === duration && styles.activeOption,
                  ]}
                  onPress={() => handleValueChange('timerNudgeDuration', duration)}>
                  <Text
                    style={[
                      styles.optionText,
                      settings.timerNudgeDuration === duration && styles.activeOptionText,
                    ]}>
                    {duration}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Exposure Analysis</Text>
            <Text style={styles.settingDescription}>
              Automatically scan posts for privacy risks
            </Text>
          </View>
          <Switch
            value={settings.exposureAnalysisEnabled}
            onValueChange={v => handleToggle('exposureAnalysisEnabled', v)}
          />
        </View>
      </Card>

      <Text style={styles.sectionHeader}>Nudge Frequency</Text>

      <Card>
        <View style={styles.optionButtons}>
          {(['daily', 'weekly', 'biweekly'] as const).map(freq => (
            <TouchableOpacity
              key={freq}
              style={[styles.optionButton, settings.nudgeFrequency === freq && styles.activeOption]}
              onPress={() => handleValueChange('nudgeFrequency', freq)}>
              <Text
                style={[
                  styles.optionText,
                  settings.nudgeFrequency === freq && styles.activeOptionText,
                ]}>
                {freq.charAt(0).toUpperCase() + freq.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Text style={styles.sectionHeader}>Delivery Style</Text>

      <Card>
        <View style={styles.optionButtons}>
          {(['heads_up', 'full_screen', 'notification'] as NudgeDeliveryStyle[]).map(style => (
            <TouchableOpacity
              key={style}
              style={[
                styles.optionButton,
                settings.nudgeDeliveryStyle === style && styles.activeOption,
              ]}
              onPress={() => handleValueChange('nudgeDeliveryStyle', style)}>
              <Text
                style={[
                  styles.optionText,
                  settings.nudgeDeliveryStyle === style && styles.activeOptionText,
                ]}>
                {style.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Text style={styles.sectionHeader}>Quiet Hours</Text>

      <Card>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Enable Quiet Hours</Text>
            <Text style={styles.settingDescription}>
              Pause nudges during specific hours
            </Text>
          </View>
          <Switch
            value={settings.quietHoursEnabled}
            onValueChange={v => handleToggle('quietHoursEnabled', v)}
          />
        </View>

        {settings.quietHoursEnabled && (
          <View style={styles.subSetting}>
            <Text style={styles.subSettingLabel}>
              Quiet hours: {settings.quietHoursStart} - {settings.quietHoursEnd}
            </Text>
            <Text style={styles.quietHoursNote}>
              No nudges will be shown during these hours
            </Text>
          </View>
        )}
      </Card>

      <Text style={styles.sectionHeader}>Sensitivity</Text>

      <Card>
        <Text style={styles.cardDescription}>
          Control how sensitive the privacy analysis should be
        </Text>
        <View style={styles.optionButtons}>
          {(['low', 'medium', 'high'] as PrivacyRiskLevel[]).map(threshold => (
            <TouchableOpacity
              key={threshold}
              style={[
                styles.optionButton,
                settings.sensitivityThreshold === threshold && styles.activeOption,
              ]}
              onPress={() => handleValueChange('sensitivityThreshold', threshold)}>
              <Text
                style={[
                  styles.optionText,
                  settings.sensitivityThreshold === threshold && styles.activeOptionText,
                ]}>
                {threshold.charAt(0).toUpperCase() + threshold.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.infoTitle}>About Settings</Text>
        <Text style={styles.infoText}>
          These settings are based on research findings that show personalization and user control
          improve the effectiveness of privacy nudges while reducing annoyance.{'\n\n'}
          All settings are stored locally on your device.
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  subSetting: {
    paddingVertical: 12,
    paddingLeft: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginTop: 8,
  },
  subSettingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 8,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  activeOption: {
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
    textTransform: 'capitalize',
  },
  activeOptionText: {
    color: '#FFFFFF',
  },
  quietHoursNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
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
