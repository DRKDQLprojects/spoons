import { FunctionComponent } from 'react'
import styles from './Container.module.css'

type ContainerProps = {
  center?: boolean
}

const Container: FunctionComponent<ContainerProps> = (props) => {
  return (<div className={props.center ? styles.centered : styles.normal }> {props.children} </div>)
}
export default Container