"use client";

import { useState, useRef } from "react";
import { uploadFile } from "@/lib/file";
import { Button } from "@/components/ui/button";
import { Paperclip, X, Loader2, FileCheck } from "lucide-react";

type Props = {
  onUploaded: (fileId: string, fileUrl: string) => void;
  onClear?: () => void;
  currentFileUrl?: string | null;
  disabled?: boolean;
  label?: string;
};

export default function FileUploadButton({
  onUploaded,
  onClear,
  currentFileUrl,
  disabled,
  label = "Attach Invoice",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const res = await uploadFile(file);
      onUploaded(res.file_id, res.file_url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (currentFileUrl) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={currentFileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          <FileCheck size={13} />
          View Invoice
        </a>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Remove file"
          >
            <X size={13} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Paperclip size={12} />
            {label}
          </>
        )}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
