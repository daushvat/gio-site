import './style.css'

const outcomes = [
  { label: 'Money', short: '🤑', icon: '🤑', multiplier: 6 },
  { label: 'OK', short: '👌', icon: '👌', multiplier: 2 },
  { label: 'Middle', short: '🖕', icon: '🖕', multiplier: 4 },
  { label: 'Troll', short: '🧌', icon: '🧌', multiplier: 3 },
  { label: 'Lobster', short: '🦞', icon: '🦞', multiplier: 3 },
  { label: 'Flip', short: '🤸‍♀️', icon: '🤸‍♀️', multiplier: 4 },
  { label: 'Trophy', short: '🏆', icon: '🏆', multiplier: 6 },
  { label: 'Sticker', short: 'Sticker', icon: '/dodo-arrow.webp', multiplier: 100, isSticker: true },
]

const bonusHandsNeeded = 5
const bonusMultipliers = [
  2, 2, 2, 2, 2, 2, 2, 2,
  3, 3, 3, 3, 3, 3, 3,
  4, 4, 4, 4, 4, 4,
  5, 5, 5, 5, 5,
  6, 6, 6, 6,
  8, 8, 8, 8,
  10, 10, 10,
  12, 12, 12,
  15, 15,
  20, 20,
  25,
  30,
  40,
  50,
  75,
  100,
]

document.querySelector('#app').innerHTML = `
  <canvas class="fireworks" aria-hidden="true"></canvas>
  <main class="page-shell">
    <section class="slot-shell" aria-label="Emoji slot machine">
      <p class="intro">DOYLO SLOT</p>

      <div class="slot-machine">
        <div class="slot-topper">
          <img class="slot-sticker" src="/dodo-arrow.webp" alt="" aria-hidden="true">
          <div class="score-chip">
            <span class="score-value">x6</span>
          </div>
        </div>

        <div class="slot-display" aria-live="polite">
          <div class="slot-reel" data-reel="0">
            <span class="reel-symbol">🤑</span>
          </div>
          <div class="slot-reel" data-reel="1">
            <span class="reel-symbol">🤑</span>
          </div>
          <div class="slot-reel" data-reel="2">
            <span class="reel-symbol">🤑</span>
          </div>
        </div>

        <div class="payline" aria-hidden="true">
          <span></span>
        </div>

        <div class="win-burst" aria-hidden="true">
          <span class="win-burst__label">WIN</span>
          <span class="win-burst__shine"></span>
        </div>

        <div class="bonus-wheel" aria-hidden="true">
          <div class="bonus-wheel__card">
            <span class="bonus-wheel__eyebrow">Bonus Game</span>
            <div class="bonus-wheel__pointer" aria-hidden="true"></div>
            <div class="bonus-wheel__disc">
              <span class="bonus-wheel__multiplier">x2</span>
            </div>
            <p class="bonus-wheel__text">50 chances from x2 to x100</p>
          </div>
        </div>
      </div>

      <div class="bet-panel" aria-label="Emoji slot betting controls">
        <div class="points-card">
          <span>DoDo Points</span>
          <strong class="points-value">1000</strong>
        </div>
        <div class="stake-control" aria-label="Bet amount">
          <span>Bet</span>
          <div class="stake-coins">
            <button class="stake-coin is-selected" type="button" data-stake="10">10</button>
            <button class="stake-coin" type="button" data-stake="20">20</button>
            <button class="stake-coin" type="button" data-stake="30">30</button>
            <button class="stake-coin" type="button" data-stake="40">40</button>
            <button class="stake-coin" type="button" data-stake="50">50</button>
          </div>
        </div>
        <div class="bonus-meter" aria-label="Bonus progress">
          <div class="bonus-meter__top">
            <span>Bonus</span>
            <strong class="bonus-meter__count">0/5</strong>
          </div>
          <div class="bonus-meter__track" aria-hidden="true">
            <span class="bonus-meter__fill"></span>
          </div>
        </div>
        <p class="bet-result" aria-live="polite">Bet 10 to 50. Triple sticker jackpot pays x100.</p>
      </div>

      <button class="dodo-button" type="button">Spin</button>
    </section>
  </main>
`

const canvas = document.querySelector('.fireworks')
const context = canvas.getContext('2d')
const button = document.querySelector('.dodo-button')
const scoreValue = document.querySelector('.score-value')
const slotReels = [...document.querySelectorAll('.slot-reel')]
const reelSymbols = [...document.querySelectorAll('.reel-symbol')]
const winBurst = document.querySelector('.win-burst')
const pointsValue = document.querySelector('.points-value')
const stakeButtons = [...document.querySelectorAll('.stake-coin')]
const betResult = document.querySelector('.bet-result')
const bonusMeterFill = document.querySelector('.bonus-meter__fill')
const bonusMeterCount = document.querySelector('.bonus-meter__count')
const bonusWheel = document.querySelector('.bonus-wheel')
const bonusWheelMultiplier = document.querySelector('.bonus-wheel__multiplier')
const bonusWheelText = document.querySelector('.bonus-wheel__text')
const particles = []
const colors = ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#00b0ff', '#651fff', '#ff00cc']
let width = 0
let height = 0
let animationFrame = 0
let spinFrame = 0
let audioContext = null
let lastTickSound = 0
let winBurstTimer = 0
let points = 1000
let displayedPoints = points
let pointsAnimationTimer = 0
let winSoundLoopTimer = 0
let bonusWheelTimer = 0
let bonusHands = 0
let selectedStake = 10

function getRandomOutcome(excludedOutcome = null) {
  const choices = excludedOutcome
    ? outcomes.filter((outcome) => outcome.label !== excludedOutcome.label)
    : outcomes

  return choices[Math.floor(Math.random() * choices.length)]
}

function createSpinResult() {
  const firstOutcome = getRandomOutcome()
  const secondMisses = Math.random() < 0.3

  if (secondMisses) {
    return {
      isJackpot: false,
      reels: [firstOutcome, getRandomOutcome(firstOutcome), getRandomOutcome()],
    }
  }

  const isJackpot = Math.random() < 0.3
  const finalOutcome = isJackpot ? firstOutcome : getRandomOutcome(firstOutcome)

  return {
    isJackpot,
    reels: [firstOutcome, firstOutcome, finalOutcome],
  }
}

function setReelSymbol(index, outcome, isLocked = false) {
  reelSymbols[index].replaceChildren()
  reelSymbols[index].classList.toggle('has-sticker-symbol', outcome.isSticker)

  if (outcome.isSticker) {
    const image = document.createElement('img')
    image.src = outcome.icon
    image.alt = outcome.label
    image.decoding = 'async'
    reelSymbols[index].append(image)
  } else {
    reelSymbols[index].textContent = outcome.short
  }

  slotReels[index].classList.toggle('is-locked', isLocked)
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }

  return audioContext
}

function playTone({ frequency, duration = 0.08, type = 'square', volume = 0.08, slideTo = frequency }) {
  const audio = getAudioContext()
  const oscillator = audio.createOscillator()
  const gain = audio.createGain()
  const start = audio.currentTime
  const end = start + duration

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(slideTo, 1), end)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)

  oscillator.connect(gain)
  gain.connect(audio.destination)
  oscillator.start(start)
  oscillator.stop(end + 0.02)
}

function playSpinStartSound() {
  playTone({ frequency: 110, slideTo: 780, duration: 0.16, type: 'square', volume: 0.065 })
  setTimeout(() => {
    playTone({ frequency: 220, slideTo: 980, duration: 0.12, type: 'triangle', volume: 0.055 })
  }, 80)
}

function playTickSound() {
  playTone({ frequency: 1180, slideTo: 820, duration: 0.025, type: 'square', volume: 0.035 })
}

function playReelStopSound(index) {
  playTone({ frequency: 520 + index * 130, slideTo: 360 + index * 110, duration: 0.075, type: 'square', volume: 0.07 })
  setTimeout(() => {
    playTone({ frequency: 780 + index * 140, slideTo: 660 + index * 110, duration: 0.04, type: 'triangle', volume: 0.045 })
  }, 45)
}

function playWinFanfare() {
  const notes = [520, 660, 784, 1046, 1318]
  notes.forEach((frequency, index) => {
    setTimeout(() => {
      playTone({ frequency, slideTo: frequency * 1.18, duration: 0.105, type: 'triangle', volume: 0.085 })
    }, index * 72)
  })
}

function startWinSoundLoop() {
  window.clearInterval(winSoundLoopTimer)
  playWinFanfare()
  winSoundLoopTimer = window.setInterval(playWinFanfare, 420)
}

function stopWinSoundLoop() {
  window.clearInterval(winSoundLoopTimer)
  winSoundLoopTimer = 0
}

function playMissSound() {
  playTone({ frequency: 280, slideTo: 92, duration: 0.24, type: 'square', volume: 0.055 })
  setTimeout(() => {
    playTone({ frequency: 180, slideTo: 72, duration: 0.18, type: 'sawtooth', volume: 0.035 })
  }, 100)
}

function playSuspenseSound() {
  const notes = [196, 247, 294, 370, 440, 554]
  notes.forEach((frequency, index) => {
    setTimeout(() => {
      playTone({ frequency, slideTo: frequency * 1.08, duration: 0.1, type: index % 2 ? 'square' : 'triangle', volume: 0.043 })
    }, index * 105)
  })
}

function updateResult(outcome) {
  scoreValue.textContent = `x${outcome.multiplier}`

  return outcome
}

function updatePointsDisplay(value = displayedPoints) {
  pointsValue.textContent = value.toLocaleString()
}

function updateStakeLimit() {
  const maxSelectableStake = Math.min(points, 50)

  if (selectedStake > maxSelectableStake && maxSelectableStake >= 10) {
    selectedStake = Math.floor(maxSelectableStake / 10) * 10
  }

  stakeButtons.forEach((stakeButton) => {
    const stake = Number(stakeButton.dataset.stake)
    stakeButton.disabled = points < stake
    stakeButton.classList.toggle('is-selected', stake === selectedStake)
    stakeButton.setAttribute('aria-pressed', String(stake === selectedStake))
  })
}

function updatePoints() {
  displayedPoints = points
  updatePointsDisplay()
  updateStakeLimit()
}

function updateBonusMeter() {
  const progress = Math.min(bonusHands / bonusHandsNeeded, 1)
  bonusMeterFill.style.width = `${progress * 100}%`
  bonusMeterCount.textContent = `${Math.min(bonusHands, bonusHandsNeeded)}/${bonusHandsNeeded}`
}

function animatePointsTo(targetPoints, onPositiveStep = null) {
  window.clearTimeout(pointsAnimationTimer)
  updateStakeLimit()

  return new Promise((resolve) => {
    const target = Math.max(0, targetPoints)
    const startsIncreasing = target > displayedPoints
    let positiveSteps = 0

    function count() {
      if (displayedPoints === target) {
        resolve()
        return
      }

      displayedPoints += displayedPoints < target ? 1 : -1
      updatePointsDisplay()

      if (startsIncreasing && onPositiveStep) {
        positiveSteps += 1
        onPositiveStep(positiveSteps)
      }

      const remaining = Math.abs(target - displayedPoints)
      const delay = remaining > 2000 ? 1 : remaining > 500 ? 2 : 8
      pointsAnimationTimer = window.setTimeout(count, delay)
    }

    count()
  })
}

function clampStake() {
  updateStakeLimit()
  return selectedStake
}

function chooseStake(event) {
  const stake = Number(event.currentTarget.dataset.stake)

  if (!Number.isFinite(stake) || points < stake) {
    return
  }

  selectedStake = stake
  updateStakeLimit()
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = Math.floor(width * ratio)
  canvas.height = Math.floor(height * ratio)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
}

function launchFirework(x, y) {
  const particleCount = 34

  for (let i = 0; i < particleCount; i += 1) {
    const angle = (Math.PI * 2 * i) / particleCount
    const speed = 2 + Math.random() * 5
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 48 + Math.random() * 24,
      maxLife: 72,
      size: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
    })
  }
}

function launchButtonShow() {
  const rect = button.getBoundingClientRect()
  launchFirework(rect.left + rect.width / 2, rect.top + rect.height / 2)
  setTimeout(() => launchFirework(width * 0.25, height * 0.35), 180)
  setTimeout(() => launchFirework(width * 0.75, height * 0.32), 320)
}

function launchDoDoCoins() {
  const rect = winBurst.getBoundingClientRect()
  const originX = rect.left + rect.width / 2
  const originY = rect.top + rect.height / 2
  const coinCount = 26

  for (let i = 0; i < coinCount; i += 1) {
    const angle = -Math.PI + (Math.PI * i) / (coinCount - 1)
    const speed = 4.5 + Math.random() * 5.5
    particles.push({
      type: 'coin',
      x: originX + (Math.random() - 0.5) * 80,
      y: originY + (Math.random() - 0.5) * 28,
      vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2.2,
      vy: Math.sin(angle) * speed - 5 - Math.random() * 5,
      life: 78 + Math.random() * 32,
      maxLife: 110,
      size: 12 + Math.random() * 9,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.5,
    })
  }
}

function showWinBurst(outcome) {
  clearTimeout(winBurstTimer)
  winBurst.classList.remove('is-visible', 'is-sticker-jackpot')
  winBurst.offsetHeight

  winBurst.classList.toggle('is-sticker-jackpot', outcome.isSticker)
  winBurst.querySelector('.win-burst__label').textContent = outcome.isSticker ? '100X' : 'WIN'
  winBurst.classList.add('is-visible')
  launchDoDoCoins()

  winBurstTimer = window.setTimeout(() => {
    winBurst.classList.remove('is-visible', 'is-sticker-jackpot')
  }, 1500)
}

function getBonusMultiplier() {
  return bonusMultipliers[Math.floor(Math.random() * bonusMultipliers.length)]
}

function playBonusWheelSound() {
  const notes = [330, 392, 494, 587, 698, 880, 1046]
  notes.forEach((frequency, index) => {
    setTimeout(() => {
      playTone({ frequency, slideTo: frequency * 1.08, duration: 0.08, type: index % 2 ? 'square' : 'triangle', volume: 0.055 })
    }, index * 90)
  })
}

function showBonusWheel(multiplier) {
  window.clearTimeout(bonusWheelTimer)
  bonusWheelMultiplier.textContent = '?'
  bonusWheelText.textContent = 'Bonus wheel spinning...'
  bonusWheel.classList.remove('is-visible', 'is-finished')
  bonusWheel.style.setProperty('--bonus-rotation', `${1440 + Math.random() * 720}deg`)
  bonusWheel.offsetHeight
  bonusWheel.classList.add('is-visible')
  playBonusWheelSound()

  return new Promise((resolve) => {
    bonusWheelTimer = window.setTimeout(() => {
      bonusWheelMultiplier.textContent = `x${multiplier}`
      bonusWheelText.textContent = `Bonus landed on x${multiplier}`
      bonusWheel.classList.add('is-finished')
      launchDoDoCoins()
      resolve()
    }, 1900)
  })
}

async function playBonusGame(stake) {
  const multiplier = getBonusMultiplier()
  const payout = stake * multiplier

  button.textContent = 'Bonus...'
  betResult.textContent = 'Bonus meter full. Entering bonus wheel.'
  await showBonusWheel(multiplier)
  points += payout
  updateStakeLimit()
  betResult.textContent = `Bonus wheel x${multiplier}. Won ${payout} DoDo Points.`
  startWinSoundLoop()

  let coinBursts = 0
  await animatePointsTo(points, (positiveSteps) => {
    if (positiveSteps % 18 !== 0 || coinBursts >= 18) {
      return
    }

    coinBursts += 1
    launchDoDoCoins()
  })

  stopWinSoundLoop()
  bonusWheelTimer = window.setTimeout(() => {
    bonusWheel.classList.remove('is-visible', 'is-finished')
  }, 600)
}

async function settleBet(spinResult, stake) {
  const [firstReel, secondReel, thirdReel] = spinResult.reels
  const won = firstReel.label === secondReel.label && secondReel.label === thirdReel.label
  const payout = stake * thirdReel.multiplier

  points += won ? payout : -stake
  points = Math.max(0, points)
  updateStakeLimit()
  betResult.textContent = won
    ? `${thirdReel.isSticker ? 'Sticker jackpot' : 'Jackpot'} x${thirdReel.multiplier}. Won ${payout} points.`
    : `Near miss. Lost ${stake} points. ${firstReel.short} ${secondReel.short} ${thirdReel.short}.`

  if (won) {
    startWinSoundLoop()
    showWinBurst(thirdReel)
    launchButtonShow()
    let coinBursts = 0
    await animatePointsTo(points, (positiveSteps) => {
      if (positiveSteps % 18 !== 0 || coinBursts >= 18) {
        return
      }

      coinBursts += 1
      launchDoDoCoins()
    })
    stopWinSoundLoop()
    return
  }

  playMissSound()
  await animatePointsTo(points)
}

function spinSlots() {
  if (points <= 0) {
    window.clearTimeout(pointsAnimationTimer)
    points = 1000
    updatePoints()
    betResult.textContent = 'Fresh 1000 points. Emoji mercy.'
  }

  const stake = clampStake()
  const spinResult = createSpinResult()
  const duration = 3200
  const start = performance.now()
  const lockTimes = [0.42, 0.58, 1]
  const lockedReels = [false, false, false]
  let suspenseStarted = false
  let secondMissNoted = false

  cancelAnimationFrame(spinFrame)
  stopWinSoundLoop()
  window.clearTimeout(pointsAnimationTimer)
  displayedPoints = points
  updatePointsDisplay()
  clearTimeout(winBurstTimer)
  winBurst.classList.remove('is-visible', 'is-sticker-jackpot')
  window.clearTimeout(bonusWheelTimer)
  bonusWheel.classList.remove('is-visible', 'is-finished')
  getAudioContext()
  button.disabled = true
  button.textContent = 'Spinning...'
  betResult.textContent = 'Reels lock one by one.'
  slotReels.forEach((reel) => reel.classList.add('is-spinning'))
  slotReels.forEach((reel) => reel.classList.remove('is-locked'))
  slotReels.forEach((reel) => reel.classList.remove('is-dramatic'))
  lastTickSound = 0
  playSpinStartSound()
  launchButtonShow()

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1)

    updateResult(spinResult.reels[2])

    reelSymbols.forEach((symbol, index) => {
      if (progress >= lockTimes[index]) {
        if (!lockedReels[index]) {
          lockedReels[index] = true
          playReelStopSound(index)
        }

        setReelSymbol(index, spinResult.reels[index], true)
        slotReels[index].classList.remove('is-spinning')
        slotReels[index].classList.remove('is-dramatic')
        return
      }

      const firstTwoMatch = spinResult.reels[0].label === spinResult.reels[1].label

      if (lockedReels[0] && lockedReels[1] && !firstTwoMatch && !secondMissNoted) {
        secondMissNoted = true
        betResult.textContent = 'Second reel missed. No triple this spin.'
      }

      if (index === 2 && lockedReels[0] && lockedReels[1] && firstTwoMatch) {
        slotReels[index].classList.add('is-dramatic')

        if (!suspenseStarted) {
          suspenseStarted = true
          betResult.textContent = 'Two match. Third reel deciding...'
          playSuspenseSound()
        }
      }

      const isDramaticThird = index === 2 && lockedReels[0] && lockedReels[1] && firstTwoMatch
      const reelDelay = isDramaticThird ? 230 : 70 + index * 18
      const spinIndex = Math.floor((now / reelDelay) + index) % outcomes.length
      setReelSymbol(index, outcomes[spinIndex])
    })

    const firstTwoLockedMatch = lockedReels[0] && lockedReels[1] && spinResult.reels[0].label === spinResult.reels[1].label
    const tickDelay = firstTwoLockedMatch ? 190 : 78
    if (now - lastTickSound > tickDelay && lockedReels.some((isLocked) => !isLocked)) {
      lastTickSound = now
      playTickSound()
    }

    if (progress < 1) {
      spinFrame = requestAnimationFrame(tick)
      return
    }

    updateResult(spinResult.reels[2])
    reelSymbols.forEach((_, index) => setReelSymbol(index, spinResult.reels[index], true))
    slotReels.forEach((reel) => reel.classList.remove('is-spinning'))
    slotReels.forEach((reel) => reel.classList.remove('is-dramatic'))
    settleBet(spinResult, stake).then(async () => {
      bonusHands += 1
      updateBonusMeter()

      if (bonusHands >= bonusHandsNeeded) {
        await new Promise((resolve) => setTimeout(resolve, 520))
        await playBonusGame(stake)
        bonusHands = 0
        updateBonusMeter()
      }

      button.disabled = false
      button.textContent = 'Spin'
    })
  }

  spinFrame = requestAnimationFrame(tick)
}

function animate() {
  context.clearRect(0, 0, width, height)

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    const particle = particles[i]
    particle.x += particle.vx
    particle.y += particle.vy
    particle.vy += 0.055
    particle.vx *= 0.99
    particle.life -= 1

    if (particle.life <= 0) {
      particles.splice(i, 1)
      continue
    }

    const opacity = particle.life / particle.maxLife
    context.globalAlpha = Math.max(opacity, 0)

    if (particle.type === 'coin') {
      particle.spin += particle.spinSpeed
      const coinWidth = Math.max(3, particle.size * Math.abs(Math.cos(particle.spin)))

      context.save()
      context.translate(particle.x, particle.y)
      context.rotate(particle.spin * 0.24)
      context.fillStyle = '#ffd84d'
      context.strokeStyle = '#fff6b8'
      context.lineWidth = 2
      context.shadowColor = '#fff000'
      context.shadowBlur = 18
      context.beginPath()
      context.ellipse(0, 0, coinWidth, particle.size, 0, 0, Math.PI * 2)
      context.fill()
      context.stroke()
      context.shadowBlur = 0
      context.fillStyle = '#9b5a00'
      context.font = `900 ${Math.max(10, particle.size * 0.72)}px Inter, sans-serif`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText('D', 0, 1)
      context.restore()
      continue
    }

    context.fillStyle = particle.color
    context.shadowColor = particle.color
    context.shadowBlur = 10
    context.beginPath()
    context.arc(particle.x, particle.y, particle.size * opacity, 0, Math.PI * 2)
    context.fill()
  }

  context.globalAlpha = 1
  context.shadowBlur = 0
  animationFrame = requestAnimationFrame(animate)
}

button.addEventListener('click', spinSlots)
stakeButtons.forEach((stakeButton) => stakeButton.addEventListener('click', chooseStake))
window.addEventListener('resize', resizeCanvas)

resizeCanvas()
updateResult(outcomes[0])
reelSymbols.forEach((_, index) => setReelSymbol(index, outcomes[0], true))
updatePoints()
updateBonusMeter()
animate()

setTimeout(launchButtonShow, 600)

window.addEventListener('beforeunload', () => {
  stopWinSoundLoop()
  window.clearTimeout(bonusWheelTimer)
  cancelAnimationFrame(animationFrame)
  cancelAnimationFrame(spinFrame)
})
