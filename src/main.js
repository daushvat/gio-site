import './style.css'

const outcomes = [
  { label: 'DODO', short: 'DODO', range: '1-25', icon: 'D' },
  { label: 'BIG DODO', short: 'BIG', range: '26-50', icon: 'B' },
  { label: 'DODOLA', short: 'DODOLA', range: '51-75', icon: 'L' },
  { label: 'DODOLA YLE', short: 'YLE', range: '76-100', icon: 'Y' },
]

document.querySelector('#app').innerHTML = `
  <canvas class="fireworks" aria-hidden="true"></canvas>
  <main class="page-shell">
    <section class="slot-shell" aria-label="DODO slot machine">
      <p class="intro">DODO SLOT</p>

      <div class="slot-machine">
        <div class="slot-topper">
          <img class="slot-sticker" src="/dodo-arrow.webp" alt="" aria-hidden="true">
          <div class="slot-sign">
            <span class="slot-kicker">Lucky measure</span>
            <strong class="slot-result-label">DODO</strong>
          </div>
          <div class="score-chip">
            <span class="score-value">1%</span>
          </div>
        </div>

        <div class="slot-display" aria-live="polite">
          <div class="slot-reel" data-reel="0">
            <span class="reel-symbol">DODO</span>
          </div>
          <div class="slot-reel" data-reel="1">
            <span class="reel-symbol">DODO</span>
          </div>
          <div class="slot-reel" data-reel="2">
            <span class="reel-symbol">DODO</span>
          </div>
        </div>

        <div class="payline" aria-hidden="true">
          <span></span>
        </div>

        <div class="slot-ranges" aria-label="Outcome ranges">
          ${outcomes
            .map(
              (outcome, index) => `
                <button class="range-card${index === 0 ? ' is-active' : ''}" type="button" data-bet="${outcome.label}">
                  <span class="range-icon">${outcome.icon}</span>
                  <strong>${outcome.short}</strong>
                  <small>${outcome.range}%</small>
                </button>
              `,
            )
            .join('')}
        </div>
      </div>

      <div class="bet-panel" aria-label="DODO betting controls">
        <div class="points-card">
          <span>Points</span>
          <strong class="points-value">1000</strong>
        </div>
        <label class="stake-control">
          <span>Bet</span>
          <input class="stake-input" type="number" min="10" max="1000" step="10" value="100">
        </label>
        <div class="bet-picks" role="group" aria-label="Pick an outcome">
          ${outcomes
            .map(
              (outcome, index) => `
                <button class="bet-pick${index === 0 ? ' is-selected' : ''}" type="button" data-bet="${outcome.label}">
                  ${outcome.short}
                </button>
              `,
            )
            .join('')}
        </div>
        <p class="bet-result" aria-live="polite">Pick a result and spin.</p>
      </div>

      <button class="dodo-button" type="button">Spin</button>
    </section>
  </main>
`

const canvas = document.querySelector('.fireworks')
const context = canvas.getContext('2d')
const button = document.querySelector('.dodo-button')
const scoreValue = document.querySelector('.score-value')
const slotResultLabel = document.querySelector('.slot-result-label')
const slotReels = [...document.querySelectorAll('.slot-reel')]
const reelSymbols = [...document.querySelectorAll('.reel-symbol')]
const rangeCards = [...document.querySelectorAll('.range-card')]
const pointsValue = document.querySelector('.points-value')
const stakeInput = document.querySelector('.stake-input')
const betPicks = [...document.querySelectorAll('.bet-pick')]
const betResult = document.querySelector('.bet-result')
const particles = []
const colors = ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#00b0ff', '#651fff', '#ff00cc']
let width = 0
let height = 0
let animationFrame = 0
let spinFrame = 0
let audioContext = null
let lastTickSound = 0
let points = 1000
let selectedBet = 'DODO'

function getDodoOutcome(value) {
  if (value <= 25) {
    return outcomes[0]
  }

  if (value <= 50) {
    return outcomes[1]
  }

  if (value <= 75) {
    return outcomes[2]
  }

  return outcomes[3]
}

function setReelSymbol(index, outcome, isLocked = false) {
  reelSymbols[index].textContent = outcome.short
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

function updateResult(value) {
  const roundedValue = Math.max(1, Math.min(100, Math.round(value)))
  const outcome = getDodoOutcome(roundedValue)

  scoreValue.textContent = `${roundedValue}%`
  slotResultLabel.textContent = outcome.label
  rangeCards.forEach((card) => {
    card.classList.toggle('is-active', card.dataset.bet === outcome.label)
  })

  return outcome
}

function updatePoints() {
  pointsValue.textContent = points.toLocaleString()
  stakeInput.max = String(Math.max(points, 10))
}

function clampStake() {
  const rawStake = Number(stakeInput.value)
  const stake = Number.isFinite(rawStake) ? rawStake : 10
  const maxStake = Math.max(points, 10)
  const clampedStake = Math.max(10, Math.min(maxStake, Math.round(stake / 10) * 10))
  stakeInput.value = String(clampedStake)
  return clampedStake
}

function setSelectedBet(bet) {
  selectedBet = bet

  betPicks.forEach((pick) => {
    pick.classList.toggle('is-selected', pick.dataset.bet === selectedBet)
  })
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

function settleBet(outcome, stake, bet) {
  const won = outcome.label === bet

  points += won ? stake * 3 : -stake
  points = Math.max(0, points)
  updatePoints()
  betResult.textContent = won
    ? `Jackpot. Won ${stake * 3} points on ${outcome.label}.`
    : `Missed. Lost ${stake} points. Result: ${outcome.label}.`

  if (won) {
    playWinSound()
    launchButtonShow()
    return
  }

  playMissSound()
}

function spinSlots() {
  if (points <= 0) {
    points = 1000
    updatePoints()
    betResult.textContent = 'Fresh 1000 points. DODO mercy.'
  }

  const stake = clampStake()
  const bet = selectedBet
  const target = 1 + Math.floor(Math.random() * 100)
  const targetOutcome = getDodoOutcome(target)
  const duration = 2200
  const start = performance.now()
  const lockTimes = [0.62, 0.78, 0.94]
  const lockedReels = [false, false, false]

  cancelAnimationFrame(spinFrame)
  getAudioContext()
  button.disabled = true
  button.textContent = 'Spinning...'
  betResult.textContent = 'Reels are running.'
  slotReels.forEach((reel) => reel.classList.add('is-spinning'))
  slotReels.forEach((reel) => reel.classList.remove('is-locked'))
  lastTickSound = 0
  playSpinStartSound()
  launchButtonShow()

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1)
    const easedProgress = 1 - (1 - progress) ** 3
    const liveValue = 1 + (target - 1) * easedProgress

    updateResult(liveValue)

    reelSymbols.forEach((symbol, index) => {
      if (progress >= lockTimes[index]) {
        if (!lockedReels[index]) {
          lockedReels[index] = true
          playReelStopSound(index)
        }

        setReelSymbol(index, targetOutcome, true)
        slotReels[index].classList.remove('is-spinning')
        return
      }

      const spinIndex = Math.floor((now / (70 + index * 18)) + index) % outcomes.length
      symbol.textContent = outcomes[spinIndex].short
    })

    if (now - lastTickSound > 78 && lockedReels.some((isLocked) => !isLocked)) {
      lastTickSound = now
      playTickSound()
    }

    if (progress < 1) {
      spinFrame = requestAnimationFrame(tick)
      return
    }

    updateResult(target)
    reelSymbols.forEach((_, index) => setReelSymbol(index, targetOutcome, true))
    slotReels.forEach((reel) => reel.classList.remove('is-spinning'))
    settleBet(targetOutcome, stake, bet)
    button.disabled = false
    button.textContent = 'Spin'
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
betPicks.forEach((pick) => {
  pick.addEventListener('click', () => setSelectedBet(pick.dataset.bet))
})
rangeCards.forEach((card) => {
  card.addEventListener('click', () => setSelectedBet(card.dataset.bet))
})
window.addEventListener('resize', resizeCanvas)

resizeCanvas()
updateResult(1)
reelSymbols.forEach((_, index) => setReelSymbol(index, outcomes[0], true))
updatePoints()
animate()

setTimeout(launchButtonShow, 600)

window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationFrame)
  cancelAnimationFrame(spinFrame)
})
