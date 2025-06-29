import { api } from "@/utils/api/instanse";

export const addToFavorites = async (spotId: string) => {
  return await api.post(`/spot/favorites/${spotId}`, {});
};
