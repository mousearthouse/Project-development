import { api } from "@/utils/api/instanse";

interface RegisterParams {
  username: string;
  email?: string;
  password: string;
  phoneNumber?: string;
  fileId?: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const userRegister = async ({
  params,
  config,
}: RequestParams<RegisterParams>) => 
  api.post<TokenResponse>('/user/register', params, config);
