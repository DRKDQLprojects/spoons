import styles from './Game.module.css'

type GameProps = {
  
}

const Game = (props: GameProps) => {
  return (
    <div className={styles.container}> 
      <h1 className={styles.title}> <span> Playing Spoons :) </span> </h1>
    </div>
  )
}

export default Game;


