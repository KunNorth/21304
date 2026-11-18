import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Nexus Dashboard — Multi-System Overview',
  description: 'Customizable Multi-Tenant Dashboard with AI Prompts & War Room',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-screen w-screen overflow-hidden p-2 md:p-3 flex justify-center items-center text-slate-800 dark:text-slate-100 bg-[#f0f2f5] dark:bg-[#0b1120]">
        {children}
      </body>
    </html>
  );
}
