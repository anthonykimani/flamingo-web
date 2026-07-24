/**
 * Client-side auth token store.
 *
 * Two token types coexist:
 *  - wallet JWT (localStorage 'token') — minted by use-wallet-auth; hosts
 *    and wallet players. Full API access.
 *  - guest token (sessionStorage 'guest_token') — issued by POST /games/join;
 *    binds this tab to one player identity in one game session.
 */

export const WALLET_TOKEN_KEY = 'token';
export const GUEST_TOKEN_KEY = 'guest_token';

/** Read the JWT exp claim without verifying (the server verifies). */
function isExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
    } catch {
        return true; // undecodable — treat as unusable
    }
}

/**
 * Best available token: wallet JWT first (host powers), then guest token.
 * Expired tokens are skipped so a stale wallet token never locks a guest
 * out of gameplay.
 */
export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    const wallet = localStorage.getItem(WALLET_TOKEN_KEY);
    if (wallet && !isExpired(wallet)) return wallet;

    const guest = sessionStorage.getItem(GUEST_TOKEN_KEY);
    if (guest && !isExpired(guest)) return guest;

    return null;
}

export function setGuestToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(GUEST_TOKEN_KEY, token);
}

export function clearGuestToken(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(GUEST_TOKEN_KEY);
}
