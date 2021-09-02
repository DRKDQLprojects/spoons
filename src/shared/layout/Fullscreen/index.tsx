import styles from './Fullscreen.module.css'
import { FunctionComponent, useEffect, useState } from 'react'

type FullscreenProps = {
  center?: boolean 
}

const Fullscreen : FunctionComponent<FullscreenProps> = (props) => {
  const className = props.center ? styles.center : styles.normal
  return <div className={className}> {props.children} </div>
}

export default Fullscreen;