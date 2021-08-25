import styles from './Countdown.module.css'

type CountdownProps = {
  countdown: number
}

const Countdown = (props: CountdownProps) => {
  const text = (props.countdown > 0 && props.countdown <= 5) ? props.countdown : 'Starting now'
  return (
    <div className={styles.container}> 
      <h1 className={styles.title}> <span> {text} </span> </h1>
    </div>
  )
}

export default Countdown;