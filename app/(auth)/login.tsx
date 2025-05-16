import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import Theme, { fontSize, spacing } from '@/constants/theme';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { Mail, Lock } from 'lucide-react-native';
import useAuthStore from '@/stores/useAuthStore';
import colors from '@/constants/colors';

export default function Login() {
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login, isLoading, error } = useAuthStore();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validate()) {
      try {
        await login({ email, password });
        router.replace('/(tabs)');
      } catch (error) {
        // Error is handled by the store
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/back@login.webp')}
          style={styles.backgroundImage}
        />
        <View style={styles.overlay} />
        <View style={styles.logoContainer}>
          <Text style={[styles.logo, { color: theme.colors.primary }]}>CloudGuard.</Text>
          <Text style={[styles.tagline, { color: theme.colors.primary }]}>
            Keep your clothes dry, always.
          </Text>
        </View>
      </View>

      <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Sign in to your account
        </Text>

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
          error={errors.email}
          leftIcon={<Mail size={18} color={theme.colors.textSecondary} />}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          leftIcon={<Lock size={18} color={theme.colors.textSecondary} />}
        />

        <TouchableOpacity>
          <Link href="/forgot-password" asChild>
            <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>
              Forgot Password?
            </Text>
          </Link>
        </TouchableOpacity>

        <Button
          title="Sign In"
          fullWidth
          onPress={handleLogin}
          isLoading={isLoading}
          style={styles.loginButton}
        />

        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, { color: theme.colors.textSecondary }]}>
            Don't have an account?{' '}
          </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={[styles.registerLink, { color: theme.colors.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: '35%',
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
    marginBottom: spacing.sm
  },
  formContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: 'Inter-Bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    marginBottom: spacing.xl,
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
  forgotPassword: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    textAlign: 'right',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  registerText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
  },
  registerLink: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
  },
});