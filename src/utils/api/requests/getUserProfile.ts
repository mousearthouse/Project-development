import { api } from "@/utils/api/instanse";

export const getUserProfile = async () => {
     return api.get<ProfileDto>('/user/profile');
}
   