import { Resend } from "resend";

type SendModeratorInviteInput = {
  eventName: string;
  inviteUrl: string;
  moderatorEmail: string;
  moderatorName: string;
};

type InviteEmailResult =
  | { status: "sent" }
  | { reason: string; status: "not_configured" }
  | { reason: string; status: "failed" };

export async function sendModeratorInviteEmail({
  eventName,
  inviteUrl,
  moderatorEmail,
  moderatorName,
}: SendModeratorInviteInput): Promise<InviteEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim();
  const replyTo = process.env.EMAIL_REPLY_TO?.trim();

  if (!apiKey || !from) {
    return {
      reason: "Configure RESEND_API_KEY e EMAIL_FROM para enviar convites por e-mail.",
      status: "not_configured",
    };
  }

  const resend = new Resend(apiKey);
  const subject = `Convite para moderar fotos - ${eventName}`;
  const text = [
    `Olá, ${moderatorName}.`,
    "",
    `Você foi convidado para moderar as fotos do evento "${eventName}" no Revela.`,
    "",
    "Acesse o link individual:",
    inviteUrl,
    "",
    "Esse link deve ser usado apenas por você.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1D1108; line-height: 1.5;">
      <p>Olá, <strong>${escapeHtml(moderatorName)}</strong>.</p>
      <p>Você foi convidado para moderar as fotos do evento <strong>${escapeHtml(eventName)}</strong> no Revela.</p>
      <p>
        <a href="${inviteUrl}" style="display: inline-block; background: #D4562B; color: #fff; padding: 12px 16px; border-radius: 8px; text-decoration: none; font-weight: 700;">
          Abrir moderação
        </a>
      </p>
      <p style="font-size: 13px; color: #8A6B55;">Esse link é individual e deve ser usado apenas por você.</p>
      <p style="font-size: 13px; color: #8A6B55;">Se o botão não abrir, copie este link:<br>${inviteUrl}</p>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from,
      html,
      replyTo: replyTo || undefined,
      subject,
      text,
      to: [moderatorEmail],
    });

    if (error) {
      return {
        reason: error.message ?? "Resend recusou o envio.",
        status: "failed",
      };
    }

    return { status: "sent" };
  } catch (error) {
    return {
      reason: error instanceof Error ? error.message : "Falha inesperada no envio.",
      status: "failed",
    };
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
