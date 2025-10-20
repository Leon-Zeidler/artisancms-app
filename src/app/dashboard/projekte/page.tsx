// This is the page for managing all projects.
// It will eventually show a more detailed list or table of projects.

export default function ProjektePage() {
  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Alle Projekte</h1>
        <p className="text-slate-400 mt-1">Hier können Sie alle Ihre Projekte verwalten, bearbeiten und löschen.</p>
      </div>

      {/* Placeholder for future content */}
      <div className="mt-8 flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-slate-700">
        <p className="text-slate-500">Projekt-Tabelle wird hier in Kürze angezeigt.</p>
      </div>
    </main>
  );
}
