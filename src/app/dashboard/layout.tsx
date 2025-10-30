// src/app/dashboard/layout.tsx
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Toaster, toast } from 'react-hot-toast';
import FeedbackWidget from '@/components/FeedbackWidget';
import WelcomeModal from '@/components/WelcomeModal';

// --- TYPE DEFINITIONS ---
type SidebarLinkProps = {
  icon: React.ElementType;
  text: string;
  href: string;
  active?: boolean;
  isExternal?: boolean;
};
type Profile = {
    id: string;
    slug: string | null;
    onboarding_complete?: boolean | null;
    has_seen_welcome_modal?: boolean | null;
};

// --- ICON COMPONENTS ---
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" strokeLinecap="round" strokeLinejoin="round" /> </svg> );
const ProjectsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" strokeLinecap="round" strokeLinejoin="round" /> </svg> );
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226.554-.22 1.156-.22 1.71 0 .554.219 1.02.684 1.11 1.226l.082.499a11.954 11.954 0 013.414 1.516.44.44 0 01.44.64l-.082.15c-.42.784-.962 1.512-1.542 2.142a.44.44 0 01-.652.066 11.954 11.954 0 01-4.228 0 .44.44 0 01-.652-.066c-.58-.63-.1.122-1.358-1.542-2.142a.44.44 0 01.44-.64c1.236-.612 2.456-1.21 3.414-1.516l.082-.499z" strokeLinecap="round" strokeLinejoin="round" /> <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" /> </svg> );
const ArrowTopRightOnSquareIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /> </svg> );
const ChatBubbleLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a.75.75 0 01-1.06 0l-3.72-3.72C9.847 17.001 9 16.036 9 14.9v-4.286c0-.97.616-1.813 1.5-2.097L12 6.75l3.75 1.761zm-6 3.486l-3.72 3.72a.75.75 0 000 1.06l3.72 3.72C11.153 20.89 12 19.925 12 18.887v-7.135c0-1.038-.847-2-1.98-2.093l-3.72-1.761a.75.75 0 00-.63.123 7.48 7.48 0 00-.738.738A7.47 7.47 0 003 11.25v4.286c0 .97.616 1.813 1.5 2.097L6 18.311v-.757c0-1.28.624-2.43 1.65-3.181l.71-.533zM18.75 9.75h.008v.008h-.008V9.75z" /> </svg>);
const InboxIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.121-1.58H6.881a2.25 2.25 0 00-2.121 1.58L2.35 13.177a2.25 2.25 0 00-.1.661z" /> </svg>);


// --- SIDEBAR COMPONENTS ---
function SidebarLink({ icon: Icon, text, href, active = false, isExternal = false }: SidebarLinkProps) {
  const baseClasses = "flex items-center p-4 text-base font-normal rounded-lg transition duration-75 group w-full";
  const activeClasses = "bg-orange-600 text-white shadow-lg";
  const inactiveClasses = "text-slate-300 hover:bg-slate-700 hover:text-white";

  const isDisabled = !href;

  if (isExternal) {
    return (
      <a
        href={isDisabled ? '#' : href}
        target={isDisabled ? '_self' : '_blank'}
        rel="noopener noreferrer"
        aria-disabled={isDisabled}
        onClick={(e) => { if (isDisabled) e.preventDefault(); }}
        className={`${baseClasses} ${inactiveClasses} justify-between ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <span className="flex items-center">
            <Icon className="h-6 w-6" />
            <span className="ml-3 text-left">{text}</span>
        </span>
        <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-500 group-hover:text-slate-300" />
      </a>
    );
  }

  return (
    <Link
      href={isDisabled ? '#' : href}
      aria-disabled={isDisabled}
      onClick={(e) => { if (isDisabled) e.preventDefault(); }}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses} ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
    >
      <Icon className="h-6 w-6" />
      <span className="ml-3 text-left">{text}</span>
    </Link>
  );
}

function Sidebar({ user, userSlug }: { user: User | null, userSlug: string | null }) {
  const pathname = usePathname();

  const websiteHref = userSlug ? `/${userSlug}` : '#'; 

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-800 p-4 relative">
      <div className="flex items-center mb-8">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md"> <ProjectsIcon className="h-6 w-6 text-white"/> </div>
        <div className="ml-3"> <h1 className="text-lg font-bold text-white">ArtisanCMS</h1> <p className="text-xs text-slate-400">Projektverwaltung</p> </div>
      </div>
      <nav className="space-y-2">
        <SidebarLink icon={DashboardIcon} text="Dashboard" href="/dashboard" active={pathname === '/dashboard'} />
        <SidebarLink icon={ProjectsIcon} text="Projekte" href="/dashboard/projekte" active={pathname?.startsWith('/dashboard/projekte')} />
        <SidebarLink icon={ChatBubbleLeftRightIcon} text="Kundenstimmen" href="/dashboard/testimonials" active={pathname === '/dashboard/testimonials'} />
        <SidebarLink icon={InboxIcon} text="Kontaktanfragen" href="/dashboard/contact" active={pathname === '/dashboard/contact'} />
        <SidebarLink icon={SettingsIcon} text="Einstellungen" href="/dashboard/einstellungen" active={pathname === '/dashboard/einstellungen'} />
         <div className="pt-4 mt-4 border-t border-slate-700">
             <SidebarLink
                icon={ArrowTopRightOnSquareIcon}
                text="Meine Webseite"
                href={websiteHref}
                isExternal={true}
             />
         </div>
      </nav>
      {user && (
          <div className="absolute bottom-0 left-0 w-64 p-4">
            <div className="p-3 bg-slate-900 rounded-lg flex items-center">
                <div className="flex-shrink-0"> <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white"> {user.email ? user.email.charAt(0).toUpperCase() : '?'} </div> </div>
                <div className="ml-3 flex-1 min-w-0"> <p className="text-sm font-semibold text-white truncate"> {user.email || 'Benutzer'} </p> <p className="text-xs text-slate-400 truncate">Angemeldet</p> </div>
            </div>
          </div>
      )}
    </aside>
  );
}


// --- MAIN LAYOUT COMPONENT ---

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null); 
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    const checkAuthAndOnboarding = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted || sessionError || !session?.user) {
        if (isMounted) router.push('/login');
        return;
      }

      const currentUser = session.user;
      if (isMounted) setUser(currentUser);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_complete, slug, has_seen_welcome_modal') 
        .eq('id', currentUser.id)
        .maybeSingle(); 

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("DashboardLayout: Error checking profile:", profileError);
      } else if (profile) {
          if (isMounted) {
              setUserSlug(profile.slug); 
              
              if (profile.has_seen_welcome_modal === false) {
                setShowWelcomeModal(true);
              }
              
              const onboardingCompleteValue = profile?.onboarding_complete;
              const needsOnboarding = !profile || onboardingCompleteValue !== true;
              const isOnboardingPage = pathname === '/onboarding';
              if (needsOnboarding && !isOnboardingPage) {
                  router.push('/onboarding');
                  return; 
              }
          }
      } else {
          if (isMounted && pathname !== '/onboarding') {
              router.push('/onboarding');
              return;
          }
      }

      if (isMounted) {
          setLoadingProfile(false);
      }
    };

    checkAuthAndOnboarding();

    return () => { isMounted = false; };

  }, [router, pathname]);

  const handleCloseWelcomeModal = async () => {
    if (!user) return;
    setIsClosingModal(true);
    
    //
    // --- THIS IS THE FIX ---
    // We create an async function that *returns a full Promise*
    // by awaiting the Supabase query.
    //
    const updatePromise = async () => {
        const { error } = await supabase
            .from('profiles')
            .update({ has_seen_welcome_modal: true })
            .eq('id', user.id);

        // If there's an error, throw it to be caught by toast.promise
        if (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
        // If no error, the promise resolves successfully
        return; // You can return anything here, or nothing
    };

    await toast.promise(
      updatePromise(), // <-- We CALL the async function here
      {
        loading: 'Saving...',
        success: () => {
          setShowWelcomeModal(false); // Close modal on success
          setIsClosingModal(false);
          return 'Viel Spaß beim Testen!'; // "Have fun testing!"
        },
        error: (err: any) => {
          setIsClosingModal(false);
          // Don't close modal on error, show error
          return `Error: ${err.message}`;
        }
      }
    );
  };

  if (loadingProfile) {
      return ( <div className="flex h-screen items-center justify-center bg-slate-900 text-white"> Lade Daten... </div> );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <Toaster position="bottom-right" toastOptions={{ className: '', duration: 5000, style: { background: '#334155', color: '#fff', border: '1px solid #475569', }, success: { duration: 3000, iconTheme: { primary: '#22c55e', secondary: '#fff' }, }, error: { duration: 6000, iconTheme: { primary: '#ef4444', secondary: '#fff' }, }, }} />
      <FeedbackWidget /> 
      
      {showWelcomeModal && (
        <WelcomeModal 
          onClose={handleCloseWelcomeModal} 
          isSaving={isClosingModal} 
        />
      )}
      
      <Sidebar user={user} userSlug={userSlug} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}