import { api } from "@/utils/api/instanse";

export const getFileUrl = (fileId: string): string => {
  const baseURL = api.defaults.baseURL || 'http://95.182.120.75:8082/api';
  const cleanBaseURL = baseURL.replace(/\/$/, '');
  return `${cleanBaseURL}/file/${fileId}`;
};
