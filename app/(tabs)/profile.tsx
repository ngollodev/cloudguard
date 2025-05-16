import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { borderRadius, fontSize, spacing } from '@/constants/theme';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { User, Mail, Lock } from 'lucide-react-native';
import useAuthStore from '@/stores/useAuthStore';
import { useToast } from '@/context/ToastContext';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, updateProfile, changePassword } = useAuthStore();
  const { showToast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [profileErrors, setProfileErrors] = useState<{
    name?: string;
    email?: string;
  }>({});
  
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateProfile = () => {
    const errors: { name?: string; email?: string } = {};
    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    
    if (!currentPassword) errors.currentPassword = 'Current password is required';
    if (!newPassword) errors.newPassword = 'New password is required';
    if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (validateProfile()) {
      try {
        await updateProfile({ name, email });
        showToast('Profile updated successfully');
      } catch (error: any) {
        showToast(error.message || 'Failed to update profile', 'error');
      }
    }
  };

  const handleChangePassword = async () => {
    if (validatePassword()) {
      try {
        await changePassword({
          current_password: currentPassword,
          password: newPassword,
          password_confirmation: confirmPassword,
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Password changed successfully');
      } catch (error: any) {
        showToast(error.message || 'Failed to change password', 'error');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>
        </View>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Personal Information
          </Text>
          
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            error={profileErrors.name}
            leftIcon={<User size={18} color={theme.colors.textSecondary} />}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={profileErrors.email}
            leftIcon={<Mail size={18} color={theme.colors.textSecondary} />}
          />

          <Button
            title="Update Profile"
            onPress={handleUpdateProfile}
            style={styles.button}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Change Password
          </Text>
          
          <Input
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            error={passwordErrors.currentPassword}
            leftIcon={<Lock size={18} color={theme.colors.textSecondary} />}
          />

          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            error={passwordErrors.newPassword}
            leftIcon={<Lock size={18} color={theme.colors.textSecondary} />}
          />

          <Input
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={passwordErrors.confirmPassword}
            leftIcon={<Lock size={18} color={theme.colors.textSecondary} />}
          />

          <Button
            title="Change Password"
            onPress={handleChangePassword}
            style={styles.button}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: 'Inter-Bold',
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
});