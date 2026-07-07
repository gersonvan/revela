import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SESSION_TOKEN_KEY = "eventoon.moderator-app.session-token";
const DEVICE_ID_KEY = "eventoon.moderator-app.device-id";
const API_BASE_URL_KEY = "eventoon.moderator-app.api-base-url";

let webSessionToken: string | null = null;
let webDeviceId: string | null = null;
let webApiBaseUrl: string | null = null;

async function getItem(key: string) {
  if (Platform.OS === "web") {
    if (key === SESSION_TOKEN_KEY) return webSessionToken;
    if (key === DEVICE_ID_KEY) return webDeviceId;
    return webApiBaseUrl;
  }

  return SecureStore.getItemAsync(key);
}

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    if (key === SESSION_TOKEN_KEY) webSessionToken = value;
    if (key === DEVICE_ID_KEY) webDeviceId = value;
    if (key === API_BASE_URL_KEY) webApiBaseUrl = value;
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteItem(key: string) {
  if (Platform.OS === "web") {
    if (key === SESSION_TOKEN_KEY) webSessionToken = null;
    if (key === DEVICE_ID_KEY) webDeviceId = null;
    if (key === API_BASE_URL_KEY) webApiBaseUrl = null;
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

export async function loadSessionToken() {
  return getItem(SESSION_TOKEN_KEY);
}

export async function saveSessionToken(token: string) {
  await setItem(SESSION_TOKEN_KEY, token);
}

export async function clearSessionToken() {
  await deleteItem(SESSION_TOKEN_KEY);
}

export async function loadApiBaseUrl() {
  return getItem(API_BASE_URL_KEY);
}

export async function saveApiBaseUrl(baseUrl: string) {
  await setItem(API_BASE_URL_KEY, baseUrl);
}

export async function getOrCreateDeviceId() {
  const existingDeviceId = await getItem(DEVICE_ID_KEY);
  if (existingDeviceId) return existingDeviceId;

  const deviceId = createDeviceId();
  await setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

function createDeviceId() {
  return `moderator-app-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
