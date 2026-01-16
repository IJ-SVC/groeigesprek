import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ErrorHandler } from "./error-handler";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Groeigesprekken - IJsselheem",
  description: "Aanmeldsysteem voor groepsontwikkelgesprekken en inloopgesprekken",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${montserrat.variable} font-montserrat`}>
        <ErrorHandler />
        {children}
      </body>
    </html>
  );
}


