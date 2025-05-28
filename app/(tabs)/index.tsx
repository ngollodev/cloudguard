import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import StatusBadge from '@/components/shared/StatusBadge';
import { borderRadius, fontSize, spacing } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import useDeviceStore from '@/stores/useDeviceStore';
import useWeatherStore from '@/stores/useWeatherStore';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Battery, Cloud, CloudOff, CloudRain, Gauge, Info, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Dashboard() {
  const { theme, isDark } = useTheme();
  const { device, fetchDeviceStatus, controlDevice, isLoading } = useDeviceStore();
  const { current, hourly, fetchWeather, isLoading: isWeatherLoading } = useWeatherStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDeviceStatus();
    fetchWeather(40.7128, -74.0060); // New York coordinates as example
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDeviceStatus(),
      fetchWeather(40.7128, -74.0060)
    ]);
    setRefreshing(false);
  };

  const handleControlPress = async (action: 'extend' | 'retract') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await controlDevice(action);
  };

  if (!device || !current) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>Welcome to</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>CloudGuard</Text>
          </View>
          <View style={styles.statusContainer}>
            {device.isOnline ? (
              device.isRaining ? (
                <StatusBadge type="rain" animated />
              ) : (
                <StatusBadge type="online" />
              )
            ) : (
              <StatusBadge type="offline" />
            )}
          </View>
        </View>

        <Card style={styles.deviceCard}>
          <View style={styles.deviceHeader}>
            <Text style={[styles.deviceName, { color: theme.colors.text }]}>{device.name}</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
              <RefreshCw size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.deviceInfo}>
            <View style={styles.infoItem}>
              <Battery size={18} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Battery: {device.batteryLevel}%
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Gauge size={18} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Motor: {device.motorHealth === 'good' ? 'Good' : device.motorHealth === 'warning' ? 'Check Soon' : 'Critical'}
              </Text>
            </View>
          </View>

          <View style={styles.lastActionCard}>
            <Info size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.lastActionText, { color: theme.colors.text }]}>
              {device.lastAction.message}
            </Text>
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              {format(new Date(device.lastAction.timestamp), 'h:mm a')}
            </Text>
          </View>

          <View style={styles.controlButtons}>
            <Button
              title="Extend"
              variant={device.isExtended ? 'outline' : 'primary'}
              style={[styles.controlButton, { marginRight: spacing.md }]}
              onPress={() => handleControlPress('extend')}
              disabled={isLoading || device.isExtended || !device.isOnline}
              isLoading={isLoading && !device.isExtended}
            />
            <Button
              title="Retract"
              variant={!device.isExtended ? 'outline' : 'primary'}
              style={styles.controlButton}
              onPress={() => handleControlPress('retract')}
              disabled={isLoading || !device.isExtended || !device.isOnline}
              isLoading={isLoading && device.isExtended}
            />
          </View>
        </Card>

        <Card style={styles.weatherCard}>
          <View style={styles.weatherHeader}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Weather</Text>
            <View style={styles.weatherIconContainer}>
              {current.isRaining ? (
                <CloudRain size={24} color={theme.colors.primary} />
              ) : (
                <Cloud size={24} color={theme.colors.primary} />
              )}
            </View>
          </View>

          <View style={styles.weatherInfo}>
            <View style={styles.currentWeather}>
              <Text style={[styles.temperature, { color: theme.colors.text }]}>
                {current.temperature}°
              </Text>
              <Text style={[styles.condition, { color: theme.colors.textSecondary }]}>
                {current.condition}
              </Text>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Humidity
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {current.humidity}%
                </Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Wind
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {current.windSpeed} km/h
                </Text>
              </View>
              <View style={styles.weatherDetail}>
                <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
                  Rain Chance
                </Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                  {current.chanceOfRain}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.hourlyForecast}>
            <Text style={[styles.hourlyTitle, { color: theme.colors.textSecondary }]}>
              Hourly Forecast
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {hourly.slice(0, 12).map((item, index) => (
                <View key={index} style={styles.hourlyItem}>
                  <Text style={[styles.hourlyTime, { color: theme.colors.textSecondary }]}>
                    {format(new Date(item.time), 'h a')}
                  </Text>
                  {item.condition.toLowerCase().includes('rain') ? (
                    <CloudRain size={20} color={theme.colors.primary} />
                  ) : (
                    <Cloud size={20} color={theme.colors.primary} />
                  )}
                  <Text style={[styles.hourlyTemp, { color: theme.colors.text }]}>
                    {item.temperature}°
                  </Text>
                  <Text style={[styles.hourlyRain, { color: theme.colors.textSecondary }]}>
                    {item.chanceOfRain}%
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </Card>

        <Card style={styles.rainingCard}>
          <View style={styles.rainingCardContent}>
            <View style={styles.rainingTextContainer}>
              <Text style={[styles.rainingTitle, { color: theme.colors.text }]}>
                {current.isRaining ? 'Raining Now!' : device.isOnline ? 'No Rain Detected' : 'Device Offline'}
              </Text>
              <Text style={[styles.rainingSubtext, { color: theme.colors.textSecondary }]}>
                {current.isRaining 
                  ? 'Your clothes are being protected.'
                  : device.isOnline 
                    ? 'Your clothes are safe at the moment.'
                    : 'Cannot determine rain status.'}
              </Text>
            </View>
            <View style={styles.rainingIcon}>
              {current.isRaining ? (
                <CloudRain size={40} color={theme.colors.primary} />
              ) : device.isOnline ? (
                <Cloud size={40} color={theme.colors.secondary} />
              ) : (
                <CloudOff size={40} color={theme.colors.textSecondary} />
              )}
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Medium',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontFamily: 'Inter-Bold',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  deviceCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deviceName: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-SemiBold',
  },
  refreshButton: {
    padding: spacing.xs,
  },
  deviceInfo: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  infoText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    marginLeft: spacing.xs,
  },
  lastActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(62, 100, 255, 0.05)',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  lastActionText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    marginLeft: spacing.xs,
  },
  timeText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    flex: 1,
  },
  weatherCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-SemiBold',
  },
  weatherIconContainer: {},
  weatherInfo: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  currentWeather: {
    flex: 1,
  },
  temperature: {
    fontSize: fontSize.xxxl,
    fontFamily: 'Inter-Bold',
  },
  condition: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
  },
  weatherDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  weatherDetail: {
    marginBottom: spacing.xs,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
  },
  detailValue: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
  },
  hourlyForecast: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: spacing.md,
  },
  hourlyTitle: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    marginBottom: spacing.sm,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: spacing.lg,
    minWidth: 50,
  },
  hourlyTime: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    marginBottom: spacing.xs,
  },
  hourlyTemp: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  hourlyRain: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
  },
  rainingCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  rainingCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rainingTextContainer: {
    flex: 1,
  },
  rainingTitle: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    marginBottom: spacing.xs,
  },
  rainingSubtext: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
  },
  rainingIcon: {
    marginLeft: spacing.md,
  },
});