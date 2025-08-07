import type { Metadata } from "next";
import "./globals.css";
import ThemeController from "@/components/ThemeController";

export const metadata: Metadata = {
  title: "康邦 • 博德！",
  description: "記錄每天的任務！Kanban Board",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="nord">
      <body className="antialiased">
        <div className="navbar bg-base-100 shadow-sm hidden">
          {/* logo */}
          <div className="flex-1">
            <a className="btn btn-ghost text-xl text-primary">康邦 • 博德！</a>
          </div>

          {/* search input 搜尋功能先不做，有需求再做 */}
          {/* <input
            type="text"
            placeholder="Search"
            className="input input-bordered w-24 md:w-auto"
          /> */}

          {/* three-dots 功能列：匯出、匯入、分享 */}
          <div className="flex-none">
            <button className="btn btn-square btn-ghost">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current">
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                ></path>{" "}
              </svg>
            </button>
          </div>
        </div>
        <ThemeController />
        {children}
      </body>
    </html>
  );
}
