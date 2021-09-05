import { FunctionComponent } from 'react';
import styles from './Logo.module.css'

type LogoProps = {
  text: string,
  fontSize?: string
} 
const Logo : FunctionComponent<LogoProps> = (props) => {
  return (
    <div className={styles.container}> 
      <h1 className={styles.text} style={{fontSize: props.fontSize}}> {props.text} </h1>
    </div>
  )
}

export default Logo;