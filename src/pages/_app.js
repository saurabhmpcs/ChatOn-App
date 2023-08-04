import Head from "next/head";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../styles/globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export default function App({ Component, pageProps }) {
  return (
    <main className={plusJakartaSans.className}>
      <Head>
        <title>ChatOn</title>
        <link rel="icon " type="image/x-icon" href="/favicon.ico?v=1" />
      </Head>{" "}
      <Component {...pageProps} />
    </main>
  );
}
