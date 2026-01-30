'use client';

import { Streamdown } from 'streamdown';
import { ComponentType } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  markdownComponents?: Record<string, ComponentType<any>>;
}

export default function ChatMessage({ role, content, markdownComponents }: ChatMessageProps) {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-blue-600 px-4 py-3 text-white">
          <div className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="prose prose-sm prose-invert max-w-none wrap-break-word prose-p:my-1 prose-p:leading-normal prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:mb-1 prose-headings:mt-3 prose-pre:bg-neutral-800">
      <Streamdown components={markdownComponents}>{content}</Streamdown>
    </div>
  );
}
