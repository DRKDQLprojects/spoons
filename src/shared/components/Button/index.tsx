
import styles from './Button.module.css'
import { FunctionComponent } from 'react'

type ButtonProps = {
  onClick: () => void,
  primary?: boolean,
  danger?: boolean,
  success?: boolean,
  disabled: boolean,
  small?: boolean
}

const Button : FunctionComponent<ButtonProps> = (props) => {

  const getStyle = () => {
    const { primary, danger, success} = props
    if (primary) return styles.button
    if (danger) return styles.danger
    if (success) return styles.success
  }

  return (
    <button 
      className={getStyle()} 
      onClick={props.onClick}
      disabled={props.disabled}
    > 
      <p 
        className={styles.text}
        style={props.small ? { fontSize:'16px'} : {} }
      > 
        {props.children} 
      </p>
    </button>
  )
}

export default Button;