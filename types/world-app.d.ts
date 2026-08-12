interface WorldAppUserVerificationStatus {
  is_orb_verified: boolean
  is_document_verified: boolean
  is_secure_document_verified: boolean
}

interface WorldAppCommand {
  name: string
  supported_versions: number[]
}

interface WorldAppPayload {
  world_app_version: number
  device_os: "ios" | "android"
  is_optional_analytics: boolean
  wallet_address: string
  verification_status: WorldAppUserVerificationStatus
  preferred_currency: string
  pending_notifications: number
  supported_commands: WorldAppCommand[]
  safe_area_insets: {
    top: number
    right: number
    bottom: number
    left: number
  }
  location?: { open_origin: string } | null
}

declare global {
  interface Window {
    WorldApp?: WorldAppPayload
  }
}

export {}
