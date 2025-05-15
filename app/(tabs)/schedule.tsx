import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { borderRadius, fontSize, spacing } from '@/constants/theme';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Plus, Calendar, Clock, ArrowUpDown, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import useScheduleStore from '@/stores/useScheduleStore';
import { Schedule } from '@/types/schedule';
import { format } from 'date-fns';

export default function ScheduleScreen() {
  const { theme } = useTheme();
  const { schedules, fetchSchedules, toggleSchedule, deleteSchedule, isLoading } = useScheduleStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSchedule, setNewSchedule] = useState<{
    name: string;
    time: string;
    type: string;
    action: string;
  }>({
    name: '',
    time: '08:00',
    type: 'daily',
    action: 'extend',
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSchedules();
    setRefreshing(false);
  };

  const handleToggle = async (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await toggleSchedule(id);
  };

  const handleDelete = async (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await deleteSchedule(id);
  };

  const getScheduleTypeText = (type: string) => {
    switch (type) {
      case 'daily':
        return 'Every day';
      case 'weekdays':
        return 'Weekdays only';
      case 'weekends':
        return 'Weekends only';
      case 'one-time':
        return 'One time only';
      case 'custom':
        return 'Custom days';
      default:
        return type;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Schedules</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowAddSchedule(true)}
        >
          <Plus size={20} color={theme.colors.card} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {schedules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={60} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No schedules yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              Tap the + button to create your first schedule
            </Text>
          </View>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id} style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <View style={styles.scheduleInfo}>
                  <Text style={[styles.scheduleName, { color: theme.colors.text }]}>
                    {schedule.name}
                  </Text>
                  <View style={styles.scheduleDetails}>
                    <View style={styles.scheduleDetail}>
                      <Calendar size={14} color={theme.colors.textSecondary} />
                      <Text style={[styles.scheduleDetailText, { color: theme.colors.textSecondary }]}>
                        {getScheduleTypeText(schedule.type)}
                      </Text>
                    </View>
                    <View style={styles.scheduleDetail}>
                      <Clock size={14} color={theme.colors.textSecondary} />
                      <Text style={[styles.scheduleDetailText, { color: theme.colors.textSecondary }]}>
                        {schedule.time}
                      </Text>
                    </View>
                    <View style={styles.scheduleDetail}>
                      <ArrowUpDown size={14} color={theme.colors.textSecondary} />
                      <Text style={[styles.scheduleDetailText, { color: theme.colors.textSecondary }]}>
                        {schedule.action === 'extend' ? 'Extend' : 'Retract'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Switch
                  value={schedule.isEnabled}
                  onValueChange={() => handleToggle(schedule.id)}
                  trackColor={{ false: '#e0e0e0', true: theme.colors.primary + '80' }}
                  thumbColor={schedule.isEnabled ? theme.colors.primary : '#f4f3f4'}
                />
              </View>
              <View style={styles.scheduleActions}>
                <TouchableOpacity style={styles.editButton}>
                  <Edit size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(schedule.id)}
                >
                  <Trash2 size={16} color={theme.colors.error} />
                  <Text style={[styles.actionText, { color: theme.colors.error }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* This would be a modal in a real app */}
      {showAddSchedule && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <Card style={styles.modalContent}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add New Schedule</Text>
            <Text style={[styles.modalHint, { color: theme.colors.textSecondary }]}>
              This would be a form in a real app
            </Text>
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="outline"
                style={{ marginRight: spacing.md }}
                onPress={() => setShowAddSchedule(false)}
              />
              <Button
                title="Add Schedule"
                onPress={() => setShowAddSchedule(false)}
              />
            </View>
          </Card>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  scheduleCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scheduleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  scheduleName: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-SemiBold',
    marginBottom: spacing.xs,
  },
  scheduleDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  scheduleDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  scheduleDetailText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    marginLeft: spacing.xs,
  },
  scheduleActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: spacing.md,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
    padding: spacing.xs,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    marginLeft: spacing.xs,
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
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontFamily: 'Inter-SemiBold',
    marginBottom: spacing.lg,
  },
  modalHint: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    marginBottom: spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});