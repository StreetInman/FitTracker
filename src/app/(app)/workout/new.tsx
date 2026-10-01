import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { DraftExercise } from '@/lib/types';

function emptyExercise(): DraftExercise {
  return { name: '', sets: [{ reps: '', weight: '' }] };
}

export default function NewWorkoutScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [workoutName, setWorkoutName] = useState('Workout');
  const [exercises, setExercises] = useState<DraftExercise[]>([emptyExercise()]);
  const [saving, setSaving] = useState(false);

  function updateExerciseName(index: number, name: string) {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, name } : ex)));
  }

  function addSet(exerciseIndex: number) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex ? { ...ex, sets: [...ex.sets, { reps: '', weight: '' }] } : ex
      )
    );
  }

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight',
    value: string
  ) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex
          ? {
              ...ex,
              sets: ex.sets.map((s, j) => (j === setIndex ? { ...s, [field]: value } : s)),
            }
          : ex
      )
    );
  }

  function removeSet(exerciseIndex: number, setIndex: number) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exerciseIndex ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIndex) } : ex
      )
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()]);
  }

  function removeExercise(index: number) {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!session?.user.id) return;
    const namedExercises = exercises.filter((ex) => ex.name.trim().length > 0);
    if (namedExercises.length === 0) {
      Alert.alert('Add at least one exercise', 'Give at least one exercise a name before saving.');
      return;
    }

    setSaving(true);
    try {
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({ user_id: session.user.id, name: workoutName.trim() || 'Workout' })
        .select()
        .single();
      if (workoutError || !workout) throw workoutError;

      const { data: insertedExercises, error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(
          namedExercises.map((ex, index) => ({
            workout_id: workout.id,
            exercise_name: ex.name.trim(),
            order_index: index,
          }))
        )
        .select();
      if (exercisesError || !insertedExercises) throw exercisesError;

      const setsToInsert = namedExercises.flatMap((ex, exIndex) =>
        ex.sets
          .filter((s) => s.reps.trim() || s.weight.trim())
          .map((s, setIndex) => ({
            workout_exercise_id: insertedExercises[exIndex].id,
            set_index: setIndex,
            reps: s.reps.trim() ? Number(s.reps) : null,
            weight: s.weight.trim() ? Number(s.weight) : null,
          }))
      );

      if (setsToInsert.length > 0) {
        const { error: setsError } = await supabase.from('workout_sets').insert(setsToInsert);
        if (setsError) throw setsError;
      }

      router.back();
    } catch (err) {
      Alert.alert('Could not save workout', err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.label}>Workout name</Text>
          <TextInput
            style={styles.input}
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="e.g. Push Day"
            placeholderTextColor="#8A8A8E"
          />

          {exercises.map((exercise, exerciseIndex) => (
            <View key={exerciseIndex} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <TextInput
                  style={[styles.input, styles.exerciseNameInput]}
                  value={exercise.name}
                  onChangeText={(text) => updateExerciseName(exerciseIndex, text)}
                  placeholder="Exercise name"
                  placeholderTextColor="#8A8A8E"
                />
                {exercises.length > 1 && (
                  <Pressable onPress={() => removeExercise(exerciseIndex)} hitSlop={10}>
                    <Text style={styles.removeText}>Remove</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.setHeaderRow}>
                <Text style={[styles.setHeaderText, styles.setCol]}>Set</Text>
                <Text style={[styles.setHeaderText, styles.setCol]}>Reps</Text>
                <Text style={[styles.setHeaderText, styles.setCol]}>Weight</Text>
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={[styles.setIndexText, styles.setCol]}>{setIndex + 1}</Text>
                  <TextInput
                    style={[styles.setInput, styles.setCol]}
                    keyboardType="number-pad"
                    value={set.reps}
                    onChangeText={(v) => updateSet(exerciseIndex, setIndex, 'reps', v)}
                    placeholder="0"
                    placeholderTextColor="#5A5A5E"
                  />
                  <TextInput
                    style={[styles.setInput, styles.setCol]}
                    keyboardType="decimal-pad"
                    value={set.weight}
                    onChangeText={(v) => updateSet(exerciseIndex, setIndex, 'weight', v)}
                    placeholder="0"
                    placeholderTextColor="#5A5A5E"
                  />
                  <Pressable
                    onPress={() => removeSet(exerciseIndex, setIndex)}
                    hitSlop={10}
                    style={styles.setRemove}>
                    <Text style={styles.removeText}>✕</Text>
                  </Pressable>
                </View>
              ))}

              <Pressable style={styles.addSetButton} onPress={() => addSet(exerciseIndex)}>
                <Text style={styles.addSetText}>+ Add set</Text>
              </Pressable>
            </View>
          ))}

          <Pressable style={styles.addExerciseButton} onPress={addExercise}>
            <Text style={styles.addExerciseText}>+ Add exercise</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Workout'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B0D' },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 40 },
  label: { color: '#9A9AA2', fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },
  input: {
    borderWidth: 1,
    borderColor: '#2A2A2E',
    backgroundColor: '#17171A',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  exerciseCard: {
    backgroundColor: '#111113',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#1F1F23',
  },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exerciseNameInput: { flex: 1 },
  removeText: { color: '#FF6B6B', fontSize: 13 },
  setHeaderRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 2 },
  setHeaderText: { color: '#6E6E73', fontSize: 12, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setCol: { flex: 1 },
  setIndexText: { color: '#8A8A8E', textAlign: 'center', fontSize: 14 },
  setInput: {
    borderWidth: 1,
    borderColor: '#2A2A2E',
    backgroundColor: '#17171A',
    color: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 15,
  },
  setRemove: { width: 24, alignItems: 'center' },
  addSetButton: { alignSelf: 'flex-start', paddingVertical: 4 },
  addSetText: { color: '#3C9FFE', fontSize: 14, fontWeight: '500' },
  addExerciseButton: {
    borderWidth: 1,
    borderColor: '#2A2A2E',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addExerciseText: { color: '#3C9FFE', fontSize: 15, fontWeight: '600' },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1F1F23',
    backgroundColor: '#0B0B0D',
  },
  saveButton: {
    backgroundColor: '#3C9FFE',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
