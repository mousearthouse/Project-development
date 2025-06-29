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
  phoneNumber?: string;
}

interface Spot {
  id: string;
  latitude: number;
  longitude: number;
  createDate: string;
  authorId: string;
  rating: number;
  name?: string;
  description?: string;
  fileId?: string;
}