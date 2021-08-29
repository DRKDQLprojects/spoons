import styles from './Loader.module.css'

type LoaderProps = {
  message: string
}

const Loader = (props: LoaderProps) => {
  return (
    <div className={styles.container}> 
      <h1> {props.message} </h1>
    </div>
  )
}

export default Loader;