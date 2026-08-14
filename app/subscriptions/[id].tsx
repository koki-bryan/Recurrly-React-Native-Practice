import { Link, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SubscriptionDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>
        {id}SubscriptionDetails: {id}
      </Text>
      <Link href="/" className="p-4 bg-accent">
        Go back
      </Link>
    </View>
  );
};

export default SubscriptionDetails;
