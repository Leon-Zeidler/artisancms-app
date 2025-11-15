// src/components/LogoUploader.tsx
"use client";

import React, { useState, useMemo } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";

// --- Icons ---
const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
    />
  </svg>
);

const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-4 animate-spin"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);
// ---

interface LogoUploaderProps {
  user: User | null;
  onUploadSuccess: (url: string) => void;
  initialLogoUrl: string;
}

export default function LogoUploader({
  user,
  onUploadSuccess,
  initialLogoUrl,
}: LogoUploaderProps) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>(initialLogoUrl);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB Limit
      toast.error("Datei ist zu groß. Max 2MB erlaubt.");
      return;
    }

    // Setze Vorschau
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Sende an die neue API-Route
      const response = await fetch("/api/upload-logo", {
        method: "POST",
        body: formData,
        // Kein 'Content-Type' Header, FormData setzt ihn automatisch mit 'boundary'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload fehlgeschlagen.");
      }

      const data = await response.json();
      onUploadSuccess(data.publicUrl); // Gibt die URL an die Seite zurück
      toast.success("Logo erfolgreich hochgeladen!");
    } catch (error: any) {
      console.error("Logo-Upload-Fehler:", error);
      toast.error(`Fehler: ${error.message}`);
      setLogoPreview(initialLogoUrl); // Setze auf altes Bild zurück
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative">
        {logoPreview ? (
          <img
            src={logoPreview}
            alt="Logo Vorschau"
            className="size-24 rounded-full border border-slate-300 bg-white object-contain p-2 shadow-sm"
          />
        ) : (
          <div className="flex size-24 items-center justify-center rounded-full border border-slate-300 bg-slate-50 text-slate-400">
            <svg
              className="size-10"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
            <ArrowPathIcon className="size-6 text-orange-500" />
          </div>
        )}
      </div>
      <label
        htmlFor="logo-upload"
        className="cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-orange-500 hover:text-orange-500"
      >
        <div className="flex items-center gap-2">
          <UploadIcon />
          <span>{logoPreview ? "Logo ändern..." : "Logo hochladen..."}</span>
        </div>
      </label>
      <input
        type="file"
        id="logo-upload"
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        onChange={handleFileChange}
        className="sr-only"
        disabled={uploading || !user}
      />
      <p className="text-center text-xs text-slate-500">
        Max. 2MB. (PNG, JPG, WEBP)
      </p>
    </div>
  );
}