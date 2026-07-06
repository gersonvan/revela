import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export type PushRegistrationResult =
  | {
      message: string;
      status: "registered";
      token: string;
    }
  | {
      message: string;
      status: "denied" | "error" | "unsupported";
    };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<PushRegistrationResult> {
  if (Platform.OS === "web") {
    return {
      message: "Notificações push do Expo não são suportadas no web.",
      status: "unsupported",
    };
  }

  if (!Device.isDevice) {
    return {
      message:
        "Use um aparelho físico para registrar push. Simuladores/emuladores podem não gerar token.",
      status: "unsupported",
    };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("pending-photos", {
      importance: Notifications.AndroidImportance.DEFAULT,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      name: "Fotos pendentes",
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const existingPermission = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermission.status;

  if (existingPermission.status !== "granted") {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== "granted") {
    return {
      message: "Permissão de notificação não concedida.",
      status: "denied",
    };
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const tokenResponse = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    return {
      message: "Notificações ativadas para este aparelho.",
      status: "registered",
      token: tokenResponse.data,
    };
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? `Não foi possível gerar o token Expo: ${error.message}`
          : "Não foi possível gerar o token Expo.",
      status: "error",
    };
  }
}
