
import styles from './Flexbox.module.css'
import { FunctionComponent } from 'react'

type FlexboxProps = {
  center?: boolean,
  column?: boolean,
  end?: boolean,
  spaceEvenly? :boolean,
  spaceBetween?: boolean,
  noWrap?: boolean,
  stretch?: boolean,
  fullWidth?: boolean,
  fullHeight?: boolean
}

const Flexbox : FunctionComponent<FlexboxProps> = (props) => {
  const getStyle = () => {
    const { center, column, end, spaceEvenly, spaceBetween} = props
    if (center && column) return styles.columnCenter
    if (end && column) return styles.columnEnd
    if (spaceEvenly && column) return styles.columnSpaceEvenly
    if (spaceBetween && column) return styles.columnSpaceBetween
    if (column) return styles.column

    if (spaceEvenly) return styles.rowSpaceEvenly
    if (end) return styles.rowEnd
    if (center) return styles.rowCenter
    return styles.row
  }

  return (
    <div 
      className={getStyle()} 
      style={{
        flexWrap: props.noWrap ? 'nowrap' : 'wrap', 
        height: (props.stretch || props.fullHeight) ? '100%' : '', 
        width: (props.stretch || props.fullWidth) ? '100%' : ''}}
    > 
      {props.children} 
    </div>
  )
}

export default Flexbox;