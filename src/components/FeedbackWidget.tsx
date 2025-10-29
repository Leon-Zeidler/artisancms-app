// src/components/FeedbackWidget.tsx
"use client";

import React, { useState } from 'react'; // Import React
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

// --- Icons ---
const ChatBubbleLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a.75.75 0 01-1.06 0l-3.72-3.72C9.847 17.001 9 16.036 9 14.9v-4.286c0-.97.616-1.813 1.5-2.097L12 6.75l3.75 1.761zm-6 3.486l-3.72 3.72a.75.75 0 000 1.06l3.72 3.72C11.153 20.89 12 19.925 12 18.887v-7.135c0-1.038-.847-2-1.98-2.093l-3.72-1.761a.75.75 0 00-.63.123 7.48 7.48 0 00-.738.738A7.47 7.47 0 003 11.25v4.286c0 .97.616 1.813 1.5 2.097L6 18.311v-.757c0-1.28.624-2.43 1.65-3.181l.71-.533z" />
  </svg>
);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);
// --- End Icons ---

type FeedbackCategory = 'Bug Report' | 'Feature Request' | 'General Comment';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>('Bug Report');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          message,
          page_url: pathname
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit feedback');
      }

      toast.success("Thank you for your feedback!");
      setMessage('');
      setCategory('Bug Report');
      setIsOpen(false);
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* --- The Modal --- */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-modal="true"
        >
          <div
            className="fixed bottom-24 right-8 z-[60] w-full max-w-sm rounded-lg bg-slate-800 shadow-xl border border-slate-700"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="flex items-center justify-between border-b border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-white">Submit Beta Feedback</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Close feedback modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label htmlFor="feedback-category" className="block text-sm font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  id="feedback-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                >
                  <option>Bug Report</option>
                  <option>Feature Request</option>
                  <option>General Comment</option>
                </select>
              </div>
              <div>
                <label htmlFor="feedback-message" className="block text-sm font-medium text-slate-300 mb-1">
                  Your Message
                </label>
                <textarea
                  id="feedback-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                  placeholder="Tell us what you think..."
                  required
                />
                <p className="text-xs text-slate-500 mt-1">
                  Current page: <code className="bg-slate-700 px-1 py-0.5 rounded">{pathname}</code>
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-x-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed"
                >
                  {isLoading && <ArrowPathIcon className="h-4 w-4" />}
                  {isLoading ? 'Sending...' : 'Send Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- The Button --- */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full bg-orange-600 p-3 text-white shadow-lg transition-transform hover:scale-110 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        aria-label="Open feedback modal"
      >
        <ChatBubbleLeftRightIcon className="h-full w-full" />
      </button>
    </>
  );
}