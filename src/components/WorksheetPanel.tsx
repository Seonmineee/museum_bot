"use client";

import React, { useState } from "react";
import { WorksheetData } from "@/types/chat";
import { FileText, Copy, Check, Printer, Sparkles, X } from "lucide-react";

interface WorksheetPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorksheetPanel: React.FC<WorksheetPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [data, setData] = useState<WorksheetData>({
    itemName: "",
    whenUsed: "",
    whoUsed: "",
    howUsed: "",
    conclusionBlank: "",
  });

  const [copied, setCopied] = useState(false);

  const fullNoticeText = `[안내문]
- 물건: ${data.itemName || "(물건 이름)"}
- 때: ${data.whenUsed || "(언제)"}
- 사람: ${data.whoUsed || "(누가)"}
- 방법: ${data.howUsed || "(어떻게)"}

이 물건을 통해 옛 사람들이 ${data.conclusionBlank || "________"} 했다는 것을 알 수 있어요.`;

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(fullNoticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="w-full md:w-80 flex-shrink-0 border-l border-[#e2d6c5] bg-[#fffdf9] p-3.5 overflow-y-auto flex flex-col h-full shadow-lg">
      <div className="flex items-center justify-between pb-2 border-b border-[#e2d6c5]">
        <div className="flex items-center gap-1.5 text-[#5e3e33]">
          <FileText className="h-4 w-4" />
          <h2 className="font-bold text-sm">안내문 활동지</h2>
        </div>
        <button
          onClick={onClose}
          className="text-[#9c8273] hover:text-[#3c2a21] p-1 rounded hover:bg-[#f3ebde]"
          title="닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 활동지 입력 양식 */}
      <div className="mt-3 space-y-2.5 flex-1">
        <div>
          <label className="block text-xs font-bold text-[#5e3e33] mb-1">
            1. 물건 이름
          </label>
          <input
            type="text"
            placeholder="예: 삐삐, 다듬이돌"
            value={data.itemName}
            onChange={(e) => setData({ ...data, itemName: e.target.value })}
            className="w-full rounded-lg border border-[#d7bd9c] bg-white px-2.5 py-1.5 text-xs text-[#3c2a21] placeholder-[#bca99a] focus:border-[#8c5b43] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#5e3e33] mb-1">
            2. 언제?
          </label>
          <input
            type="text"
            placeholder="예: 할머니가 어릴 때"
            value={data.whenUsed}
            onChange={(e) => setData({ ...data, whenUsed: e.target.value })}
            className="w-full rounded-lg border border-[#d7bd9c] bg-white px-2.5 py-1.5 text-xs text-[#3c2a21] placeholder-[#bca99a] focus:border-[#8c5b43] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#5e3e33] mb-1">
            3. 누가?
          </label>
          <input
            type="text"
            placeholder="예: 어머니들, 학생들"
            value={data.whoUsed}
            onChange={(e) => setData({ ...data, whoUsed: e.target.value })}
            className="w-full rounded-lg border border-[#d7bd9c] bg-white px-2.5 py-1.5 text-xs text-[#3c2a21] placeholder-[#bca99a] focus:border-[#8c5b43] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#5e3e33] mb-1">
            4. 어떻게?
          </label>
          <textarea
            rows={2}
            placeholder="예: 옷감을 돌에 얹고 방망이로 두드렸어요."
            value={data.howUsed}
            onChange={(e) => setData({ ...data, howUsed: e.target.value })}
            className="w-full rounded-lg border border-[#d7bd9c] bg-white px-2.5 py-1.5 text-xs text-[#3c2a21] placeholder-[#bca99a] focus:border-[#8c5b43] focus:outline-none"
          />
        </div>

        <div className="rounded-lg border border-dashed border-[#ba8b5f] bg-[#faf6f0] p-2.5">
          <label className="flex items-center gap-1 text-xs font-bold text-[#8c5b43] mb-1">
            <Sparkles className="h-3 w-3" />
            <span>5. 마지막 빈칸 채우기</span>
          </label>
          <div className="text-xs text-[#5e3e33] leading-relaxed">
            &quot;이 물건을 통해 옛 사람들이
            <input
              type="text"
              placeholder="직접 생각해서 채우기"
              value={data.conclusionBlank}
              onChange={(e) => setData({ ...data, conclusionBlank: e.target.value })}
              className="mx-1 my-1 inline-block border-b-2 border-[#8c5b43] bg-white px-1.5 py-0.5 text-xs font-semibold text-[#8c5b43] focus:outline-none rounded w-full"
            />
            했다는 것을 알 수 있어요.&quot;
          </div>
        </div>

        {/* 완성된 미리보기 카드 */}
        <div className="mt-2 rounded-lg border border-[#e2d6c5] bg-white p-2.5 shadow-inner">
          <div className="text-[11px] font-bold text-[#5e3e33] mb-1">
            미리보기:
          </div>
          <div className="rounded bg-[#f9f5ef] p-2 text-xs text-[#3c2a21] whitespace-pre-wrap font-sans leading-relaxed border border-[#eedfcb]">
            {fullNoticeText}
          </div>
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="mt-3 pt-2.5 border-t border-[#e2d6c5] flex gap-2">
        <button
          onClick={handleCopyNotice}
          className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-[#8c5b43] px-2.5 py-1.5 text-xs font-bold text-white shadow hover:bg-[#734a3b] transition"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              <span>복사됨!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>전체 복사</span>
            </>
          )}
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-1 rounded-lg border border-[#d7bd9c] bg-[#f3ebde] px-2.5 py-1.5 text-xs font-bold text-[#5e3e33] hover:bg-[#e6d5bf] transition"
          title="인쇄"
        >
          <Printer className="h-3 w-3" />
          <span>인쇄</span>
        </button>
      </div>
    </div>
  );
};
