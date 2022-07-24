import { FunctionComponent  } from "react";
import styles from './Avatar.module.css';
import { Stack } from '@mui/material';
import Avatar from ".";

type AvatarPickerProps = {
  number: number,
  size?: number,
  onPrevious: () => void,
  onNext: () => void
}

const AvatarPicker: FunctionComponent<AvatarPickerProps> = (props) => {
  return (
    <Stack direction="row" justifyContent="center" alignItems="center" flexWrap="nowrap">
      <h1 
        className={styles.arrow} 
        onClick={props.onPrevious}
      >
        {'<'} 
      </h1>
      <Stack justifyContent="center" alignItems="center">
        <Avatar number={props.number} size={props.size}/>
      </Stack>
      <h1 
        className={styles.arrow} 
        onClick={props.onNext}
      > 
        {'>'} 
      </h1>
    </Stack>
  )
}

export default AvatarPicker;