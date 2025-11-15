// src/app/dashboard/layout.tsx
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js'; 
import { Toaster, toast } from 'react-hot-toast';
import FeedbackWidget from '@/components/FeedbackWidget';
import WelcomeModal from '@/components/WelcomeModal';
import { ProfileProvider, type Profile } from '@/contexts/ProfileContext';
import { isBetaActive } from '@/lib/subscription';

// --- TYPE DEFINITIONS ---
type SidebarLinkProps = { 
  icon: React.ElementType;
  text: string;
  href: string;
  active?: boolean;
  isExternal?: boolean;
};

// --- 2. LOKALE PROFILE TYPE DEFINITION ENTFERNT (wir nutzen jetzt die aus dem Context) ---

// --- ICONS (Unverändert) ---
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" strokeLinecap="round" strokeLinejoin="round" /> </svg> );
const ProjectsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /> </svg> );
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h3.75" /> </svg> );
const ArrowTopRightOnSquareIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /> </svg> );
const ChatBubbleLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.513c.47 0 .682.557.34.886l-4.14 3.001a.563.563 0 00-.182.658l1.58 4.673a.563.563 0 01-.815.632l-4.14-3a.563.563 0 00-.65 0l-4.14 3a.563.563 0 01-.815-.632l1.58-4.673a.563.563 0 00-.182-.658l-4.14-3.001a.563.563 0 01.34-.886h5.513a.563.563 0 00.475-.31l2.125-5.11z" /> </svg> );
const InboxIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /> </svg> );
const LockClosedIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /> </svg> );
const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-3.741-.97m-3.741 0a9.094 9.094 0 00-3.741.97m7.482 0a9.094 9.094 0 01-3.741-.97m3.741 0c-.393.16-1.183.3-2.12.39m-3.741 0c-.937-.09-1.727-.23-2.12-.39M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> </svg> );
const ArrowLeftOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /> </svg> );
const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m3-3.75l-3 3m3 0l-3-3m-3.75 0h.008v.008H7.5v-.008zM4.5 12.75h15a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25h-15a2.25 2.25 0 00-2.25 2.25v3.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

// --- SIDEBAR COMPONENTS (Unchanged) ---
function Sidebar({ user, userSlug, isAdmin }: { user: User | null; userSlug: string | null; isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseClient(), []);
  
  const websiteHref = userSlug ? `/${userSlug}` : '#'; 

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Abmelden fehlgeschlagen: ${error.message}`);
    } else {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <aside className="w-64 flex flex-col flex-shrink-0 border-r border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 h-screen sticky top-0">
      <div className="flex items-center mb-8 px-5 pt-6">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
          <DashboardIcon className="h-6 w-6 text-white"/>
        </div>
        <div className="ml-3">
          <h1 className="text-lg font-bold text-slate-900">ArtisanCMS</h1>
          <p className="text-xs text-slate-500">Projektverwaltung</p>
        </div>
      </div>
      <nav className="flex-1 space-y-2 px-5 overflow-y-auto">
        <SidebarLink icon={DashboardIcon} text="Dashboard" href="/dashboard" active={pathname === '/dashboard'} />
        <SidebarLink icon={ProjectsIcon} text="Projekte" href="/dashboard/projekte" active={pathname?.startsWith('/dashboard/projekte')} />
        <SidebarLink icon={UserGroupIcon} text="Team / Über Uns" href="/dashboard/team" active={pathname === '/dashboard/team'} />
        <SidebarLink icon={ChatBubbleLeftRightIcon} text="Kundenstimmen" href="/dashboard/testimonials" active={pathname === '/dashboard/testimonials'} />
        <SidebarLink icon={InboxIcon} text="Kontaktanfragen" href="/dashboard/contact" active={pathname === '/dashboard/contact'} />
        <SidebarLink icon={CreditCardIcon} text="Abonnement" href="/dashboard/abo" active={pathname === '/dashboard/abo'} />
        <SidebarLink icon={SettingsIcon} text="Einstellungen" href="/dashboard/einstellungen" active={pathname === '/dashboard/einstellungen'} />

        

         <div className="mt-6 border-t border-slate-200 pt-6">
             <SidebarLink
                icon={ArrowTopRightOnSquareIcon}
                text="Meine Webseite"
                href={websiteHref}
                isExternal={true}
             />
         </div>
         {isAdmin && (
           <div className="mt-4 border-t border-slate-200 pt-4">
             <SidebarLink
                icon={LockClosedIcon}
                text="Admin"
                href="/dashboard/admin"
                active={pathname === '/dashboard/admin'}
             />
           </div>
         )}
      </nav>
      {user && (
          <div className="absolute bottom-0 left-0 w-64 px-5 pb-6">
            <div className="flex items-center rounded-xl bg-orange-50/80 p-3 shadow-inner shadow-orange-100">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                    {user.email ? user.email.charAt(0).toUpperCase() : '?'}
                  </div>
                </div>
                <div className="ml-3 min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.email || 'Benutzer'}</p>
                  <p className="text-xs text-slate-500">Angemeldet</p>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Abmelden"
                  className="ml-2 flex-shrink-0 rounded-md p-2 text-orange-500 transition-colors hover:bg-orange-100 hover:text-orange-600"
                >
                  <span className="sr-only">Abmelden</span>
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                </button>
            </div>
          </div>
      )}
    </aside>
  );
}

function SidebarLink({ icon: Icon, text, href, active = false, isExternal = false }: SidebarLinkProps) {
  const baseClasses = "flex items-center p-4 text-base font-normal rounded-lg transition duration-75 group w-full";
  const activeClasses = "bg-orange-500 text-white shadow-lg shadow-orange-200";
  const inactiveClasses = "text-slate-600 hover:bg-orange-50 hover:text-orange-600";

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
        <ArrowTopRightOnSquareIcon className="h-4 w-4 text-slate-400 transition-colors group-hover:text-orange-500" />
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

// --- MAIN LAYOUT COMPONENT ---

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null); 
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); 
  
  // --- 3. STATE FÜR FULL PROFILE ---
  const [fullProfile, setFullProfile] = useState<Profile | null>(null);

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

      // --- 4. SELECT ALL (*) ---
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*') 
        .eq('id', currentUser.id)
        .maybeSingle(); 

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("DashboardLayout: Error checking profile:", profileError);
      } else if (profileData) {
          if (isMounted) {
              // --- 5. SETZE FULL PROFILE ---
              const typedProfile = profileData as Profile;
              setFullProfile(typedProfile);
              setUserSlug(typedProfile.slug); 
              
              if (typedProfile.has_seen_welcome_modal === false) {
                setShowWelcomeModal(true);
              }
              
              // Check for admin role (assuming your Profile type supports it or we check property)
              // The context type doesn't explicitly list 'role' but the DB has it.
              // You might need to cast as any or extend the Profile type if TS complains.
              if ((typedProfile as any).role === 'admin') {
                setIsAdmin(true);
              }

              const onboardingCompleteValue = typedProfile.onboarding_complete; // Type fix: check if it exists
              // Note: onboarding_complete is not in the standard Profile type from context, 
              // but it IS in the DB. If you get TS errors here, extend the Profile type 
              // or use (typedProfile as any).onboarding_complete
              
              const needsOnboarding = !typedProfile || (typedProfile as any).onboarding_complete !== true;
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

  }, [router, pathname, supabase]);

  const handleCloseWelcomeModal = async () => {
    if (!user) return;
    setIsClosingModal(true);
    
    const updatePromise = async () => {
        const { error } = await supabase
            .from('profiles')
            .update({ has_seen_welcome_modal: true })
            .eq('id', user.id);
        if (error) { console.error("Error updating profile:", error); throw error; }
        return;
    };

    await toast.promise(
      updatePromise(), 
      {
        loading: 'Saving...',
        success: () => {
          setShowWelcomeModal(false);
          setIsClosingModal(false);
          return 'Viel Spaß beim Testen!';
        },
        error: (err: any) => {
          setIsClosingModal(false);
          return `Error: ${err.message}`;
        }
      }
    );
  };

  if (loadingProfile) {
      return ( <div className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-100 via-white to-slate-100 text-slate-600"> Lade Daten... </div> );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-white to-slate-50 text-slate-900">
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '',
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #f97316',
            boxShadow: '0 20px 45px -20px rgba(249, 115, 22, 0.35)',
          },
          success: {
            duration: 2500,
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            duration: 6000,
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <FeedbackWidget />

      {showWelcomeModal && (
        <WelcomeModal
          onClose={handleCloseWelcomeModal}
          isSaving={isClosingModal}
        />
      )}

      <Sidebar user={user} userSlug={userSlug} isAdmin={isAdmin} />
      
      <div className="flex-1 overflow-y-auto">
        {fullProfile && isBetaActive(fullProfile) && (
          <div className="sticky top-0 z-10 mx-6 mt-6 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-xs text-orange-800 shadow-sm">
            <span className="font-semibold">Beta-Version:</span>{' '}
            Sie nutzen ArtisanCMS derzeit im Rahmen einer kostenlosen Beta-Phase.
          </div>
        )}
        
        {/* --- 6. WRAP CHILDREN WITH PROVIDER --- */}
        {fullProfile ? (
           <ProfileProvider profile={fullProfile}>
              {children}
           </ProfileProvider>
        ) : (
           children
        )}
      </div>
    </div>
  );
}
// --- ENDE DATEI --- //
