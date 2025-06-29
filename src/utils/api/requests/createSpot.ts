import { api } from "@/utils/api/instanse";

interface CreateSpotParams {
  latitude: number;
  longitude: number;
  rating: number;
}

export const createSpot = async (params: CreateSpotParams) => {
  return await api.post('/spot', params);
};
