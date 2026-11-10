"use client";

import React, { useState, useEffect, useRef } from "react";
import { Message, CuratorSettings } from "@/types/chat";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { WorksheetPanel } from "@/components/WorksheetPanel";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { Sparkles, Info, AlertCircle } from "lucide-react";

const INITIAL_MESSAGE: Message = {
  id: "welcome-1",
  role: "assistant",
  content:
    "안녕! 옛 생활 박물관 선배 큐레이터야. 어떤 옛 물건의 안내문을 쓰고 싶니? 물건 이름을 말해줘!",
  timestamp: Date.now(),
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWorksheetOpen, setIsWorksheetOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [settings, setSettings] = useState<CuratorSettings>({
    apiKey: "",
    searchEnabled: true,
    model: "gemini-2.5-flash",
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // 로컬 스토리지에서 설정 불러오기
  useEffect(() => {
    try {
      const savedApiKey = localStorage.getItem("curator_gemini_api_key") || "";
      const savedSearch = localStorage.getItem("curator_search_enabled");
      const savedModel = localStorage.getItem("curator_model") || "gemini-2.5-flash";

      setSettings({
        apiKey: savedApiKey,
        searchEnabled: savedSearch !== null ? savedSearch === "true" : true,
        model: savedModel,
      });
    } catch (e) {
      console.warn("로컬 스토리지 접근 오류:", e);
    }
  }, []);

  const handleSaveSettings = (newSettings: CuratorSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem("curator_gemini_api_key", newSettings.apiKey);
      localStorage.setItem("curator_search_enabled", String(newSettings.searchEnabled));
      localStorage.setItem("curator_model", newSettings.model);
    } catch (e) {
      console.warn("로컬 스토리지 저장 오류:", e);
    }
  };

  // 메시지 추가 시 스크롤 이동
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    setNotice(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          apiKey: settings.apiKey,
          searchEnabled: settings.searchEnabled,
          model: settings.model,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "답변을 불러오지 못했습니다.");
      }

      const assistantMessage: Message = {
        id: `curator-${Date.now()}`,
        role: "assistant",
        content: data.content,
        timestamp: Date.now(),
        groundingMetadata: data.groundingMetadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (data.notice) {
        setNotice(data.notice);
      }
      if (data.errorNotice) {
        setNotice(data.errorNotice);
      }
    } catch (err: any) {
      console.error("Chat Error:", err);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "그건 나도 잘 모르겠어. 선생님께 여쭤보자.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setNotice("네트워크 또는 API 연결 상태를 확인해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    if (confirm("대화 내용을 모두 지우고 처음부터 다시 시작할까요?")) {
      setMessages([INITIAL_MESSAGE]);
      setNotice(null);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#f7f3ed]">
      {/* 상단 헤더 */}
      <ChatHeader
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetChat={handleResetChat}
        onToggleWorksheet={() => setIsWorksheetOpen(!isWorksheetOpen)}
        isWorksheetOpen={isWorksheetOpen}
        hasApiKey={Boolean(settings.apiKey)}
        searchEnabled={settings.searchEnabled}
      />

      {/* 알림 배너 */}
      {!settings.apiKey && (
        <div className="flex items-center justify-between bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-800">
          <div className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
            <span>내장 모드로 실행 중입니다.</span>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="font-bold underline hover:text-amber-900"
          >
            API 키 설정
          </button>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-1.5 bg-blue-50 border-b border-blue-200 px-4 py-1.5 text-xs text-blue-800">
          <AlertCircle className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 중앙 본문 영역: 채팅 영역 + 활동지 패널 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 채팅 영역 */}
        <div className="flex flex-1 flex-col overflow-hidden bg-[#fffdfa]/60">
          {/* 메시지 스크롤 영역 */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f3ebd9]/70">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* AI 생각 중 로딩 인디케이터 */}
            {isLoading && (
              <div className="flex w-full gap-3 py-3 px-3 sm:px-6">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#8c5b43] to-[#5e3e33] text-white shadow">
                  <Sparkles className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-2xl bg-[#fffdfa] border border-[#e5d8c6] px-4 py-2.5 text-xs text-[#735345] shadow-sm flex items-center gap-2">
                  <span className="flex space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8c5b43] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8c5b43] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#8c5b43] animate-bounce"></span>
                  </span>
                  <span>답변을 적고 있어요...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* 하단 질문 입력창 */}
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>

        {/* 오른쪽 안내문 활동지 패널 */}
        <WorksheetPanel
          isOpen={isWorksheetOpen}
          onClose={() => setIsWorksheetOpen(false)}
        />
      </div>

      {/* API 키 및 설정 모달 */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
