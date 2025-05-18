import axios from 'axios';
import requestInterceptor from './interceptors/request';
import responseInterceptor from './interceptors/response';
import handleError from './interceptors/error';
import { isAuthRequest } from './utils/token';

const request = axios.create({
    baseURL: '/api/',
    timeout: 3500
});

request.interceptors.request.use(requestInterceptor, handleError);
request.interceptors.response.use(responseInterceptor, handleError);

export default request;

export {
    isAuthRequest
};
