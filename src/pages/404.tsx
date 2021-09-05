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
        <Logo text="404"/>
        <br/>
        <h2 >You look lost! No worries, we are here to help!</h2>
        <br/>
        <p>
          If you tried to join a game, make sure the link or code is entered correctly.
        </p>
        <p>
          Otherwise, head back to the homepage and Create a Lobby!
        </p>
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