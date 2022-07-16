import { FunctionComponent  } from "react";
import Flexbox from "src/shared/layout/Flexbox";
import styles from './Avatar.module.css';

type AvatarProps = {
  number: number,
  size?: number,
}

const Avatar: FunctionComponent<AvatarProps> = (props) => {
  return (
    <div 
      className={styles.avatarBorder}
      style={{ height: `${(props.size && props.size + 5) || 110}px` , width: `${(props.size && props.size + 5) || 110}px`}}
    >
      <Flexbox center>
        <img
          src={require(`/public/assets/avatars/${props.number < 0 ? 'empty' : props.number}.svg`)}
          alt='Avatar'
          height={props.size || 100}
          width={props.size || 100}
        />
      </Flexbox>
    </div>
  )
}

export default Avatar;