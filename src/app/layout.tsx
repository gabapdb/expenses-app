import "@/styles/design-tokens.css";
import "@/styles/globals.css";
import React from "react";

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
        <div className="mx-auto max-w-6xl p-6 space-y-6">
          <header className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Expenses</h1>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
