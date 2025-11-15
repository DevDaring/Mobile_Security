import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PrivacyRiskLevel} from '../types';
import {getRiskColor, getRiskLabel} from '../utils/helpers';

interface RiskBadgeProps {
  risk: PrivacyRiskLevel;
  size?: 'small' | 'medium';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({risk, size = 'medium'}) => {
  const color = getRiskColor(risk);
  const label = getRiskLabel(risk);

  return (
    <View style={[styles.badge, {backgroundColor: color}, styles[`${size}Badge`]]}>
      <Text style={[styles.text, styles[`${size}Text`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  smallBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  mediumBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
});
