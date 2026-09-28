import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Joke Lab | The Humor Project",
  description: "A members-ready lab for AI, robot, and LLM humor, powered by Next.js and Supabase Auth.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
