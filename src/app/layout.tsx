import type { Metadata } from "next";
// This line imports all the styles from globals.css
import "./globals.css";

export const metadata: Metadata = {
  title: "ArtisanCMS",
  description: "Manage your portfolio with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}