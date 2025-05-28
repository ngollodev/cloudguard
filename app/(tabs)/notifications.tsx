import { format } from 'date-fns';
import { Bell, BellOff, Check, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/shared/Card';
import { fontSize, spacing } from '../../constants/theme';
import { useTheme as useThemeContext } from '../../context/ThemeContext';
import useNotificationStore from '../../stores/useNotificationStore';

export default function NotificationsScreen() {
  const { theme } = useThemeContext();
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, clearAllNotifications, isLoading } = useNotificationStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'rain_detected':
        return <Bell color={theme.colors.primary} size={20} />;
      case 'clothes_retracted':
        return <Bell color={theme.colors.secondary} size={20} />;
      case 'clothes_extended':
        return <Bell color={theme.colors.secondary} size={20} />;
      case 'schedule_executed':
        return <Bell color={theme.colors.secondary} size={20} />;
      case 'device_offline':
        return <BellOff color={theme.colors.warning} size={20} />;
      case 'system_error':
        return <BellOff color={theme.colors.error} size={20} />;
      case 'weather_alert':
        return <Bell color={theme.colors.warning} size={20} />;
      default:
        return <Bell color={theme.colors.primary} size={20} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return theme.colors.secondary;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAllNotifications();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header,
        {
          marginTop: -55,
        }
      ]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, { marginRight: spacing.sm }]}
            onPress={handleMarkAllAsRead}
          >
            <Check size={16} color={theme.colors.primary} />
            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
              Mark all read
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleClearAll}
          >
            <Trash2 size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.headerButtonText, { color: theme.colors.textSecondary }]}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BellOff size={60} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No notifications
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              You're all caught up!
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity 
              key={notification.id}
              onPress={() => markAsRead(notification.id)}
              activeOpacity={0.7}
            >
              <Card
                style={{
                  ...styles.notificationCard,
                  ...(!notification.isRead && {
                    borderLeftWidth: 4,
                    borderLeftColor: theme.colors.primary
                  })
                }}
              >
                <View style={styles.notificationHeader}>
                  {getNotificationIcon(notification.type)}
                  <View style={styles.notificationInfo}>
                    <Text style={[
                      styles.notificationTitle, 
                      { color: theme.colors.text },
                      !notification.isRead && { fontFamily: 'Inter-SemiBold' },
                    ]}>
                      {notification.title}
                    </Text>
                    <Text style={[styles.notificationTime, { color: theme.colors.textSecondary }]}>
                      {format(new Date(notification.timestamp), 'MMM d, h:mm a')}
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.notificationMessage, 
                  { color: theme.colors.text },
                  notification.isRead && { opacity: 0.8 },
                ]}>
                  {notification.message}
                </Text>
              </Card>
            </TouchableOpacity>
          ))
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
    marginBottom: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  headerButtonText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl * 2,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Medium',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  notificationCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  notificationInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  notificationTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Medium',
  },
  notificationTime: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    marginTop: spacing.xs,
  },
  notificationMessage: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    lineHeight: fontSize.sm * 1.5,
  },
});