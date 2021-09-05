
import { FunctionComponent } from 'react'
import { Grid } from '@material-ui/core';

const Fullscreen : FunctionComponent<any> = (props) => {
  return (
    <Grid
      container
      spacing={0}
      direction="column"
      justifyContent="center"
      alignItems="center"
      style={{minHeight: '100vh'}}
    >
      {props.children}
    </Grid>
  )
}

export default Fullscreen;