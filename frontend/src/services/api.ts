// frontend/src/services/api.ts
import axios from "axios";
import toast from "react-hot-toast";

const baseURL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL,
  withCredentials: false,
  timeout: 15_000
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const message = err?.response?.data?.error || err.message || "Request failed";
    toast.error(message);
    return Promise.reject(err);
  }
);

export async function uploadPhotos(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  
  for (const file of files) {
    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result;
          if (typeof result === 'string') {
            resolve(result);
          } else {
            reject(new Error('Failed to convert file to base64'));
          }
        };
        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsDataURL(file);
      });

      // Get auth token
      const token = localStorage.getItem('token');
      
      // Upload via our base64 API
      const { data } = await api.post('/images/upload', {
        image: base64Data,
        filename: file.name,
        mimetype: file.type
      }, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      if (data.success) {
        urls.push(data.data.imageUrl);
      } else {
        // Fall back to base64 for immediate display if API fails
        console.warn(`API upload failed for ${file.name}, using base64 fallback`);
        urls.push(base64Data);
      }
    } catch (error) {
      console.error(`Failed to process ${file.name}:`, error);
      // Convert to base64 for local display as fallback
      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        urls.push(base64Data);
      } catch (fallbackError) {
        console.error(`Complete failure for ${file.name}:`, fallbackError);
        throw new Error(`Cannot process file: ${file.name}`);
      }
    }
  }
  
  return urls;
}

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
  age: number;
  bio?: string;
  location?: string;
  interests: string[];
  photos: string[];
}) {
  const { data } = await api.post("/auth/signup", payload);
  toast.success("Welcome to SoulSync");
  return data;
}
