import { format } from 'date-fns';
import { TriangleAlert as AlertTriangle, ArrowUp, ClipboardList, CloudRain } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../components/shared/Card';
import { borderRadius, fontSize, spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import useHistoryStore from '../../stores/useHistoryStore';
import { LogEntry } from '../../types/history';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { logs, isLoading, error, fetchLogs } = useHistoryStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  const groupLogsByDate = () => {
    const groups: { [key: string]: LogEntry[] } = {};
    logs.forEach((log: LogEntry) => {
        const date = format(new Date(log.timestamp), 'MMM d, yyyy');
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(log);
    });
    return groups;
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'action':
        return <ArrowUp size={20} color={theme.colors.primary} />;
      case 'system':
        return <ClipboardList size={20} color={theme.colors.textSecondary} />;
      case 'error':
        return <AlertTriangle size={20} color={theme.colors.error} />;
      case 'weather':
        return <CloudRain size={20} color={theme.colors.accent} />;
      default:
        return null;
    }
  };

  const groupedLogs = groupLogsByDate();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header,
        {
          marginTop: -55,
        }
      ]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Activity History</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          </View>
        ) : logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No history available
            </Text>
          </View>
        ) : (
          Object.entries(groupedLogs).map(([date, groupLogs]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={[styles.dateHeader, { color: theme.colors.textSecondary }]}>
                {date}
              </Text>
              {groupLogs.map((log) => (
                <Card key={log.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    {getLogIcon(log.type)}
                    <Text style={[styles.logTitle, { color: theme.colors.text }]}>
                      {log.title}
                    </Text>
                    <Text style={[styles.logTime, { color: theme.colors.textSecondary }]}>
                      {format(new Date(log.timestamp), 'h:mm a')}
                    </Text>
                  </View>
                  <Text style={[styles.logDescription, { color: theme.colors.textSecondary }]}>
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
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    padding: spacing.md,
    backgroundColor: 'rgba(240, 87, 87, 0.1)',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: spacing.xl,
  },
  dateHeader: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Medium',
    marginBottom: spacing.md,
  },
  logCard: {
    marginBottom: spacing.md,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  logTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: 'Inter-SemiBold',
    marginLeft: spacing.sm,
  },
  logTime: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
  },
  logDescription: {
    fontSize: fontSize.sm,
    fontFamily: 'Inter-Regular',
    lineHeight: fontSize.sm * 1.5,
  },
});