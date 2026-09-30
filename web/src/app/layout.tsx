import type { Metadata } from "next";
import "./globals.css";
import ChatProvider from "../components/ChatProvider";
export const metadata: Metadata={title:"V1 Travel — Thoughtful journeys. Human support.",description:"From China to Spain and everywhere between. Thoughtful travel planning with a human by your side."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body><ChatProvider>{children}</ChatProvider></body></html>;}
