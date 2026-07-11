"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  EventModerationMode,
  EventStatus,
  ModeratorStatus,
} from "@/generated/prisma/enums";
import { requireAdmin } from "@/lib/admin";
import { sendModeratorInviteEmail } from "@/lib/email/moderator-invite";
import { createSecretToken, hashSecretToken } from "@/lib/moderation/token";
import { prisma } from "@/lib/prisma";
import { buildEventSlug } from "@/lib/slug";
import {
  isSupportedImageType,
  saveEventInvitation,
} from "@/lib/storage";

const DEFAULT_AUTHORIZATION_TEXT =
  "Ao enviar, você autoriza que esta foto apareça no telão da festa após moderação. Envie apenas fotos que você se sente confortável em compartilhar neste evento.";
const DEFAULT_PRIMARY_COLOR = "#D4562B";
const DEFAULT_SECONDARY_COLOR = "#FBF5EE";
const MAX_INVITATION_SIZE_BYTES = 20 * 1024 * 1024;

function parseModerationMode(value: FormDataEntryValue | null) {
  return value === EventModerationMode.WITHOUT_MODERATION
    ? EventModerationMode.WITHOUT_MODERATION
    : EventModerationMode.WITH_MODERATION;
}

export async function createEventAction(formData: FormData) {
  const admin = await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const primaryColor = String(formData.get("primaryColor") ?? "").trim();
  const secondaryColor = String(formData.get("secondaryColor") ?? "").trim();
  const moderationMode = parseModerationMode(formData.get("moderationMode"));
  const authorizationText = String(
    formData.get("authorizationText") ?? DEFAULT_AUTHORIZATION_TEXT,
  ).trim();

  if (!name) {
    throw new Error("Nome do evento e obrigatorio.");
  }

  const event = await prisma.event.create({
    data: {
      adminId: admin.id,
      name,
      eventDate: eventDate ? new Date(`${eventDate}T12:00:00`) : null,
      moderationMode,
      publicSlug: buildEventSlug(name),
      primaryColor: primaryColor || DEFAULT_PRIMARY_COLOR,
      secondaryColor: secondaryColor || DEFAULT_SECONDARY_COLOR,
      authorizationText: authorizationText || DEFAULT_AUTHORIZATION_TEXT,
    },
  });

  revalidatePath("/admin");
  redirect(`/admin/events/${event.id}`);
}

export async function updateEventStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const eventId = String(formData.get("eventId") ?? "");
  const status = String(formData.get("status") ?? "") as EventStatus;

  if (!Object.values(EventStatus).includes(status)) {
    throw new Error("Status inválido.");
  }

  await prisma.event.updateMany({
    where: {
      id: eventId,
      adminId: admin.id,
    },
    data: {
      status,
      closedAt: status === EventStatus.CLOSED ? new Date() : null,
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/events/${eventId}`);
}

export async function createModeratorAction(formData: FormData) {
 const admin = await requireAdmin();
 const eventId = String(formData.get("eventId") ?? "");
 const name = String(formData.get("name") ?? "").trim();
 const email = String(formData.get("email") ?? "").trim().toLowerCase();

 if (!name) {
 throw new Error("Nome do moderador é obrigatório.");
 }

 if (email && !isValidEmail(email)) {
 throw new Error("E-mail do moderador inválido.");
 }

 const event = await prisma.event.findFirst({
 where: {
 id: eventId,
 adminId: admin.id,
 },
 select: {
 id: true,
 name: true,
 publicSlug: true,
 },
 });

 if (!event) {
 throw new Error("Evento não encontrado.");
 }

 const token = createSecretToken();
 const baseUrl = process.env.NEXTAUTH_URL ?? "http://127.0.0.1:3000";
 const inviteUrl = `${baseUrl}/moderate/${token}`;
 let inviteStatus = "manual";
 let inviteReason = "";

 await prisma.moderator.create({
 data: {
 email: email || null,
 eventId: event.id,
 name,
 tokenHash: hashSecretToken(token),
 },
 });

 if (email) {
 const emailResult = await sendModeratorInviteEmail({
 eventName: event.name,
 inviteUrl,
 moderatorEmail: email,
 moderatorName: name,
 });
 inviteStatus = emailResult.status;
 inviteReason = "reason" in emailResult ? emailResult.reason : "";
 }

 revalidatePath(`/admin/events/${event.id}`);
 const redirectParams = new URLSearchParams({
 moderatorToken: token,
 inviteStatus,
 });

 if (email) {
 redirectParams.set("moderatorEmail", email);
 }

 if (inviteReason) {
 redirectParams.set("inviteReason", inviteReason);
 }

 redirect(`/admin/events/${event.id}?${redirectParams.toString()}`);
}

function isValidEmail(value: string) {
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function revokeModeratorAction(formData: FormData) {
  const admin = await requireAdmin();
  const eventId = String(formData.get("eventId") ?? "");
  const moderatorId = String(formData.get("moderatorId") ?? "");

  const moderator = await prisma.moderator.findFirst({
    where: {
      id: moderatorId,
      eventId,
      event: {
        adminId: admin.id,
      },
    },
    select: {
      id: true,
      eventId: true,
      status: true,
    },
  });

  if (!moderator) {
    throw new Error("Moderador não encontrado.");
  }

  if (moderator.status !== ModeratorStatus.REVOKED) {
    await prisma.moderator.update({
      where: { id: moderator.id },
      data: {
        revokedAt: new Date(),
        status: ModeratorStatus.REVOKED,
      },
    });
  }

  revalidatePath(`/admin/events/${moderator.eventId}`);
}

export async function updateEventSettingsAction(formData: FormData) {
  const admin = await requireAdmin();
  const eventId = String(formData.get("eventId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const primaryColor = String(formData.get("primaryColor") ?? "").trim();
  const secondaryColor = String(formData.get("secondaryColor") ?? "").trim();
  const moderationMode = parseModerationMode(formData.get("moderationMode"));
  const galleryEnabled = formData.get("galleryEnabled") === "on";
  const authorizationText = String(
    formData.get("authorizationText") ?? DEFAULT_AUTHORIZATION_TEXT,
  ).trim();
  const invitationFile = formData.get("invitationImage");
  const removeInvitationImage = formData.get("removeInvitationImage") === "on";

  if (!name) {
    throw new Error("Nome do evento e obrigatorio.");
  }

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      adminId: admin.id,
    },
    select: {
      id: true,
      publicSlug: true,
    },
  });

  if (!event) {
    throw new Error("Evento não encontrado.");
  }

  let invitationImageUrl: null | string | undefined = removeInvitationImage
    ? null
    : undefined;

  if (invitationFile instanceof File && invitationFile.size > 0) {
    if (!isSupportedImageType(invitationFile.type)) {
      throw new Error("Formato de convite não suportado.");
    }

    if (invitationFile.size > MAX_INVITATION_SIZE_BYTES) {
      throw new Error("A imagem do convite deve ter até 20 MB.");
    }

    const storedInvitation = await saveEventInvitation({
      eventId: event.id,
      file: invitationFile,
    });
    invitationImageUrl = storedInvitation.invitationImageUrl;
  }

  await prisma.event.update({
    where: {
      id: event.id,
    },
    data: {
      authorizationText: authorizationText || DEFAULT_AUTHORIZATION_TEXT,
      eventDate: eventDate ? new Date(`${eventDate}T12:00:00`) : null,
      galleryEnabled,
      invitationImageUrl,
      moderationMode,
      name,
      primaryColor: primaryColor || DEFAULT_PRIMARY_COLOR,
      secondaryColor: secondaryColor || DEFAULT_SECONDARY_COLOR,
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/events/${event.id}`);
  revalidatePath(`/e/${event.publicSlug}`);
  revalidatePath(`/screen/${event.publicSlug}`);
  revalidatePath(`/t/${event.publicSlug}`);
  revalidatePath(`/gallery/${event.publicSlug}`);
}
