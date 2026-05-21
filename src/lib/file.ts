import { apiFetch } from "./api";

export interface UploadFileResponse {
  file_id: string;
  file_path: string;
  file_url: string;
}

export async function uploadFile(file: File): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch(`/files/upload`, {
    method: "POST",
    body: formData,
  });

  return res.data;
}

export async function getFileById(fileId: string): Promise<UploadFileResponse> {
  const res = await apiFetch(`/purchase-records/by-item/${fileId}`);
  return res.data;
}

export async function openFileWithAuth(filePath: string): Promise<void> {
  const token = localStorage.getItem("access_token");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/files/proxy/${filePath}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) throw new Error("Failed to fetch file");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
