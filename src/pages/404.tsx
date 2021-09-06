import router from 'next/router';
import Fullscreen from 'src/shared/layout/Fullscreen';
import Logo from 'src/shared/components/Logo';
import Button from 'src/shared/components/Button';
import { Grid } from '@material-ui/core';

export default function Custom404() {
  return (
    <Fullscreen> 
      <Grid
        container
        spacing={0}
        direction="column"
        justifyContent="center"
        alignItems="center"
        style={{ textAlign: 'center'}}
      >
        <h1> You look lost! No worries, we are here to help! </h1>
        <br/>
        <h3>
          If you tried to join a game, make sure the link is entered correctly.
        </h3>
        <br/>
        <h3>
          Otherwise, head back to the homepage and Create a Lobby!
        </h3>
        <br/>
        <Button 
          onClick={()=> router.push("/")}
          disabled={false}
          primary
        > 
          Create a lobby 
        </Button>
      </Grid>
    </Fullscreen>
  )
}