import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { borderRadius, fontSize, spacing } from '@/constants/theme';
import Card from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import Modal from '@/components/shared/Modal';
import { Plus, Calendar, Clock, ArrowUpDown, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import useScheduleStore from '@/stores/useScheduleStore';
import { Schedule, ScheduleType } from '@/types/schedule';
import { format } from 'date-fns';
import { useToast } from '@/context/ToastContext';

export default function ScheduleScreen() {
  const { theme } = useTheme();
  const { schedules, fetchSchedules, toggleSchedule, deleteSchedule, createSchedule, updateSchedule, isLoading } = useScheduleStore();
  const { showToast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showEditSchedule, setShowEditSchedule] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    time: '08:00',
    type: 'daily' as ScheduleType,
    action: 'extend' as 'extend' | 'retract',
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    time?: string;
  }>({});

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
    try {
      await toggleSchedule(id);
      showToast('Schedule status updated');
    } catch (error: any) {
      showToast(error.message || 'Failed to update schedule', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedSchedule) return;
    
    try {
      await deleteSchedule(selectedSchedule.id);
      setShowDeleteConfirm(false);
      setSelectedSchedule(null);
      showToast('Schedule deleted successfully');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete schedule', 'error');
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setScheduleForm({
      name: schedule.name,
      time: schedule.time,
      type: schedule.type,
      action: schedule.action,
    });
    setShowEditSchedule(true);
  };

  const validateForm = () => {
    const errors: { name?: string; time?: string } = {};
    if (!scheduleForm.name) errors.name = 'Name is required';
    if (!scheduleForm.time) errors.time = 'Time is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (showEditSchedule && selectedSchedule) {
        await updateSchedule(selectedSchedule.id, scheduleForm);
        showToast('Schedule updated successfully');
      } else {
        await createSchedule(scheduleForm);
        showToast('Schedule created successfully');
      }
      
      setShowAddSchedule(false);
      setShowEditSchedule(false);
      setSelectedSchedule(null);
      setScheduleForm({
        name: '',
        time: '08:00',
        type: 'daily',
        action: 'extend',
      });
    } catch (error: any) {
      showToast(error.message || 'Failed to save schedule', 'error');
    }
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

  const renderScheduleForm = () => (
    <>
      <Input
        label="Schedule Name"
        placeholder="Enter schedule name"
        value={scheduleForm.name}
        onChangeText={(text) => setScheduleForm(prev => ({ ...prev, name: text }))}
        error={formErrors.name}
      />

      <Input
        label="Time"
        placeholder="HH:MM"
        value={scheduleForm.time}
        onChangeText={(text) => setScheduleForm(prev => ({ ...prev, time: text }))}
        error={formErrors.time}
      />

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Type</Text>
        <View style={styles.typeButtons}>
          {(['daily', 'weekdays', 'weekends'] as ScheduleType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                {
                  backgroundColor:
                    scheduleForm.type === type
                      ? theme.colors.primary
                      : 'transparent',
                  borderColor: theme.colors.primary,
                },
              ]}
              onPress={() => setScheduleForm(prev => ({ ...prev, type }))}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  {
                    color:
                      scheduleForm.type === type
                        ? theme.colors.card
                        : theme.colors.primary,
                  },
                ]}
              >
                {getScheduleTypeText(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Action</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  scheduleForm.action === 'extend'
                    ? theme.colors.primary
                    : 'transparent',
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => setScheduleForm(prev => ({ ...prev, action: 'extend' }))}
          >
            <Text
              style={[
                styles.actionButtonText,
                {
                  color:
                    scheduleForm.action === 'extend'
                      ? theme.colors.card
                      : theme.colors.primary,
                },
              ]}
            >
              Extend
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  scheduleForm.action === 'retract'
                    ? theme.colors.primary
                    : 'transparent',
                borderColor: theme.colors.primary,
              },
            ]}
            onPress={() => setScheduleForm(prev => ({ ...prev, action: 'retract' }))}
          >
            <Text
              style={[
                styles.actionButtonText,
                {
                  color:
                    scheduleForm.action === 'retract'
                      ? theme.colors.card
                      : theme.colors.primary,
                },
              ]}
            >
              Retract
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.modalButtons}>
        <Button
          title="Cancel"
          variant="outline"
          style={{ marginRight: spacing.md }}
          onPress={() => {
            setShowAddSchedule(false);
            setShowEditSchedule(false);
            setSelectedSchedule(null);
            setScheduleForm({
              name: '',
              time: '08:00',
              type: 'daily',
              action: 'extend',
            });
          }}
        />
        <Button
          title={showEditSchedule ? 'Update Schedule' : 'Add Schedule'}
          onPress={handleSubmit}
          isLoading={isLoading}
        />
      </View>
    </>
  );

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
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEdit(schedule)}
                >
                  <Edit size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.actionText, { color: theme.colors.textSecondary }]}>
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => {
                    setSelectedSchedule(schedule);
                    setShowDeleteConfirm(true);
                  }}
                >
                  <Trash2 size={16} color={theme.colors.error} />
                  <Text style={[styles.actionText, { color: theme.colors.error }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal
        isVisible={showAddSchedule || showEditSchedule}
        onClose={() => {
          setShowAddSchedule(false);
          setShowEditSchedule(false);
          setSelectedSchedule(null);
          setScheduleForm({
            name: '',
            time: '08:00',
            type: 'daily',
            action: 'extend',
          });
        }}
        title={showEditSchedule ? 'Edit Schedule' : 'Add New Schedule'}
      >
        {renderScheduleForm()}
      </Modal>

      <Modal
        isVisible={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedSchedule(null);
        }}
        title="Delete Schedule"
      >
        <Text style={[styles.deleteText, { color: theme.colors.text }]}>
          Are you sure you want to delete this schedule?
        </Text>
        <Text style={[styles.deleteSubtext, { color: theme.colors.textSecondary }]}>
          This action cannot be undone.
        </Text>
        <View style={styles.modalButtons}>
          <Button
            title="Cancel"
            variant="outline"
            style={{ marginRight: spacing.md }}
            onPress={() => {
              setShowDeleteConfirm(false);
              setSelectedSchedule(null);
            }}
          />
          <Button
            title="Delete"
            variant="danger"
            onPress={handleDelete}
            isLoading={isLoading}
          />
        </View>
      </Modal>
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
  formGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    marginBottom: spacing.xs,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  typeButton: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  typeButtonText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.xl,
  },
  deleteText: {
    fontSize: fontSize.lg,
    fontFamily: 'Inter-Medium',
    marginBottom: spacing.xs,
  },
  deleteSubtext: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
    marginBottom: spacing.xl,
  },
});