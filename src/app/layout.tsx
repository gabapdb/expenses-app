import "@/styles/design-tokens.css";
import "@/styles/globals.css";
import React from "react";
import AuthButtons from "@/components/AuthButtons";

export const metadata = {
  title: "Expenses App",
  description: "Next.js + Firebase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {/* ✅ Moved inside <body> */}
        <header className="flex justify-between items-center p-4 border-b border-gray-200">
          <h1 className="font-semibold text-lg">Expenses App</h1>
          <AuthButtons />
        </header>

        <main className="mx-auto max-w-6xl p-6 space-y-6">{children}</main>
      </body>
    </html>
  );
}
