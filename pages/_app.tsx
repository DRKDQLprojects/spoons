import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head> 
        <title>SPOONS by DRKDQL</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta name="description" content="Online multiplayer version of the card game called Spoons" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps}/> 
    </>
  )
}
export default MyApp