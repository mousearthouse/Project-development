import { api } from "@/utils/api/instanse";

export const deleteRoad = async (roadId: string) => {
  return await api.put(`/road/${roadId}/delete`);
};
