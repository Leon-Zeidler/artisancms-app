// src/components/ProjectGalleryManager.tsx
"use client";

import React, { useState, useMemo } from 'react';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { Project } from './ProjectForm'; // <-- Make sure this is imported

// --- Icons (Omitted for brevity) ---
const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /> </svg> );
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );


type GalleryImage = { url: string; path: string; };

// --- (FIX 1: Update Props) ---
interface ProjectGalleryManagerProps {
  projectId: string; // <-- Changed from 'project'
  userId: string; // <-- Changed from 'user'
  initialGalleryImages: GalleryImage[];
  onGalleryUpdate: (newGallery: GalleryImage[]) => void;
}

export default function ProjectGalleryManager({ 
  projectId, 
  userId, 
  initialGalleryImages, 
  onGalleryUpdate 
}: ProjectGalleryManagerProps) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [gallery, setGallery] = useState<GalleryImage[]>(initialGalleryImages); // <-- Use prop
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const updateGalleryInSupabase = async (newGallery: GalleryImage[]) => {
    const { error } = await supabase
      .from('projects')
      .update({ gallery_images: newGallery })
      .eq('id', projectId); // <-- Use prop
    if (error) { toast.error(`Gallery update failed: ${error.message}`); return false; }
    return true;
  };

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) { return; }
    setIsUploading(true);
    const files = Array.from(event.target.files);
    const uploadPromises = files.map(file => {
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${userId}/${projectId}/${fileName}`; // <-- Use props

      return supabase.storage
        .from('project-images')
        .upload(filePath, file)
        .then(result => {
          if (result.error) throw result.error;
          const { data: urlData } = supabase.storage.from('project-images').getPublicUrl(result.data.path);
          return { url: urlData.publicUrl, path: result.data.path };
        });
    });

    const toastId = toast.loading(`Uploading ${files.length} image(s)...`);
    try {
      const newImages = await Promise.all(uploadPromises);
      const newGallery = [...gallery, ...newImages];
      const success = await updateGalleryInSupabase(newGallery);
      if (success) {
        setGallery(newGallery);
        onGalleryUpdate(newGallery); // <-- (FIX 2: Call the callback)
        toast.success(`Successfully added ${files.length} image(s)!`, { id: toastId });
      } else {
        toast.error('Failed to save new images to project.', { id: toastId });
      }
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`, { id: toastId });
    }
    setIsUploading(false);
    event.target.value = '';
  };

  const handleImageDelete = async (image: GalleryImage) => {
    if (!window.confirm("Are you sure you want to delete this image from the gallery?")) { return; }
    setIsDeleting(image.path);
    const toastId = toast.loading('Deleting image...');

    try {
      const { error: storageError } = await supabase.storage.from('project-images').remove([image.path]);
      if (storageError) throw storageError;

      const newGallery = gallery.filter(img => img.path !== image.path);
      const success = await updateGalleryInSupabase(newGallery);
      if (success) {
        setGallery(newGallery);
        onGalleryUpdate(newGallery); // <-- (FIX 3: Call the callback)
        toast.success('Image deleted.', { id: toastId });
      } else {
        toast.error('Failed to update gallery in database.', { id: toastId });
      }
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`, { id: toastId });
    }
    setIsDeleting(null);
  };

  // --- (Render function is unchanged) ---
  return (
    <section className="pt-8">
      <h2 className="text-xl font-semibold text-white mb-6">Project Gallery</h2>
      <div className="space-y-6">
        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((image) => (
              <div key={image.path} className="relative group aspect-square">
                <img src={image.url} alt="Project gallery image" className="w-full h-full object-cover rounded-md border border-slate-700" />
                <button type="button" onClick={() => handleImageDelete(image)} disabled={isDeleting === image.path || isUploading} className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Delete image">
                  {isDeleting === image.path ? <ArrowPathIcon className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg">
            <PhotoIcon className="mx-auto h-12 w-12 text-slate-500" />
            <h3 className="mt-2 text-sm font-semibold text-slate-300">Empty Gallery</h3>
            <p className="mt-1 text-sm text-slate-400">Add images using the uploader below.</p>
          </div>
        )}
        <div>
          <label htmlFor="galleryUpload" className="mb-2 block text-sm font-medium text-slate-300"> Add Images to Gallery </label>
          <input type="file" id="galleryUpload" multiple accept="image/png, image/jpeg, image/webp" onChange={handleGalleryUpload} disabled={isUploading || !!isDeleting} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-slate-800 disabled:opacity-50" />
          {isUploading && (
            <p className="mt-2 text-xs text-orange-400 flex items-center gap-2">
              <ArrowPathIcon className="h-4 w-4" />
              Uploading, please wait...
            </p>
          )}
        </div>
      </div>
    </section>
  );
}