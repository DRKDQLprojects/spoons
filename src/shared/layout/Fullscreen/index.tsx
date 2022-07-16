import { FunctionComponent, useEffect, useState } from 'react'
import { Grid } from '@material-ui/core'

const Fullscreen : FunctionComponent<any> = (props) => {

  const [width, setWidth] = useState(-1)

  useEffect(() => {
    setWidth(window.screen.width)
    window.addEventListener('resize', calculateWidth)
    return (() => window.removeEventListener('resize', calculateWidth))
  }, [])

  const calculateWidth = () => { 
    setWidth(window.screen.width) 
  }

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      justifyContent="center"
      alignItems="center"
      style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, rgba(131,86,204,0.7) 0%, rgba(113,199,218,0.7) 100%), url(${width > 850 ? require('/public/assets/Spoon.svg') : require('/public/assets/SpoonMobile.svg')})`,
      }}
    > 
      <div>
        {props.children}
      </div>
    </Grid>
  )
}

export default Fullscreen;