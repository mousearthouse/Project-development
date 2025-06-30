import { api } from "@/utils/api/instanse";

export interface SpotRating {
  rating: number;
}

export const getSpotRating = async (spotId: string) => {
  return await api.get<SpotRating>(`/spot/${spotId}/rating`);
};
