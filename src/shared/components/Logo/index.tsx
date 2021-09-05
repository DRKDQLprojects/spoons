import { FunctionComponent } from 'react';
import Image from 'next/image';
import styles from './Logo.module.css'

type LogoProps = {
  error?: boolean,
  size?: number
} 
const Logo : FunctionComponent<LogoProps> = (props) => {
  return (
    <div className={styles.container}> 
      <Image
        src={props.error ? `/assets/404.svg` : `/assets/Logo.svg`}
        alt='Spoons Logo'
        height={100}
        width={props.size ? props.size : 600 }
      />
    </div>
  )
}

export default Logo;