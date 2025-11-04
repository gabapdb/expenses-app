import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Expenses Dashboard",
  description: "Manage sourcing, petty cash, and liquidation effortlessly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0f0f0f] text-neutral-100`}>
        <div className="flex min-h-screen">
          {/* 🧱 Sidebar always visible */}
          <Sidebar />
          {/* 🧾 Page content */}
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
