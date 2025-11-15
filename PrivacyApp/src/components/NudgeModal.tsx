import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {Nudge, NudgeDeliveryStyle} from '../types';
import {Button} from './Button';

interface NudgeModalProps {
  visible: boolean;
  nudge: Nudge | null;
  onClose: () => void;
  onAction?: (actionId: string) => void;
}

export const NudgeModal: React.FC<NudgeModalProps> = ({
  visible,
  nudge,
  onClose,
  onAction,
}) => {
  if (!nudge) return null;

  const isHeadsUp = nudge.deliveryStyle === 'heads_up';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={[styles.container, isHeadsUp && styles.headsUpContainer]}>
        <View style={[styles.content, isHeadsUp && styles.headsUpContent]}>
          <ScrollView>
            <View style={styles.header}>
              <Text style={styles.title}>{nudge.title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.message}>{nudge.message}</Text>

            {nudge.data?.apps && (
              <View style={styles.appsContainer}>
                {nudge.data.apps.slice(0, 3).map((app: string, index: number) => (
                  <View key={index} style={styles.appItem}>
                    <Text style={styles.appIcon}>📱</Text>
                    <Text style={styles.appName}>{app}</Text>
                  </View>
                ))}
                {nudge.data.apps.length > 3 && (
                  <Text style={styles.moreText}>
                    and {nudge.data.apps.length - 3} others
                  </Text>
                )}
              </View>
            )}

            <View style={styles.actions}>
              {nudge.actions.map((action, index) => (
                <Button
                  key={action.id}
                  title={action.label}
                  onPress={() => {
                    if (onAction) {
                      onAction(action.id);
                    }
                    action.action();
                  }}
                  variant={
                    action.type === 'primary'
                      ? 'primary'
                      : action.type === 'dismiss'
                      ? 'outline'
                      : 'secondary'
                  }
                  style={styles.actionButton}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headsUpContainer: {
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  headsUpContent: {
    width: '95%',
    maxHeight: '40%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: '#6B7280',
  },
  message: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 24,
  },
  appsContainer: {
    marginBottom: 20,
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
  moreText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
    paddingLeft: 12,
  },
  actions: {
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 8,
  },
});
