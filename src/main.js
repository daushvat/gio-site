import './style.css'

const galleryShots = [
  {
    title: 'Blue Patrol',
    detail: 'A night-watch portrait for the officer every boulevard recognizes.',
  },
  {
    title: 'City Smile',
    detail: 'The kind of look that turns traffic into applause.',
  },
  {
    title: 'After Hours',
    detail: 'Stories, charm, and a little mystery under electric-blue lights.',
  },
]

const storyBeats = [
  'Gio walked the city like it was built for him: calm shoulders, clean uniform, sharp eyes, and that impossible smile everyone pretended not to notice.',
  'At every cafe window, girls whispered the same thing: the city felt safer when he passed by, and somehow a little more dangerous too.',
  'He never chased attention. He helped old neighbors cross rainy streets, settled arguments before they became trouble, and made even the loudest nights behave.',
  'By midnight, the rumor was already moving from block to block: if blue lights flashed softly on the avenue, Gio was nearby, and every heart in the city knew it.',
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
            <div class="photo-placeholder">
              <span>Gio</span>
            </div>
          </div>
          <div class="profile-meta">
            <span class="status-dot"></span>
            <span>City favorite • Police story edition</span>
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
        <h2 id="gallery-title">Drop the next photos here</h2>
      </div>
      <div class="gallery-grid">
        ${galleryShots
          .map(
            (shot, index) => `
              <article class="gallery-card">
                <div class="gallery-image">
                  <span>Photo ${index + 1}</span>
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
