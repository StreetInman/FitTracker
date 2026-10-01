import { Redirect } from 'expo-router';

import { useSession } from '@/lib/auth-context';

// This is the app's root route ("/"). It doesn't render anything itself —
// it just decides where to send the user based on whether they're logged in.
export default function Index() {
  const { session, isLoading } = useSession();

  if (isLoading) return null;

  return <Redirect href={session ? '/(app)/workout' : '/sign-in'} />;
}
