type RequestParams<Params = undefined> = Params extends undefined
? { config?: RequestOptions }
: { params: Params; config?: RequestOptions };


interface LoginParams {
    username: string;
    password: string;
}
  
interface TokenResponse {
  accessToken: string;
  refreshToken: string
}

interface ProfileDto {
  id: string;
  username?: string;
  email?: string;
  proneNumber?: string;
}