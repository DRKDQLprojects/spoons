
import styles from './Button.module.css'
import { FunctionComponent } from 'react'

type ButtonProps = {
  onClick: () => void
}

const Button : FunctionComponent<ButtonProps> = (props) => {
  return (
    <button 
      className={styles.button} 
      onClick={props.onClick}
    > 
      <p className={styles.text}> {props.children} </p>
    </button>
  )
}

export default Button;