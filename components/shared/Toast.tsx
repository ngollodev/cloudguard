import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { borderRadius, fontSize, spacing } from '@/constants/theme';
import { CircleCheck as CheckCircle2, Circle as XCircle, CircleAlert as AlertCircle, X } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 3000,
}) => {
  const { theme } = useTheme();
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} color={theme.colors.success} />;
      case 'error':
        return <XCircle size={20} color={theme.colors.error} />;
      case 'info':
        return <AlertCircle size={20} color={theme.colors.primary} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success + '10';
      case 'error':
        return theme.colors.error + '10';
      case 'info':
        return theme.colors.primary + '10';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'info':
        return theme.colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
      ]}
    >
      {getIcon()}
      <Text style={[styles.message, { color: theme.colors.text }]}>
        {message}
      </Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <X size={16} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? spacing.xl : spacing.xxl * 2,
    left: spacing.xl,
    right: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    alignSelf: 'center',
    zIndex: 1000,
  },
  message: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});

export default Toast;