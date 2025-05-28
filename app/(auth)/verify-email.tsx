import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, spacing } from '@/constants/theme';
import Button from '@/components/shared/Button';
import { authService } from '@/services/api';
import { emailConfig } from '@/constants/email';

export default function VerifyEmail() {
  const { theme } = useTheme();
  const router = useRouter();
  const { token, email } = useLocalSearchParams();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Verify the email once the component `mounts
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setIsVerifying(false);
        setErrorMessage('No verification token provided.');
        return;
      }

      try {
        setIsVerifying(true);
        await authService.verifyEmail(token as string);
        setIsSuccess(true);
      } catch (error: any) {
        console.error('Email verification error:', error);
        setErrorMessage(error.response?.data?.message || emailConfig.messages.verificationInvalid);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, email]);

  const handleContinue = () => {
    router.replace('/login');
  };

  const handleResend = async () => {
    if (!email) {
      setErrorMessage('Email address is missing. Cannot resend verification email.');
      return;
    }

    try {
      setIsVerifying(true);
      await authService.resendVerificationEmail(email as string);
      setErrorMessage('');
      setIsVerifying(false);
      setIsSuccess(true);
      // Display success message for resending
      setErrorMessage('A new verification email has been sent. Please check your inbox.');
    } catch (error: any) {
      setIsVerifying(false);
      setErrorMessage(error.response?.data?.message || 'Failed to resend verification email.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/5702515/pexels-photo-5702515.jpeg' }}
          style={styles.backgroundImage}
        />
        <View style={styles.overlay} />
        <View style={styles.logoContainer}>
          <Text style={[styles.logo, { color: theme.colors.card }]}>Smart Rain</Text>
          <Text style={[styles.tagline, { color: theme.colors.card }]}>
            Keep your clothes dry, always.
          </Text>
        </View>
      </View>

      <View style={[styles.contentContainer, { backgroundColor: theme.colors.card }]}>
        {isVerifying ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Verifying your email...
            </Text>
          </View>
        ) : isSuccess ? (
          <View style={styles.successContainer}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Email Verified!</Text>
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              Your email has been successfully verified. You can now log in to your account.
            </Text>
            <Button
              title="Continue to Login"
              fullWidth
              onPress={handleContinue}
              style={styles.button}
            />
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '20' }]}>
              <Text style={styles.errorIcon}>!</Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Verification Failed</Text>
            <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
              {errorMessage}
            </Text>
            <Button
              title="Try Again"
              fullWidth
              onPress={handleResend}
              style={styles.button}
            />
            <Button
              title="Back to Login"
              fullWidth
              variant="outline"
              onPress={handleContinue}
              style={styles.secondaryButton}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: '30%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  logoContainer: {
    width: '100%',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  logo: {
    fontSize: fontSize.xxxl,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  tagline: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
  },
  successContainer: {
    alignItems: 'center',
    width: '100%',
  },
  errorContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 40,
    fontWeight: 'bold',
  },
  errorIcon: {
    color: '#F44336',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginBottom: spacing.md,
  },
  secondaryButton: {
    marginBottom: spacing.md,
  },
});