import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function AppTabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="workout">
        <NativeTabs.Trigger.Label>Workouts</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'figure.strengthtraining.traditional', selected: 'figure.strengthtraining.traditional' }}
          md={{ default: 'fitness_center', selected: 'fitness_center' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="nutrition">
        <NativeTabs.Trigger.Label>Nutrition</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'fork.knife', selected: 'fork.knife' }}
          md={{ default: 'restaurant', selected: 'restaurant' }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person', selected: 'person.fill' }}
          md={{ default: 'person_outline', selected: 'person' }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
