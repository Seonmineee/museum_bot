"use client";

import React, { useState } from "react";
import { Message } from "@/types/chat";
import { Landmark, User, Globe, ExternalLink, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isCurator = message.role === "assistant";
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasSources =
    message.groundingMetadata?.sources &&
    message.groundingMetadata.sources.length > 0;

  return (
    <div
      className={`flex w-full gap-3 py-3 px-3 sm:px-6 transition-colors ${
        isCurator ? "bg-transparent" : "bg-[#f9f5ef]/50"
      }`}
    >
      {/* 아바타 아이콘 */}
      <div className="flex-shrink-0 pt-0.5">
        {isCurator ? (
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#8c5b43] to-[#5e3e33] text-white shadow">
            <Landmark className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        ) : (
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6b8e23] to-[#556b2f] text-white shadow">
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        )}
      </div>

      {/* 메시지 본체 */}
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-[#3c2a21]">
              {isCurator ? "선배 큐레이터" : "나 (초등 3학년)"}
            </span>
            <span className="text-[11px] text-[#9c8273]">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          {/* 복사 버튼 */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] text-[#9c8273] hover:text-[#5e3e33] transition"
            title="내용 복사하기"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span className="text-emerald-600">복사됨</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>복사</span>
              </>
            )}
          </button>
        </div>

        {/* 메시지 텍스트: 초등 3학년 친화적인 따뜻한 줄글 카드 */}
        <div
          className={`rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed break-words shadow-sm ${
            isCurator
              ? "bg-[#fffdfa] border border-[#e5d8c6] text-[#3c2a21]"
              : "bg-[#ebdcca]/60 border border-[#dbc6af] text-[#2c1d11]"
          }`}
        >
          {message.content}
        </div>

        {/* 웹 검색 출처 표시 (그라운딩 메타데이터) */}
        {hasSources && message.groundingMetadata?.sources && (
          <div className="mt-1.5 rounded-lg border border-[#e2d6c5] bg-[#fffcf7] px-3 py-2 text-xs text-[#735345]">
            <button
              onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex w-full items-center justify-between font-semibold hover:text-[#3c2a21]"
            >
              <div className="flex items-center gap-1.5 text-emerald-800">
                <Globe className="h-3.5 w-3.5" />
                <span>
                  웹 검색 참고 자료 ({message.groundingMetadata.sources.length}건)
                </span>
                {message.groundingMetadata.searchQueries &&
                  message.groundingMetadata.searchQueries.length > 0 && (
                    <span className="hidden sm:inline font-normal text-[#9c8273]">
                      · 검색어: {message.groundingMetadata.searchQueries.slice(0, 2).join(", ")}
                    </span>
                  )}
              </div>
              {sourcesOpen ? (
                <ChevronUp className="h-3.5 w-3.5 text-[#9c8273]" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-[#9c8273]" />
              )}
            </button>

            {sourcesOpen && (
              <div className="mt-2 space-y-1.5 border-t border-[#f0e3d2] pt-2">
                {message.groundingMetadata.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded px-2 py-1 hover:bg-[#f3ebde] transition text-[#5e3e33]"
                  >
                    <span className="truncate pr-2 font-medium">{src.title}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 text-[#9c8273]" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
