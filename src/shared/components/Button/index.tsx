
import styles from './Button.module.css'
import { FunctionComponent } from 'react'

type ButtonProps = {
  onClick: () => void,
  primary?: boolean,
  danger?: boolean,
  success?: boolean,
  disabled: boolean,
  stretch?: boolean
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
      style={props.stretch ? { height: '100%', width: '100%' } : {}}
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