import nodemailer from "nodemailer";

export const sendMail = async ({
  to,
  subject,
  text,
  html,
  messageId,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  messageId?: string;
}) => {
  if (!process.env.SMTP_HOST && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) throw new Error("SMTP_NOT_CONFIGURED");
  const transporter = nodemailer.createTransport({
    ...(process.env.SMTP_HOST ? { host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_PORT === "465" } : { service: "gmail" }),
    auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });

  try {
    const info = await transporter.sendMail({
      from: `"Sien-Official" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
      messageId,
    });

    if (!info.accepted.length || info.rejected.length) throw new Error("SMTP_REJECTED");
    return { success: true as const };
  } finally { transporter.close(); }
};
