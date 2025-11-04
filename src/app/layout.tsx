import "@/styles/globals.css";
import "@/styles/layout.css";
import { Inter } from "next/font/google";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "APDB Project & Expenses",
  description: "Project & expenses manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
