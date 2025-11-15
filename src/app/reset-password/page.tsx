"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseClient } from "../../lib/supabaseClient";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          console.log("Password recovery event detected.");
          setShowForm(true);
          setMessage("Please enter your new password.");
        } else if (event === "SIGNED_IN") {
          toast.success("Already signed in. Redirecting...");
          router.push("/dashboard");
        }
      },
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      // Logic if needed
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const handlePasswordUpdate = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    const updatePromise = supabase.auth.updateUser({ password: password });
    await toast.promise(updatePromise, {
      loading: "Updating password...",
      success: () => {
        setMessage("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return "Password updated!";
      },
      error: (err: any) => {
        console.error("Password update error:", err.message);
        setError(`Error updating password: ${err.message}`);
        return `Error: ${err.message}`;
      },
    });
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
          {" "}
          Reset Your Password{" "}
        </h1>
        {showForm ? (
          <form onSubmit={handlePasswordUpdate}>
            <div className="mb-4">
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {" "}
                New Password{" "}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {" "}
                Confirm New Password{" "}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="mb-4 text-center text-sm text-red-600">{error}</p>
            )}
            {message && !error && (
              <p className="mb-4 text-center text-sm text-blue-600">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-md px-4 py-2 text-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${loading ? "cursor-not-allowed bg-orange-300" : "bg-orange-600 hover:bg-orange-700"}`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : (
          <p className="text-center text-gray-600">
            {message || "Checking for password recovery status..."}
            {!message && (
              <Link
                href="/login"
                className="mt-4 block text-sm text-orange-600 hover:text-orange-500"
              >
                Back to Login
              </Link>
            )}
          </p>
        )}
      </div>
    </main>
  );
}
