import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { WorkoutWithExercises } from '@/lib/types';

export default function WorkoutListScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user.id) return;
    const { data, error } = await supabase
      .from('workouts')
      .select('*, workout_exercises(*, workout_sets(*))')
      .eq('user_id', session.user.id)
      .order('performed_at', { ascending: false });

    if (!error && data) {
      setWorkouts(data as unknown as WorkoutWithExercises[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [session?.user.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No workouts yet</Text>
              <Text style={styles.emptySubtitle}>Log your first workout to see it here.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const exerciseCount = item.workout_exercises.length;
          const setCount = item.workout_exercises.reduce(
            (sum, ex) => sum + ex.workout_sets.length,
            0
          );
          const date = new Date(item.performed_at);
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDate}>
                  {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
              <Text style={styles.cardSubtitle}>
                {exerciseCount} exercise{exerciseCount === 1 ? '' : 's'} · {setCount} set
                {setCount === 1 ? '' : 's'}
              </Text>
              {item.workout_exercises.length > 0 && (
                <Text style={styles.cardExercises} numberOfLines={1}>
                  {item.workout_exercises.map((ex) => ex.exercise_name).join(', ')}
                </Text>
              )}
            </View>
          );
        }}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/workout/new')}>
        <Text style={styles.fabText}>+ Log Workout</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B0D' },
  listContent: { padding: 16, paddingBottom: 100, gap: 12, flexGrow: 1 },
  card: {
    backgroundColor: '#17171A',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  cardDate: { color: '#8A8A8E', fontSize: 13 },
  cardSubtitle: { color: '#9A9AA2', fontSize: 14 },
  cardExercises: { color: '#6E6E73', fontSize: 13, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, gap: 6 },
  emptyTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  emptySubtitle: { color: '#8A8A8E', fontSize: 14 },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    backgroundColor: '#3C9FFE',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
