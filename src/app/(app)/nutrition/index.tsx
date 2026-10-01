import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { FoodEntry } from '@/lib/types';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export default function NutritionScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [day, setDay] = useState(() => new Date());
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user.id) return;
    const from = startOfDay(day);
    const to = addDays(from, 1);
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('logged_at', from.toISOString())
      .lt('logged_at', to.toISOString())
      .order('logged_at', { ascending: false });

    if (!error && data) setEntries(data as FoodEntry[]);
    setLoading(false);
    setRefreshing(false);
  }, [session?.user.id, day]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const totals = useMemo(
    () =>
      entries.reduce(
        (acc, e) => ({
          calories: acc.calories + Number(e.calories),
          protein: acc.protein + Number(e.protein_g),
          carbs: acc.carbs + Number(e.carbs_g),
          fat: acc.fat + Number(e.fat_g),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [entries]
  );

  const dayLabel = isSameDay(day, new Date())
    ? 'Today'
    : day.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.dayNav}>
        <Pressable onPress={() => setDay((d) => addDays(d, -1))} hitSlop={10}>
          <Text style={styles.dayNavArrow}>‹</Text>
        </Pressable>
        <Text style={styles.dayNavLabel}>{dayLabel}</Text>
        <Pressable onPress={() => setDay((d) => addDays(d, 1))} hitSlop={10}>
          <Text style={styles.dayNavArrow}>›</Text>
        </Pressable>
      </View>

      <View style={styles.totalsCard}>
        <View style={styles.totalsHeader}>
          <Text style={styles.caloriesValue}>{Math.round(totals.calories)}</Text>
          <Text style={styles.caloriesLabel}>calories</Text>
        </View>
        <View style={styles.macroRow}>
          <MacroStat label="Protein" value={totals.protein} color="#4CD964" />
          <MacroStat label="Carbs" value={totals.carbs} color="#FFD60A" />
          <MacroStat label="Fat" value={totals.fat} color="#FF9F0A" />
        </View>
      </View>

      <FlatList
        data={entries}
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
              <Text style={styles.emptyTitle}>Nothing logged</Text>
              <Text style={styles.emptySubtitle}>Log a food to see it here.</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.entryRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.entryName}>{item.name}</Text>
              <Text style={styles.entryMacros}>
                P {Math.round(item.protein_g)}g · C {Math.round(item.carbs_g)}g · F{' '}
                {Math.round(item.fat_g)}g
              </Text>
            </View>
            <Text style={styles.entryCalories}>{Math.round(item.calories)} cal</Text>
          </View>
        )}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/nutrition/new')}>
        <Text style={styles.fabText}>+ Log Food</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function MacroStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.macroStat}>
      <Text style={[styles.macroValue, { color }]}>{Math.round(value)}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B0D' },
  dayNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 8,
  },
  dayNavArrow: { color: '#3C9FFE', fontSize: 28, paddingHorizontal: 12 },
  dayNavLabel: { color: '#fff', fontSize: 16, fontWeight: '600', minWidth: 120, textAlign: 'center' },
  totalsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#17171A',
    borderRadius: 14,
    padding: 18,
    gap: 14,
  },
  totalsHeader: { alignItems: 'center', gap: 2 },
  caloriesValue: { color: '#fff', fontSize: 36, fontWeight: '700' },
  caloriesLabel: { color: '#8A8A8E', fontSize: 13, textTransform: 'uppercase' },
  macroRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macroStat: { alignItems: 'center', gap: 2 },
  macroValue: { fontSize: 18, fontWeight: '600' },
  macroLabel: { color: '#8A8A8E', fontSize: 12 },
  listContent: { padding: 16, paddingTop: 4, paddingBottom: 100, gap: 10, flexGrow: 1 },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#17171A',
    borderRadius: 10,
    padding: 14,
  },
  entryName: { color: '#fff', fontSize: 15, fontWeight: '500' },
  entryMacros: { color: '#8A8A8E', fontSize: 13, marginTop: 2 },
  entryCalories: { color: '#fff', fontSize: 15, fontWeight: '600' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 6 },
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
