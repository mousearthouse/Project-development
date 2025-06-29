import { api } from '@/utils/api/instanse'

export interface UpdateProfileRequest {
  email?: string
  username?: string
  phoneNumber?: string
      avatarId?:string
}

export interface UpdateProfileResponse {
  id: string
  username?: string
  email?: string
  phoneNumber?: string
    avatarId?:string
}

export const updateUserProfile = async (data: UpdateProfileRequest) => {
  return api.put<UpdateProfileResponse>('/user/profile', data, {
    headers: {
      'Content-Type': 'application/json-patch+json',
    },
  })
}
