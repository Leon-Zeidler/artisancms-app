// src/components/ProjectGalleryManager.tsx
"use client";

import React, { useState, useMemo } from "react";
import { createSupabaseClient } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
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
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
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

interface GalleryImage {
  url: string;
  path: string;
}

interface ProjectGalleryManagerProps {
  projectId: string | number;
  userId: string;
  initialGalleryImages: GalleryImage[];
  onGalleryUpdate: (newGallery: GalleryImage[]) => void;
}

export default function ProjectGalleryManager({
  projectId,
  userId,
  initialGalleryImages,
  onGalleryUpdate,
}: ProjectGalleryManagerProps) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [gallery, setGallery] = useState<GalleryImage[]>(initialGalleryImages);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const updateGalleryInSupabase = async (newGallery: GalleryImage[]) => {
    const { error } = await supabase
      .from("projects")
      .update({ gallery_images: newGallery })
      .eq("id", projectId);
    if (error) {
      toast.error(`Galerie konnte nicht aktualisiert werden: ${error.message}`);
      return false;
    }
    return true;
  };

  const handleGalleryUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    setIsUploading(true);
    const files = Array.from(event.target.files);
    const toastId = toast.loading(`Lade ${files.length} Bild(er) hoch...`);

    try {
      const newImages = await Promise.all(
        files.map(async (file) => {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `${userId}/${projectId}/${fileName}`;

          const uploadResult = await supabase.storage
            .from("project-images")
            .upload(filePath, file);
          if (uploadResult.error) throw uploadResult.error;

          const { data: urlData } = supabase.storage
            .from("project-images")
            .getPublicUrl(uploadResult.data.path);
          return { url: urlData.publicUrl, path: uploadResult.data.path };
        }),
      );

      const newGallery = [...gallery, ...newImages];
      const success = await updateGalleryInSupabase(newGallery);

      if (success) {
        setGallery(newGallery);
        onGalleryUpdate(newGallery);
        toast.success(`${files.length} Bild(er) hinzugefügt!`, { id: toastId });
      } else {
        toast.error("Speichern der neuen Bilder fehlgeschlagen.", {
          id: toastId,
        });
      }
    } catch (error: any) {
      console.error("Upload failed", error);
      toast.error(`Upload fehlgeschlagen: ${error.message}`, { id: toastId });
    }

    setIsUploading(false);
    event.target.value = "";
  };

  const handleImageDelete = async (image: GalleryImage) => {
    if (!window.confirm("Soll dieses Bild wirklich gelöscht werden?")) {
      return;
    }

    setIsDeleting(image.path);
    const toastId = toast.loading("Bild wird entfernt...");

    try {
      const { error: storageError } = await supabase.storage
        .from("project-images")
        .remove([image.path]);
      if (storageError) throw storageError;

      const newGallery = gallery.filter((img) => img.path !== image.path);
      const success = await updateGalleryInSupabase(newGallery);

      if (success) {
        setGallery(newGallery);
        onGalleryUpdate(newGallery);
        toast.success("Bild gelöscht.", { id: toastId });
      } else {
        toast.error("Galerie konnte nicht aktualisiert werden.", {
          id: toastId,
        });
      }
    } catch (error: any) {
      console.error("Delete failed", error);
      toast.error(`Löschen fehlgeschlagen: ${error.message}`, { id: toastId });
    }

    setIsDeleting(null);
  };

  return (
    <section className="space-y-6">
      {gallery.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {gallery.map((image) => (
            <div
              key={image.path}
              className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-orange-100/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt="Project gallery image"
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleImageDelete(image)}
                disabled={isDeleting === image.path || isUploading}
                className="absolute right-2 top-2 inline-flex size-9 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-md shadow-red-100 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Bild löschen"
              >
                {isDeleting === image.path ? (
                  <ArrowPathIcon />
                ) : (
                  <TrashIcon className="size-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/70 px-6 py-12 text-center shadow-sm shadow-orange-100">
          <PhotoIcon className="mx-auto size-12 text-orange-400" />
          <h3 className="mt-4 text-base font-semibold text-slate-800">
            Noch keine Galerie-Bilder
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Fügen Sie weitere Eindrücke hinzu, um Ihr Projekt lebendig zu
            machen.
          </p>
        </div>
      )}

      <div>
        <label
          htmlFor="galleryUpload"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Galerie erweitern
        </label>
        <input
          type="file"
          id="galleryUpload"
          multiple
          accept="image/png, image/jpeg, image/webp"
          onChange={handleGalleryUpload}
          disabled={isUploading || !!isDeleting}
          className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition file:mr-4 file:rounded-full file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:font-semibold file:text-orange-700 hover:file:bg-orange-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-70"
        />
        {isUploading && (
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-orange-600">
            <ArrowPathIcon />
            Bilder werden hochgeladen...
          </p>
        )}
      </div>
    </section>
  );
}
