import "@/styles/globals.css";
import "@/styles/layout.css";
import { Inter } from "next/font/google";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/context/AuthContext";
import DevLoginButton from "@/components/ui/DevLoginButton";

const inter = Inter({ subsets: ["latin"] });

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
