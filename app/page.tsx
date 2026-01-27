'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to create chat');
      }

      const { threadId } = await response.json();

      // Redirect to chat page with initial message
      router.push(`/chat/${threadId}?message=${encodeURIComponent(input)}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4">
      <main className="flex w-full max-w-2xl flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#ad0636]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="mb-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
          Missouri Bills
        </h1>
        <p className="mb-10 text-lg text-neutral-400">
          Search and explore Missouri House legislation
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Missouri House bills..."
              disabled={isLoading}
              className="w-full rounded-full border border-neutral-700 bg-neutral-900 px-6 py-4 pr-24 text-base text-white placeholder-neutral-500 transition-colors focus:border-blue-500/50 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#ad0636] px-5 py-2 text-sm font-medium text-white transition-all hover:bg-[#8a0529] disabled:opacity-50"
            >
              {isLoading ? (
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <span className="flex items-center gap-2">
                  Send
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Disclaimer */}
        <p className="mt-4 text-xs text-neutral-500">
          AI can make mistakes. Please double-check responses.
        </p>

        {/* Suggested Questions */}
        <div className="mt-10">
          <p className="mb-4 text-sm text-neutral-500">Try asking:</p>
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() =>
                handleSuggestedQuestion(
                  'What healthcare related bills have been introduced this session?'
                )
              }
              className="rounded-full border border-blue-800/50 bg-blue-950/30 px-4 py-2 text-sm text-blue-200 transition-colors hover:border-blue-700/50 hover:bg-blue-900/30"
            >
              What healthcare related bills have been introduced this session?
            </button>
            <button
              onClick={() =>
                handleSuggestedQuestion('Which bills have upcoming committee hearings?')
              }
              className="rounded-full border border-blue-800/50 bg-blue-950/30 px-4 py-2 text-sm text-blue-200 transition-colors hover:border-blue-700/50 hover:bg-blue-900/30"
            >
              Which bills have upcoming committee hearings?
            </button>
            <button
              onClick={() =>
                handleSuggestedQuestion('What education bills have passed the House this year?')
              }
              className="rounded-full border border-blue-800/50 bg-blue-950/30 px-4 py-2 text-sm text-blue-200 transition-colors hover:border-blue-700/50 hover:bg-blue-900/30"
            >
              What education bills have passed the House this year?
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 text-sm text-neutral-600">
          <p>
            Data from the{' '}
            <a
              href="https://house.mo.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 underline hover:text-neutral-400"
            >
              Missouri House of Representatives
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
