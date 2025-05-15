import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, fontSize, spacing } from '../../constants/theme';
import colors from '../../constants/colors';

type StatusType = 'online' | 'offline' | 'rain' | 'normal' | 'warning' | 'error';

interface StatusBadgeProps {
  type: StatusType;
  text?: string;
  animated?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  text,
  animated = false,
}) => {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (type) {
      case 'online':
        return colors.success[500];
      case 'offline':
        return colors.neutral[500];
      case 'rain':
        return colors.primary[500];
      case 'normal':
        return colors.success[500];
      case 'warning':
        return colors.warning[500];
      case 'error':
        return colors.error[500];
      default:
        return colors.neutral[500];
    }
  };

  const getStatusText = () => {
    if (text) return text;

    switch (type) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'rain':
        return 'Raining';
      case 'normal':
        return 'Normal';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getStatusColor() + '20', // Add transparency
          borderColor: getStatusColor(),
        },
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: getStatusColor(),
          },
          animated && styles.animated,
        ]}
      />
      <Text
        style={[
          styles.text,
          {
            color: getStatusColor(),
          },
        ]}
      >
        {getStatusText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  animated: {
    opacity: 0.8,
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});

export default StatusBadge;