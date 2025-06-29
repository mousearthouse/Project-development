import { api } from "@/utils/api/instanse";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('fileDto', file);
  
  return await api.post('/file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
