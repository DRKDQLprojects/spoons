
import styles from './Flexbox.module.css'
import { FunctionComponent } from 'react'

type FlexboxProps = {
  center?: boolean,
  column?: boolean,
}

const Flexbox : FunctionComponent<FlexboxProps> = (props) => {
  const getStyle = () => {
    const { center, column } = props
    if (center && column) return styles.columnCenter
    if (center) return styles.center
    if (column) return styles.column
    return styles.normal
  }

  return <div className={getStyle()}> {props.children} </div>
}

export default Flexbox;