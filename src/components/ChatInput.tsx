"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const QUICK_PROMPTS = [
  { label: "삐삐", text: "삐삐는 누가 어떻게 썼어?" },
  { label: "다듬이", text: "다듬이돌과 방망이는 언제 썼어?" },
  { label: "연탄난로", text: "연탄난로는 어떻게 썼어?" },
  { label: "공중전화", text: "공중전화 카드는 언제 썼어?" },
  { label: "보온도시락", text: "보온도시락은 누가 썼어?" },
  { label: "대신 써줘", text: "안내문 대신 써줘!" },
  { label: "다 알았어요", text: "이제 다 알았어요!" },
];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-[#e2d6c5] bg-[#fffdfa]/95 px-3 py-2.5 sm:px-6 backdrop-blur-md">
      {/* 퀵 질문 칩 */}
      <div className="mb-2 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <div className="flex items-center gap-1 text-[#8c5b43] font-semibold whitespace-nowrap pl-1">
          <Sparkles className="h-3 w-3" />
          <span>질문:</span>
        </div>
        {QUICK_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(p.text)}
            disabled={isLoading}
            className="flex-shrink-0 rounded-full border border-[#d7bd9c] bg-[#faf6f0] px-2.5 py-1 text-xs text-[#5e3e33] transition hover:bg-[#e6d5bf] disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
        <div className="relative flex-1 rounded-2xl border border-[#d7bd9c] bg-white shadow-sm focus-within:border-[#8c5b43] focus-within:ring-2 focus-within:ring-[#ba8b5f]/30">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            placeholder="물건에 대해 물어보렴 (예: 삐삐는 누가 썼어?)"
            className="w-full resize-none rounded-2xl bg-transparent py-2.5 pl-4 pr-10 text-sm sm:text-base text-[#3c2a21] placeholder-[#b09684] focus:outline-none disabled:bg-gray-50"
          />
        </div>

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8c5b43] to-[#5e3e33] text-white shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          title="질문 전송"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
