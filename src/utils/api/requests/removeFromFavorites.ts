import { api } from "@/utils/api/instanse";

export const removeFromFavorites = async (spotId: string) => {
  return await api.delete(`/spot/favorites/${spotId}`);
};
