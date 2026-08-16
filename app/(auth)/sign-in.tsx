import { useSignIn } from "@clerk/expo";
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

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const isFetching = fetchStatus === "fetching";
  const canSubmit = emailAddress.trim() !== "" && password !== "" && !isFetching;

  const handleSignIn = async () => {
    Keyboard.dismiss();

    const { error } = await signIn.password({ emailAddress, password });
    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) return;
          router.replace("/(tabs)" as Href);
        },
      });
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor: { strategy: string }) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();

    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) return;
          router.replace("/(tabs)" as Href);
        },
      });
    }
  };

  // Device trust verification state
  if (signIn.status === "needs_client_trust") {
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

                <Text className="text-3xl font-sans-bold text-primary">Verify your device</Text>
                <Text className="mt-2 max-w-[320px] text-center text-base font-sans-medium text-muted-foreground">
                  We sent a verification code to your email to confirm this device
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
                    onPress={() => signIn.mfa.sendEmailCode()}
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

  // Main sign-in form
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

              <Text className="text-3xl font-sans-bold text-primary">Welcome back</Text>
              <Text className="mt-2 max-w-[320px] text-center text-base font-sans-medium text-muted-foreground">
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            {/* Form card */}
            <View className="mt-8 rounded-3xl border border-border bg-card p-5">
              <View className="gap-4">
                {/* Email field */}
                <View className="gap-2">
                  <Text className="text-sm font-sans-semibold text-primary">Email</Text>
                  <TextInput
                    className={clsx(
                      "rounded-2xl border border-border bg-background px-4 py-4 text-base font-sans-medium text-primary",
                      errors?.fields?.identifier && "border-destructive",
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
                  {errors?.fields?.identifier && (
                    <Text className="text-xs font-sans-medium text-destructive">
                      {errors.fields.identifier.message}
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
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(0,0,0,0.35)"
                    secureTextEntry
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={canSubmit ? handleSignIn : undefined}
                  />
                  {errors?.fields?.password && (
                    <Text className="text-xs font-sans-medium text-destructive">
                      {errors.fields.password.message}
                    </Text>
                  )}
                </View>

                {/* Submit button */}
                <Pressable
                  className={clsx(
                    "mt-1 items-center rounded-2xl bg-accent py-4",
                    !canSubmit && "bg-accent/45",
                  )}
                  onPress={handleSignIn}
                  disabled={!canSubmit}
                >
                  <Text className="text-base font-sans-bold text-primary">
                    {isFetching ? "Signing in…" : "Sign in"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Link to sign-up */}
            <View className="mt-5 flex-row items-center justify-center gap-1">
              <Text className="text-sm font-sans-medium text-muted-foreground">New to Recurrly?</Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable>
                  <Text className="text-sm font-sans-bold text-accent">Create an account</Text>
                </Pressable>
              </Link>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
