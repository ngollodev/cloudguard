import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, spacing } from '@/constants/theme';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { Mail, Lock } from 'lucide-react-native';
import useAuthStore from '@/stores/useAuthStore';

export default function Login() {
  const { theme } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [loginError, setLoginError] = useState<string | null>(null);

  const { login, isLoading, error, clearError } = useAuthStore();

  // Clear any errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Clear login error whenever email or password changes
  useEffect(() => {
    if (loginError) setLoginError(null);
  }, [email, password]);

  const validate = () => {
    const newErrors: {email?: string; password?: string} = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Please enter a valid email';

    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showNetworkErrorAlert = (message: string) => {
    Alert.alert(
      "Connection Error",
      message,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Settings", onPress: () => Linking.openSettings() }
      ]
    );
  };

  const handleLogin = async () => {
    if (validate()) {
      try {
        // Clear any previous errors
        setLoginError(null);
        setErrors({});
        await login({ email, password });
        router.replace('/(tabs)');
      } catch (error: any) {
        console.log('Login error details:', error.response?.status, error.response?.data);

        // Show error modal for network issues
        if (!error.response) {
          const errorMsg = error.message || 'Unable to connect to the server. Please check your internet connection and try again.';

          // Handle different network errors
          if (errorMsg.includes('API server could not be reached')) {
            showNetworkErrorAlert('The API server could not be reached. Please check your network connection and ensure the server is running.');
          } else if (errorMsg.includes('timed out')) {
            showNetworkErrorAlert('The connection timed out. The server might be overloaded or your network connection is unstable.');
          } else {
            showNetworkErrorAlert(errorMsg);
          }
          return;
        }

        // Handle 401 Unauthorized - Check for specific validation messages
        if (error.response?.status === 401) {
          // Extract field-specific errors from the response
          const responseData = error.response?.data || {};
          const validationErrors = responseData.errors || {};
          const newErrors: {email?: string; password?: string} = {};

          // Handle email-specific errors
          if (validationErrors.email && validationErrors.email.length > 0) {
            newErrors.email = validationErrors.email[0];
          }

          // Handle password-specific errors
          if (validationErrors.password && validationErrors.password.length > 0) {
            newErrors.password = validationErrors.password[0];
          }

          // Set field errors if we have any
          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
          }
          // Show the main error message if available
          else if (responseData.message) {
            setLoginError(responseData.message);
          }
          // Fallback error message
          else {
            setLoginError('Invalid email or password. Please try again.');
          }
        }
        // Handle validation errors from Laravel (usually 422)
        else if (error.response?.status === 422) {
          const backendErrors = error.response.data.errors || error.response.data.formErrors || {};
          const newErrors: {email?: string; password?: string} = {};

          if (backendErrors.email && backendErrors.email.length > 0) {
            newErrors.email = backendErrors.email[0];
          }

          if (backendErrors.password && backendErrors.password.length > 0) {
            newErrors.password = backendErrors.password[0];
          }

          if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
          } else if (error.response?.data?.message) {
            setLoginError(error.response.data.message);
          }
        }
        // Handle other errors
        else if (error.response?.data?.message) {
          setLoginError(error.response.data.message);
        } else {
          setLoginError('An unexpected error occurred. Please try again.');
        }
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
          <Text style={[styles.logo, { color: theme.colors.card }]}>CloudGuard</Text>
          <Text style={[styles.tagline, { color: theme.colors.card }]}>
            Keep your clothes dry, always.
          </Text>
        </View>
      </View>

      <View style={[styles.formContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Sign in to your account
        </Text>

        {(loginError || (error && !Object.keys(errors).length)) && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {loginError || error}
            </Text>
          </View>
        )}

        <Input
          label="Email"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text: string) => {
            setEmail(text);
            if (errors.email) setErrors({...errors, email: undefined});
          }}
          error={errors.email}
          leftIcon={<Mail size={18} color={theme.colors.textSecondary} />}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={(text: string) => {
            setPassword(text);
            if (errors.password) setErrors({...errors, password: undefined});
          }}
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
