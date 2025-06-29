import { api } from "@/utils/api/instanse";

export const putDeclineDeleteSpot = async (id: string) => {
  return await api.put(`/spot/${id}/decline`);
};
