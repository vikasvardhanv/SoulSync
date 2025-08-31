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
  const form = new FormData();
  for (const f of files) form.append("files", f);
  const { data } = await api.post<{ urls: string[] }>("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data.urls;
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
