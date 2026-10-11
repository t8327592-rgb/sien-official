type Environment = Record<string, string | undefined>;
export function adminIntegrationStatuses(env: Environment) {
  const groups = [
    { name: "Google Calendar", description: "納期自動登録API", keys: ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY", "GOOGLE_CALENDAR_ID"] },
    { name: "Discord 通知", description: "新規依頼の通知先", keys: ["DISCORD_WEBHOOK_URL"] },
    { name: "SMTP メール", description: "管理者通知（お客様への自動返信なし）", keys: ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "ADMIN_NOTIFICATION_EMAIL"] },
  ];
  return groups.map(group => {
    const present = group.keys.some(key => Boolean(env[key]?.trim()));
    let configured = group.keys.every(key => Boolean(env[key]?.trim()));
    if (group.name === "SMTP メール") {
      const authenticated = Boolean(env.SMTP_USER?.trim() && env.SMTP_PASS?.trim());
      configured = Boolean((env.SMTP_HOST?.trim() || authenticated) && (env.SMTP_FROM?.trim() || env.SMTP_USER?.trim()) && (env.ADMIN_NOTIFICATION_EMAIL?.trim() || env.SMTP_USER?.trim()));
    }
    if (group.name === "Discord 通知" && present) {
      configured = /^https:\/\/(?:discord(?:app)?\.com)\/api\/webhooks\/[^/]+\/[^\s]+$/.test(env.DISCORD_WEBHOOK_URL || "");
    }
    return { ...group, state: configured ? "configured" : present ? "incomplete" : "missing", label: configured ? "設定あり・接続未確認" : present ? "設定を確認" : "未設定" };
  });
}
