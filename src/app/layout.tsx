import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "옛 생활 박물관 큐레이터 선배 | 초등 3학년 사회 모둠 활동",
  description: "박물관 큐레이터 선배와 대화하며 옛 물건의 안내문을 스스로 완성해보는 챗봇 웹사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#f7f3ed] antialiased text-[#3c2a21]">
        {children}
      </body>
    </html>
  );
}
