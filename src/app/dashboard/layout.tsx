"use client";

// Import hooks, Link, supabase, etc.
import Link from 'next/link'; // Standard Next.js import
import { usePathname, useRouter } from 'next/navigation'; // Standard Next.js imports
import React, { useState, useEffect } from 'react'; // Added useState, useEffect
// *** Reverting to path alias - ensure tsconfig.json has paths configured ***
import { supabase } from '@/lib/supabaseClient'; 
import { User } from '@supabase/supabase-js'; // Import User type

// --- TYPE DEFINITIONS ---
type SidebarLinkProps = {
  icon: React.ElementType;
  text: string;
  href: string;
  active?: boolean;
  isExternal?: boolean; // For external link styling
};

// --- ICON COMPONENTS ---
// (Make sure these icon components are defined correctly in your code)
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" strokeLinecap="round" strokeLinejoin="round" /> </svg> );
const ProjectsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" strokeLinecap="round" strokeLinejoin="round" /> </svg> );
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226.554-.22 1.156-.22 1.71 0 .554.219 1.02.684 1.11 1.226l.082.499a11.954 11.954 0 013.414 1.516.44.44 0 01.44.64l-.082.15c-.42.784-.962 1.512-1.542 2.142a.44.44 0 01-.652.066 11.954 11.954 0 01-4.228 0 .44.44 0 01-.652-.066c-.58-.63-.1.122-1.358-1.542-2.142a.44.44 0 01.44-.64c1.236-.612 2.456-1.21 3.414-1.516l.082-.499z" strokeLinecap="round" strokeLinejoin="round" /> <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" /> </svg> );
const ArrowTopRightOnSquareIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /> </svg> );


// --- SIDEBAR COMPONENTS ---

function SidebarLink({ icon: Icon, text, href, active = false, isExternal = false }: SidebarLinkProps) {
  const baseClasses = "flex items-center p-4 text-base font-normal rounded-lg transition duration-75 group w-full";
  const activeClasses = "bg-orange-600 text-white shadow-lg";
  const inactiveClasses = "text-slate-300 hover:bg-slate-700 hover:text-white";

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank" 
        rel="noopener noreferrer" 
        className={`${baseClasses} ${inactiveClasses} justify-between`} 
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
      href={href}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      <Icon className="h-6 w-6" />
      <span className="ml-3 text-left">{text}</span>
    </Link>
  );
}

// Sidebar component now takes the user object as a prop
function Sidebar({ user }: { user: User | null }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-800 p-4 relative"> 
      {/* Logo Section */}
      <div className="flex items-center mb-8">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
            <ProjectsIcon className="h-6 w-6 text-white"/>
        </div>
        <div className="ml-3">
          <h1 className="text-lg font-bold text-white">ArtisanCMS</h1>
          <p className="text-xs text-slate-400">Projektverwaltung</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-2">
        <SidebarLink
          icon={DashboardIcon}
          text="Dashboard"
          href="/dashboard"
          active={pathname === '/dashboard'}
        />
        <SidebarLink
          icon={ProjectsIcon}
          text="Projekte"
          href="/dashboard/projekte"
          active={pathname?.startsWith('/dashboard/projekte')} 
        />
        <SidebarLink
          icon={SettingsIcon}
          text="Einstellungen"
          href="/dashboard/einstellungen"
          active={pathname === '/dashboard/einstellungen'}
        />
         {/* Link to Public Website */}
         <div className="pt-4 mt-4 border-t border-slate-700">
             <SidebarLink
                icon={ArrowTopRightOnSquareIcon}
                text="Meine Webseite"
                href="/" 
                isExternal={true} 
             />
         </div>
      </nav>

      {/* User Profile Section */}
      {user && (
          <div className="absolute bottom-0 left-0 w-64 p-4">
            <div className="p-3 bg-slate-900 rounded-lg flex items-center">
                <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                        {user.email ? user.email.charAt(0).toUpperCase() : '?'}
                    </div>
                </div>
                <div className="ml-3 flex-1 min-w-0"> 
                    <p className="text-sm font-semibold text-white truncate">
                        {user.email || 'Benutzer'}
                    </p>
                     <p className="text-xs text-slate-400 truncate">Angemeldet</p>
                </div>
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
  const [loadingProfile, setLoadingProfile] = useState(true); 
  const router = useRouter();
  const pathname = usePathname(); 

  // useEffect hook to check authentication and onboarding status
  useEffect(() => {
    let isMounted = true; 

    const checkAuthAndOnboarding = async () => {
      console.log("DashboardLayout: Checking Auth and Onboarding..."); 
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted || sessionError || !session?.user) {
        console.log("DashboardLayout: No active session, redirecting to login.");
        if (isMounted) router.push('/login');
        return; 
      }
      
      const currentUser = session.user;
      if (isMounted) setUser(currentUser);

      console.log("DashboardLayout: Checking profile for onboarding:", currentUser.id);
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_complete') 
        .eq('id', currentUser.id); 

      console.log("DashboardLayout: Profile fetch result:", { profiles, profileError }); 

      if (profileError) { 
        console.error("DashboardLayout: Error checking profile:", profileError);
        if (isMounted) setLoadingProfile(false); 
        return; 
      } 
      
      const profile = profiles && profiles.length > 0 ? profiles[0] : null; 
      const onboardingCompleteValue = profile?.onboarding_complete;
      const needsOnboarding = !profile || onboardingCompleteValue !== true; 
      const isOnboardingPage = pathname === '/onboarding'; 
      console.log("DashboardLayout: Onboarding check:", { 
          profileExists: !!profile, 
          onboardingComplete: onboardingCompleteValue,
          needsOnboarding: needsOnboarding,
          isOnboardingPage: isOnboardingPage
      });

      // Redirect logic
      if (needsOnboarding && !isOnboardingPage) {
          console.log("DashboardLayout: Redirecting to /onboarding");
          if (isMounted) router.push('/onboarding');
          return; 
      } else if (needsOnboarding && isOnboardingPage) {
          console.log("DashboardLayout: Already on onboarding page.");
      } else if (!needsOnboarding) {
          console.log("DashboardLayout: Onboarding complete.");
      }
      
      if (isMounted) {
          console.log("DashboardLayout: Setting loadingProfile to false."); 
          setLoadingProfile(false); 
      }
    };

    checkAuthAndOnboarding();

    return () => {
        console.log("DashboardLayout: Unmounting..."); 
        isMounted = false; 
    };

  }, [router, pathname]); 

  if (loadingProfile) {
      console.log("DashboardLayout: Rendering loading state..."); 
      return (
          <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
              Lade Daten... 
          </div>
      );
  }

  console.log("DashboardLayout: Rendering main layout..."); 
  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <Sidebar user={user} /> 
      <div className="flex-1 overflow-y-auto">
        {children} 
      </div>
    </div>
  );
}

