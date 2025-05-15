import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { borderRadius, fontSize, spacing } from '@/constants/theme';
import Card from '@/components/shared/Card';
import { ClipboardList, ArrowUp, ArrowDown, CloudRain, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import useHistoryStore from '@/stores/useHistoryStore';
import { format } from 'date-fns';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { logs, fetchLogs, isLoading } = useHistoryStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const getLogIcon = (type: string, title: string) => {
    if (title.toLowerCase().includes('extend')) {
      return <ArrowDown color={theme.colors.secondary} size={20} />;
    } else if (title.toLowerCase().includes('retract')) {
      return <ArrowUp color={theme.colors.primary} size={20} />;
    } else if (title.toLowerCase().includes('rain')) {
      return <CloudRain color={theme.colors.primary} size={20} />;
    } else if (type === 'error') {
      return <AlertTriangle color={theme.colors.error} size={20} />;
    } else {
      return <ClipboardList color={theme.colors.textSecondary} size={20} />;
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'action':
        return theme.colors.secondary;
      case 'weather':
        return theme.colors.primary;
      case 'error':
        return theme.colors.error;
      case 'system':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  const groupLogsByDate = () => {
    const grouped: { [key: string]: typeof logs } = {};
    
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');
      const dateLabel = format(date, 'MMMM d, yyyy');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          logs: [],
          label: dateLabel,
        };
      }
      
      grouped[dateKey].logs.push(log);
    });
    
    return Object.entries(grouped).map(([key, value]) => ({
      date: key,
      label: value.label,
      logs: value.logs,
    })).sort((a, b) => b.date.localeCompare(a.date)); // Sort descending
  };

  const groupedLogs = groupLogsByDate();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Activity History</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ClipboardList size={60} color={theme.colors.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No history yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
              Actions will be recorded here
            </Text>
          </View>
        ) : (
          groupedLogs.map((group) => (
            <View key={group.date} style={styles.dateGroup}>
              <Text style={[styles.dateHeader, { color: theme.colors.textSecondary }]}>
                {group.label}
              </Text>
              {group.logs.map((log) => (
                <Card key={log.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    {getLogIcon(log.type, log.title)}
                    <View style={styles.logInfo}>
                      <Text style={[styles.logTitle, { color: theme.colors.text }]}>
                        {log.title}
                      </Text>
                      <Text style={[styles.logTime, { color: theme.colors.textSecondary }]}>
                        {format(new Date(log.timestamp), 'h:mm a')}
                      </Text>
                    </View>
                    <View 
                      style={[
                        styles.logType, 
                        { backgroundColor: getLogTypeColor(log.type) + '20' }
                      ]}
                    >
                      <Text style={[
                        styles.logTypeText, 
                        { color: getLogTypeColor(log.type) }
                      ]}>
                        {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.logDescription, { color: theme.colors.text }]}>
                    {log.description}
                  </Text>
                </Card>
              ))}
            </View>
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
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
  },
  logCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  logInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  logTitle: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
  },
  logTime: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Regular',
    marginTop: spacing.xs,
  },
  logType: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  logTypeText: {
    fontSize: fontSize.xs,
    fontFamily: 'Inter-Medium',
  },
  logDescription: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    lineHeight: fontSize.sm * 1.5,
  },
});