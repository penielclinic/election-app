import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "해운대순복음교회 항존직 선거",
  description: "2026년 항존직(장로·안수집사·권사) 후보 지원 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
