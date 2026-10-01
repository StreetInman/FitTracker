import { Stack } from 'expo-router';

export default function WorkoutStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Workouts' }} />
      <Stack.Screen name="new" options={{ title: 'Log Workout', presentation: 'modal' }} />
    </Stack>
  );
}
