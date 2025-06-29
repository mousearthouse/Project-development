import { api } from "@/utils/api/instanse";

export const putDeleteSpot = async (id: string) => {
  return await api.put(`/spot/${id}/delete`);
};
