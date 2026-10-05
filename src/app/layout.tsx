import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Joke Arena — Great models. Questionable jokes.",
  description: "GPT and Gemini roast the AI world. Vote in blind battles and discover the funniest models on the Elo leaderboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
