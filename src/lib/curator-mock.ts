// 간결한 2~3문장 응답 엔진

export function getMockCuratorResponse(userText: string): {
  content: string;
  groundingMetadata?: { searchQueries: string[]; sources: { title: string; url: string }[] };
} {
  const text = userText.trim();

  // 규칙 5: 안내문 대필 요청
  if (
    text.includes("써줘") ||
    text.includes("작성해줘") ||
    text.includes("써 줘") ||
    text.includes("대신 써")
  ) {
    return {
      content: "안내문은 네가 직접 써야 해. 대신 무엇이 더 궁금하니?",
    };
  }

  // 규칙 8: 다 알았어요
  if (
    text.includes("다 알았") ||
    text.includes("다 배웠") ||
    text.includes("이제 알겠") ||
    text.includes("다 했어") ||
    text.includes("다 썼어")
  ) {
    return {
      content:
        "멋지다! 그럼 이 물건을 언제, 누가, 어떻게 썼는지 네 말로 한번 들려줄래?",
    };
  }

  // 실물/사진 다름
  if (
    text.includes("사진이랑 달라") ||
    text.includes("실물이랑 달라") ||
    text.includes("다른데")
  ) {
    return {
      content:
        "네가 지금 보고 있는 모습이 더 정확하단다. 옛날에는 손으로 만들어 모양이 조금씩 달랐거든. 네가 보는 물건은 어떻게 생겼니?",
    };
  }

  // 60년 이전 오래된 유물 / 외국 물건
  if (
    text.includes("신석기") ||
    text.includes("빗살무늬") ||
    text.includes("조선") ||
    text.includes("삼국") ||
    text.includes("훈민정음") ||
    text.includes("첨성대") ||
    text.includes("거북선") ||
    text.includes("외국") ||
    text.includes("피라미드")
  ) {
    return {
      content:
        "이번 활동은 약 60년 안에 우리 가족이 쓰던 생활 물건을 조사하는 시간이야. 삐삐나 다듬이돌처럼 가까운 때 쓰던 물건으로 다시 골라볼까?",
    };
  }

  // 삐삐
  if (text.includes("삐삐") || text.includes("무선호출기") || text.includes("호출기")) {
    return {
      content:
        "무선호출기(삐삐)는 엄마 아빠가 젊었을 때 허리띠에 차고 다니며 연락 번호를 받던 기계란다. 신호가 오면 근처 공중전화로 달려가서 전화를 걸었어. 이 작은 기계로 연락을 받으면 어떤 기분이었을까?",
      groundingMetadata: {
        searchQueries: ["삐삐 사용법"],
        sources: [{ title: "대한민국역사박물관 - 무선호출기", url: "https://www.much.go.kr" }],
      },
    };
  }

  // 다듬이
  if (text.includes("다듬이") || text.includes("방망이")) {
    return {
      content:
        "다듬이는 할머니가 어릴 때 어머니들이 빨래한 옷의 구김을 펴려고 쓰던 도구란다. 돌 위에 옷감을 얹고 양손에 쥔 방망이로 경쾌하게 두드렸어. 방망이를 두드릴 때 어떤 소리가 났을까?",
      groundingMetadata: {
        searchQueries: ["다듬이돌과 방망이"],
        sources: [{ title: "국립민속박물관 - 다듬이", url: "https://www.nfm.go.kr" }],
      },
    };
  }

  // 연탄난로
  if (text.includes("연탄") || text.includes("난로")) {
    return {
      content:
        "연탄난로는 할머니와 부모님이 학교 다닐 때 교실을 따뜻하게 하려고 썼단다. 집게로 연탄을 갈아 넣고 그 위에 양은 도시락을 얹어 데워 먹었어. 난로 위에 데운 도시락은 어떤 맛이었을까?",
      groundingMetadata: {
        searchQueries: ["옛날 교실 연탄난로"],
        sources: [{ title: "대한민국역사박물관 - 연탄난로", url: "https://www.much.go.kr" }],
      },
    };
  }

  // 공중전화 카드
  if (text.includes("공중전화") || text.includes("전화카드")) {
    return {
      content:
        "공중전화 카드는 엄마 아빠가 어릴 때 길거리 전화 부스에서 통화하려고 지갑에 넣고 다녔단다. 기계에 넣으면 통화한 만큼 작은 구멍이 뚫렸어. 줄을 서서 차례를 기다리던 사람들의 마음은 어땠을까?",
      groundingMetadata: {
        searchQueries: ["공중전화카드 역사"],
        sources: [{ title: "KT 정보통신관", url: "https://history.kt.com" }],
      },
    };
  }

  // 보온도시락
  if (text.includes("보온도시락") || text.includes("도시락")) {
    return {
      content:
        "보온도시락은 부모님이 학교 다닐 때 따뜻한 점심을 먹으려고 가방에 챙겨 다녔단다. 아침에 담은 따뜻한 밥과 국을 점심시간에 열어 친구들과 나눠 먹었어. 겨울에 뚜껑을 열었을 때 어떤 냄새가 났을까?",
      groundingMetadata: {
        searchQueries: ["옛날 보온도시락"],
        sources: [{ title: "국립민속박물관 - 학교생활", url: "https://www.nfm.go.kr" }],
      },
    };
  }

  // 다이얼 전화기
  if (text.includes("다이얼") || text.includes("옛날 전화기")) {
    return {
      content:
        "다이얼 전화기는 할머니가 어릴 때 거실에 두고 온 가족이 함께 썼단다. 번호 구멍에 손가락을 넣고 끝까지 돌려서 신호를 보냈어. 번호판이 차르르 돌아가는 동안 무슨 생각을 했을까?",
      groundingMetadata: {
        searchQueries: ["다이얼 전화기"],
        sources: [{ title: "국립민속박물관 - 통신도구", url: "https://www.nfm.go.kr" }],
      },
    };
  }

  // 잘 모르는 물건
  if (text.includes("모르는") || text.includes("외계인")) {
    return {
      content: "그건 나도 잘 모르겠어. 선생님께 여쭤보자.",
    };
  }

  // 일반 응답 (간결한 3문장)
  return {
    content: `${text}은(는) 할머니나 부모님이 어릴 때 집에서 가족과 함께 자주 쓰던 물건이란다. 손으로 정성껏 다루며 생활에 큰 도움을 받았어. 이 물건을 쓰던 사람들은 어떤 점이 편리했을까?`,
    groundingMetadata: {
      searchQueries: [`옛 생활 도구 ${text}`],
      sources: [{ title: "국립민속박물관", url: "https://www.nfm.go.kr" }],
    },
  };
}
