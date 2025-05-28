import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import Input from '@/components/shared/Input';
import { fontSize, spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import useAuthStore from '@/stores/useAuthStore';
import { validateEmail, validatePassword } from '@/utils/validators';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { MediaType } from 'expo-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import useProfileStore from '@/stores/useProfileStore';
import { profileService } from '@/services/profile';
import { AlertCircle, Camera, CheckCircle, Lock, Mail, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Keyboard, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { 
    user, 
    isLoading, 
    error, 
    clearError,
    fetchProfile,
    updateProfile,
    updatePassword,
    updateAvatar 
  } = useProfileStore();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Initialize form with user data
    const loadProfile = async () => {
      await fetchProfile();
    };
    loadProfile();

    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidShow.remove();
      keyboardDidHide.remove();
    };
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      clearError();
    }
  }, [error]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateProfileForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone: ''
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^[\d\s\+\-\(\)]{10,20}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every(val => !val);
  };

  const validatePasswordForm = () => {
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = 'Password must be 8+ chars with uppercase, lowercase, number & symbol';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.values(newErrors).every(val => !val);
  };

  const handleUpdateProfile = async () => {
    Keyboard.dismiss();
    if (!validateProfileForm()) return;

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      }, showToast);
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleChangePassword = async () => {
    Keyboard.dismiss();
    if (!validatePasswordForm()) return;

    try {
      await updatePassword({
        current_password: formData.currentPassword,
        password: formData.newPassword,
        password_confirmation: formData.confirmPassword
      }, showToast);
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleAvatarUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        showToast('Permission to access photos is required', 'error');
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: MediaType.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (pickerResult.canceled) return;

      // Prepare the file for upload
      const file = {
        uri: pickerResult.assets[0].uri,
        type: pickerResult.assets[0].type,
        name: pickerResult.assets[0].fileName || 'avatar.jpg'
      };

      try {
        const updatedProfile = await profileService.updateAvatar(file);
        // Update the user profile in the store
        useProfileStore.getState().updateProfile({ name: updatedProfile.user.name, email: updatedProfile.user.email }, showToast);
        showToast('Avatar updated successfully', 'success');
      } catch (error) {
        showToast('Failed to update avatar', 'error');
      }


    } catch (error) {
      showToast('Failed to update avatar', 'error');
      console.error('Avatar upload error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      showToast('Logging out...', 'info');
      await logout();
      showToast('Successfully logged out', 'success');
      router.replace('/(auth)/login');
    } catch (err) {
      showToast('Failed to logout. Please try again.', 'error');
      console.error('Logout error:', err);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleAvatarUpload}>
              <Image 
                source={
                  user?.avatar 
                    ? { uri: user.avatar, cache: 'reload' } 
                    : require('@/assets/images/default-avatar.png')
                }
                style={[styles.avatar, { borderColor: theme.colors.border }]}
                resizeMode="cover"
              />
              <View style={[styles.cameraIcon, { backgroundColor: theme.colors.primary }]}>
                <Camera size={16} color={theme.colors.background} />
              </View>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {user?.name || 'Profile Settings'}
          </Text>
          
          {user?.email_verified_at ? (
            <View style={styles.verifiedBadge}>
              <CheckCircle size={16} color={theme.colors.success} />
              <Text style={[styles.verifiedText, { color: theme.colors.success }]}>
                Email Verified
              </Text>
            </View>
          ) : (
            <View style={styles.unverifiedBadge}>
              <AlertCircle size={16} color={theme.colors.warning} />
              <Text style={[styles.verifiedText, { color: theme.colors.warning }]}>
                Email Not Verified
              </Text>
            </View>
          )}
        </View>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Personal Information
          </Text>
          
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            error={errors.name}
            leftIcon={<User size={18} color={theme.colors.textSecondary} />}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            error={errors.email}
            leftIcon={<Mail size={18} color={theme.colors.textSecondary} />}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChangeText={(text) => handleChange('phone', text)}
            error={errors.phone}
            keyboardType="phone-pad"
            returnKeyType="done"
          />

          <Button
            title={isLoading ? 'Updating...' : 'Update Profile'}
            onPress={handleUpdateProfile}
            style={styles.button}
            disabled={isLoading}
            isLoading={isLoading}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Change Password
          </Text>
          
          <Input
            label="Current Password"
            placeholder="Enter current password"
            value={formData.currentPassword}
            onChangeText={(text) => handleChange('currentPassword', text)}
            error={errors.currentPassword}
            leftIcon={<Lock size={18} color={theme.colors.textSecondary} />}
            secureTextEntry
            returnKeyType="next"
          />

          <Input
            label="New Password"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChangeText={(text) => handleChange('newPassword', text)}
            error={errors.newPassword}
            leftIcon={<Lock size={18} color={theme.colors.textSecondary} />}
            secureTextEntry
            returnKeyType="next"
          />

          <Input
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
            error={errors.confirmPassword}
            leftIcon={<Lock size={18} color={theme.colors.textSecondary} />}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleChangePassword}
          />

          <Button
            title={isLoading ? 'Updating...' : 'Change Password'}
            onPress={handleChangePassword}
            style={styles.button}
            disabled={isLoading}
            isLoading={isLoading}
          />
        </Card>

        {!isKeyboardVisible && (
          <Button
            title="Logout"
            onPress={handleLogout}
            style={styles.logoutButton}
            variant="outline"
            textColor={theme.colors.error}
            borderColor={theme.colors.error}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: 'Inter-Bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  verifiedText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    marginLeft: spacing.xs,
  },
  section: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
  logoutButton: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
  },
});