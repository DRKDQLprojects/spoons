import styles from './TextField.module.css'
import { FunctionComponent } from 'react'

type TextFieldProps = {
  type: string,
  value: string,
  onPaste: (e: any) => () => void,
  onChange: (e: any) => void,
  maxLength: number,
  placeholder: string,
  error: boolean 
}

const TextField : FunctionComponent<TextFieldProps> = (props) => {
  return (
    <input 
      className={!props.error ? styles.textfield : styles.error} 
      type={props.type}
      value={props.value}
      onPaste={props.onPaste}
      onChange={props.onChange}
      maxLength={props.maxLength}
      placeholder={props.placeholder}
    >
      {props.children}
    </input> 
  )
}

export default TextField;