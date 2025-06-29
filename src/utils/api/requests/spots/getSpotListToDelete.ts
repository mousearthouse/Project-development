import { api } from "@/utils/api/instanse";

export const getSpotListToDelete = async () => {
  return await api.get(`/spot/deleting`);
};
