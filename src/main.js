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
      </div>

      <div class="bet-panel" aria-label="Emoji slot betting controls">
        <div class="points-card">
          <span>DoDo Points</span>
          <strong class="points-value">1000</strong>
        </div>
        <label class="stake-control">
          <span>Bet</span>
          <input class="stake-input" type="number" min="10" max="50" step="10" value="10">
        </label>
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
const stakeInput = document.querySelector('.stake-input')
const betResult = document.querySelector('.bet-result')
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
  playTone({ frequency: 150, slideTo: 520, duration: 0.18, type: 'sawtooth', volume: 0.07 })
}

function playTickSound() {
  playTone({ frequency: 760, slideTo: 420, duration: 0.035, type: 'square', volume: 0.045 })
}

function playReelStopSound(index) {
  playTone({ frequency: 300 + index * 95, slideTo: 190 + index * 70, duration: 0.1, type: 'triangle', volume: 0.08 })
}

function playWinSound() {
  const notes = [420, 560, 700, 940]
  notes.forEach((frequency, index) => {
    setTimeout(() => {
      playTone({ frequency, slideTo: frequency * 1.12, duration: 0.13, type: 'triangle', volume: 0.1 })
    }, index * 90)
  })
}

function playMissSound() {
  playTone({ frequency: 240, slideTo: 120, duration: 0.22, type: 'sawtooth', volume: 0.065 })
}

function playSuspenseSound() {
  const notes = [220, 248, 278, 312, 350]
  notes.forEach((frequency, index) => {
    setTimeout(() => {
      playTone({ frequency, slideTo: frequency * 1.04, duration: 0.16, type: 'triangle', volume: 0.055 })
    }, index * 120)
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
  stakeInput.max = String(Math.min(Math.max(points, 10), 50))
}

function updatePoints() {
  displayedPoints = points
  updatePointsDisplay()
  updateStakeLimit()
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
  const rawStake = Number(stakeInput.value)
  const stake = Number.isFinite(rawStake) ? rawStake : 10
  const maxStake = Math.min(Math.max(points, 10), 50)
  const clampedStake = Math.max(10, Math.min(maxStake, Math.round(stake / 10) * 10))
  stakeInput.value = String(clampedStake)
  return clampedStake
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
    playWinSound()
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
  window.clearTimeout(pointsAnimationTimer)
  displayedPoints = points
  updatePointsDisplay()
  clearTimeout(winBurstTimer)
  winBurst.classList.remove('is-visible', 'is-sticker-jackpot')
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
    settleBet(spinResult, stake).then(() => {
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
stakeInput.addEventListener('change', clampStake)
window.addEventListener('resize', resizeCanvas)

resizeCanvas()
updateResult(outcomes[0])
reelSymbols.forEach((_, index) => setReelSymbol(index, outcomes[0], true))
updatePoints()
animate()

setTimeout(launchButtonShow, 600)

window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationFrame)
  cancelAnimationFrame(spinFrame)
})
