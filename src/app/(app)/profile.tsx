import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/lib/auth-context';

export default function ProfileScreen() {
  const { session, signOut } = useSession();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {session?.user.email?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.email}>{session?.user.email}</Text>

        <Pressable
          style={styles.signOutButton}
          onPress={() =>
            Alert.alert('Log out', 'Are you sure you want to log out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: () => signOut() },
            ])
          }>
          <Text style={styles.signOutText}>Log Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B0B0D' },
  container: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 16, paddingHorizontal: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#3C9FFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  email: { color: '#fff', fontSize: 16 },
  signOutButton: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#2A2A2E',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  signOutText: { color: '#FF6B6B', fontSize: 15, fontWeight: '600' },
});
