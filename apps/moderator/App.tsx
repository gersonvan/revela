import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createModeratorApi, ModeratorApiError } from "./src/api/client";
import type {
  ModeratorContext,
  PhotoItem,
  PhotoListResponse,
  PhotoStatus,
} from "./src/api/types";
import {
  clearSessionToken,
  getOrCreateDeviceId,
  loadApiBaseUrl,
  loadSessionToken,
  saveApiBaseUrl,
  saveSessionToken,
} from "./src/auth/session-store";
import { APP_VERSION, DEFAULT_API_BASE_URL } from "./src/config";
import { registerForPushNotifications } from "./src/notifications/register-push-token";

type AppState = "checking-session" | "login" | "moderation";

export default function App() {
  const [apiBaseUrl, setApiBaseUrl] = useState(DEFAULT_API_BASE_URL);
  const [inviteToken, setInviteToken] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [context, setContext] = useState<ModeratorContext | null>(null);
  const [photoList, setPhotoList] = useState<PhotoListResponse | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const [state, setState] = useState<AppState>("checking-session");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const [registeringPush, setRegisteringPush] = useState(false);
  const api = useMemo(() => createModeratorApi(apiBaseUrl), [apiBaseUrl]);

  const selectedPhoto =
    photoList?.items.find((photo) => photo.id === selectedPhotoId) ??
    photoList?.items[0] ??
    null;

  const showError = useCallback((error: unknown, fallback: string) => {
    if (error instanceof ModeratorApiError) {
      setErrorMessage(error.message);
      return;
    }

    setErrorMessage(fallback);
  }, []);

  const loadModerationState = useCallback(
    async (token: string, mode: "initial" | "refresh" = "initial") => {
      if (mode === "refresh") setRefreshing(true);
      else setLoading(true);

      try {
        const [nextContext, nextPhotoList] = await Promise.all([
          api.getContext(token),
          api.listPendingPhotos(token),
        ]);
        setContext(nextContext);
        setPhotoList(nextPhotoList);
        setSelectedPhotoId((currentPhotoId) => {
          if (
            currentPhotoId &&
            nextPhotoList.items.some((photo) => photo.id === currentPhotoId)
          ) {
            return currentPhotoId;
          }

          return nextPhotoList.items[0]?.id ?? null;
        });
        setErrorMessage(null);
        setState("moderation");
      } catch (error) {
        if (error instanceof ModeratorApiError && error.status === 401) {
          await clearSessionToken();
          setSessionToken(null);
          setState("login");
        }
        showError(error, "Não foi possível carregar a moderação.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [api, showError],
  );

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      const storedBaseUrl = await loadApiBaseUrl();
      if (storedBaseUrl && mounted) setApiBaseUrl(storedBaseUrl);

      const storedToken = await loadSessionToken();
      if (!mounted) return;

      if (!storedToken) {
        setState("login");
        return;
      }

      setSessionToken(storedToken);
      await createModeratorApi(storedBaseUrl ?? apiBaseUrl)
        .getContext(storedToken)
        .then(async (nextContext) => {
          const nextPhotoList = await createModeratorApi(
            storedBaseUrl ?? apiBaseUrl,
          ).listPendingPhotos(storedToken);
          if (!mounted) return;
          setContext(nextContext);
          setPhotoList(nextPhotoList);
          setSelectedPhotoId(nextPhotoList.items[0]?.id ?? null);
          setErrorMessage(null);
          setState("moderation");
        })
        .catch(async (error: unknown) => {
          if (error instanceof ModeratorApiError && error.status === 401) {
            await clearSessionToken();
            if (!mounted) return;
            setSessionToken(null);
            setState("login");
          }
          if (!mounted) return;
          showError(error, "Não foi possível restaurar a sessão.");
          setState("login");
        });
    }

    void restoreSession();

    return () => {
      mounted = false;
    };
  }, [loadModerationState]);

  async function activateSession() {
    const trimmedToken = inviteToken.trim();
    const trimmedBaseUrl = apiBaseUrl.trim().replace(/\/+$/, "");

    if (!trimmedBaseUrl) {
      setErrorMessage("Informe a URL do backend.");
      return;
    }

    if (!trimmedToken) {
      setErrorMessage("Cole o token ou link de convite do moderador.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const deviceId = await getOrCreateDeviceId();
      const activation = await createModeratorApi(trimmedBaseUrl).activateSession({
        appVersion: APP_VERSION,
        deviceId,
        deviceName: Platform.OS,
        inviteToken: extractInviteToken(trimmedToken),
        platform: Platform.OS,
      });

      await saveSessionToken(activation.sessionToken);
      await saveApiBaseUrl(trimmedBaseUrl);
      setApiBaseUrl(trimmedBaseUrl);
      setSessionToken(activation.sessionToken);
      setInviteToken("");
      await loadModerationState(activation.sessionToken);
    } catch (error) {
      showError(error, "Não foi possível ativar este convite.");
    } finally {
      setLoading(false);
    }
  }

  async function decidePhoto(photo: PhotoItem, nextStatus: PhotoStatus) {
    if (!sessionToken) return;

    const verb = nextStatus === "APPROVED" ? "aprovar" : "rejeitar";

    setLoading(true);
    setErrorMessage(null);

    try {
      await api.decidePhoto(sessionToken, photo.id, nextStatus);
      await loadModerationState(sessionToken, "refresh");
    } catch (error) {
      showError(error, `Não foi possível ${verb} a foto.`);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    if (!sessionToken) {
      await clearSessionToken();
      setState("login");
      return;
    }

    setLoading(true);

    try {
      await api.logout(sessionToken);
    } catch {
      // Sessão inválida ou offline: limpar o app localmente ainda é seguro.
    } finally {
      await clearSessionToken();
      setSessionToken(null);
      setContext(null);
      setPhotoList(null);
      setSelectedPhotoId(null);
      setLoading(false);
      setState("login");
    }
  }

  async function registerPushToken() {
    if (!sessionToken) {
      setPushMessage("Entre com um convite antes de ativar notificações.");
      return;
    }

    setRegisteringPush(true);
    setPushMessage(null);

    try {
      const result = await registerForPushNotifications();

      if (result.status !== "registered") {
        setPushMessage(result.message);
        return;
      }

      await api.registerPushToken(sessionToken, {
        appVersion: APP_VERSION,
        platform: Platform.OS,
        pushToken: result.token,
      });
      setPushMessage(result.message);
    } catch (error) {
      showError(error, "Não foi possível registrar notificações.");
    } finally {
      setRegisteringPush(false);
    }
  }

  if (state === "checking-session") {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color="#D4562B" size="large" />
          <Text style={styles.mutedText}>Verificando sessão...</Text>
        </View>
      </Screen>
    );
  }

  if (state === "login") {
    return (
      <Screen>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.loginShell}
        >
          <View>
            <Text style={styles.eyebrow}>Revela</Text>
            <Text style={styles.title}>Moderação do evento</Text>
            <Text style={styles.description}>
              Acesse com o convite individual enviado pelo administrador. O app
              é exclusivo para moderadores.
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>URL do backend</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setApiBaseUrl}
              placeholder="http://127.0.0.1:3000"
              style={styles.input}
              value={apiBaseUrl}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Token ou link do convite</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              multiline
              onChangeText={setInviteToken}
              placeholder="Cole aqui o link /moderate/..."
              style={[styles.input, styles.tokenInput]}
              value={inviteToken}
            />
          </View>

          {errorMessage ? <InlineMessage tone="error" text={errorMessage} /> : null}

          <PrimaryButton
            disabled={loading}
            icon="log-in-outline"
            label={loading ? "Ativando..." : "Ativar acesso"}
            onPress={activateSession}
          />

          <Text style={styles.helperText}>
            O envio de fotos por convidados continua no QR Code web. Este app
            não implementa upload de convidados.
          </Text>
        </KeyboardAvoidingView>
        <StatusBar style="dark" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            onRefresh={() =>
              sessionToken ? void loadModerationState(sessionToken, "refresh") : undefined
            }
            refreshing={refreshing}
            tintColor="#D4562B"
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Moderação</Text>
            <Text style={styles.title}>{context?.event.name ?? "Evento"}</Text>
            <Text style={styles.mutedText}>
              {context?.moderator.name ?? "Moderador"} ·{" "}
              {context?.counts.pending ?? 0} pendentes
            </Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => void logout()}>
            <Ionicons color="#8A6B55" name="log-out-outline" size={24} />
          </Pressable>
        </View>

        {errorMessage ? <InlineMessage tone="error" text={errorMessage} /> : null}

        {pushMessage ? <InlineMessage tone="info" text={pushMessage} /> : null}

        <View style={styles.summaryRow}>
          <SummaryTile label="Pendentes" tone="pending" value={context?.counts.pending ?? 0} />
          <SummaryTile label="Aprovadas" tone="approved" value={context?.counts.approved ?? 0} />
          <SummaryTile label="Rejeitadas" tone="rejected" value={context?.counts.rejected ?? 0} />
        </View>

        {loading && !refreshing ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#D4562B" />
            <Text style={styles.mutedText}>Atualizando...</Text>
          </View>
        ) : null}

        {context?.permissions.canRegisterPushToken ? (
          <View style={styles.notificationCard}>
            <View style={styles.notificationText}>
              <Text style={styles.sectionTitle}>Alertas de fotos pendentes</Text>
              <Text style={styles.mutedText}>
                Registra este aparelho para alertas agrupados. Se falhar, a
                moderação continua disponível no app e no web.
              </Text>
            </View>
            <SecondaryButton
              disabled={registeringPush}
              icon="notifications-outline"
              label={registeringPush ? "Ativando..." : "Ativar"}
              onPress={() => void registerPushToken()}
            />
          </View>
        ) : null}

        {photoList && photoList.items.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons color="#D4562B" name="checkmark-done-outline" size={36} />
            <Text style={styles.emptyTitle}>Nenhuma foto pendente</Text>
            <Text style={styles.description}>
              Puxe para atualizar. O painel web continua disponível se o app
              estiver indisponível.
            </Text>
          </View>
        ) : null}

        {selectedPhoto ? (
          <PhotoReview
            disabled={loading}
            onApprove={() => void decidePhoto(selectedPhoto, "APPROVED")}
            onReject={() => {
              Alert.alert("Rejeitar foto", "Confirmar rejeição desta foto?", [
                { style: "cancel", text: "Cancelar" },
                {
                  onPress: () => void decidePhoto(selectedPhoto, "REJECTED"),
                  style: "destructive",
                  text: "Rejeitar",
                },
              ]);
            }}
            photo={selectedPhoto}
          />
        ) : null}

        {photoList && photoList.items.length > 1 ? (
          <View style={styles.queue}>
            <Text style={styles.sectionTitle}>Fila pendente</Text>
            {photoList.items.map((photo) => (
              <Pressable
                accessibilityRole="button"
                key={photo.id}
                onPress={() => setSelectedPhotoId(photo.id)}
                style={[
                  styles.queueItem,
                  selectedPhoto?.id === photo.id ? styles.queueItemActive : null,
                ]}
              >
                <Text style={styles.queueTitle}>{photo.guestName}</Text>
                <Text numberOfLines={1} style={styles.mutedText}>
                  {formatDate(photo.uploadedAt)}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
      <StatusBar style="dark" />
    </Screen>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={styles.screen}>{children}</SafeAreaView>;
}

function PhotoReview({
  disabled,
  onApprove,
  onReject,
  photo,
}: {
  disabled: boolean;
  onApprove: () => void;
  onReject: () => void;
  photo: PhotoItem;
}) {
  return (
    <View style={styles.reviewCard}>
      <Image source={{ uri: photo.imageUrl }} style={styles.photo} />
      <View style={styles.reviewBody}>
        <Text style={styles.photoGuest}>{photo.guestName}</Text>
        <Text style={styles.mutedText}>{formatDate(photo.uploadedAt)}</Text>
        {photo.message ? <Text style={styles.photoMessage}>“{photo.message}”</Text> : null}
        <View style={styles.actionRow}>
          <PrimaryButton
            disabled={disabled}
            icon="checkmark-outline"
            label="Aprovar"
            onPress={onApprove}
          />
          <SecondaryButton
            disabled={disabled}
            icon="close-outline"
            label="Rejeitar"
            onPress={onReject}
          />
        </View>
      </View>
    </View>
  );
}

function PrimaryButton({
  disabled,
  icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.primaryButton, disabled ? styles.disabledButton : null]}
    >
      <Ionicons color="#FFFFFF" name={icon} size={18} />
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  disabled,
  icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.secondaryButton, disabled ? styles.disabledButton : null]}
    >
      <Ionicons color="#DC2626" name={icon} size={18} />
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SummaryTile({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "approved" | "pending" | "rejected";
  value: number;
}) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          tone === "approved" ? styles.approvedText : null,
          tone === "rejected" ? styles.rejectedText : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function InlineMessage({ text, tone }: { text: string; tone: "error" | "info" }) {
  return (
    <View style={[styles.message, tone === "error" ? styles.errorMessage : null]}>
      <Text style={styles.messageText}>{text}</Text>
    </View>
  );
}

function extractInviteToken(value: string) {
  const match = value.match(/\/moderate\/([^/?#]+)/);
  return decodeURIComponent(match?.[1] ?? value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  });
}

const styles = StyleSheet.create({
  actionRow: {
    gap: 10,
    marginTop: 18,
  },
  approvedText: {
    color: "#16A34A",
  },
  centered: {
    alignItems: "center",
    flex: 1,
    gap: 16,
    justifyContent: "center",
  },
  description: {
    color: "#6F594B",
    fontSize: 15,
    lineHeight: 22,
  },
  disabledButton: {
    opacity: 0.56,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8DDD1",
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 24,
  },
  emptyTitle: {
    color: "#1D1108",
    fontSize: 20,
    fontWeight: "800",
  },
  errorMessage: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  eyebrow: {
    color: "#D4562B",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  formGroup: {
    gap: 8,
  },
  header: {
    alignItems: "flex-start",
    borderBottomColor: "#E8DDD1",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  helperText: {
    color: "#8A6B55",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E8DDD1",
    borderRadius: 10,
    borderWidth: 1,
    color: "#1D1108",
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    color: "#1D1108",
    fontSize: 13,
    fontWeight: "800",
  },
  loadingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  loginShell: {
    flex: 1,
    gap: 20,
    justifyContent: "center",
    padding: 20,
  },
  message: {
    backgroundColor: "#F4EDE1",
    borderColor: "#E8DDD1",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  messageText: {
    color: "#1D1108",
    fontSize: 14,
    lineHeight: 20,
  },
  mutedText: {
    color: "#8A6B55",
    fontSize: 13,
    lineHeight: 18,
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E8DDD1",
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
    padding: 14,
  },
  notificationText: {
    gap: 4,
  },
  photo: {
    aspectRatio: 4 / 3,
    backgroundColor: "#F4EDE1",
    width: "100%",
  },
  photoGuest: {
    color: "#1D1108",
    fontSize: 20,
    fontWeight: "800",
  },
  photoMessage: {
    color: "#6F594B",
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 22,
    marginTop: 12,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#D4562B",
    borderRadius: 10,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  queue: {
    gap: 10,
  },
  queueItem: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E8DDD1",
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
  },
  queueItemActive: {
    borderColor: "#D4562B",
  },
  queueTitle: {
    color: "#1D1108",
    fontSize: 15,
    fontWeight: "800",
  },
  rejectedText: {
    color: "#DC2626",
  },
  reviewBody: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E8DDD1",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  screen: {
    backgroundColor: "#FBF5EE",
    flex: 1,
  },
  scrollContent: {
    gap: 18,
    padding: 16,
    paddingBottom: 32,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(220,38,38,0.35)",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "800",
  },
  sectionTitle: {
    color: "#1D1108",
    fontSize: 16,
    fontWeight: "800",
  },
  summaryLabel: {
    color: "#8A6B55",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  summaryTile: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E8DDD1",
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  summaryValue: {
    color: "#D4562B",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },
  title: {
    color: "#1D1108",
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 36,
    marginTop: 6,
  },
  tokenInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
});
