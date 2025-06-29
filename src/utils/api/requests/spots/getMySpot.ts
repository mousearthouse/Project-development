import { api } from "@/utils/api/instanse";

export const getMySpots = async () => {
  return await api.get<Spot[]>('/spot/my');
};
