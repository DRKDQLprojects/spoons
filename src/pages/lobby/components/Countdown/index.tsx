import Fullscreen from 'src/shared/layout/Fullscreen'
import styles from './Countdown.module.css'

type CountdownProps = {
  seconds: number
}

const Countdown = (props: CountdownProps) => {
  const text = (props.seconds > 0 && props.seconds <= 5) ? `Starting in ${props.seconds}...` : 'Starting now'
  return ( 
    <Fullscreen>
      <h1 className={styles.text}> {text} </h1>
    </Fullscreen>
  )
}

export default Countdown;