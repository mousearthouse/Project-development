import { api } from "@/utils/api/instanse";

export const postUserLogin = async ({
    params,
    config,
}: RequestParams<LoginParams>) =>
    api.post<TokenResponse>('/auth/login', params, config);