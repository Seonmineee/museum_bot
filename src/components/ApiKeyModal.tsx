"use client";

import React, { useState } from "react";
import { CuratorSettings } from "@/types/chat";
import { X, Key, Globe, ExternalLink, Save, CheckCircle2 } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CuratorSettings;
  onSaveSettings: (settings: CuratorSettings) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [searchEnabled, setSearchEnabled] = useState(settings.searchEnabled);
  const [model, setModel] = useState(settings.model || "gemini-2.5-flash");
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      apiKey: apiKey.trim(),
      searchEnabled,
      model,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#fffdf9] p-5 shadow-2xl border border-[#e2d6c5]">
        <div className="flex items-center justify-between pb-3 border-b border-[#e2d6c5]">
          <div className="flex items-center gap-2 text-[#5e3e33]">
            <Key className="h-5 w-5" />
            <h3 className="font-bold text-base">환경 설정 (LLM & 웹 검색)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9c8273] hover:text-[#3c2a21] p-1 rounded-md hover:bg-[#f3ebde]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Gemini API Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#5e3e33]">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-[#8c5b43] hover:underline"
              >
                <span>무료 키 발급받기</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-lg border border-[#d7bd9c] bg-white px-3 py-2 text-sm text-[#3c2a21] placeholder-[#bca99a] focus:border-[#8c5b43] focus:outline-none font-mono"
            />
            <p className="mt-1 text-[11px] text-[#735345]">
              * 브라우저 로컬 저장소에 안전하게 보관됩니다. 키를 입력하지 않아도 내장 큐레이터 모드로 기본 체험이 가능합니다.
            </p>
          </div>

          {/* 웹 검색 토글 */}
          <div className="flex items-center justify-between rounded-xl border border-[#e2d6c5] bg-[#faf6f0] p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#3c2a21]">
                  구글 실시간 웹 검색 연동 (Grounding)
                </div>
                <div className="text-[11px] text-[#735345]">
                  물건의 유래 및 최신 전시 자료를 웹에서 검색해 답변합니다.
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={searchEnabled}
                onChange={(e) => setSearchEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* 모델 선택 */}
          <div>
            <label className="block text-xs font-bold text-[#5e3e33] mb-1">
              Gemini 모델 선택
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-[#d7bd9c] bg-white px-3 py-2 text-xs text-[#3c2a21] focus:border-[#8c5b43] focus:outline-none"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (권장: 초고속 및 실시간 검색 지원)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (안정적)</option>
              <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
            </select>
          </div>

          {/* Vercel 배포 안내 */}
          <div className="rounded-lg bg-[#f0e7d8]/60 p-2.5 text-[11px] text-[#634533] leading-relaxed border border-[#e2d6c5]">
            <span className="font-bold">Vercel 배포 팁:</span> Vercel 프로젝트 대시보드의 Environment Variables에 <code className="bg-white/80 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code>를 등록하면 사용자 입력 없이도 전역 활성화됩니다.
          </div>

          {/* 저장 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-[#735345] hover:bg-[#f3ebde]"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-[#8c5b43] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#734a3b] transition"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>저장 완료!</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>설정 저장하기</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
