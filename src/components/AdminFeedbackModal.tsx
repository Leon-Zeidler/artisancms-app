// src/components/AdminFeedbackModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { type Feedback as FeedbackType } from '@/app/dashboard/admin/page'; // We'll export this type

// --- Icons ---
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg>);
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );

interface AdminFeedbackModalProps {
  item: FeedbackType | null;
  onClose: () => void;
  onSave: (itemId: string, newNote: string, newResolvedStatus: boolean) => Promise<void>;
  isSaving: boolean;
  userEmail: string;
}

export default function AdminFeedbackModal({ item, onClose, onSave, isSaving, userEmail }: AdminFeedbackModalProps) {
  const [adminNote, setAdminNote] = useState('');
  const [isResolved, setIsResolved] = useState(false);

  // When the modal opens (when 'item' changes),
  // update the internal state for the note and checkbox.
  useEffect(() => {
    if (item) {
      setAdminNote(item.admin_notes || '');
      setIsResolved(item.is_resolved || false);
    }
  }, [item]);

  if (!item) {
    return null;
  }

  const handleSaveClick = () => {
    onSave(item.id, adminNote, isResolved);
  };

  return (
    <div
      className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      aria-modal="true"
    >
      <div
        className="relative z-[60] w-full max-w-2xl rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-orange-200/40"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex items-start justify-between border-b border-orange-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Feedback Details</h3>
            <p className="text-sm text-slate-500">
              From: <strong className="text-slate-900">{userEmail}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-orange-50 p-1.5 text-orange-500 transition hover:bg-orange-100 hover:text-orange-600"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
          {/* Feedback Details */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-orange-500">Category</label>
              <p className="ml-2 inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                {item.category}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-orange-500">Page URL</label>
              <p className="mt-1 text-sm font-mono text-slate-600">{item.page_url}</p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-orange-500">Submitted At</label>
              <p className="mt-1 text-sm text-slate-600">{new Date(item.created_at).toLocaleString('de-DE')}</p>
            </div>
            <div>
              {/* --- FIX: Replaced ' with &apos; --- */}
              <label className="text-xs font-semibold uppercase tracking-wide text-orange-500">User&apos;s Message</label>
              <div className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-orange-100/40">
                <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">{item.message}</p>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="border-t border-orange-100 pt-4">
            <label htmlFor="admin_notes" className="mb-2 block text-sm font-semibold text-slate-800">
              Your Admin Notes
            </label>
            <textarea
              id="admin_notes"
              rows={4}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="Add your private notes here..."
            />
          </div>

          {/* Mark as Resolved */}
          <div className="relative flex items-start">
            <div className="flex h-6 items-center">
              <input
                id="is_resolved"
                name="is_resolved"
                type="checkbox"
                checked={isResolved}
                onChange={(e) => setIsResolved(e.target.checked)}
                className="h-4 w-4 rounded border-orange-300 text-orange-500 focus:ring-orange-400 focus:ring-offset-0"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="is_resolved" className="font-semibold text-slate-800">
                Mark as Resolved
              </label>
              <p className="text-xs text-slate-500">
                {/* --- FIX: Replaced ' with &apos; --- */}
                Check this box when you&apos;ve handled this feedback.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 rounded-b-3xl border-t border-orange-100 bg-orange-50/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving}
            className="inline-flex items-center gap-x-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {isSaving && <ArrowPathIcon className="h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Note & Close'}
          </button>
        </div>
      </div>
    </div>
  );
}