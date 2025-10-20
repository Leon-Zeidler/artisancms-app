"use client";

// Import 'Link' for navigation and 'usePathname' to detect the current URL
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

// --- TYPE DEFINITIONS ---
type SidebarLinkProps = {
  icon: React.ElementType;
  text: string;
  href: string; // We now use 'href' for the destination URL
  active?: boolean;
};

// --- ICON COMPONENTS ---
const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6A2.25 2.25 0 0115.75 3.75h2.25A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75A2.25 2.25 0 0115.75 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" strokeLinecap="round" strokeLinejoin="round" /> </svg> );
const ProjectsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" strokeLinecap="round" strokeLinejoin="round" /> </svg> );
const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226.554-.22 1.156-.22 1.71 0 .554.219 1.02.684 1.11 1.226l.082.499a11.954 11.954 0 013.414 1.516.44.44 0 01.44.64l-.082.15c-.42.784-.962 1.512-1.542 2.142a.44.44 0 01-.652.066 11.954 11.954 0 01-4.228 0 .44.44 0 01-.652-.066c-.58-.63-.1.122-1.358-1.542-2.142a.44.44 0 01.44-.64c1.236-.612 2.456-1.21 3.414-1.516l.082-.499z" strokeLinecap="round" strokeLinejoin="round" /> <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" /> </svg> );


// --- SIDEBAR COMPONENTS ---

function SidebarLink({ icon: Icon, text, href, active = false }: SidebarLinkProps) {
  return (
    // We now use the Next.js Link component for fast, client-side navigation
    <Link
      href={href}
      className={`flex items-center p-4 text-base font-normal rounded-lg transition duration-75 group w-full ${
        active
          ? 'bg-orange-600 text-white shadow-lg'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="ml-3 text-left">{text}</span>
    </Link>
  );
}

function Sidebar() {
  // usePathname is a hook that gives us the current URL.
  // Example: '/dashboard/projekte'
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-800 p-4">
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
        {/*
          The 'active' prop is now determined by checking if the current URL (pathname)
          matches the link's destination (href).
        */}
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
          active={pathname === '/dashboard/projekte'} 
        />
        <SidebarLink 
          icon={SettingsIcon} 
          text="Einstellungen" 
          href="/dashboard/einstellungen" 
          active={pathname === '/dashboard/einstellungen'} 
        />
      </nav>

      {/* User Profile Section (at the bottom) */}
      <div className="absolute bottom-0 left-0 w-64 p-4">
        <div className="p-3 bg-slate-900 rounded-lg flex items-center">
            <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                    L
                </div>
            </div>
            <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-white truncate">Leon Zeidler</p>
                <p className="text-xs text-slate-400 truncate">leon@northcoded.com</p>
            </div>
        </div>
      </div>
    </aside>
  );
}


// --- MAIN LAYOUT COMPONENT ---

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-900 text-white">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

