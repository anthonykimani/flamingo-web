import axios, { AxiosError } from "axios";
import { IResponse } from "../interfaces/IResponse";
import { apiOptions } from "./api.config";
import { getAuthToken } from "@/utils/tokens";

interface Params {
  headers: any;
}

const getHttpConfig = (): Params => ({
  headers: {
    Authorization: `Bearer ${getAuthToken() ?? ''}`
  },
});

function extractError(er: unknown): { status: number; message: string } {
  if (er instanceof AxiosError && er.response) {
    return {
      status: er.response.status,
      message: er.response.data?.message || er.response.statusText || er.message,
    };
  }
  if (er instanceof Error) {
    return { status: 512, message: er.message };
  }
  return { status: 512, message: "Unknown error" };
}

const Http = {
  /**
   * Post request
   * @param url Url endpoint path
   * @param data Post data
   * @returns Promise<IResponse>
   */
  post: async function (url: string, data: any): Promise<IResponse> {
    const httpConfig = getHttpConfig(); 
    try {
      let response = await axios({
        url: `${url}`,
        data,
        method: "post",
        ...httpConfig,
      });

      return {
        payload: response.data,
        status: response.status,
        message: response.statusText,
      };
    } catch (er) {
      const { status, message } = extractError(er);
      return { payload: undefined, status, message };
    }
  },

  get: async function (url: string): Promise<IResponse> {
    const httpConfig = getHttpConfig(); 
    try {
      let response = await axios({
        url: `${url}`,
        method: "get",
        ...httpConfig,
      });

      return {
        payload: response.data,
        status: response.status,
        message: response.statusText,
      };
    } catch (er) {
      const { status, message } = extractError(er);
      return { payload: undefined, status, message };
    }
  },

  delete: async function (url: string, data: any): Promise<IResponse> {
    const httpConfig = getHttpConfig(); 
    try {
      let response = await axios({
        url: `${url}`,
        data,
        method: "delete",
        ...httpConfig,
      });

      return {
        payload: response.data,
        status: response.status,
        message: response.statusText,
      };
    } catch (er) {
      const { status, message } = extractError(er);
      return { payload: undefined, status, message };
    }
  },

  /**
   * sets Bearer token
   * @param token 
   */
  setToken: (token: string) => {
    localStorage.setItem('token', token)
  },

  /**
   * Deletes Bearer token
   * 
   */
  deleteToken: () => {
    localStorage.removeItem('token')
  }

  //TODO: implement methods
  //UPDATE
  //PATCH

  // const handleGetNetInfo = () => {
  //   NetInfo.fetch().then(state => {
  //     setNetInfo(state);
  //   });
  // };
};

export default Http;