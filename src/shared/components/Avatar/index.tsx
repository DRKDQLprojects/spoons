import { FunctionComponent  } from "react";
import { Stack } from "@mui/material"
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
      <Stack justifyContent="center" alignItems="center">
        <img
          src={require(`/public/assets/avatars/${props.number < 0 ? 'empty' : props.number}.svg`)}
          alt='Avatar'
          height={props.size || 100}
          width={props.size || 100}
        />
      </Stack>
    </div>
  )
}

export default Avatar;