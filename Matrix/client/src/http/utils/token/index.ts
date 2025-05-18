/**
 * 网络请求 Token 处理方法工具
 * @author Prk<code@imprk.me>
 */

const TOKEN_KEY: string = '__prk_token';

/**
 * 获取 Token
 * @author Prk<code@imprk.me>
 * 
 * @return {string | null} Token 如有
 */
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY) ?? null;

/**
 * 设置 Token
 * @author Prk<code@imprk.me>
 * 
 * @param {string} token 欲要设定的 Token
 * 
 * @return {void} 什么都不会返回
 */
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);

/**
 * 清空 Token
 * @author Prk<code@imprk.me>
 * 
 * @return {void} 什么都不会返回
 */
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

/**
 * 判断当前的请求是不是登录注册请求
 * @author Prk<code@imprk.me>
 * 
 * @param {InternalAxiosRequestConfig} config 请求实例配置
 * 
 * @return {boolean} 是不是登录注册请求
 */
export const isAuthRequest = (config: { __isAuthRequest?: boolean; }): boolean => !!config.__isAuthRequest;
