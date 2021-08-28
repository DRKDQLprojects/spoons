import styles from './Loader.module.css'

type LoaderProps = {
  message: string
}

const Loader = (props: LoaderProps) => {
  return (
    <div className={styles.container}> 
      <h1 className={styles.title}> <span> Loading... ({props.message}) </span> </h1>
    </div>
  )
}

export default Loader;