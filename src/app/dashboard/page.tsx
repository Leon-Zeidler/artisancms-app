import React from 'react';

// --- TYPE DEFINITIONS ---
type ProjectCardProps = {
  title: string;
  client: string;
  date: string;
  imageUrl: string;
  status: 'Published' | 'Draft';
};

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
};

// --- ICON COMPONENTS ---
const DocumentDuplicateIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);

const PencilSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const CheckBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);


// --- MOCK DATA ---
// Later, this data will come from your Supabase database.
const projects: ProjectCardProps[] = [
  { title: "Badezimmer-Sanierung", client: "Familie Müller", date: "15. Jan. 2025", imageUrl: "https://placehold.co/600x400/FFF/333?text=Bad", status: "Published" },
  { title: "Küche Modernisierung", client: "Herr Schmidt", date: "01. Feb. 2025", imageUrl: "https://placehold.co/600x400/EEE/333?text=Küche", status: "Draft" },
  { title: "Dachausbau Wagner", client: "Familie Wagner", date: "01. Nov. 2024", imageUrl: "https://placehold.co/600x400/DDD/333?text=Dach", status: "Published" },
  { title: "Terrassenbau Becker", client: "Herr Becker", date: "10. Jan. 2025", imageUrl: "https://placehold.co/600x400/CCC/333?text=Terrasse", status: "Draft" },
];


// --- UI COMPONENTS ---

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex justify-between items-center">
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className="bg-slate-900 p-3 rounded-lg">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
    </div>
  );
}

function ProjectCard({ title, client, date, imageUrl, status }: ProjectCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden group">
      <div className="relative">
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover"/>
        <div className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full ${
            status === 'Published' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
            {status === 'Published' ? 'Veröffentlicht' : 'Entwurf'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-white truncate">{title}</h3>
        <p className="text-sm text-slate-400 mt-1">{client} • {date}</p>
      </div>
    </div>
  );
}

function NewProjectCard() {
    return (
        <button className="bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 hover:border-orange-600 transition-colors duration-300 w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-orange-500">
            <div className="bg-slate-700/50 rounded-full p-4 mb-4">
                <PlusIcon className="h-8 w-8"/>
            </div>
            <h3 className="text-lg font-bold">Neues Projekt</h3>
            <p className="text-sm">Klicken Sie hier zum Hinzufügen</p>
        </button>
    );
}

// --- MAIN PAGE COMPONENT ---

export default function DashboardPage() {
  const totalProjects = projects.length;
  const publishedProjects = projects.filter(p => p.status === 'Published').length;
  const draftProjects = totalProjects - publishedProjects;

  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Übersicht</h1>
        <p className="text-slate-400 mt-1">Willkommen zurück, Leon. Hier ist Ihre aktuelle Projektübersicht.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard title="Alle Projekte" value={totalProjects} description="Gesamt registriert" icon={DocumentDuplicateIcon} />
        <StatCard title="Entwürfe" value={draftProjects} description="Nicht veröffentlicht" icon={PencilSquareIcon} />
        <StatCard title="Veröffentlicht" value={publishedProjects} description="Öffentlich sichtbar" icon={CheckBadgeIcon} />
      </div>

      {/* Projects Grid */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white">Aktuelle Projekte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          <NewProjectCard />
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
        </div>
      </div>
    </main>
  );
}