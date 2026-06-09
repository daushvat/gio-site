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
        <div class="wheel-arrow" aria-hidden="true"></div>
        <div class="wheel-square is-active" data-min="1" data-max="25" data-angle="-135">
          DODO
        </div>
        <div class="wheel-square" data-min="26" data-max="50" data-angle="-45">
          BIG DODO
        </div>
        <div class="wheel-square" data-min="51" data-max="75" data-angle="135">
          DODOLA
        </div>
        <div class="wheel-square" data-min="76" data-max="100" data-angle="45">
          DODOLA YLE
        </div>
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
const wheelSquares = [...document.querySelectorAll('.wheel-square')]
const particles = []
const colors = ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#00b0ff', '#651fff', '#ff00cc']
let width = 0
let height = 0
let animationFrame = 0
let measureFrame = 0

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

function updateMeter(value) {
  const roundedValue = Math.max(1, Math.min(100, Math.round(value)))
  meterValue.textContent = `${roundedValue}%`
  meterLabel.textContent = getDodoLabel(roundedValue)
  meterFill.style.width = `${roundedValue}%`

  wheelSquares.forEach((square) => {
    const min = Number(square.dataset.min)
    const max = Number(square.dataset.max)
    const isActive = roundedValue >= min && roundedValue <= max
    square.classList.toggle('is-active', isActive)

    if (isActive) {
      wheelArrow.style.transform = `translate(-50%, -50%) rotate(${square.dataset.angle}deg)`
    }
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
  cancelAnimationFrame(measureFrame)
  launchButtonShow()

  const target = 1 + Math.floor(Math.random() * 100)
  const duration = 1900
  const start = performance.now()

  button.disabled = true
  button.textContent = 'Measuring...'

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1)
    const easedProgress = 1 - (1 - progress) ** 3
    const value = 1 + (target - 1) * easedProgress

    updateMeter(value)

    if (progress < 1) {
      measureFrame = requestAnimationFrame(tick)
      return
    }

    updateMeter(target)
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
window.addEventListener('resize', resizeCanvas)

resizeCanvas()
updateMeter(1)
animate()

setTimeout(launchButtonShow, 600)

window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationFrame)
  cancelAnimationFrame(measureFrame)
})
