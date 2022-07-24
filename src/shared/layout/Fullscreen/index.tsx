import { FunctionComponent, useEffect, useState } from 'react'
import { Grid } from '@mui/material'

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
      direction="column"
      justifyContent="center"
      alignItems="center"
      style={{
        minHeight: '100vh',
      }}
    > 
      {props.children}
    </Grid>
  )
}

export default Fullscreen;