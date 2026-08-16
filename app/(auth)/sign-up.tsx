import { useAuth, useSignUp } from "@clerk/expo";
import clsx from "clsx";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
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

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const isFetching = fetchStatus === "fetching";
  const canSubmit =
    firstName.trim() !== "" &&
    emailAddress.trim() !== "" &&
    password !== "" &&
    !isFetching;

  const handleSignUp = async () => {
    Keyboard.dismiss();

    const { error } = await signUp.password({
      emailAddress,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
    if (error) return;

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    Keyboard.dismiss();

    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) return;
          router.replace("/(tabs)" as Href);
        },
      });
    }
  };

  const handleResendCode = async () => {
    await signUp.verifications.sendEmailCode();
  };

  // If already signed in, render nothing (redirect handled by root layout)
  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  // Check if we're in the verification state
  const isVerifying =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields?.includes("email_address") &&
    (signUp.missingFields?.length ?? 0) === 0;

  // Verification state
  if (isVerifying) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 32 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Brand block */}
              <View className="mt-2 items-center">
                <View className="mb-7 flex-row items-center gap-3">
                  <View className="relative size-14 items-center justify-center rounded-2xl bg-accent">
                    <Text className="text-2xl font-sans-extrabold text-background">R</Text>
                  </View>
                  <View>
                    <Text className="text-3xl font-sans-extrabold text-primary">Recurrly</Text>
                    <Text className="-mt-1 text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">Smart Billing</Text>
                  </View>
                </View>

                <Text className="text-3xl font-sans-bold text-primary">Verify your email</Text>
                <Text className="mt-2 max-w-[320px] text-center text-base font-sans-medium text-muted-foreground">
                  We sent a verification code to {emailAddress}
                </Text>
              </View>

              {/* Verification card */}
              <View className="mt-8 rounded-3xl border border-border bg-card p-5">
                <View className="gap-4">
                  <View className="gap-2">
                    <Text className="text-sm font-sans-semibold text-primary">Verification code</Text>
                    <TextInput
                      className={clsx(
                        "rounded-2xl border border-border bg-background px-4 py-4 text-base font-sans-medium text-primary",
                        errors?.fields?.code && "border-destructive",
                      )}
                      value={code}
                      onChangeText={setCode}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor="rgba(0,0,0,0.35)"
                      keyboardType="number-pad"
                      autoComplete="one-time-code"
                      textContentType="oneTimeCode"
                      returnKeyType="done"
                      onSubmitEditing={handleVerify}
                    />
                    {errors?.fields?.code && (
                      <Text className="text-xs font-sans-medium text-destructive">
                        {errors.fields.code.message}
                      </Text>
                    )}
                  </View>

                  <Pressable
                    className={clsx(
                      "mt-1 items-center rounded-2xl bg-accent py-4",
                      (!code.trim() || isFetching) && "bg-accent/45",
                    )}
                    onPress={handleVerify}
                    disabled={!code.trim() || isFetching}
                  >
                    <Text className="text-base font-sans-bold text-primary">
                      {isFetching ? "Verifying…" : "Verify"}
                    </Text>
                  </Pressable>

                  <Pressable
                    className="items-center rounded-2xl border border-accent/30 bg-accent/10 py-3"
                    onPress={handleResendCode}
                    disabled={isFetching}
                  >
                    <Text className="text-sm font-sans-semibold text-accent">
                      Resend code
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Main sign-up form
  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 32 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Brand block */}
            <View className="mt-2 items-center">
              <View className="mb-7 flex-row items-center gap-3">
                <View className="relative size-14 items-center justify-center rounded-2xl bg-accent">
                  <Text className="text-2xl font-sans-extrabold text-background">R</Text>
                </View>
                <View>
                  <Text className="text-3xl font-sans-extrabold text-primary">Recurrly</Text>
                  <Text className="-mt-1 text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground">Smart Billing</Text>
                </View>
              </View>

              <Text className="text-3xl font-sans-bold text-primary">Create your account</Text>
              <Text className="mt-2 max-w-[320px] text-center text-base font-sans-medium text-muted-foreground">
                Start tracking and managing all your subscriptions
              </Text>
            </View>

            {/* Form card */}
            <View className="mt-8 rounded-3xl border border-border bg-card p-5">
              <View className="gap-4">
                {/* First name field */}
                <View className="gap-2">
                  <Text className="text-sm font-sans-semibold text-primary">First name</Text>
                  <TextInput
                    className={clsx(
                      "rounded-2xl border border-border bg-background px-4 py-4 text-base font-sans-medium text-primary",
                      errors?.fields?.firstName && "border-destructive",
                    )}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    autoCapitalize="words"
                    autoComplete="given-name"
                    textContentType="givenName"
                    returnKeyType="next"
                  />
                  {errors?.fields?.firstName && (
                    <Text className="text-xs font-sans-medium text-destructive">
                      {errors.fields.firstName.message}
                    </Text>
                  )}
                </View>

                {/* Last name field (optional) */}
                <View className="gap-2">
                  <Text className="text-sm font-sans-semibold text-primary">
                    Last name{" "}
                    <Text className="text-xs font-sans-medium text-muted-foreground">(optional)</Text>
                  </Text>
                  <TextInput
                    className={clsx(
                      "rounded-2xl border border-border bg-background px-4 py-4 text-base font-sans-medium text-primary",
                      errors?.fields?.lastName && "border-destructive",
                    )}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    autoCapitalize="words"
                    autoComplete="family-name"
                    textContentType="familyName"
                    returnKeyType="next"
                  />
                  {errors?.fields?.lastName && (
                    <Text className="text-xs font-sans-medium text-destructive">
                      {errors.fields.lastName.message}
                    </Text>
                  )}
                </View>

                {/* Email field */}
                <View className="gap-2">
                  <Text className="text-sm font-sans-semibold text-primary">Email</Text>
                  <TextInput
                    className={clsx(
                      "rounded-2xl border border-border bg-background px-4 py-4 text-base font-sans-medium text-primary",
                      errors?.fields?.emailAddress && "border-destructive",
                    )}
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
                  />
                  {errors?.fields?.emailAddress && (
                    <Text className="text-xs font-sans-medium text-destructive">
                      {errors.fields.emailAddress.message}
                    </Text>
                  )}
                </View>

                {/* Password field */}
                <View className="gap-2">
                  <Text className="text-sm font-sans-semibold text-primary">Password</Text>
                  <TextInput
                    className={clsx(
                      "rounded-2xl border border-border bg-background px-4 py-4 text-base font-sans-medium text-primary",
                      errors?.fields?.password && "border-destructive",
                    )}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="go"
                    onSubmitEditing={canSubmit ? handleSignUp : undefined}
                  />
                  {errors?.fields?.password && (
                    <Text className="text-xs font-sans-medium text-destructive">
                      {errors.fields.password.message}
                    </Text>
                  )}
                  <Text className="text-sm font-sans-medium text-muted-foreground">
                    Must be at least 8 characters
                  </Text>
                </View>

                {/* Submit button */}
                <Pressable
                  className={clsx(
                    "mt-1 items-center rounded-2xl bg-accent py-4",
                    !canSubmit && "bg-accent/45",
                  )}
                  onPress={handleSignUp}
                  disabled={!canSubmit}
                >
                  <Text className="text-base font-sans-bold text-primary">
                    {isFetching ? "Creating account…" : "Create account"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Link to sign-in */}
            <View className="mt-5 flex-row items-center justify-center gap-1">
              <Text className="text-sm font-sans-medium text-muted-foreground">Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable>
                  <Text className="text-sm font-sans-bold text-accent">Sign in</Text>
                </Pressable>
              </Link>
            </View>

            {/* Required for sign-up flows on Expo web */}
            <View nativeID="clerk-captcha" />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
