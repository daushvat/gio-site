import './style.css'

document.querySelector('#app').innerHTML = `
  <canvas class="fireworks" aria-hidden="true"></canvas>
  <main class="page-shell">
    <section class="hero" aria-label="Gio personal site">
      <div class="rainbow-orbit" aria-hidden="true"></div>
      <div class="portrait-wrap">
        <img class="portrait" src="/gio-photo.jpg" alt="Gio" />
        <div class="portrait-fallback" aria-hidden="true">GIO</div>
      </div>
      <p class="eyebrow">gio.davushvat.com</p>
      <h1>Gio in full color.</h1>
      <p class="intro">
        Loud rainbows, saturated joy, and one extremely serious DODO button.
      </p>
      <button class="dodo-button" type="button">
        Make Gio Great Again
      </button>
    </section>
  </main>
`

const canvas = document.querySelector('.fireworks')
const context = canvas.getContext('2d')
const button = document.querySelector('.dodo-button')
const portrait = document.querySelector('.portrait')
const particles = []
const colors = ['#ff1744', '#ff9100', '#ffea00', '#00e676', '#00b0ff', '#651fff', '#ff00cc']
let width = 0
let height = 0
let animationFrame = 0

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
  for (let i = 0; i < 95; i += 1) {
    const angle = (Math.PI * 2 * i) / 95
    const speed = 2.5 + Math.random() * 7
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 70 + Math.random() * 35,
      maxLife: 105,
      size: 2 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    })
  }
}

function launchButtonShow() {
  const rect = button.getBoundingClientRect()
  const originX = rect.left + rect.width / 2
  const originY = rect.top + rect.height / 2
  launchFirework(originX, originY)

  setTimeout(() => launchFirework(width * 0.25, height * 0.28), 170)
  setTimeout(() => launchFirework(width * 0.75, height * 0.34), 300)
  setTimeout(() => launchFirework(width * 0.5, height * 0.18), 440)
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
    context.shadowBlur = 18
    context.beginPath()
    context.arc(particle.x, particle.y, particle.size * opacity, 0, Math.PI * 2)
    context.fill()
  }

  context.globalAlpha = 1
  context.shadowBlur = 0
  animationFrame = requestAnimationFrame(animate)
}

portrait.addEventListener('error', () => {
  portrait.hidden = true
})

button.addEventListener('click', launchButtonShow)
window.addEventListener('resize', resizeCanvas)

resizeCanvas()
animate()

setTimeout(launchButtonShow, 600)

window.addEventListener('beforeunload', () => cancelAnimationFrame(animationFrame))
