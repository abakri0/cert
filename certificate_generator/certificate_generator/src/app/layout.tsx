'use client';

import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>مولد الشهادات</title>
        <meta name="description" content="تطبيق لإنشاء وإرسال الشهادات" />
        <style jsx global>{`
          @font-face {
            font-family: 'Shamel Bold';
            src: url('/fonts/shamel_bold.ttf') format('truetype');
            font-weight: bold;
            font-style: normal;
          }
          
          @font-face {
            font-family: 'Shamel Light';
            src: url('/fonts/shamel_light.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          
          body {
            font-family: 'Shamel Light', sans-serif;
          }
          
          h1, h2, h3, h4, h5, h6, strong {
            font-family: 'Shamel Bold', sans-serif;
          }
        `}</style>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
