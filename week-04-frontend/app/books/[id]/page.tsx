"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface Book {
  id: number;
  title: string;
  author: string;
  status: string;
  rating: number | null;
}

export default function BookDetailPage() {
  const router = useRouter();
  const params = useParams();
  const idStr = params.id as string;
  const bookId = parseInt(idStr);

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Action states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [markReadRating, setMarkReadRating] = useState<string>("5");
  const [showRatingSelector, setShowRatingSelector] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/books/${bookId}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Book not found in database.");
        }
        throw new Error("Failed to load book details.");
      }
      
      const data = await res.json();
      setBook(data);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId]);

  // Handle Mark as Read (PUT request)
  async function handleMarkAsRead(selectedRating: number) {
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_URL}/books/${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "read",
          rating: selectedRating,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      const updatedBook = await res.json();
      setBook(updatedBook);
      setShowRatingSelector(false);
    } catch (err: any) {
      alert(err.message || "Error updating book");
    } finally {
      setIsUpdating(false);
    }
  }

  // Handle Delete (DELETE request)
  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/books/${bookId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete book");
      }

      router.push("/books"); // Return to list page
    } catch (err: any) {
      alert(err.message || "Error deleting book");
      setIsDeleting(false);
    }
  }

  // Helper to render star rating beautifully
  const renderStars = (rating: number | null) => {
    if (rating === null) return null;
    return (
      <div className="flex gap-1 mt-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-6 h-6 ${i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>
    );
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "read":
        return {
          label: "Read Completed",
          classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "reading":
        return {
          label: "Currently Reading",
          classes: "bg-blue-50 text-blue-700 border-blue-200 animate-pulse",
        };
      case "want_to_read":
      default:
        return {
          label: "Want to Read",
          classes: "bg-amber-50 text-amber-700 border-amber-200",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Link */}
        <Link
          href="/books"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-8 transition-colors duration-200 group"
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

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm animate-pulse space-y-6">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/2"></div>
            <div className="h-32 bg-slate-100 rounded-2xl"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center shadow-sm">
            <svg
              className="mx-auto h-16 w-16 text-rose-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-xl font-bold text-rose-800">Book Not Found</h3>
            <p className="mt-2 text-slate-600">{error}</p>
            <Link
              href="/books"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-rose-600 hover:bg-rose-700 shadow transition-all duration-200"
            >
              Return to Catalog
            </Link>
          </div>
        )}

        {/* Details Card */}
        {book && !loading && !error && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
            {/* Header border stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600" />
            
            {/* Metadata / Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Book ID: #{book.id}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${getStatusDisplay(book.status).classes}`}>
                {getStatusDisplay(book.status).label}
              </span>
            </div>

            {/* Title & Author */}
            <div className="space-y-3 mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {book.title}
              </h1>
              <p className="text-lg text-slate-500 font-medium">
                by <span className="text-slate-800 font-semibold">{book.author}</span>
              </p>
            </div>

            {/* Rating Section */}
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Personal Rating
                </span>
                {book.rating !== null ? (
                  <div className="flex items-center gap-2">
                    {renderStars(book.rating)}
                    <span className="text-sm font-semibold text-slate-600 mt-1">({book.rating} / 5)</span>
                  </div>
                ) : (
                  <span className="text-slate-500 text-sm font-medium italic">Unrated</span>
                )}
              </div>

              {/* Status Actions */}
              {book.status !== "read" && !showRatingSelector && (
                <button
                  onClick={() => setShowRatingSelector(true)}
                  className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm focus:outline-none transition-all duration-200"
                >
                  <svg
                    className="mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Read
                </button>
              )}
            </div>

            {/* Inline Rating Selection for "Mark as Read" action */}
            {showRatingSelector && (
              <div className="p-6 border border-emerald-100 bg-emerald-50/30 rounded-2xl mb-8 animate-fade-in">
                <h3 className="text-sm font-bold text-emerald-950 mb-3 uppercase tracking-wider">
                  How would you rate this book?
                </h3>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <select
                    value={markReadRating}
                    onChange={(e) => setMarkReadRating(e.target.value)}
                    className="flex-1 px-4 py-2 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white text-emerald-950 font-semibold"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 / 5)</option>
                    <option value="4">⭐⭐⭐⭐ (4 / 5)</option>
                    <option value="3">⭐⭐⭐ (3 / 5)</option>
                    <option value="2">⭐⭐ (2 / 5)</option>
                    <option value="1">⭐ (1 / 5)</option>
                  </select>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setShowRatingSelector(false)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-semibold rounded-xl text-sm transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleMarkAsRead(parseInt(markReadRating))}
                      disabled={isUpdating}
                      className="px-4 py-2 border border-transparent text-white bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-xl text-sm shadow transition-all duration-200"
                    >
                      {isUpdating ? "Saving..." : "Confirm & Save"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Destructive / Action Buttons */}
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
              {confirmDelete ? (
                <div className="flex items-center gap-3 w-full sm:w-auto p-3 bg-rose-50 border border-rose-100 rounded-2xl animate-shake">
                  <span className="text-sm font-semibold text-rose-800 pl-2">
                    Are you sure?
                  </span>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-xs transition-colors duration-200 ml-auto"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-3 py-1.5 border border-transparent bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors duration-200"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 bg-white rounded-xl text-sm font-semibold hover:bg-rose-50/30 transition-all duration-200"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Book
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
