import { Stack } from 'expo-router';

export default function NutritionStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Nutrition' }} />
      <Stack.Screen name="new" options={{ title: 'Log Food', presentation: 'modal' }} />
    </Stack>
  );
}
