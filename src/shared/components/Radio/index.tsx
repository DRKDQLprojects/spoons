
import styles from './Radio.module.css'
import { FunctionComponent } from 'react'

type RadioProps = {
  id: string,
  label: string,
  checked: boolean,
  disabled: boolean,
  onChange: () => void
}

const Radio : FunctionComponent<RadioProps> = (props) => {
  return (
    <div className={!props.disabled ? styles.radio : styles.disabled}> 
      <input 
        type="radio"
        id={props.id}
        name={props.id}
        checked={props.checked} 
        disabled={props.disabled} 
        onChange={props.onChange}
      />
      <label htmlFor={props.id}>
        {props.label} 
      </label>
    </div>
  )
}

export default Radio;