import Fullscreen from 'src/shared/layout/Fullscreen'

type LoaderProps = {
  message: string
}

const Loader = (props: LoaderProps) => {
  return (
    <Fullscreen>
      <h1 style={{ textAlign: 'center'}}> {props.message} </h1>
    </Fullscreen>
  )
}

export default Loader;