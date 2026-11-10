"use client";

import React from "react";
import { Landmark, Settings, RotateCcw, FileText, Globe } from "lucide-react";

interface ChatHeaderProps {
  onOpenSettings: () => void;
  onResetChat: () => void;
  onToggleWorksheet: () => void;
  isWorksheetOpen: boolean;
  hasApiKey: boolean;
  searchEnabled: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onOpenSettings,
  onResetChat,
  onToggleWorksheet,
  isWorksheetOpen,
  hasApiKey,
  searchEnabled,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e2d6c5] bg-[#fffdfa]/95 px-4 py-3 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8c5b43] to-[#5e3e33] text-white shadow-md">
          <Landmark className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-[#3c2a21]">
              옛 생활 박물관 큐레이터
            </h1>
            <span className="inline-flex items-center rounded-full bg-[#f3ebde] px-2 py-0.5 text-[11px] font-semibold text-[#8c5b43] border border-[#d7bd9c]">
              초등 3학년
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 웹 검색 상태 배지 */}
        <div
          title={searchEnabled ? "웹 검색 기능 활성화됨" : "웹 검색 비활성화됨"}
          className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
            searchEnabled
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-gray-100 text-gray-500 border-gray-200"
          }`}
        >
          <Globe className="h-3 w-3" />
          <span>웹 검색 {searchEnabled ? "ON" : "OFF"}</span>
        </div>

        {/* 안내문 워크시트 토글 버튼 */}
        <button
          onClick={onToggleWorksheet}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm ${
            isWorksheetOpen
              ? "bg-[#8c5b43] text-white hover:bg-[#734a3b]"
              : "bg-[#f3ebde] text-[#5e3e33] border border-[#d7bd9c] hover:bg-[#e6d5bf]"
          }`}
          title="안내문 작성 활동지 열기/닫기"
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">나의 안내문 활동지</span>
          <span className="sm:hidden">활동지</span>
        </button>

        {/* 대화 초기화 */}
        <button
          onClick={onResetChat}
          className="p-2 text-[#735345] hover:text-[#3c2a21] hover:bg-[#f3ebde] rounded-lg transition"
          title="새로운 대화 시작하기"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        {/* 설정 버튼 */}
        <button
          onClick={onOpenSettings}
          className={`relative p-2 rounded-lg transition ${
            !hasApiKey
              ? "text-amber-700 bg-amber-100 hover:bg-amber-200"
              : "text-[#735345] hover:text-[#3c2a21] hover:bg-[#f3ebde]"
          }`}
          title="설정 (Gemini API 키 및 옵션)"
        >
          <Settings className="h-4 w-4" />
          {!hasApiKey && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
