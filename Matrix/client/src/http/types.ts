/**
 * 接口固定响应格式
 * @author Prk<code@imprk.me>
 */

export interface ResponseData <T>{
    /**
     * 请求是否成功
     * @type {boolean}
     * @example true
     */
    success: boolean;

    /**
     * 响应状态码
     * @type {number}
     * @example 200
     */
    code: number;

    /**
     * 消息
     * @type {string}
     * @example 账号密码错误
     */
    message: string;

    /**
     * 数据
     * @type {T}
     */
    data: T;
};
