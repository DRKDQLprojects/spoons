import Container from 'src/shared/layout/Container';
import styles from './Loader.module.css'

type LoaderProps = {
  message: string
}

const Loader = (props: LoaderProps) => {
  return (
    <div className={styles.container}> 
      <Container center>
        <h1> {props.message} </h1>
      </Container>
    </div>
  )
}

export default Loader;