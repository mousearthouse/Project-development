import { api } from "@/utils/api/instanse";

export const deleteApproveDeleteSpot = async (id: string) => {
  return await api.delete(`/spot/${id}/approve`);
};
