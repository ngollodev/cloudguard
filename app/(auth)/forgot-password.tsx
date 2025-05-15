import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, spacing } from '@/constants/theme';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { Mail } from 'lucide-react-native';
import { ChevronLeft } from 'lucide-react-native';
import useAuthStore from '@/stores/useAuthStore';

export default function ForgotPassword() {
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { resetPassword, isLoading } = useAuthStore();

  const validate = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    setError(null);
    return true;
  };

  const handleResetPassword = async () => {
    if (validate()) {
      try {
        await resetPassword({ email });
        setSuccess(true);
      } catch (error: any) {
        setError(error.message || 'Failed to send reset email');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text }]}>Forgot Password</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Enter your email to receive a password reset link
        </Text>
      </View>

      {success ? (
        <View style={styles.successContainer}>
          <Text style={[styles.successTitle, { color: theme.colors.text }]}>
            Email Sent
          </Text>
          <Text style={[styles.successText, { color: theme.colors.textSecondary }]}>
            Check your email for instructions to reset your password.
          </Text>
          <Button
            title="Back to Login"
            onPress={() => router.replace('/login')}
            style={styles.backToLoginButton}
          />
        </View>
      ) : (
        <View style={styles.formContainer}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            </View>
          )}

          <Input
            label="Email"
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={error || undefined}
            leftIcon={<Mail size={18} color={theme.colors.textSecondary} />}
          />

          <Button
            title="Send Reset Link"
            fullWidth
            onPress={handleResetPassword}
            isLoading={isLoading}
            style={styles.resetButton}
          />

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: 'Inter-Bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
  },
  formContainer: {
    flex: 1,
  },
  errorContainer: {
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(240, 87, 87, 0.1)',
  },
  errorText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
  },
  resetButton: {
    marginTop: spacing.lg,
  },
  cancelButton: {
    marginTop: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
  },
  cancelText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  successTitle: {
    fontSize: fontSize.xxl,
    fontFamily: 'Inter-Bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backToLoginButton: {
    width: '100%',
  },
});