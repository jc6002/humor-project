import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hello World | The Humor Project",
  description: "Week 1 Hello World assignment for Designing for GenAI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
