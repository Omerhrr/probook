import type { Metadata } from "next";
import "./globals.css";
import DefaultLayout from "@/layouts/DefaultLayout";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "@/styles/theme";
import { AuthProvider } from "@/contexts/AuthContext"; // Import AuthProvider

export const metadata: Metadata = {
  title: "ProBook",
  description: "Professional Business Accounting", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline /> {/* MUI's baseline styles */}
          <AuthProvider>
            <DefaultLayout>{children}</DefaultLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
