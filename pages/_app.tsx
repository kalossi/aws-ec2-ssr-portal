// pages/_app.tsx
import { SessionProvider } from 'next-auth/react'
import { AppProps } from 'next/app';
import '../styles/globals.css';
import { Component } from 'react';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;