// src/app/dashboard/admin/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation"; // <-- 1. ADDED IMPORT
import { createSupabaseClient } from "@/lib/supabaseClient";
// import { createAdminClient } from '@/lib/supabaseAdminClient'; // <-- 2. REMOVED IMPORT
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import AdminFeedbackModal from "@/components/AdminFeedbackModal";

// --- Icons (All are correct) ---
const DocumentDuplicateIcon = ({
  title,
  ...props
}: React.SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    {" "}
    {title && <title>{title}</title>}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
    />{" "}
  </svg>
);
const UsersIcon = ({
  title,
  ...props
}: React.SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    {" "}
    {title && <title>{title}</title>}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.003c0 1.113.285 2.16.786 3.07M15 19.128c-1.113 0-2.16-.285-3.07-.786v-.003c-1.113 0-2.16.285-3.07.786m6.14 0c-1.113 0-2.16-.285-3.07-.786V15.07c0-1.113-.285-2.16-.786-3.07M15 19.128v-.003c0-1.113.285-2.16.786-3.07M9 15.07v.003c0 1.113.285 2.16.786 3.07M9 15.07c-1.113 0-2.16.285-3.07.786v-.003c-1.113 0-2.16-.285-3.07.786m6.14 0c-1.113 0-2.16-.285-3.07-.786V15.07"
    />{" "}
  </svg>
);
const ChatBubbleLeftRightIcon = ({
  title,
  ...props
}: React.SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    {" "}
    {title && <title>{title}</title>}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a.75.75 0 01-1.06 0l-3.72-3.72C9.847 17.001 9 16.036 9 14.9v-4.286c0-.97.616-1.813 1.5-2.097L12 6.75l3.75 1.761zm-6 3.486l-3.72 3.72a.75.75 0 000 1.06l3.72 3.72C11.153 20.89 12 19.925 12 18.887v-7.135c0-1.038-.847-2-1.98-2.093l-3.72-1.761a.75.75 0 00-.63.123 7.48 7.48 0 00-.738.738A7.47 7.47 0 003 11.25v4.286c0 .97.616 1.813 1.5 2.097L6 18.311v-.757c0-1.28.624-2.43 1.65-3.181l.71-.533zM18.75 9.75h.008v.008h-.008V9.75z"
    />{" "}
  </svg>
);
const CheckIcon = ({
  title,
  ...props
}: React.SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    {" "}
    {title && <title>{title}</title>}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />{" "}
  </svg>
);
const PencilSquareIcon = ({
  title,
  ...props
}: React.SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    {" "}
    {title && <title>{title}</title>}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
    />{" "}
  </svg>
);
const InboxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.121-1.58H6.881a2.25 2.25 0 00-2.121 1.58L2.35 13.177a2.25 2.25 0 00-.1.661z"
    />{" "}
  </svg>
);

// --- Re-using StatCard Component ---
type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
};
function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-lg shadow-orange-100/40">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
          {title}
        </p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
        <Icon className="size-6" />
      </div>
    </div>
  );
}

// --- TYPE DEFINITIONS ---
// 4. UPDATED TYPE: Feedback now includes a 'profiles' object
export type Feedback = {
  id: string;
  created_at: string;
  user_id: string;
  category: string | null;
  message: string;
  page_url: string | null;
  admin_notes: string | null;
  is_resolved: boolean | null;
  profiles: {
    // This data is 'joined' from the profiles table
    email: string | null;
    business_name: string | null;
  } | null; // It could be null if the profile was deleted
};
type Profile = {
  id: string;
  business_name: string | null;
  slug: string | null;
  email: string | null;
};

export default function AdminPage() {
  const router = useRouter(); // <-- 3. ADDED ROUTER
  const supabase = useMemo(() => createSupabaseClient(), []);

  // --- Data State (Kept all original states) ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [masterFeedbackList, setMasterFeedbackList] = useState<Feedback[]>([]);
  const [newFeedback, setNewFeedback] = useState<Feedback[]>([]);
  const [resolvedFeedback, setResolvedFeedback] = useState<Feedback[]>([]);
  const [userList, setUserList] = useState<Profile[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null,
  );
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    setNewFeedback(masterFeedbackList.filter((item) => !item.is_resolved));
    setResolvedFeedback(masterFeedbackList.filter((item) => item.is_resolved));
  }, [masterFeedbackList]);

  // <-- 5. REPLACED useEffect with the new fetch-based logic -->
  useEffect(() => {
    const initializeAdmin = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not logged in.");
        router.push("/login");
        return;
      }
      setCurrentUser(user);
      setIsAdmin(true); // Optimistically set to true. API will block if not admin.

      try {
        // We will create these API routes next
        const [feedbackRes, projectsCountRes, usersRes] = await Promise.all([
          fetch("/api/admin/feedback"),
          fetch("/api/admin/projects-count"),
          fetch("/api/admin/users"),
        ]);

        if (!feedbackRes.ok)
          throw new Error(
            `Failed to fetch feedback: ${await feedbackRes.text()}`,
          );
        if (!projectsCountRes.ok)
          throw new Error(
            `Failed to fetch project count: ${await projectsCountRes.text()}`,
          );
        if (!usersRes.ok)
          throw new Error(`Failed to fetch users: ${await usersRes.text()}`);

        const feedbackData = await feedbackRes.json();
        const projectsCountData = await projectsCountRes.json();
        const usersData = await usersRes.json();

        setMasterFeedbackList(feedbackData);
        setTotalProjects(projectsCountData.count || 0);
        setUserList(usersData);
        setTotalUsers(usersData.length);
      } catch (err: any) {
        console.error("Error fetching admin data:", err);
        setError(`Failed to load admin data: ${err.message}`);
        if (err.message.includes("Access Denied")) {
          setIsAdmin(false); // Correctly set admin status if API denies
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAdmin();
  }, [router, supabase]); // Added router dependency

  // --- Modal Handlers (Kept all original functions) ---
  const handleOpenFeedback = (item: Feedback) => {
    setSelectedFeedback(item);
  };

  const handleCloseModal = () => {
    setSelectedFeedback(null);
  };

  const handleSaveNoteAndResolve = async (
    itemId: string,
    newNote: string,
    newResolvedStatus: boolean,
  ) => {
    setIsSavingNote(true);

    // We can't use createAdminClient() anymore.
    // We must call a new API route to perform this action.

    // We will create this API route in the next step.
    const savePromise = fetch("/api/admin/feedback/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        feedbackId: itemId,
        admin_notes: newNote,
        is_resolved: newResolvedStatus,
      }),
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update");
      }
      return res.json();
    });

    await toast.promise(savePromise, {
      loading: "Saving note...",
      success: (updatedItem: Feedback) => {
        // Update the item in our master list
        setMasterFeedbackList((currentList) =>
          currentList.map((item) =>
            item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
          ),
        );
        setIsSavingNote(false);
        handleCloseModal();
        return "Note saved successfully!";
      },
      error: (err) => {
        setIsSavingNote(false);
        return `Failed to save: ${err.message}`;
      },
    });
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-10 text-sm text-slate-500">
        Loading Admin Dashboard...
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  // This check is now cosmetic, the API routes provide the real security
  if (!isAdmin) {
    return <div className="p-8 text-center text-red-600">Access Denied.</div>;
  }

  // 6. UPDATED userMap logic
  // The new API route joins the user email, so we don't need a separate map.
  // We can just access `item.profiles.email`.

  return (
    <main className="space-y-10 px-6 py-10 lg:px-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-1 text-slate-600">
          Overview of all beta test activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Total Users"
          value={totalUsers}
          description="All signed-up profiles"
          icon={UsersIcon}
        />
        <StatCard
          title="Total Projects"
          value={totalProjects}
          description="All projects created"
          icon={DocumentDuplicateIcon}
        />
        <StatCard
          title="New Feedback"
          value={newFeedback.length}
          description={`${masterFeedbackList.length} total submissions`}
          icon={InboxIcon}
        />
      </div>

      {/* Data Lists */}
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Column 1: Feedback */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            New Feedback ({newFeedback.length})
          </h2>
          <div className="space-y-4">
            {newFeedback.length > 0 ? (
              newFeedback.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleOpenFeedback(item)}
                  className="w-full rounded-2xl border border-orange-100 bg-white/90 p-4 text-left shadow-sm shadow-orange-100 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300"
                >
                  <div className="mb-2 flex items-center justify-between">
                    {/* 7. UPDATED to use new data shape */}
                    <span className="max-w-[200px] truncate text-sm font-semibold text-slate-900">
                      {item.profiles?.email ||
                        `Unknown User (${item.user_id.slice(0, 8)}...)`}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.admin_notes && (
                        <PencilSquareIcon
                          className="size-4 text-slate-400"
                          title="Note added"
                        />
                      )}
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <p className="mb-2 line-clamp-2 text-sm text-slate-600">
                    {item.message}
                  </p>
                  <p className="text-xs text-slate-500">
                    On page:{" "}
                    <code className="text-slate-400">{item.page_url}</code>
                  </p>
                </button>
              ))
            ) : (
              <p className="py-4 text-center text-slate-500">
                No new feedback. Inbox is clear!
              </p>
            )}
          </div>

          <details className="mt-8">
            <summary className="cursor-pointer text-xl font-semibold text-slate-900 transition hover:text-orange-500">
              Resolved Feedback ({resolvedFeedback.length})
            </summary>
            <div className="mt-6 space-y-4">
              {resolvedFeedback.length > 0 ? (
                resolvedFeedback.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleOpenFeedback(item)}
                    className="w-full rounded-2xl border border-emerald-100 bg-white/80 p-4 text-left shadow-sm shadow-emerald-100 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-300"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      {/* 7. UPDATED to use new data shape */}
                      <span className="max-w-[200px] truncate text-sm font-medium text-slate-700">
                        {item.profiles?.email || `Unknown User`}
                      </span>
                      <div className="flex items-center gap-2">
                        {item.admin_notes && (
                          <PencilSquareIcon
                            className="size-4 text-slate-400"
                            title="Note added"
                          />
                        )}
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                          <CheckIcon className="size-3" /> Resolved
                        </span>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {item.message}
                    </p>
                  </button>
                ))
              ) : (
                <p className="py-4 text-center text-slate-500">
                  No feedback resolved yet.
                </p>
              )}
            </div>
          </details>
        </div>

        {/* Column 2: Users */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            Registered Users ({userList.length})
          </h2>
          <div className="space-y-4">
            {userList.length > 0 ? (
              userList.map((profile) => (
                <div
                  key={profile.id}
                  className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm shadow-orange-100"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {profile.business_name || "No Business Name"}
                  </p>
                  <p className="text-sm text-slate-600">
                    {profile.email || "No Email Found"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Slug: {profile.slug || "Not set"}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-slate-500">
                No users have signed up yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <AdminFeedbackModal
        item={selectedFeedback}
        onClose={handleCloseModal}
        onSave={handleSaveNoteAndResolve}
        isSaving={isSavingNote}
        // 7. UPDATED to use new data shape
        userEmail={selectedFeedback?.profiles?.email || "Unknown User"}
      />
    </main>
  );
}
