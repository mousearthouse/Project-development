import { api } from "@/utils/api/instanse";

export interface RoadPoint {
  id: string;
  latitude: number;
  longitude: number;
  type: 'Normal' | 'Bad' | 'Stairs';
  createDate: string;
  parentPointId: string | null;
}

export interface Road {
  id: string;
  authorId: string;
  rating: number;
  name?: string;
  description?: string;
  fileId?: string;
  points: RoadPoint[];
}

export const getRoads = async () => {
  return await api.get<Road[]>('/road');
};
