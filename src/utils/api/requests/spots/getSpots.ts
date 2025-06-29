import { api } from "@/utils/api/instanse";

export const getSpots = async () => {
  return await api.get<Spot[]>('/spot');
};
