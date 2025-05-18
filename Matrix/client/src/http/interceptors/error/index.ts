/**
 * 统一失败错误
 */

import { ElNotification } from 'element-plus';
import type { ResponseData } from '../../types';

type ErrorType = Error & {
    response?: {
        data: ResponseData<any>;
    };
};

export default (error: ErrorType): Promise<void> => {
    const message: string = error.response?.data?.message ?? error.message ?? '请求失败，请检查网络！';

    ElNotification({
        type: 'warning',
        title: '请求失败',
        message
    });

    return Promise.reject(
        new Error(message)
    );
};
