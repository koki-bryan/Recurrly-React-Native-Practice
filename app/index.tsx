import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, isSignedIn]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#ea7a53" />
      <Text className="mt-4 text-sm font-sans-medium text-muted-foreground">
        {isLoaded ? "Redirecting…" : "Loading…"}
      </Text>
    </View>
  );
}
