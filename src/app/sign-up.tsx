import { Link } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/lib/auth-context';

export default function SignUpScreen() {
  const { signUp } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!email || !password) {
      setError('Enter an email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const { error: signUpError } = await signUp(email.trim(), password);
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError);
      return;
    }
    // If your Supabase project has "Confirm email" turned on, there's no
    // session yet after sign-up — let the user know to check their inbox.
    setInfo('Check your email to confirm your account, then log in.');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Track your workouts and nutrition in one place.</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#8A8A8E"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#8A8A8E"
          secureTextEntry
          autoCapitalize="none"
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {info && <Text style={styles.info}>{info}</Text>}

        <Pressable
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? 'Creating account…' : 'Sign Up'}</Text>
        </Pressable>

        <Link href="/sign-in" style={styles.link}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B0D' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#9A9AA2', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#2A2A2E',
    backgroundColor: '#17171A',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: { color: '#FF6B6B', fontSize: 14, marginTop: 4 },
  info: { color: '#4CD964', fontSize: 14, marginTop: 4 },
  button: {
    backgroundColor: '#3C9FFE',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { marginTop: 18, alignSelf: 'center' },
  linkText: { color: '#3C9FFE', fontSize: 14 },
});
