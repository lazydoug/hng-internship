import React, { useState, useEffect, useRef } from 'react'
import './App.css'

const App = () => {
  const [targetColor, setTargetColor] = useState('')
  const [colorOptions, setColorOptions] = useState([])
  const [score, setScore] = useState(10)
  const [highestScore, setHighestScore] = useState(() => {
    return parseInt(localStorage.getItem('highestScore')) || 0
  })
  const [timer, setTimer] = useState(15)
  const [gameStatus, setGameStatus] = useState('')
  const [guessStartTime, setGuessStartTime] = useState(Date.now())
  const [mainColor, setMainColor] = useState(generateMainColor())

  const rulesDialog = useRef()
  const gameOverDialog = useRef()
  const countdown = useRef()

  useEffect(() => {
    startNewGame()
  }, [])

  useEffect(() => {
    if (timer > 0) {
      countdown.current = setTimeout(() => setTimer(timer - 1), 1000)
      return () => clearTimeout(countdown.current)
    } else {
      setGameStatus("Opps! Time's up!")
    }
  }, [timer])

  function generateMainColor() {
    // Generate a random color in HSL format
    const hue = random(360); // Hue: 0-360 (defines the color family)
    const saturation = 70; // Fixed saturation (for consistency)
    const lightness = 50; // Mid-range lightness

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  function generateShades(baseColor) {
    let shades = [];
    let [hue, saturation, lightness] = baseColor.match(/\d+/g).map(Number);

    // Define a range of lightness values for different shades
    const lightnessValues = [30, 40, 50, 60, 70, 80]; // Shades 300, 500, 700, etc.

    lightnessValues.forEach(l => {
      shades.push(`hsl(${hue}, ${saturation}%, ${l}%)`);
    });

    return shuffleArray(shades); // Shuffle the shades before returning
  }

  function random(num) {
    return Math.floor(Math.random() * num);
  }

  function shuffleArray(array) {
    // Fisher-Yates shuffle algorithm
    let shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }

  const generateColors = () => {
    const colors = generateShades(mainColor);
    setTargetColor(colors[Math.floor(Math.random() * colors.length)]);
    setColorOptions(colors);
    setGuessStartTime(Date.now());
  };

  const handleGuess = color => {
    const timeTaken = (Date.now() - guessStartTime) / 1000

    if (color === targetColor) {
      let points = 5
      if (timeTaken > 5) points -= 2
      if (timeTaken > 10) points -= 4
      if (points < 1) points = 0

      setScore(prevScore => {
        const newScore = prevScore + points

        setHighestScore(prevHighest => {
          const updatedHighest = Math.max(prevHighest, newScore)
          localStorage.setItem('highestScore', updatedHighest)
          return updatedHighest
        })

        return newScore
      })

      setGameStatus(`Correct! (+${points} points)`)
      startNewGame()
    } else {
      setScore(prevScore => {
        const newScore = prevScore - 5
        if (newScore <= 0) {
          clearTimeout(countdown.current)
          gameOverDialog.current.showModal()
          return 0
        }
        return newScore
      })

      setGameStatus('Wrong! -5 points.')
    }
  }

  const startNewGame = () => {
    setTimer(15)
    setGameStatus('')
    setMainColor(generateMainColor())
    generateColors()
  }

  return (
    <>
      <dialog ref={rulesDialog} className='rules-modal'>
        <h3>Game Rules</h3>
        <p>
          You will see a target color. <br /> Choose the correct color from six
          shades. <br /> Correct answers give points (faster guesses earn more
          points). <br /> Wrong answers deduct 5 points. <br /> If points reach
          0, you lose!
        </p>

        <form method='dialog'>
          <button>Close</button>
        </form>
      </dialog>

      <dialog ref={gameOverDialog} className='game-over-modal'>
        <h2>Game Over!</h2>
        <p>You ran out of points. Try again?</p>
        <form method='dialog'>
          <button onClick={startNewGame}>Start New Game</button>
        </form>
      </dialog>

      <div className='container'>
        <h1>Color Guessing Game</h1>
        <p data-testid='gameInstructions'>
          Guess the correct color!{' '}
          <span
            className='info-icon'
            onClick={() => rulesDialog.current.showModal()}
            data-testid='infoIcon'>
            ℹ️
          </span>
        </p>

        <div
          className='color-box'
          style={{ backgroundColor: targetColor }}
          data-testid='colorBox'></div>

        <div className='color-options'>
          {colorOptions.map((color, index) => (
            <button
              key={index}
              className='color-option'
              style={{ backgroundColor: color }}
              onClick={() => handleGuess(color)}
              data-testid='colorOption'></button>
          ))}
        </div>

        <p className='game-status' data-testid='gameStatus'>
          {gameStatus}
        </p>
        <p className='score'>
          Score: <span data-testid='score'>{score}</span>
        </p>
        <p className='highest-score'>
          Highest Score: <span data-testid='highestScore'>{highestScore}</span>
        </p>
        <p className='timer'>
          Time Left: <span data-testid='timer'>{timer}</span> sec
        </p>

        <button
          className='new-game'
          onClick={startNewGame}
          data-testid='newGameButton'>
          New Game
        </button>
      </div>
    </>
  )
}

export default App
