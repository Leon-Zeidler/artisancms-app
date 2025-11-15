import { User } from "@supabase/supabase-js";

// Die zentrale Definition für ein Projekt
export type Project = {
  id: string; // <-- FIX: Geändert von 'number' zu 'string'
  user_id: string;
  title: string | null;
  "project-date": string | null;
  ai_description: string | null;
  status: "Published" | "Draft" | string | null;
  created_at: string;
  notes: string | null;
  after_image_url: string | null;
  after_image_storage_path: string | null;
  before_image_url: string | null;
  before_image_storage_path: string | null;
  gallery_images: { url: string; path: string }[] | null;
};

// Props für das ProjectForm-Interface
export interface ProjectFormProps {
  currentUser: User;
  userSlug: string | null;
  initialData: Project | null; // Null bei neuem Projekt
}
