"use client";

import { useState, useEffect } from "react";
import Link from "next/link";


interface Book {
  id: number;
  title: string;
  author: string;
  status: string;
  rating: number | null;
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Retrieve base API URL from env, default to local if not loaded
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/books`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch books (Status: ${res.status})`);
      }
      
      const data = await res.json();
      setBooks(data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Helper to render Status badges with premium aesthetic tags
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "read":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            Read Completed
          </span>
        );
      case "reading":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 animate-pulse shadow-sm">
            Currently Reading
          </span>
        );
      case "want_to_read":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
            Want to Read
          </span>
        );
    }
  };

  // Helper to render star rating beautifully
  const renderRating = (rating: number | null) => {
    if (rating === null) {
      return <span className="text-gray-400 text-xs italic">Not rated yet</span>;
    }

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-indigo-600 to-indigo-900 bg-clip-text text-transparent">
              My Personal Library
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Track your reading progress, organize your catalog, and review books.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
            <Link
              href="/books/new"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow transition-all duration-200"
            >
              <svg
                className="mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Book
            </Link>

            <button
              onClick={fetchBooks}
              className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <svg
                className="mr-2 h-4 w-4 text-slate-500 hover:text-indigo-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3 3L22 4" />
              </svg>
              Sync Library
            </button>
          </div>
        </header>

        {/* Loading State Grid */}
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse flex flex-col space-y-4"
              >
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                <div className="mt-auto pt-4 flex justify-between">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-xl mx-auto shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-rose-800">Connection Failed</h3>
            <p className="mt-2 text-sm text-rose-600">{error}</p>
            <button
              onClick={fetchBooks}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 shadow transition-all duration-200"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Empty State Banner */}
        {!loading && !error && books.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-xl mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-slate-900">Your shelf is empty</h3>
            <p className="mt-2 text-sm text-slate-500">
              Add books to your database to see them populate here.
            </p>
            <Link
              href="/books/new"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow transition-colors duration-200"
            >
              Add Your First Book
            </Link>
          </div>
        )}

        {/* Books Grid */}
        {!loading && !error && books.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <div
                key={book.id}
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      ID: #{book.id}
                    </span>
                    {renderStatusBadge(book.status)}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors duration-200">
                    {book.title}
                  </h3>
                  
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    by <span className="text-slate-700">{book.author}</span>
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Rating
                  </span>
                  {renderRating(book.rating)}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
