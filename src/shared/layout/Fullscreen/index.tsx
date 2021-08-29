
import styles from './Fullscreen.module.css'
import { FunctionComponent } from 'react'

type FullscreenProps = {
  center?: boolean 
}

const Fullscreen : FunctionComponent<FullscreenProps> = (props) => {
  const style = props.center ? styles.center : styles.normal
  return <div className={style}> {props.children} </div>
}

export default Fullscreen;