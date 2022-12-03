import { PrismicPreview } from "@prismicio/next";
import { PrismicProvider } from "@prismicio/react";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import Link from "next/link";
import { repositoryName } from "../../prismicio";
import { Header } from "../components/Header";

import "../styles/global.scss";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <PrismicProvider internalLinkComponent={(props) => <Link {...props} />}>
      <PrismicPreview repositoryName={repositoryName}>
        <SessionProvider session={session}>
          <Header />
          <Component {...pageProps} />
        </SessionProvider>
      </PrismicPreview>
    </PrismicProvider>
  );
}
