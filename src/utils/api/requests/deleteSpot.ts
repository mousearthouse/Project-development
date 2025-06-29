import { api } from "@/utils/api/instanse";

export const deleteSpot = async (spotId: string) => {
  return await api.put(`/spot/${spotId}/delete`);
};
