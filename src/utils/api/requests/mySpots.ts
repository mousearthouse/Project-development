import { api } from "@/utils/api/instanse";
export interface Spot {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  description: string;
  fileId: string;
  createDate: string;  // ISO дата
  authorId: string;
  rating: number;
}

export const getMySpots = async () => {
  return api.get<Spot[]>('/spot/my');
}
