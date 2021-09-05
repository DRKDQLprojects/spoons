import Fullscreen from 'src/shared/layout/Fullscreen'
import styles from './Countdown.module.css'

type CountdownProps = {
  seconds: number
}

const Countdown = (props: CountdownProps) => {
  return ( 
    <Fullscreen>
      <h1 className={styles.text}> {props.seconds} </h1>
    </Fullscreen>
  )
}

export default Countdown;