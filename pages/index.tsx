import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Spoons | By Derek and Marc</title>
        <meta name="description" content="Online multiplayer version of the card game called Spoons" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <span> Spoons</span>
        </h1>
        <p> This project is currently under development. Stay tuned :)</p>
        <p> - Derek Daquel & Marc Pizzinato</p>
      </main>
    </div>
  )
}

export default Home
