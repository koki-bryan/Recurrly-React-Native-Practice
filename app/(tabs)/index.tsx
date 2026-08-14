import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);
export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-xl font-bold text-blue-500">Hello World</Text>
      <Text className="bg-background text-success font-bold rounded-2xl p-4">
        SHEEESHHH
      </Text>
      <Link href="/onboarding" className="text-blue-400 font-bold text-2xl">
        Go to onboarding
      </Link>
      <Link href="/(auth)/sign-in" className="text-blue-400 font-bold text-2xl">
        Go to sign in
      </Link>
      <Link href="/(auth)/sign-up" className="text-blue-400 font-bold text-2xl">
        Go to sign up
      </Link>
      <Link
        href="/subscriptions/spotify"
        className="text-blue-400 font-bold text-2xl"
      >
        Go to spotify
      </Link>
    </SafeAreaView>
  );
}
