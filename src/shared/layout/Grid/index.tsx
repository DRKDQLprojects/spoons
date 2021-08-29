
import styles from './Grid.module.css'
import { FunctionComponent } from 'react'

type GridProps = {
  gridTemplateColumns: string
}

const Grid : FunctionComponent<GridProps> = (props) => {
  return <div className={styles.grid} style={{gridTemplateColumns: props.gridTemplateColumns}}> {props.children} </div>
}

export default Grid;