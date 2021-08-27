import styles from './Countdown.module.css'

type CountdownProps = {
  seconds: number
}

const Countdown = (props: CountdownProps) => {
  const text = (props.seconds > 0 && props.seconds <= 5) ? `Starting in ${props.seconds}` : 'Starting now'
  return (
    <div className={styles.container}> 
      <h1 className={styles.title}> <span> {text} </span> </h1>
    </div>
  )
}

export default Countdown;