import type { Metadata } from "next";
import Script from "next/script";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "BitMind — AI Agent Economy on Bitcoin",
  description:
    "Two AI Agents collaborating and paying each other on Bitcoin L2 via x402 protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <Script
          id="ethereum-protect"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var _dp=Object.defineProperty;Object.defineProperty=function(o,p,d){if(o===window&&p==="ethereum"){d=Object.assign({},d,{configurable:true})}return _dp.call(Object,o,p,d)};window.addEventListener("error",function(e){if(e.message&&e.message.indexOf("ethereum")!==-1){e.stopImmediatePropagation();e.preventDefault()}},true)}catch(e){}`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
