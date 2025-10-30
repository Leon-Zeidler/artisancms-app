// src/app/dashboard/admin/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { createAdminClient } from '@/lib/supabaseAdminClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import AdminFeedbackModal from '@/components/AdminFeedbackModal';

// --- Icons ---
const DocumentDuplicateIcon = ({ title, ...props }: React.SVGProps<SVGSVGElement> & { title?: string }) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" > {title && <title>{title}</title>}<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /> </svg> );
const UsersIcon = ({ title, ...props }: React.SVGProps<SVGSVGElement> & { title?: string }) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> {title && <title>{title}</title>}<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.003c0 1.113.285 2.16.786 3.07M15 19.128c-1.113 0-2.16-.285-3.07-.786v-.003c-1.113 0-2.16.285-3.07.786m6.14 0c-1.113 0-2.16-.285-3.07-.786V15.07c0-1.113-.285-2.16-.786-3.07M15 19.128v-.003c0-1.113.285-2.16.786-3.07M9 15.07v.003c0 1.113.285 2.16.786 3.07M9 15.07c-1.113 0-2.16.285-3.07.786v-.003c-1.113 0-2.16-.285-3.07.786m6.14 0c-1.113 0-2.16-.285-3.07-.786V15.07" /> </svg>);
const ChatBubbleLeftRightIcon = ({ title, ...props }: React.SVGProps<SVGSVGElement> & { title?: string }) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> {title && <title>{title}</title>}<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a.75.75 0 01-1.06 0l-3.72-3.72C9.847 17.001 9 16.036 9 14.9v-4.286c0-.97.616-1.813 1.5-2.097L12 6.75l3.75 1.761zm-6 3.486l-3.72 3.72a.75.75 0 000 1.06l3.72 3.72C11.153 20.89 12 19.925 12 18.887v-7.135c0-1.038-.847-2-1.98-2.093l-3.72-1.761a.75.75 0 00-.63.123 7.48 7.48 0 00-.738.738A7.47 7.47 0 003 11.25v4.286c0 .97.616 1.813 1.5 2.097L6 18.311v-.757c0-1.28.624-2.43 1.65-3.181l.71-.533zM18.75 9.75h.008v.008h-.008V9.75z" /> </svg>);
const CheckIcon = ({ title, ...props }: React.SVGProps<SVGSVGElement> & { title?: string }) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> {title && <title>{title}</title>}<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> </svg> );
const PencilSquareIcon = ({ title, ...props }: React.SVGProps<SVGSVGElement> & { title?: string }) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> {title && <title>{title}</title>}<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /> </svg> );
const InboxIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.121-1.58H6.881a2.25 2.25 0 00-2.121 1.58L2.35 13.177a2.25 2.25 0 00-.1.661z" /> </svg>);


// --- Re-using StatCard Component ---
type StatCardProps = { title: string; value: string | number; description: string; icon: React.ElementType; };
function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return ( <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex justify-between items-center"> <div> <p className="text-sm text-slate-400">{title}</p> <p className="text-3xl font-bold text-white">{value}</p> <p className="text-xs text-slate-500">{description}</p> </div> <div className="bg-slate-900 p-3 rounded-lg"> <Icon className="h-6 w-6 text-slate-400" /> </div> </div> );
}

// --- TYPE DEFINITIONS ---
export type Feedback = {
    id: string;
    created_at: string;
    user_id: string; 
    category: string | null;
    message: string;
    page_url: string | null;
    admin_notes: string | null;
    is_resolved: boolean | null;
};
type Profile = {
    id: string;
    business_name: string | null;
    slug: string | null;
    email: string | null; 
};

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data State ---
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  
  const [masterFeedbackList, setMasterFeedbackList] = useState<Feedback[]>([]); 
  const [newFeedback, setNewFeedback] = useState<Feedback[]>([]); 
  const [resolvedFeedback, setResolvedFeedback] = useState<Feedback[]>([]); 

  const [userList, setUserList] = useState<Profile[]>([]);
  
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    setNewFeedback(masterFeedbackList.filter(item => !item.is_resolved));
    setResolvedFeedback(masterFeedbackList.filter(item => item.is_resolved));
  }, [masterFeedbackList]);

  useEffect(() => {
    const initializeAdmin = async () => {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
      if (!user || user.id !== adminId) {
        setIsAdmin(false);
        setError("Access Denied. This page is for administrators only.");
        setLoading(false);
        return;
      }
      
      setIsAdmin(true);
      const adminSupabase = createAdminClient();

      try {
        const [feedbackRes, projectsRes, profilesRes] = await Promise.all([
          
          adminSupabase
            .from('feedback')
            .select(`
              id, created_at, category, message, page_url, user_id,
              admin_notes, is_resolved 
            `) 
            .order('created_at', { ascending: false }),
          
          adminSupabase
            .from('projects')
            .select('id', { count: 'exact', head: true }),
          
          adminSupabase
            .from('profiles')
            .select('id, business_name, slug, email')
            .order('updated_at', { ascending: false, nullsFirst: false })
        ]);

        if (feedbackRes.error) throw feedbackRes.error;
        setMasterFeedbackList(feedbackRes.data as Feedback[]);

        if (projectsRes.error) throw projectsRes.error;
        setTotalProjects(projectsRes.count || 0);

        if (profilesRes.error) throw profilesRes.error;
        setUserList(profilesRes.data as Profile[]); 
        setTotalUsers(profilesRes.data.length);

      } catch (err: any) {
        console.error("Error fetching admin data:", err);
        setError(`Failed to load admin data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    initializeAdmin();
  }, []);

  // --- Modal Handlers ---
  const handleOpenFeedback = (item: Feedback) => {
    setSelectedFeedback(item);
  };
  
  const handleCloseModal = () => {
    setSelectedFeedback(null);
  };

  const handleSaveNoteAndResolve = async (itemId: string, newNote: string, newResolvedStatus: boolean) => {
    setIsSavingNote(true);
    const adminSupabase = createAdminClient(); 

    const savePromise = async () => {
      //
      // --- THIS IS THE FIX ---
      //
      const { data, error } = await adminSupabase
        .from('feedback')
        .update({
          admin_notes: newNote,
          is_resolved: newResolvedStatus
        })
        .eq('id', itemId)
        .select(); // <-- REMOVED .single()
      
      if (error) {
        console.error("Supabase update error:", error);
        throw error; // This will be caught by toast.promise
      }

      // Check if data was returned (it might not be due to RLS quirk)
      if (!data || data.length === 0) {
        console.warn("Update succeeded but SELECT returned 0 rows. Using local data for UI update.");
        // We return a "partial" feedback object with just the changed data
        return { 
          id: itemId, 
          admin_notes: newNote, 
          is_resolved: newResolvedStatus 
        } as Partial<Feedback>; // Use Partial<Feedback>
      }

      return data[0] as Feedback; // Return the full updated row
      //
      // --- END OF FIX ---
      //
    };

    await toast.promise(savePromise(), {
      loading: 'Saving note...',
      success: (updatedItem) => {
        // Update the item in our master list
        setMasterFeedbackList(currentList => 
          currentList.map(item => 
            // Merge the partial or full updated item
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item
          )
        );
        setIsSavingNote(false);
        handleCloseModal();
        return "Note saved successfully!";
      },
      error: (err) => {
        setIsSavingNote(false);
        return `Failed to save: ${err.message}`;
      }
    });
  };
  
  // --- Render Logic ---

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading Admin Dashboard...</div>;
  }
  
  if (error) {
     return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  
  if (!isAdmin) {
     return <div className="p-8 text-center text-red-500">Access Denied.</div>;
  }

  const userMap = new Map(userList.map(user => [user.id, user.email || 'No Email']));

  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of all beta test activity.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard title="Total Users" value={totalUsers} description="All signed-up profiles" icon={UsersIcon} />
        <StatCard title="Total Projects" value={totalProjects} description="All projects created" icon={DocumentDuplicateIcon} />
        <StatCard 
          title="New Feedback" 
          value={newFeedback.length} 
          description={`${masterFeedbackList.length} total submissions`}
          icon={InboxIcon} 
        />
      </div>

      {/* Data Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        
        {/* Column 1: Feedback */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">New Feedback ({newFeedback.length})</h2>
          <div className="space-y-4">
            {newFeedback.length > 0 ? (
              newFeedback.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => handleOpenFeedback(item)}
                  className="w-full p-4 bg-slate-800 rounded-lg border border-slate-700 text-left transition-all hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-white truncate max-w-[200px]">
                      {userMap.get(item.user_id) || `Unknown User (${item.user_id.slice(0, 8)}...)`}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.admin_notes && (
                        <PencilSquareIcon className="h-4 w-4 text-slate-500" title="Note added" />
                      )}
                      <span className="text-xs text-orange-400 bg-orange-900/50 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 mb-2 truncate">{item.message}</p>
                  <p className="text-xs text-slate-500">
                    On page: <code className="text-slate-400">{item.page_url}</code>
                  </p>
                </button>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No new feedback. Inbox is clear!</p>
            )}
          </div>
          
          <details className="mt-8">
            <summary className="text-xl font-semibold text-white cursor-pointer hover:text-orange-400">
              Resolved Feedback ({resolvedFeedback.length})
            </summary>
            <div className="space-y-4 mt-6">
              {resolvedFeedback.length > 0 ? (
                resolvedFeedback.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => handleOpenFeedback(item)}
                    className="w-full p-4 bg-slate-800/60 rounded-lg border border-slate-700/60 text-left transition-all hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 opacity-70 hover:opacity-100"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-300 truncate max-w-[200px]">
                        {userMap.get(item.user_id) || `Unknown User`}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.admin_notes && (
                          <PencilSquareIcon className="h-4 w-4 text-slate-500" title="Note added" />
                        )}
                        <span className="text-xs text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckIcon className="h-3 w-3" /> Resolved
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mb-2 truncate">{item.message}</p>
                  </button>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No feedback resolved yet.</p>
              )}
            </div>
          </details>
        </div>

        {/* Column 2: Users */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Registered Users ({userList.length})</h2>
          <div className="space-y-4">
            {userList.length > 0 ? (
              userList.map(profile => (
                <div key={profile.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="text-sm font-semibold text-white">{profile.business_name || "No Business Name"}</p>
                  <p className="text-sm text-slate-400">{profile.email || "No Email Found"}</p>
                  <p className="text-xs text-slate-500 mt-1">Slug: {profile.slug || "Not set"}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-4">No users have signed up yet.</p>
            )}
          </div>
        </div>
      </div>
      
      <AdminFeedbackModal
        item={selectedFeedback}
        onClose={handleCloseModal}
        onSave={handleSaveNoteAndResolve}
        isSaving={isSavingNote}
        userEmail={userMap.get(selectedFeedback?.user_id || '') || 'Unknown User'}
      />
    </main>
  );
}

