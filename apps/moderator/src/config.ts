import Constants from "expo-constants";

const configuredBaseUrl =
  process.env.EXPO_PUBLIC_MODERATOR_API_BASE_URL ??
  Constants.expoConfig?.extra?.moderatorApiBaseUrl;

export const DEFAULT_API_BASE_URL =
  typeof configuredBaseUrl === "string" && configuredBaseUrl.length > 0
    ? configuredBaseUrl
    : "http://127.0.0.1:3000";

export const APP_VERSION =
  Constants.expoConfig?.version ?? Constants.manifest2?.extra?.expoClient?.version ?? "0.1.0";
