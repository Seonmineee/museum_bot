"use client";

import React, { useState, useEffect } from "react";
import { CuratorSettings, ProviderType } from "@/types/chat";
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
  const [provider, setProvider] = useState<ProviderType>(settings.provider || "gemini");
  const [apiKey, setApiKey] = useState(settings.apiKey || "");
  const [searchEnabled, setSearchEnabled] = useState(settings.searchEnabled);
  const [model, setModel] = useState(settings.model || "gemini-2.5-flash");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setProvider(settings.provider || "gemini");
    setApiKey(settings.apiKey || "");
    setSearchEnabled(settings.searchEnabled);
    setModel(settings.model || (settings.provider === "openai" ? "gpt-4o-mini" : "gemini-2.5-flash"));
  }, [settings, isOpen]);

  // 키 입력 시 sk- 로 시작하면 자동으로 OpenAI로 전환
  const handleKeyChange = (val: string) => {
    setApiKey(val);
    if (val.trim().startsWith("sk-") && provider !== "openai") {
      setProvider("openai");
      setModel("gpt-4o-mini");
    }
  };

  const handleProviderChange = (newProvider: ProviderType) => {
    setProvider(newProvider);
    if (newProvider === "openai") {
      setModel("gpt-4o-mini");
    } else {
      setModel("gemini-2.5-flash");
    }
  };

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      apiKey: apiKey.trim(),
      provider,
      searchEnabled,
      model,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#fffdf9] p-5 shadow-2xl border border-[#e2d6c5]">
        <div className="flex items-center justify-between pb-3 border-b border-[#e2d6c5]">
          <div className="flex items-center gap-2 text-[#5e3e33]">
            <Key className="h-5 w-5" />
            <h3 className="font-bold text-sm sm:text-base">AI 모델 & API 키 설정</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9c8273] hover:text-[#3c2a21] p-1 rounded-md hover:bg-[#f3ebde]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* AI 제공자 선택 탭 (Gemini vs OpenAI) */}
          <div>
            <label className="block text-xs font-bold text-[#5e3e33] mb-1.5">
              사용할 AI 서비스
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleProviderChange("gemini")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  provider === "gemini"
                    ? "bg-[#8c5b43] text-white border-[#8c5b43] shadow-sm"
                    : "bg-white text-[#735345] border-[#d7bd9c] hover:bg-[#faf6f0]"
                }`}
              >
                Google Gemini (추천)
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange("openai")}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                  provider === "openai"
                    ? "bg-[#10a37f] text-white border-[#10a37f] shadow-sm"
                    : "bg-white text-[#735345] border-[#d7bd9c] hover:bg-[#faf6f0]"
                }`}
              >
                OpenAI (ChatGPT)
              </button>
            </div>
          </div>

          {/* API Key 입력 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#5e3e33]">
                {provider === "openai" ? "OpenAI API Key" : "Google Gemini API Key"}
              </label>
              {provider === "openai" ? (
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[#10a37f] hover:underline"
                >
                  <span>키 발급받기</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              ) : (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-[#8c5b43] hover:underline"
                >
                  <span>무료 키 발급</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
            <input
              type="password"
              placeholder={provider === "openai" ? "sk-..." : "AIzaSy..."}
              value={apiKey}
              onChange={(e) => handleKeyChange(e.target.value)}
              className="w-full rounded-lg border border-[#d7bd9c] bg-white px-3 py-2 text-xs sm:text-sm text-[#3c2a21] placeholder-[#bca99a] focus:border-[#8c5b43] focus:outline-none font-mono"
            />
            <p className="mt-1 text-[11px] text-[#735345]">
              * 키가 없어도 내장 모드로 기본 대화가 가능합니다.
            </p>
          </div>

          {/* 세부 모델 선택 */}
          <div>
            <label className="block text-xs font-bold text-[#5e3e33] mb-1">
              세부 모델
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-lg border border-[#d7bd9c] bg-white px-3 py-2 text-xs text-[#3c2a21] focus:border-[#8c5b43] focus:outline-none"
            >
              {provider === "openai" ? (
                <>
                  <option value="gpt-4o-mini">GPT-4o mini (추천: 가볍고 빠름)</option>
                  <option value="gpt-4o">GPT-4o (최고 성능)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </>
              ) : (
                <>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (권장: 초고속+웹검색)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </>
              )}
            </select>
          </div>

          {/* Gemini인 경우 구글 실시간 웹 검색 옵션 */}
          {provider === "gemini" && (
            <div className="flex items-center justify-between rounded-xl border border-[#e2d6c5] bg-[#faf6f0] p-2.5">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-700" />
                <span className="text-xs font-bold text-[#3c2a21]">구글 실시간 웹 검색</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={searchEnabled}
                  onChange={(e) => setSearchEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
          )}

          {/* 저장 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#735345] hover:bg-[#f3ebde]"
            >
              닫기
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-[#8c5b43] px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-[#734a3b] transition"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>저장됨!</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>설정 저장</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
