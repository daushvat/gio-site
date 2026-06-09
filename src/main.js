import './style.css'

document.querySelector('#app').innerHTML = `
  <canvas class="fireworks" aria-hidden="true"></canvas>
  <main class="page-shell">
    <section class="hero" aria-label="Personal site">
      <p class="intro">
        DODO METER
      </p>
      <div class="meter" aria-live="polite">
        <div class="meter-readout">
          <span class="meter-value">1%</span>
          <span class="meter-label">DODO</span>
        </div>
        <div class="meter-track" aria-hidden="true">
          <div class="meter-fill"></div>
        </div>
      </div>
      <div class="dodo-wheel" aria-label="DODO meter wheel">
        <div class="wheel-glow" aria-hidden="true"></div>
        <div class="wheel-arrow" aria-hidden="true"></div>
        <div class="wheel-hub" aria-hidden="true">?</div>
        <div class="wheel-square is-active" data-label="DODO" data-min="1" data-max="25" data-angle="-135">
          <span class="wheel-badge">x1</span>
          DODO
        </div>
        <div class="wheel-square" data-label="BIG DODO" data-min="26" data-max="50" data-angle="-45">
          <span class="wheel-badge">x2</span>
          BIG DODO
        </div>
        <div class="wheel-square" data-label="DODOLA" data-min="51" data-max="75" data-angle="135">
          <span class="wheel-badge">x3</span>
          DODOLA
        </div>
        <div class="wheel-square" data-label="DODOLA YLE" data-min="76" data-max="100" data-angle="45">
          <span class="wheel-badge">x4</span>
          DODOLA YLE
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
          <button class="bet-pick is-selected" type="button" data-bet="DODO">DODO</button>
          <button class="bet-pick" type="button" data-bet="BIG DODO">BIG</button>
          <button class="bet-pick" type="button" data-bet="DODOLA">DODOLA</button>
          <button class="bet-pick" type="button" data-bet="DODOLA YLE">YLE</button>
        </div>
        <p class="bet-result" aria-live="polite">Pick a square and measure.</p>
      </div>
      <button class="dodo-button" type="button">
        Measure
      </button>
    </section>
  </main>
`

const canvas = document.querySelector('.fireworks')
const context = canvas.getContext('2d')
const button = document.querySelector('.dodo-button')
const meterValue = document.querySelector('.meter-value')
const meterLabel = document.querySelector('.meter-label')
const meterFill = document.querySelector('.meter-fill')
const wheelArrow = document.querySelector('.wheel-arrow')
const wheelHub = document.querySelector('.wheel-hub')
const wheelSquares = [...document.querySelectorAll('.wheel-square')]
const pointsValue = document.querySelector('.points-value')
const stakeInput = document.querySelector('.stake-input')
const betPicks = [...document.querySelectorAll('.bet-pick')]
const betResult = document.querySelector('.bet-result')
const particles = []
const colors = ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#00b0ff', '#651fff', '#ff00cc']
let width = 0
let height = 0
let animationFrame = 0
let measureFrame = 0
let points = 1000
let selectedBet = 'DODO'
let arrowRotation = -135

function getDodoLabel(value) {
  if (value <= 25) {
    return 'DODO'
  }

  if (value <= 50) {
    return 'BIG DODO'
  }

  if (value <= 75) {
    return 'DODOLA'
  }

  return 'DODOLA YLE'
}

function getWheelSquareForValue(value) {
  const roundedValue = Math.max(1, Math.min(100, Math.round(value)))

  return wheelSquares.find((square) => {
    const min = Number(square.dataset.min)
    const max = Number(square.dataset.max)
    return roundedValue >= min && roundedValue <= max
  })
}

function setArrowRotation(rotation) {
  arrowRotation = rotation
  wheelArrow.style.transform = `translate(-50%, -50%) rotate(${arrowRotation}deg)`
}

function updateWheelSelection(value, shouldMoveArrow = true) {
  const activeSquare = getWheelSquareForValue(value)

  wheelSquares.forEach((square) => {
    square.classList.toggle('is-active', square === activeSquare)
  })

  if (activeSquare && shouldMoveArrow) {
    setArrowRotation(Number(activeSquare.dataset.angle))
  }
}

function updateMeter(value, shouldMoveArrow = true) {
  const roundedValue = Math.max(1, Math.min(100, Math.round(value)))
  const label = getDodoLabel(roundedValue)
  meterValue.textContent = `${roundedValue}%`
  meterLabel.textContent = label
  meterFill.style.width = `${roundedValue}%`
  wheelHub.textContent = roundedValue
  updateWheelSelection(roundedValue, shouldMoveArrow)

  return label
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
  const particleCount = 32

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
  const originX = rect.left + rect.width / 2
  const originY = rect.top + rect.height / 2
  launchFirework(originX, originY)

  setTimeout(() => launchFirework(width * 0.72, height * 0.3), 240)
}

function runMeasurement() {
  if (points <= 0) {
    points = 1000
    updatePoints()
    betResult.textContent = 'Fresh 1000 points. DODO mercy.'
  }

  const stake = clampStake()
  const bet = selectedBet
  cancelAnimationFrame(measureFrame)
  launchButtonShow()

  const target = 1 + Math.floor(Math.random() * 100)
  const targetSquare = getWheelSquareForValue(target)
  const targetAngle = Number(targetSquare.dataset.angle)
  const startRotation = arrowRotation
  const currentNormalizedRotation = ((arrowRotation % 360) + 360) % 360
  const targetNormalizedAngle = ((targetAngle % 360) + 360) % 360
  const forwardDistance = (targetNormalizedAngle - currentNormalizedRotation + 360) % 360
  const finalRotation = startRotation + 1440 + forwardDistance
  const duration = 1900
  const start = performance.now()

  button.disabled = true
  button.textContent = 'Measuring...'
  wheelArrow.classList.add('is-spinning')

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1)
    const easedProgress = 1 - (1 - progress) ** 3
    const value = 1 + (target - 1) * easedProgress
    const spinProgress = 1 - (1 - progress) ** 4

    updateMeter(value, false)
    setArrowRotation(startRotation + (finalRotation - startRotation) * spinProgress)

    if (progress < 1) {
      measureFrame = requestAnimationFrame(tick)
      return
    }

    setArrowRotation(targetAngle)
    wheelArrow.classList.remove('is-spinning')
    const result = updateMeter(target)
    const won = result === bet
    points += won ? stake * 3 : -stake
    points = Math.max(0, points)
    updatePoints()
    betResult.textContent = won
      ? `Won ${stake * 3} points on ${result}.`
      : `Lost ${stake} points. Result: ${result}.`
    button.disabled = false
    button.textContent = 'Measure'
    launchButtonShow()
  }

  measureFrame = requestAnimationFrame(tick)
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

button.addEventListener('click', runMeasurement)
stakeInput.addEventListener('change', clampStake)
betPicks.forEach((pick) => {
  pick.addEventListener('click', () => setSelectedBet(pick.dataset.bet))
})
window.addEventListener('resize', resizeCanvas)

resizeCanvas()
updateMeter(1)
updatePoints()
animate()

setTimeout(launchButtonShow, 600)

window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationFrame)
  cancelAnimationFrame(measureFrame)
})
