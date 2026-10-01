import { useRouter } from 'expo-router';
import { ReactNode, useState } from 'react';
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

export default function NewFoodEntryScreen() {
  const router = useRouter();
  const { session } = useSession();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!session?.user.id) return;
    if (!name.trim()) {
      Alert.alert('Name required', 'Give the food or meal a name.');
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('food_entries').insert({
      user_id: session.user.id,
      name: name.trim(),
      calories: Number(calories) || 0,
      protein_g: Number(protein) || 0,
      carbs_g: Number(carbs) || 0,
      fat_g: Number(fat) || 0,
    });
    setSaving(false);

    if (error) {
      Alert.alert('Could not save', error.message);
      return;
    }
    router.back();
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Field label="Food / meal name">
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Grilled chicken bowl"
              placeholderTextColor="#8A8A8E"
            />
          </Field>

          <Field label="Calories">
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="#8A8A8E"
            />
          </Field>

          <View style={styles.macroInputRow}>
            <Field label="Protein (g)" style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                value={protein}
                onChangeText={setProtein}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#8A8A8E"
              />
            </Field>
            <Field label="Carbs (g)" style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#8A8A8E"
              />
            </Field>
            <Field label="Fat (g)" style={{ flex: 1 }}>
              <TextInput
                style={styles.input}
                value={fat}
                onChangeText={setFat}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#8A8A8E"
              />
            </Field>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: ReactNode;
  style?: object;
}) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
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
  macroInputRow: { flexDirection: 'row', gap: 10 },
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
