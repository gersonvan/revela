import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Revela Moderador",
  slug: "revela-moderador",
  version: "0.1.0",
  orientation: "portrait",
  scheme: "revela-moderador",
  userInterfaceStyle: "light",
  plugins: ["expo-notifications"],
  extra: {
    moderatorApiBaseUrl:
      process.env.EXPO_PUBLIC_MODERATOR_API_BASE_URL ?? "http://127.0.0.1:3000",
    eas: {
      projectId: "8d43ff4b-94a6-4c31-83c2-085132a0516d",
    },
  },
  ios: {
    supportsTablet: false,
  },
  android: {
    package: "br.com.gersonvan.revelamoderador",
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: "#FBF5EE",
    },
  },
};

export default config;
