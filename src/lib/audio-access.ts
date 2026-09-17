import { sql } from "@/lib/db"

export interface AudioAccess {
  purchased: boolean
  claimed: boolean
  granted: boolean
  hasAccess: boolean
}

// Any completed purchase (flipbook, ebook, physical, bundle) unlocks full
// audio, same as the pre-existing behavior on the audio page — this isn't
// scoped to a single product the way flipbook access is.
export async function getAudioAccess(
  authUserId: string | undefined,
  email: string | undefined
): Promise<AudioAccess> {
  if (!authUserId) return { purchased: false, claimed: false, granted: false, hasAccess: false }

  const [purchaseRows, claimRows, grantRows] = await Promise.all([
    sql`
      SELECT 1 FROM purchases pu
      WHERE pu.user_id = (SELECT id FROM user_profiles WHERE auth_user_id = ${authUserId})
        AND pu.status = 'completed'
        AND pu.access_granted = true
      LIMIT 1
    `,
    sql`
      SELECT 1 FROM book_claims bc
      WHERE bc.user_id = (SELECT id FROM user_profiles WHERE auth_user_id = ${authUserId})
        AND bc.status = 'approved'
      LIMIT 1
    `,
    sql`
      SELECT 1 FROM access_grants ag
      WHERE lower(ag.email) = lower(${email ?? ''})
        AND ag.revoked_at IS NULL
        AND (ag.expires_at IS NULL OR ag.expires_at > NOW())
      LIMIT 1
    `,
  ])

  const purchased = purchaseRows.length > 0
  const claimed = claimRows.length > 0
  const granted = grantRows.length > 0
  return { purchased, claimed, granted, hasAccess: purchased || claimed || granted }
}
