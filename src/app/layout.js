import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Wolfpack - Running Community",
  description: "Rejoins la meute pour ta prochaine sortie running",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        {/* On ajoute la div wrapper ici, autour de {children} */}
        <div vaul-drawer-wrapper="" className="bg-black min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}