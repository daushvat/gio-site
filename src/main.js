import './style.css'

const galleryShots = [
  {
    title: 'Rear-View Watch',
    detail: 'The quiet glance from the patrol car that started every rumor on the avenue.',
    image: '/gio-rearview.jpg',
    alt: 'Gio reflected in a car rear-view mirror',
  },
  {
    title: 'King of the Hill',
    detail: 'Arms open above the city, pointing toward the skyline like the whole block belonged to him.',
    image: '/gio-city-rooftop.jpg',
    alt: 'Gio standing on a car with arms out toward the city skyline',
    position: 'top center',
  },
  {
    title: 'Tire Yard Test',
    detail: 'A rough-edge training ground scene where Gio made even the toughest backdrop look like a fan meet.',
    image: '/gio-training-yard.jpg',
    alt: 'Gio smiling and gesturing in a tire-filled training yard',
    position: 'center top',
  },
  {
    title: 'Night Patrol',
    detail: 'A midnight canyon frame with hard shadows, bright focus, and Gio looking calm when the city gets loud.',
    image: '/gio-night-patrol.jpg',
    alt: 'Gio standing at night in a rocky outdoor setting',
    position: 'center top',
  },
]

const storyBeats = [
  'Gio watched the city through mirrors, windows, and blue evening glass: calm shoulders, sharp eyes, and that impossible focus everyone pretended not to notice.',
  'Some afternoons he climbed above the street, opened his arms to the skyline, and made the whole city look like it was waiting for his next move.',
  'Even in the rough training yards, surrounded by dust, tires, and echoing shots, Gio smiled like he had just invited the whole city backstage.',
  'By midnight, the rumor was already moving from block to block: if a steady glance appeared in the rear-view mirror or a sharp shadow crossed the canyon road, Gio was nearby, and every heart in the city knew it.',
]

document.querySelector('#app').innerHTML = `
  <main class="site-shell">
    <section class="hero" aria-labelledby="hero-title">
      <nav class="topbar" aria-label="Main navigation">
        <a class="brand" href="#top" aria-label="GioFans home">
          <span class="brand-mark">GF</span>
          <span>GioFans</span>
        </a>
        <div class="nav-links" aria-label="Page sections">
          <a href="#story">Story</a>
          <a href="#gallery">Photos</a>
          <a href="#profile">Profile</a>
        </div>
      </nav>

      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">Official city crush profile</p>
          <h1 id="hero-title">GioFans: subscribe to the officer everyone talks about.</h1>
          <p class="hero-text">
            A polished biography site for Gio: part legend, part city diary, all blue-light charisma.
            Send the photos next and this page becomes his personal fan-style storybook.
          </p>
          <div class="hero-actions">
            <a class="button button-primary" href="#gallery">View profile</a>
            <a class="button button-secondary" href="#story">Read the story</a>
          </div>
        </div>

        <aside class="profile-panel" aria-label="Featured profile card">
          <div class="photo-stage">
            <img src="/gio-rearview.jpg" alt="Gio reflected in a car rear-view mirror" />
          </div>
          <div class="profile-meta">
            <span class="status-dot"></span>
            <span>Rear-view exclusive • Police story edition</span>
          </div>
        </aside>
      </div>
    </section>

    <section class="story-band" id="story" aria-labelledby="story-title">
      <div class="section-heading">
        <p class="eyebrow">Imaginary biography</p>
        <h2 id="story-title">The policeman every girl liked in the city</h2>
      </div>
      <div class="story-grid">
        ${storyBeats
          .map(
            (beat, index) => `
              <article class="story-card">
                <span>${String(index + 1).padStart(2, '0')}</span>
                <p>${beat}</p>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>

    <section class="gallery-band" id="gallery" aria-labelledby="gallery-title">
      <div class="section-heading">
        <p class="eyebrow">Photo-ready layout</p>
        <h2 id="gallery-title">Gio's growing city file</h2>
      </div>
      <div class="gallery-grid">
        ${galleryShots
          .map(
            (shot, index) => `
              <article class="gallery-card">
                <div class="gallery-image">
                  ${
                    shot.image
                      ? `<img src="${shot.image}" alt="${shot.alt}" style="object-position: ${shot.position || 'center'}" />`
                      : `<span>Photo ${index + 1}</span>`
                  }
                </div>
                <h3>${shot.title}</h3>
                <p>${shot.detail}</p>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>

    <section class="profile-band" id="profile" aria-labelledby="profile-title">
      <div class="profile-copy">
        <p class="eyebrow">GioFans profile</p>
        <h2 id="profile-title">Blue uniform. Bright city. Main-character energy.</h2>
        <p>
          GioFans is built like a premium personal profile: bold headline, cinematic biography,
          smooth gallery blocks, and a professional blue visual system ready for real photos.
        </p>
      </div>
      <div class="stats-strip" aria-label="Profile highlights">
        <div>
          <strong>24/7</strong>
          <span>City watch</span>
        </div>
        <div>
          <strong>100%</strong>
          <span>Blue charisma</span>
        </div>
        <div>
          <strong>VIP</strong>
          <span>Fan profile</span>
        </div>
      </div>
    </section>
  </main>
`
