import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/top-nav";
import { ConvexClientProvider } from "./convex-client-provider";

// Font loading configuration
// Currently using system font fallbacks that approximate the brand fonts.
// When font files are available, add them to app/fonts/ and configure next/font/local:
//
// import localFont from "next/font/local";
//
// const avenirNext = localFont({
//   src: [
//     { path: "./fonts/AvenirNext-Regular.woff2", weight: "400", style: "normal" },
//     { path: "./fonts/AvenirNext-DemiBold.woff2", weight: "600", style: "normal" },
//   ],
//   variable: "--font-avenir-next",
//   display: "swap",
// });
//
// const recklessNeue = localFont({
//   src: [
//     { path: "./fonts/RecklessNeue-Regular.woff2", weight: "400", style: "normal" },
//     { path: "./fonts/RecklessNeue-SemiBold.woff2", weight: "600", style: "normal" },
//   ],
//   variable: "--font-reckless-neue",
//   display: "swap",
// });
//
// Then add to body className: `${avenirNext.variable} ${recklessNeue.variable} antialiased`

export const metadata: Metadata = {
  title: "Impact Studio",
  description: "Playing consulting platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ConvexClientProvider>
          <TopNav />
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
