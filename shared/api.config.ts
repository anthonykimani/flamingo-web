const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV;
const APP_API_KEY = process.env.NEXT_PUBLIC_APP_API_KEY;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;

const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
const gamesApiBaseUrl = process.env.NEXT_PUBLIC_GAMESERVICE_BASE_URL;

export const apiOptions = {
    env: APP_ENV,
    apiKey: APP_API_KEY,
    name: APP_NAME,
    endpoints: {
        appUrl: `${appBaseUrl}`,
        gameService: `${gamesApiBaseUrl}`
    }
}