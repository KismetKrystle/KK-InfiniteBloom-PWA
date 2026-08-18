import { sql } from './db'

export const MAX_DEVICES = 2

function parseDeviceLabel(userAgent: string | null): string | null {
  if (!userAgent) return null

  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Chrome\//.test(userAgent)
      ? 'Chrome'
      : /Safari\//.test(userAgent) && !/Chrome/.test(userAgent)
        ? 'Safari'
        : /Firefox\//.test(userAgent)
          ? 'Firefox'
          : 'Browser'

  const os = /iPhone|iPad/.test(userAgent)
    ? 'iPhone/iPad'
    : /Android/.test(userAgent)
      ? 'Android'
      : /Macintosh/.test(userAgent)
        ? 'Mac'
        : /Windows/.test(userAgent)
          ? 'Windows'
          : 'device'

  return `${browser} on ${os}`
}

// Registers this device against the purchaser's account the first time it's
// seen, capped at MAX_DEVICES. Fails open (allowed: true) if the profile
// can't be resolved — a technical hiccup should never lock out a purchaser.
export async function checkDeviceAccess(
  authUserId: string,
  deviceFingerprint: string,
  userAgent: string | null
): Promise<{ allowed: boolean }> {
  const profileRows = await sql`
    SELECT id FROM user_profiles WHERE auth_user_id = ${authUserId}
  `
  const profileId = profileRows[0]?.id
  if (!profileId) return { allowed: true }

  const existing = await sql`
    SELECT id FROM user_devices
    WHERE user_id = ${profileId} AND device_fingerprint = ${deviceFingerprint}
  `
  if (existing.length > 0) {
    await sql`UPDATE user_devices SET last_seen = NOW() WHERE id = ${existing[0].id}`
    return { allowed: true }
  }

  const countRows = await sql`
    SELECT COUNT(*) AS count FROM user_devices WHERE user_id = ${profileId}
  `
  if (Number(countRows[0]?.count ?? 0) >= MAX_DEVICES) {
    return { allowed: false }
  }

  await sql`
    INSERT INTO user_devices (user_id, device_fingerprint, device_label)
    VALUES (${profileId}, ${deviceFingerprint}, ${parseDeviceLabel(userAgent)})
    ON CONFLICT (user_id, device_fingerprint) DO NOTHING
  `
  return { allowed: true }
}
