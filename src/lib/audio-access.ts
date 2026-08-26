import { sql } from "@/lib/db"

export interface AudioAccess {
  purchased: boolean
  claimed: boolean
  hasAccess: boolean
}

// Any completed purchase (flipbook, ebook, physical, bundle) unlocks full
// audio, same as the pre-existing behavior on the audio page — this isn't
// scoped to a single product the way flipbook access is.
export async function getAudioAccess(authUserId: string | undefined): Promise<AudioAccess> {
  if (!authUserId) return { purchased: false, claimed: false, hasAccess: false }

  const [purchaseRows, claimRows] = await Promise.all([
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
  ])

  const purchased = purchaseRows.length > 0
  const claimed = claimRows.length > 0
  return { purchased, claimed, hasAccess: purchased || claimed }
}
