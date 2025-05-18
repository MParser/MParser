import { setToken } from '../../utils/token';
import { ElNotification } from 'element-plus';
import type { AxiosResponse } from 'axios';
import type { ResponseData } from '../../types';

export default <T>(response: AxiosResponse): Promise<T> => {
    // 如果请求包含新的 Token，就自动设置
    if (response.headers['Authorization']) {
        setToken(response.headers['Authorization']);
    }

    const data: ResponseData<T> = response.data;

    // 响应体码是 200 为成功，否则均为失败！
    if (200 !== data.code) {
        const message: string = data.message ?? '未知错误，请稍后重试！';
        ElNotification({
            type: 'warning',
            title: '请求失败',
            message
        });
        return Promise.reject(
            new Error(message)
        );
    }

    return Promise.resolve(data.data);
};
