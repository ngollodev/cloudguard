import { useAuth } from '@/./context/AuthContext';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Navigate to login screen if not authenticated
      router.replace('/(auth)/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={[styles.AuthText, { color: theme.colors.primary }]}>
          Checking Authentication...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  AuthText: {
    padding: spacing.xl
  },
});