import { api } from "@/utils/api/instanse";

interface RateSpotParams {
  objectId: string;
  rating: number;
}

export const rateSpot = async (params: RateSpotParams) => {
  return await api.post('/spot/rating', params);
};
