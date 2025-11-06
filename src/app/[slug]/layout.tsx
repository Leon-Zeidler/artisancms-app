import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import React from 'react';

import { ProfileProvider, type Profile } from '@/contexts/ProfileContext'; 
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { DynamicGlobalStyles } from '@/components/DynamicGlobalStyles'; // <-- 1. IMPORT THE NEW COMPONENT

// --- Helper function to fetch profile by slug ---
async function getProfileBySlug(slug: string): Promise<Profile | null> {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from('profiles')
    .select(
      // Fetch all new columns
      '*, is_published, show_services_section, show_team_page, show_testimonials_page'
    )
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching profile for slug [${slug}]:`, error.message);
    return null;
  }
  return data as Profile;
}

// --- 2. REMOVE THE OLD DynamicGlobalStyles COMPONENT DEFINITION ---
/*
const DynamicGlobalStyles = ({ primaryColor, secondaryColor }: { primaryColor: string, secondaryColor: string }) => {
  // ... THIS IS NOW IN ITS OWN FILE ...
};
*/

// --- The Layout Component ---
export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const slug = params.slug;
  const profile = await getProfileBySlug(slug);

  // If no profile is found, render 404
  if (!profile) {
    notFound();
  }

  // --- THIS IS THE GUARD (Fix #1) ---
  if (profile.is_published === false) {
    notFound();
  }

  return (
    // The profile object (with all flags) is now available to all child client components
    <ProfileProvider profile={profile}>
      {/* 3. USE THE IMPORTED COMPONENT */}
      <DynamicGlobalStyles
        primaryColor={profile.primary_color || '#F97316'}
        secondaryColor={profile.secondary_color || '#F8FAFC'}
      />
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <Navbar
          businessName={profile.business_name}
          slug={profile.slug}
          logoUrl={profile.logo_url}
          // Pass the new flags to the Navbar
          showTeamPage={profile.show_team_page}
          showTestimonialsPage={profile.show_testimonials_page}
        />
        <main className="flex-grow">{children}</main>
        <Footer
          businessName={profile.business_name}
          slug={profile.slug}
          // Pass the new flags to the Footer
          showServicesSection={profile.show_services_section}
          showTeamPage={profile.show_team_page}
          showTestimonialsPage={profile.show_testimonials_page}
        />
      </div>
    </ProfileProvider>
  );
}