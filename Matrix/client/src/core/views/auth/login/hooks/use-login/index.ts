import { loginHttp } from '../../api';
import { ElNotification } from 'element-plus';
import type { LoginForm } from '../../types';
import type { FormInstance, FormRules } from 'element-plus';

export const useLogin = () => {
    const { push } = useRouter();
    const { setUser } = useUserStore();

    const loading = ref<boolean>(false);

    const loginFormRef = ref<FormInstance>();

    const loginForm = reactive<LoginForm>({
        email: '',
        password: ''
    });

    const rules = reactive<FormRules<LoginForm>>({
        email: [
            { required: true, message: '请输入邮箱', trigger: 'blur' },
            // { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ]
    });

    const submitForm = (formEl: FormInstance | undefined): void => {
        if (!formEl) return void 0;

        formEl.validate((valid: boolean): void => {
            if (!valid) return void 0;
            onSubmit();
        });
    }

    const onSubmit = async (): Promise<void> => {
        if (loading.value) return void 0;
        loading.value = true;

        try {
            const { user } = await loginHttp({
                username: loginForm.email,
                password: loginForm.password
            });

            ElNotification({
                type: 'success',
                title: '登录成功',
                message: '登录成功，正在跳转至首页！'
            });

            setUser(user);
            push({
                name: 'home'
            });
        } finally {
            loading.value = false;
        }
    };

    return {
        loginFormRef,
        loginForm, rules,
        submitForm
    };
};
