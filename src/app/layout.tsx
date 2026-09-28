import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Laugh List | The Humor Project",
  description: "A members-ready collection of humor, powered by Next.js and Supabase Auth.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
