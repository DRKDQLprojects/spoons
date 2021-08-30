import styles from './404.module.css'
import router from 'next/router';
import Fullscreen from 'src/shared/layout/Fullscreen';
import Logo from 'src/shared/components/Logo';
import Button from 'src/shared/components/Button';

export default function Custom404() {
  return (
    <Fullscreen center> 
      <Logo text="404"/>
      <h1 >You look lost! No worries, we are here to help!</h1>

      <p>
        If you tried to join a game, make sure the link or code is entered correctly.
      </p>
      <p>
        Otherwise, head back to the homepage and Create a Lobby!
      </p>
      <br/>
      <div style={{ height: '65px'}}>
        <Button 
          onClick={()=> router.push("/")}
          disabled={false}
          primary
        > 
          Create a lobby 
        </Button>
      </div> 
    </Fullscreen>
  )
}