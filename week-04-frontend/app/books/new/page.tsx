"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewBookPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("want_to_read");
  const [rating, setRating] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Prepare submit payload
    // If rating is provided and status is 'read', convert to int, otherwise pass null
    const submitRating = status === "read" && rating !== "" ? parseInt(rating) : null;

    try {
      const res = await fetch(`${API_URL}/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          author,
          status,
          rating: submitRating,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to create book");
      }

      router.push("/books"); // Navigate back to the list page on success
    } catch (err: any) {
      setError(err.message || "Error creating book");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Back Link */}
        <Link
          href="/books"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors duration-200 group"
        >
          <svg
            className="mr-2 h-4 w-4 transform group-hover:-translate-x-1 transition-transform duration-200"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Library
        </Link>

        {/* Form Container Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-bold text-slate-900 bg-gradient-to-r from-indigo-600 to-indigo-900 bg-clip-text text-transparent">
              Add a New Book
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Expand your shelf by cataloging a new read.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-800 flex items-start gap-2.5 shadow-sm animate-shake">
              <svg
                className="h-5 w-5 text-rose-500 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                Book Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Hobbit"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 placeholder-slate-400 bg-slate-50 hover:bg-slate-50/50 focus:bg-white"
              />
            </div>

            {/* Author Input */}
            <div>
              <label htmlFor="author" className="block text-sm font-semibold text-slate-700 mb-2">
                Author
              </label>
              <input
                id="author"
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. J.R.R. Tolkien"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 placeholder-slate-400 bg-slate-50 hover:bg-slate-50/50 focus:bg-white"
              />
            </div>

            {/* Status Select */}
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-2">
                Reading Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  if (e.target.value !== "read") {
                    setRating(""); // reset rating if status is not read
                  }
                }}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 bg-slate-50 hover:bg-slate-50/50 focus:bg-white text-slate-800 font-medium"
              >
                <option value="want_to_read">Want to Read</option>
                <option value="reading">Currently Reading</option>
                <option value="read">Read Completed</option>
              </select>
            </div>

            {/* Conditional Rating Field (only if status is 'read') */}
            {status === "read" && (
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl animate-fade-in">
                <label htmlFor="rating" className="block text-sm font-semibold text-indigo-900 mb-2">
                  Rating (Optional)
                </label>
                <select
                  id="rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 bg-white text-indigo-950 font-medium"
                >
                  <option value="">Choose a rating...</option>
                  <option value="5">⭐⭐⭐⭐⭐ (5 / 5)</option>
                  <option value="4">⭐⭐⭐⭐ (4 / 5)</option>
                  <option value="3">⭐⭐⭐ (3 / 5)</option>
                  <option value="2">⭐⭐ (2 / 5)</option>
                  <option value="1">⭐ (1 / 5)</option>
                </select>
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-100 flex gap-4">
              <Link
                href="/books"
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm focus:outline-none transition-colors duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 shadow-sm hover:shadow focus:outline-none transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  "Add to Shelf"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
