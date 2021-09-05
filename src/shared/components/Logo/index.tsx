import { FunctionComponent } from 'react';
import styles from './Logo.module.css'

type LogoProps = {
  error?: boolean,
  size?: number
} 
const Logo : FunctionComponent<LogoProps> = (props) => {
  return (
    <div className={styles.container}> 
      <img
        src={require(props.error ? `/public/assets/404.svg` : `/public/assets/Logo.svg`)}
        alt='Spoons Logo'
        height={props.size || 125}
        width={'100%'}
      />
    </div>
  )
}

export default Logo;