import styles from './Grid.module.css'
import { FunctionComponent } from 'react'

type GridProps = {
  gridTemplateColumns: string,
  gridTemplateRows: string
}

const Grid : FunctionComponent<GridProps> = (props) => {
  return <div className={styles.grid} style={{gridTemplateColumns: props.gridTemplateColumns, gridTemplateRows: props.gridTemplateRows}}> {props.children} </div>
}

export default Grid;