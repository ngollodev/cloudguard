import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Platform, Alert, Linking } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { fontSize, spacing } from '@/constants/theme';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { Mail, Lock, User, ChevronLeft, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import useAuthStore from '@/stores/useAuthStore';

export default function Register() {
  const { theme } = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [registerError, setRegisterError] = useState<string | null>(null);

  const { register, isLoading, error, clearError } = useAuthStore();

  // Clear any errors when component mounts
  useEffect(() => {
    clearError();
  }, []);

  // Clear register error whenever form fields change
  useEffect(() => {
    if (registerError) setRegisterError(null);
  }, [name, email, password, confirmPassword]);

  // Request camera permissions if needed
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required",
          "Sorry, we need camera roll permissions to make this work!"
        );
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 300, height: 300 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );

        setAvatar(manipulatedImage.base64 || null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        "Image Error",
        "There was a problem selecting your image. Please try again."
      );
    }
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

  const validate = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!name) newErrors.name = 'Name is required';

    if (!email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Please enter a valid email';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(password)) newErrors.password = 'Password must contain at least one uppercase letter';
    else if (!/[a-z]/.test(password)) newErrors.password = 'Password must contain at least one lowercase letter';
    else if (!/[0-9]/.test(password)) newErrors.password = 'Password must contain at least one number';
    else if (!/[^A-Za-z0-9]/.test(password)) newErrors.password = 'Password must contain at least one special character';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (validate()) {
      try {
        // Clear previous errors
        setRegisterError(null);

        await register({
          name,
          email,
          password,
          password_confirmation: confirmPassword,
          avatar: avatar || undefined,
        });
        router.replace('/(tabs)');
      } catch (error: any) {
        console.log('Registration error details:', error.response?.status, error.response?.data);

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
        }
        // Handle validation errors from Laravel (422 status)
        else if (error.response?.status === 422) {
          const backendErrors = error.response.data.errors || error.response.data.formErrors || {};

          if (Object.keys(backendErrors).length > 0) {
            const newErrors: {
              name?: string;
              email?: string;
              password?: string;
              confirmPassword?: string;
            } = {};

            if (backendErrors.name && backendErrors.name.length > 0) {
              newErrors.name = backendErrors.name[0];
            }

            if (backendErrors.email && backendErrors.email.length > 0) {
              newErrors.email = backendErrors.email[0];
            }

            if (backendErrors.password && backendErrors.password.length > 0) {
              newErrors.password = backendErrors.password[0];
            }

            if (backendErrors.password_confirmation && backendErrors.password_confirmation.length > 0) {
              newErrors.confirmPassword = backendErrors.password_confirmation[0];
            }

            setErrors(newErrors);
          } else if (error.response?.data?.message) {
            setRegisterError(error.response.data.message);
          }
        }
        // Handle other server errors
        else if (error.response?.data?.message) {
          setRegisterError(error.response.data.message);
        } else {
          setRegisterError('Registration failed. Please try again later.');
        }
      }
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Join Smart Rain to manage your clothesline
          </Text>
        </View>

        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {avatar ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${avatar}` }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.border }]}>
              <Camera size={32} color={theme.colors.textSecondary} />
            </View>
          )}
          <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
            Add Profile Picture
          </Text>
        </TouchableOpacity>

        {(registerError || (error && !Object.keys(errors).length)) && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {registerError || error}
            </Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={(text: string) => {
              setName(text);
              if (errors.name) setErrors({...errors, name: undefined});
            }}
            error={errors.name}
            leftIcon={<User size={18} color={theme.colors.textSecondary} />}
          />

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
            placeholder="Create a password"
            secureTextEntry
            value={password}
            onChangeText={(text: string) => {
              setPassword(text);
              if (errors.password) setErrors({...errors, password: undefined});
            }}
            error={errors.password}
            leftIcon={<Lock size={18} color={theme.colors.textSecondary} />}
            helperText="Must be at least 8 characters with mixed case, numbers and symbols"
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text: string) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors({...errors, confirmPassword: undefined});
            }}
            error={errors.confirmPassword}
            leftIcon={<Lock size={18} color={theme.colors.textSecondary} />}
          />

          <Button
            title="Create Account"
            fullWidth
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.registerButton}
          />

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: theme.colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.loginLink, { color: theme.colors.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
    </ScrollView>
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.sm,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
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
  formContainer: {
    flex: 1,
  },
  registerButton: {
    marginTop: spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
  },
  loginLink: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-SemiBold',
  },
});
