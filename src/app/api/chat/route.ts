import { NextRequest, NextResponse } from "next/server";
import { CURATOR_SYSTEM_PROMPT } from "@/lib/curator-prompt";
import { getMockCuratorResponse } from "@/lib/curator-mock";
import { Message, GroundingMetadata, ProviderType } from "@/types/chat";

interface ChatRequestBody {
  messages: Message[];
  apiKey?: string;
  provider?: ProviderType;
  searchEnabled?: boolean;
  model?: string;
}

// 서버 환경변수 등록 여부 확인용 (학생들에게 배너 숨김 처리)
export async function GET() {
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY?.trim());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());
  return NextResponse.json({
    hasServerKey: hasOpenAI || hasGemini,
    defaultProvider: hasOpenAI ? "openai" : hasGemini ? "gemini" : null,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const { messages, apiKey: userApiKey, searchEnabled = true, model } = body;

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

    const inputApiKey = userApiKey?.trim() || "";

    // 환경변수 우선순위:
    // 1) 클라이언트 키가 있으면 해당 키 사용
    // 2) 클라이언트 키가 없으면 Vercel 환경변수(OPENAI_API_KEY 또는 GEMINI_API_KEY) 자동 적용
    const isOpenAI =
      inputApiKey.startsWith("sk-") ||
      body.provider === "openai" ||
      (!inputApiKey && Boolean(process.env.OPENAI_API_KEY?.trim()));

    const apiKey = isOpenAI
      ? inputApiKey || process.env.OPENAI_API_KEY?.trim()
      : inputApiKey || process.env.GEMINI_API_KEY?.trim();

    // 등록된 키가 전혀 없으면 내장 큐레이터 모드
    if (!apiKey) {
      const mockResult = getMockCuratorResponse(lastMessage.content);
      return NextResponse.json({
        content: mockResult.content,
        groundingMetadata: mockResult.groundingMetadata,
        isMock: true,
        notice: "내장 모드로 실행 중입니다.",
      });
    }

    // 1. OpenAI GPT API 호출 (선생님 키 또는 학생 키)
    if (isOpenAI) {
      const gptModel = model || "gpt-4o-mini";
      const openAiMessages = [
        { role: "system", content: CURATOR_SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ];

      const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: gptModel,
          messages: openAiMessages,
          temperature: 0.7,
        }),
      });

      if (!gptResponse.ok) {
        const errorData = await gptResponse.text();
        console.error("OpenAI API Error:", errorData);
        const mockResult = getMockCuratorResponse(lastMessage.content);
        return NextResponse.json({
          content: mockResult.content,
          groundingMetadata: mockResult.groundingMetadata,
          isMock: true,
          errorNotice: `AI 호출 오류 (${gptResponse.status}): 잠시 후 다시 시도해 주세요.`,
        });
      }

      const gptData = await gptResponse.json();
      let replyContent = gptData.choices?.[0]?.message?.content || "";
      replyContent = removeEmojis(replyContent);

      return NextResponse.json({
        content: replyContent,
        isMock: false,
      });
    }

    // 2. Google Gemini API 호출
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

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

    const targetModel = model || "gemini-2.5-flash";
    const endpointUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

    const apiResponse = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload),
    });

    if (!apiResponse.ok) {
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

      const mockResult = getMockCuratorResponse(lastMessage.content);
      return NextResponse.json({
        content: mockResult.content,
        groundingMetadata: mockResult.groundingMetadata,
        isMock: true,
        errorNotice: `Gemini API 호출 오류: 잠시 후 다시 시도해 주세요.`,
      });
    }

    const data = await apiResponse.json();
    return processGeminiSuccess(data);
  } catch (error: any) {
    console.error("Server API Error:", error);
    return NextResponse.json(
      {
        error: "서버 처리 중 오류가 발생했습니다.",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

function processGeminiSuccess(data: any) {
  const candidate = data.candidates?.[0];
  let replyText = candidate?.content?.parts?.map((p: any) => p.text || "").join("").trim() || "";
  replyText = removeEmojis(replyText);

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
      groundingMetadata = { searchQueries, sources };
    }
  }

  return NextResponse.json({
    content: replyText,
    groundingMetadata,
    isMock: false,
  });
}

function removeEmojis(text: string): string {
  return text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ""
  ).trim();
}
