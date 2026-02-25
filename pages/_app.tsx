import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from "@/components/header";

if (typeof window === "undefined") {
  require("../utils/server_utils");
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto px-8 py-8">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
