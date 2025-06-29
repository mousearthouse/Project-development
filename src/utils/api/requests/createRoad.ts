import { api } from "@/utils/api/instanse";

export interface CreateRoadPointDto {
  latitude: number;
  longitude: number;
  type: 'Normal' | 'Bad' | 'Stairs';
}

interface CreateRoadParams {
  rating: number;
  points: CreateRoadPointDto[];
}

export const createRoad = async (params: CreateRoadParams) => {
  return await api.post('/road', params);
};
