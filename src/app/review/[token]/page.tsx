// src/app/review/[token]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// --- Icons ---
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const ExclamationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
// ---

type TokenStatus = 'loading' | 'valid' | 'invalid' | 'submitted';
type ProjectDetails = {
  projectTitle: string;
  businessName: string;
};

export default function ReviewPage() {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('loading');
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [authorName, setAuthorName] = useState('');
  const [authorHandle, setAuthorHandle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const params = useParams();
  const router = useRouter();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  // 1. Verify the token on page load
  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid');
      setError('Kein Bewertungs-Token gefunden.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch('/api/review/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Unbekannter Fehler');
        }

        setProjectDetails(result);
        setTokenStatus('valid');
      } catch (err: any) {
        setTokenStatus('invalid');
        setError(`Link ungültig oder abgelaufen: ${err.message}`);
      }
    };

    verifyToken();
  }, [token]);

  // 2. Handle the form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !authorName.trim() || !body.trim()) {
      setError("Bitte füllen Sie alle Pflichtfelder aus.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/review/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          author_name: authorName,
          author_handle: authorHandle,
          body,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Senden');
      }

      setTokenStatus('submitted');
    } catch (err: any) {
      setError(`Senden fehlgeschlagen: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render different states ---

  const renderLoading = () => (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Link wird geprüft...</h1>
      <ArrowPathIcon className="h-8 w-8 text-gray-500 animate-spin mx-auto" />
    </div>
  );
  
  const renderError = (message: string) => (
    <div className="text-center">
       <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-red-700 mb-4">Link ungültig</h1>
      <p className="text-gray-600 mb-6">{message}</p>
      <p className="text-sm text-gray-500">
        Dieser Bewertungslink ist möglicherweise abgelaufen oder wurde bereits verwendet.
      </p>{' '}
      {/* <-- FIX: Corrected </S-p> to </p> --> */}
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center">
      <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-green-700 mb-4">Vielen Dank!</h1>
      <p className="text-gray-600 mb-6">
        Ihre Bewertung für {projectDetails?.businessName || 'diesen Betrieb'} wurde erfolgreich übermittelt.
      </p>
      <Link href="/" className="text-sm text-orange-600 hover:text-orange-500">
        Zurück zur Startseite
      </Link>
    </div>
  );
  
  const renderForm = () => (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bewertung abgeben</h1>
        <p className="text-gray-600 mt-2">
          für das Projekt <strong className="text-gray-800">{projectDetails?.projectTitle}</strong> von <strong className="text-gray-800">{projectDetails?.businessName}</strong>
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="authorName" className="mb-2 block text-sm font-medium text-gray-700">Ihr Name *</label>
          <input
            type="text" id="authorName" value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            placeholder="Max Mustermann"
          />
        </div>
        
        <div>
          <label htmlFor="authorHandle" className="mb-2 block text-sm font-medium text-gray-700">Zusatz (z.B. Firma, Ort)</label>
          <input
            type="text" id="authorHandle" value={authorHandle}
            onChange={(e) => setAuthorHandle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            placeholder="Musterfirma GmbH"
          />
        </div>

        <div>
          <label htmlFor="body" className="mb-2 block text-sm font-medium text-gray-700">Ihre Bewertung *</label>
          <textarea
            id="body" value={body} rows={5}
            onChange={(e) => setBody(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            placeholder="Wie war Ihre Erfahrung mit unserer Arbeit?"
          />
        </div>
        
        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-orange-600 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed inline-flex items-center justify-center gap-x-2"
        >
          {isSubmitting && <ArrowPathIcon className="h-5 w-5" />}
          {isSubmitting ? 'Wird gesendet...' : 'Bewertung absenden'}
        </button>
      </form>
    </>
  );

  // --- Main Render Switch ---
  
  let content;
  switch (tokenStatus) {
    case 'loading':
      content = renderLoading();
      break;
    case 'valid':
      content = renderForm();
      break;
    case 'submitted':
      content = renderSuccess();
      break;
    case 'invalid':
    default:
      content = renderError(error || 'Der Link ist ungültig.');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-xl border border-gray-200">
        {content}
      </div>
    </main>
  );
}

