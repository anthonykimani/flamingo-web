import axios from "axios";
import { IResponse } from "../interfaces/IResponse";
import { apiOptions } from "./api.config";

interface Params {
  headers: any;
}

const getHttpConfig = (): Params => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
    apiKey: `${apiOptions.apiKey}`,
  },
});

const Http = {
  /**
   * Post request
   * @param url Url endpoint path
   * @param data Post data
   * @returns Promise<IResponse>
   */
  post: async function (url: string, data: any): Promise<IResponse> {
    const httpConfig = getHttpConfig(); 
    console.log("url", url, data, httpConfig.headers.Authorization)
    try {
      let response = await axios({
        ...httpConfig,
        url: `${url}`,
        data,
        method: "post",
      });

      return {
        payload: response.data,
        status: response.status,
        message: response.statusText,
      };
    } catch (er) {
      console.log(er);
      return {
        payload: undefined,
        status: 512,
        message: er,
      };
    }
  },

  /**
   * Get request
   * @param url Url endpoint path
   * @param data Get data
   * @returns Promise<IResponse>
   */
  get: async function (url: string): Promise<IResponse> {
    const httpConfig = getHttpConfig(); 
    try {
      let response = await axios({
        ...httpConfig,
        url: `${url}`,
        method: "get",
      });

      return {
        payload: response.data,
        status: response.status,
        message: response.statusText,
      };
    } catch (er) {
      return {
        payload: undefined,
        status: 512,
        message: er,
      };
    }
  },

  /**
   * delete request
   * @param url Url endpoint path
   * @param data Delete data
   * @returns Promise<IResponse>
   */
  delete: async function (url: string, data: any): Promise<IResponse> {
    const httpConfig = getHttpConfig(); 
    try {
      let response = await axios({
        ...httpConfig,
        url: `${url}`,
        data,
        method: "delete",
      });

      return {
        payload: response.data,
        status: response.status,
        message: response.statusText,
      };
    } catch (er) {
      return {
        payload: undefined,
        status: 512,
        message: er,
      };
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