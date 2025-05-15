import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { borderRadius, fontSize, spacing } from '@/constants/theme';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { User, Moon, Sun, Bell, TriangleAlert as AlertTriangle, LogOut, Wrench, Info, FileSliders as Sliders } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import useAuthStore from '@/stores/useAuthStore';
import useDeviceStore from '@/stores/useDeviceStore';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { device, settings, updateDeviceSettings, renameDevice, factoryReset, testMotor } = useDeviceStore();
  
  const [deviceName, setDeviceName] = useState(device?.name || '');
  const [showFactoryResetConfirm, setShowFactoryResetConfirm] = useState(false);

  const handleLogout = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await logout();
    router.replace('/(auth)/login');
  };

  const handleToggleTheme = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTheme();
  };

  const handleUpdateSettings = async (key: string, value: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await updateDeviceSettings({ [key]: value });
  };

  const handleSaveDeviceName = async () => {
    if (deviceName && deviceName !== device?.name) {
      await renameDevice(deviceName);
    }
  };

  const handleFactoryReset = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    await factoryReset();
    setShowFactoryResetConfirm(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
        </View>

        <Card style={styles.settingsGroup}>
          <Text style={[styles.groupTitle, { color: theme.colors.text }]}>Profile</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <User size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Account
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
              {useAuthStore.getState().user?.email}
            </Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.settingsGroup}>
          <Text style={[styles.groupTitle, { color: theme.colors.text }]}>Appearance</Text>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleToggleTheme}
          >
            <View style={styles.settingInfo}>
              {isDark ? (
                <Moon size={20} color={theme.colors.textSecondary} />
              ) : (
                <Sun size={20} color={theme.colors.textSecondary} />
              )}
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleToggleTheme}
              trackColor={{ false: '#e0e0e0', true: theme.colors.primary + '80' }}
              thumbColor={isDark ? theme.colors.primary : '#f4f3f4'}
            />
          </TouchableOpacity>
        </Card>

        <Card style={styles.settingsGroup}>
          <Text style={[styles.groupTitle, { color: theme.colors.text }]}>Device Settings</Text>
          
          <View style={styles.inputSetting}>
            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
              Device Name
            </Text>
            <View style={styles.deviceNameRow}>
              <Input
                value={deviceName}
                onChangeText={setDeviceName}
                containerStyle={styles.deviceNameInput}
              />
              <Button
                title="Save"
                size="sm"
                onPress={handleSaveDeviceName}
                disabled={!deviceName || deviceName === device?.name}
              />
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleUpdateSettings('autoRetract', !settings?.autoRetract)}
          >
            <View style={styles.settingInfo}>
              <CloudRain size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Auto-Retract on Rain
              </Text>
            </View>
            <Switch
              value={settings?.autoRetract || false}
              onValueChange={(value) => handleUpdateSettings('autoRetract', value)}
              trackColor={{ false: '#e0e0e0', true: theme.colors.primary + '80' }}
              thumbColor={settings?.autoRetract ? theme.colors.primary : '#f4f3f4'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleUpdateSettings('notificationsEnabled', !settings?.notificationsEnabled)}
          >
            <View style={styles.settingInfo}>
              <Bell size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Push Notifications
              </Text>
            </View>
            <Switch
              value={settings?.notificationsEnabled || false}
              onValueChange={(value) => handleUpdateSettings('notificationsEnabled', value)}
              trackColor={{ false: '#e0e0e0', true: theme.colors.primary + '80' }}
              thumbColor={settings?.notificationsEnabled ? theme.colors.primary : '#f4f3f4'}
            />
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => testMotor()}
          >
            <View style={styles.settingInfo}>
              <Wrench size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                Test Motor
              </Text>
            </View>
            <Text style={[styles.settingAction, { color: theme.colors.primary }]}>
              Run
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowFactoryResetConfirm(true)}
          >
            <View style={styles.settingInfo}>
              <AlertTriangle size={20} color={theme.colors.error} />
              <Text style={[styles.settingText, { color: theme.colors.error }]}>
                Factory Reset Device
              </Text>
            </View>
            <Text style={[styles.settingAction, { color: theme.colors.error }]}>
              Reset
            </Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.settingsGroup}>
          <Text style={[styles.groupTitle, { color: theme.colors.text }]}>About</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Info size={20} color={theme.colors.textSecondary} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                App Version
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
              1.0.0
            </Text>
          </TouchableOpacity>
        </Card>

        <Button
          title="Sign Out"
          variant="outline"
          onPress={handleLogout}
          style={styles.signOutButton}
          leftIcon={<LogOut size={18} color={theme.colors.primary} />}
        />

        {/* This would be a modal in a real app */}
        {showFactoryResetConfirm && (
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <Card style={styles.modalContent}>
              <AlertTriangle size={30} color={theme.colors.error} style={styles.modalIcon} />
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Factory Reset</Text>
              <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>
                This will reset your device to factory defaults. All your settings and schedules will be lost.
              </Text>
              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  variant="outline"
                  style={{ marginRight: spacing.md }}
                  onPress={() => setShowFactoryResetConfirm(false)}
                />
                <Button
                  title="Reset"
                  variant="danger"
                  onPress={handleFactoryReset}
                />
              </View>
            </Card>
          </View>
        )}
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
  settingsGroup: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  groupTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
    marginLeft: spacing.md,
  },
  settingValue: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
  },
  settingAction: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: spacing.xs,
  },
  inputSetting: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    marginBottom: spacing.xs,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceNameInput: {
    flex: 1,
    marginRight: spacing.sm,
    marginBottom: 0,
  },
  signOutButton: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: spacing.lg,
    alignItems: 'center',
  },
  modalIcon: {
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-Bold',
    marginBottom: spacing.sm,
  },
  modalText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
});

function CloudRain(props: any) {
  return <Bell {...props} />;
}