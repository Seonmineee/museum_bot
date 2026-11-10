import { NextRequest, NextResponse } from "next/server";
import { CURATOR_SYSTEM_PROMPT } from "@/lib/curator-prompt";
import { getMockCuratorResponse } from "@/lib/curator-mock";
import { Message, GroundingMetadata } from "@/types/chat";

interface ChatRequestBody {
  messages: Message[];
  apiKey?: string;
  searchEnabled?: boolean;
  model?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { messages, apiKey: userApiKey, searchEnabled = true, model = "gemini-2.5-flash" } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "메시지가 비어 있습니다." },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "마지막 메시지는 사용자의 질문이어야 합니다." },
        { status: 400 }
      );
    }

    // API Key 우선순위: 1) 클라이언트 설정 키, 2) 환경변수 GEMINI_API_KEY
    const apiKey = userApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();

    // API Key가 없으면 안내 및 내장 큐레이터 엔진으로 응답
    if (!apiKey) {
      const mockResult = getMockCuratorResponse(lastMessage.content);
      return NextResponse.json({
        content: mockResult.content,
        groundingMetadata: mockResult.groundingMetadata,
        isMock: true,
        notice: "Gemini API 키를 입력하시면 실시간 웹 검색 및 최신 모델 추론이 적용됩니다.",
      });
    }

    // Gemini API 호출 준비
    // 대화 히스토리 포맷팅 (role: user / model)
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Google Search Grounding 도구 설정
    const tools = searchEnabled ? [{ googleSearch: {} }] : [];

    const requestPayload: any = {
      system_instruction: {
        parts: [{ text: CURATOR_SYSTEM_PROMPT }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
      },
    };

    if (tools.length > 0) {
      requestPayload.tools = tools;
    }

    // Gemini 모델 호출 (gemini-2.5-flash 기본, 오류 시 gemini-1.5-flash 등 지원)
    const targetModel = model || "gemini-2.5-flash";
    const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error("Gemini API Error Response:", errorText);

      // 모델명 호환성 시도 (gemini-1.5-flash 폴백)
      if (targetModel !== "gemini-1.5-flash") {
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const fallbackResp = await fetch(fallbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        });

        if (fallbackResp.ok) {
          const fbData = await fallbackResp.json();
          return processGeminiSuccess(fbData);
        }
      }

      // API 오류 시 사용자 친화적인 에러 응답 및 폴백
      const mockResult = getMockCuratorResponse(lastMessage.content);
      return NextResponse.json({
        content: mockResult.content,
        groundingMetadata: mockResult.groundingMetadata,
        isMock: true,
        errorNotice: `Gemini API 호출 중 오류가 발생하여 내장 답변을 제공합니다: ${apiResponse.statusText}`,
      });
    }

    const data = await apiResponse.json();
    return processGeminiSuccess(data);
  } catch (error: any) {
    console.error("Server API Error:", error);
    return NextResponse.json(
      {
        error: "서버에서 응답을 생성하는 중 문제가 발생했습니다.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

function processGeminiSuccess(data: any) {
  const candidate = data.candidates?.[0];
  let replyText = candidate?.content?.parts?.map((p: any) => p.text || "").join("").trim() || "";

  // 이모지 필터링 (규칙 10: "이모지는 쓰지 않는다" 엄격 준수)
  replyText = removeEmojis(replyText);

  // Grounding 메타데이터 추출 (웹 검색 결과)
  const groundingMetadataRaw = candidate?.groundingMetadata;
  let groundingMetadata: GroundingMetadata | undefined;

  if (groundingMetadataRaw) {
    const searchQueries: string[] = groundingMetadataRaw.webSearchQueries || [];
    const sources: { title: string; url: string }[] = [];

    if (Array.isArray(groundingMetadataRaw.groundingChunks)) {
      for (const chunk of groundingMetadataRaw.groundingChunks) {
        if (chunk?.web?.uri) {
          sources.push({
            title: chunk.web.title || "웹 검색 출처",
            url: chunk.web.uri,
          });
        }
      }
    }

    if (searchQueries.length > 0 || sources.length > 0) {
      groundingMetadata = {
        searchQueries,
        sources,
      };
    }
  }

  return NextResponse.json({
    content: replyText,
    groundingMetadata,
    isMock: false,
  });
}

function removeEmojis(text: string): string {
  // Unicode emoji regex
  return text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  ).trim();
}
