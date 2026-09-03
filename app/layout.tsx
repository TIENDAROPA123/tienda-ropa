import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nova Atelier | Tienda Online",
  description: "Tienda moderna de ropa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}