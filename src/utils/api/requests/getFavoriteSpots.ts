import { api } from "@/utils/api/instanse";
import type { Spot } from "./spots/getSpots";

export const getFavoriteSpots = async () => {
  return await api.get<Spot[]>('/spot/favourite');
};
