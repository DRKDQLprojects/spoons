
import styles from './Button.module.css'
import { FunctionComponent } from 'react'

type ButtonProps = {
  onClick: () => void,
  primary?: boolean,
  danger?: boolean,
  success?: boolean,
  disabled: boolean,
  stretch?: boolean,
  hidden?: boolean,
}

const Button : FunctionComponent<ButtonProps> = (props) => {

  const getClass = () => {
    const { primary, danger, success } = props
    if (primary) return styles.button
    if (danger) return styles.danger
    if (success) return styles.success
  }

  return (
    <button 
      className={getClass()} 
      onClick={props.onClick}
      disabled={props.disabled}
      style={{ 
        visibility: props.hidden ? 'hidden' : undefined
      }}
    > 
      <p 
        className={styles.text}
      > 
        {props.children} 
      </p>
    </button>
  )
}

export default Button;