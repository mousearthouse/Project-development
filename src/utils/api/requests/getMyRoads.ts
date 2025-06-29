import { api } from "@/utils/api/instanse";

export interface MyRoadPoint {
  id: string;
  latitude: number;
  longitude: number;
  type: string;
  createDate: string;
  parentPointId: string | null;
}

export interface MyRoad {
  id: string;
  authorId: string;
  rating: number;
  fileId?: string;
  name?: string;
  description?: string;
  points: MyRoadPoint[];
}

export const getMyRoads = async () => {
  return await api.get<MyRoad[]>('/road/my');
};
