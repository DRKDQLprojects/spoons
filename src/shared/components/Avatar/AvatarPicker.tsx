import { FunctionComponent  } from "react";
import styles from './Avatar.module.css';
import Flexbox from "src/shared/layout/Flexbox";
import Avatar from ".";

type AvatarPickerProps = {
  number: number,
  size?: number,
  onPrevious: () => void,
  onNext: () => void
}

const AvatarPicker: FunctionComponent<AvatarPickerProps> = (props) => {
  return (
    <Flexbox center noWrap>
      <h1 
        className={styles.arrow} 
        onClick={props.onPrevious}
      >
        {'<'} 
      </h1>
      <Flexbox column center>
        <Avatar number={props.number} size={props.size}/>
      </Flexbox>
      <h1 
        className={styles.arrow} 
        onClick={props.onNext}
      > 
        {'>'} 
      </h1>
    </Flexbox>
  )
}

export default AvatarPicker;