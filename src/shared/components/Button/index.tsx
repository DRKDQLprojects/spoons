
import styles from './Button.module.css'
import { FunctionComponent } from 'react'

type ButtonProps = {
  onClick: () => void,
  primary?: boolean,
  danger?: boolean,
  disabled: boolean
}

const Button : FunctionComponent<ButtonProps> = (props) => {

  const getStyle = () => {
    const { primary, danger, disabled} = props
    if (disabled) return styles.disabled
    if (danger) return styles.danger
    return styles.button
  }
  return (
    <button 
      className={getStyle()} 
      onClick={props.onClick}
      disabled={props.disabled}
    > 
      <p className={styles.text}> {props.children} </p>
    </button>
  )
}

export default Button;