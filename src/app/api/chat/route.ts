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
    // 제공자 판별 (sk- 로 시작하면 OpenAI, 아니면 Gemini or 환경변수 확인)
    const isOpenAI =
      body.provider === "openai" ||
      inputApiKey.startsWith("sk-") ||
      (!inputApiKey && Boolean(process.env.OPENAI_API_KEY));

    const apiKey = isOpenAI
      ? inputApiKey || process.env.OPENAI_API_KEY?.trim()
      : inputApiKey || process.env.GEMINI_API_KEY?.trim();

    // API Key가 없으면 내장 큐레이터 모드
    if (!apiKey) {
      const mockResult = getMockCuratorResponse(lastMessage.content);
      return NextResponse.json({
        content: mockResult.content,
        groundingMetadata: mockResult.groundingMetadata,
        isMock: true,
        notice: "API 키를 설정하시면 실시간 AI 모델이 직접 답변합니다.",
      });
    }

    // 1. OpenAI GPT API 호출 처리
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
          errorNotice: `OpenAI API 오류 (${gptResponse.status}): ${gptResponse.statusText}`,
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

    // 2. Google Gemini API 호출 처리
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
      // 1.5-flash 폴백 시도
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
        errorNotice: `Gemini API 오류 (${apiResponse.status}): ${apiResponse.statusText}`,
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
