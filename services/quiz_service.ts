import { IQuiz } from "@/interfaces/IQuiz";
import { IResponse } from "@/interfaces/IResponse";
import { apiOptions } from "@/shared/api.config";
import Http from "@/shared/http.config";


export async function addQuiz(gameData: IQuiz): Promise<IResponse> {
    const response = await Http.post(
        `${apiOptions.endpoints.gameService}/quizzes/createQuiz`, gameData
    );

    if (response.payload.status == 200) {
        return {
            message: response.payload.message,
            payload: response.payload.data,
            status: response.payload.status,
            ok: response.ok,
            statusText: response.payload.statusText,
            json: response.payload.json,
        }
    }
    throw new Error(`
        Failed to add reward program: ${response.payload.message}`);
}