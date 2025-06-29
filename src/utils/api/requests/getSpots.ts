import { api } from "@/utils/api/instanse";

export interface Spot {
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

export const getSpots = async () => {
  return await api.get<Spot[]>('/spot');
};
