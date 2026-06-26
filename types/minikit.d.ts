declare module "@worldcoin/minikit-js" {
  interface MiniKitUser {
    walletAddress?: string
    username?: string
    profilePictureUrl?: string
  }

  interface WalletAuthInput {
    nonce: string
    statement?: string
    requestId?: string
    expirationTime?: Date
  }

  interface WalletAuthResult {
    finalPayload: {
      status: "success" | "error"
      message?: string
      signature?: string
      address?: string
    }
  }

  interface AsyncCommands {
    walletAuth(payload: WalletAuthInput): Promise<WalletAuthResult>
  }

  export class MiniKit {
    static install(appId?: string): void
    static isInstalled(debug?: boolean): boolean
    static user: MiniKitUser
    static commandsAsync: AsyncCommands
  }
}
