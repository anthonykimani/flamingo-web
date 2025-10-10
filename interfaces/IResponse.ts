/**TODO: move to library when ready */
export interface IResponse {
  ok?: any;
  statusText?: any;
  json?(): any;
  payload: any;
  status: number;
  message: any;
  errors?: any;
}
