import styles from './404.module.css'
import router from 'next/router';

export default function Custom404() {
  return (
    <div className={styles.container}> 
      <h1 >Hey there, you seem to be lost!</h1>
      <p> Not to worry we will help you get back </p>

      <h2> Where would you like to go?</h2>
      <button onClick={e => router.push("/")}> Create a Spoons lobby </button>
      <br/>
      <br/>
       <div> Join a Spoons Game </div>
      <br/>
      <br/>
      If you attempted to join via game link, the lobby probably does not exist anymore. Make sure you entered the link correctly :)
    </div>
  )
}