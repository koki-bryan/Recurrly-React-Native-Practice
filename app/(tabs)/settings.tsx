import { useAuth, useUser } from "@clerk/expo";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const DEFAULT_AVATAR = require("@/assets/images/avatar.png");

export default function Settings() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const hasNameChanged =
    firstName.trim() !== (user?.firstName ?? "") ||
    lastName.trim() !== (user?.lastName ?? "");

  const handleSaveName = async () => {
    if (!user || !hasNameChanged) return;
    Keyboard.dismiss();
    setIsSaving(true);
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      Alert.alert("Updated", "Your name has been updated.");
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to update name.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePickPhoto = async () => {
    if (!user) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library to update your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    setIsUploadingPhoto(true);
    try {
      const asset = result.assets[0];
      await user.setProfileImage({
        file: {
          uri: asset.uri,
          name: "profile.jpg",
          type: asset.mimeType ?? "image/jpeg",
        } as any,
      });
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Failed to upload photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch {
      setIsSigningOut(false);
    }
  };

  const profileImageUri = user?.imageUrl;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-2xl font-sans-bold text-primary mb-6">
              Settings
            </Text>

            {/* Profile picture section */}
            <View className="items-center mb-6">
              <Pressable onPress={handlePickPhoto} disabled={isUploadingPhoto}>
                <View className="relative">
                  <Image
                    source={
                      profileImageUri
                        ? { uri: profileImageUri }
                        : DEFAULT_AVATAR
                    }
                    className="size-24 rounded-full"
                  />
                  {isUploadingPhoto && (
                    <View className="absolute inset-0 items-center justify-center rounded-full bg-black/40">
                      <ActivityIndicator color="#fff" />
                    </View>
                  )}
                </View>
              </Pressable>
              <Pressable onPress={handlePickPhoto} disabled={isUploadingPhoto}>
                <Text className="mt-3 text-sm font-sans-semibold text-accent">
                  Change photo
                </Text>
              </Pressable>
            </View>

            {/* Name edit section */}
            <View className="rounded-2xl border border-border bg-card p-4 mb-4">
              <Text className="text-base font-sans-semibold text-primary mb-4">
                Profile
              </Text>

              <View className="gap-4">
                <View className="gap-2">
                  <Text className="text-sm font-sans-semibold text-primary">
                    First name
                  </Text>
                  <TextInput
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-base font-sans-medium text-primary"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-sm font-sans-semibold text-primary">
                    Last name
                  </Text>
                  <TextInput
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-base font-sans-medium text-primary"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={
                      hasNameChanged ? handleSaveName : undefined
                    }
                  />
                </View>

                <Pressable
                  className={`mt-1 items-center rounded-2xl bg-accent py-3 ${
                    !hasNameChanged || isSaving ? "bg-accent/45" : ""
                  }`}
                  onPress={handleSaveName}
                  disabled={!hasNameChanged || isSaving}
                >
                  <Text className="text-sm font-sans-bold text-primary">
                    {isSaving ? "Saving…" : "Save changes"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Account info */}
            <View className="rounded-2xl border border-border bg-card p-4 mb-4">
              <Text className="text-base font-sans-semibold text-primary mb-2">
                Account
              </Text>
              <Text className="text-sm font-sans-medium text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </Text>
              <Text className="text-xs font-sans-medium text-muted-foreground mt-1">
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "—"}
              </Text>
            </View>

            {/* Sign out */}
            <Pressable
              className={`items-center rounded-2xl bg-primary py-4 ${
                isSigningOut ? "bg-primary/50" : ""
              }`}
              onPress={handleSignOut}
              disabled={isSigningOut}
            >
              <Text className="font-sans-bold text-background">
                {isSigningOut ? "Signing out…" : "Sign out"}
              </Text>
            </Pressable>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
