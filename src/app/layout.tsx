import "@/styles/globals.css";
import "@/styles/layout.css";
// Local font optional — ignore missing file
import type localFont from "next/font/local";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/context/AuthContext";
import DevLoginButton from "@/components/ui/DevLoginButton";

const inter = {
  className: "",
  variable: "--font-inter",
} as ReturnType<typeof localFont>;

export const metadata = {
  title: "APDB Project & Expenses",
  description: "Project & expenses manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#121212] text-[#e5e5e5]`}>
        {/* 🔐 Global Auth Context */}
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <DevLoginButton />
      </body>
    </html>
  );
}
