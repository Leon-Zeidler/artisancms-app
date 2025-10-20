// This is the page for managing user settings.
// It will eventually have forms for changing passwords, managing subscriptions, etc.

export default function EinstellungenPage() {
  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Einstellungen</h1>
        <p className="text-slate-400 mt-1">Verwalten Sie hier Ihr Konto und Ihre Abonnements.</p>
      </div>

      {/* Placeholder for future content */}
      <div className="mt-8 flex h-96 items-center justify-center rounded-lg border-2 border-dashed border-slate-700">
        <p className="text-slate-500">Kontoeinstellungen werden hier in Kürze angezeigt.</p>
      </div>
    </main>
  );
}
