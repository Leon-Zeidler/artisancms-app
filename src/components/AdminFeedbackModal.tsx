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
      className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      aria-modal="true"
    >
      <div
        className="relative z-[60] w-full max-w-2xl rounded-lg bg-slate-800 shadow-xl border border-slate-700"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex items-start justify-between border-b border-slate-700 p-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Feedback Details</h3>
            <p className="text-sm text-slate-400">
              From: <strong className="text-white">{userEmail}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Feedback Details */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium text-slate-500">Category</label>
              <p className="text-sm text-orange-400 bg-orange-900/50 px-2 py-0.5 rounded-full inline-block ml-2">
                {item.category}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Page URL</label>
              <p className="text-sm text-slate-300 font-mono">{item.page_url}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Submitted At</label>
              <p className="text-sm text-slate-300">{new Date(item.created_at).toLocaleString('de-DE')}</p>
            </div>
            <div>
              {/* --- FIX: Replaced ' with &apos; --- */}
              <label className="text-xs font-medium text-slate-500">User&apos;s Message</label>
              <div className="mt-1 p-3 bg-slate-900 rounded-md border border-slate-700">
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{item.message}</p>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="border-t border-slate-700 pt-4">
            <label htmlFor="admin_notes" className="block text-sm font-medium text-slate-300 mb-1">
              Your Admin Notes
            </label>
            <textarea
              id="admin_notes"
              rows={4}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
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
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-orange-600 focus:ring-orange-600 focus:ring-offset-slate-800"
              />
            </div>
            <div className="ml-3 text-sm leading-6">
              <label htmlFor="is_resolved" className="font-medium text-slate-300">
                Mark as Resolved
              </label>
              <p className="text-slate-500 text-xs">
                {/* --- FIX: Replaced ' with &apos; --- */}
                Check this box when you&apos;ve handled this feedback.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 border-t border-slate-700 p-4 bg-slate-800/50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            disabled={isSaving}
            className="inline-flex items-center gap-x-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed"
          >
            {isSaving && <ArrowPathIcon className="h-4 w-4" />}
            {isSaving ? 'Saving...' : 'Save Note & Close'}
          </button>
        </div>
      </div>
    </div>
  );
}