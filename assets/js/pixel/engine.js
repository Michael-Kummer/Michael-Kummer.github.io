/* Pixel art engine shared by every scene on the site. Style rules: docs/pixel-art.md */
(function (root) {
  'use strict';

  /* ---------- Palette: hue-shifted ramps, dark to light. Scenes may only use these. ---------- */
  const RAMPS = {
    ink: ['#0e0a17', '#1c1428', '#2b1f3d'],
    stone: ['#221f30', '#363149', '#4f4966', '#716b8a', '#9d97b3', '#cbc6da'],
    slate: ['#171a2c', '#252b47', '#363f66', '#4c5a8c'],
    rock: ['#262a45', '#3b416a', '#596497', '#8591c2', '#b7c1e3'],
    snow: ['#8794c4', '#aebce4', '#d6e0f8', '#f5f8ff'],
    haze: ['#7486ba', '#93a5d4', '#b4c3e6', '#d6e1f5'],
    spruce: ['#0a1f22', '#12352f', '#1d4d3c', '#2f6847', '#4d8a55', '#7aae68'],
    leaf: ['#1c3820', '#2e5a2a', '#4c8532', '#78b03d', '#acd659', '#e0f08f'],
    gold: ['#55340f', '#8a581b', '#c08a2c', '#e4b947', '#f6dc84', '#fff3c6'],
    canola: ['#5f5d0b', '#9b9413', '#d6c71f', '#f3e541', '#fff8a3'],
    grass: ['#1c3420', '#2f5129', '#477434', '#68973e', '#94bc53', '#c5df7a'],
    dirt: ['#2a1812', '#45291b', '#654027', '#8a5c38', '#b38250', '#d6ab78'],
    bark: ['#1f110d', '#382015', '#56341f', '#7b4e2d', '#a06d43'],
    birch: ['#35333a', '#7f7b78', '#bfb9ad', '#e6e1d4', '#fffdf4'],
    barn: ['#2a0b11', '#4c1318', '#77211f', '#a33729', '#cc5d3a', '#ec9061'],
    clay: ['#371b1e', '#5d2e29', '#8a4934', '#b77046', '#d99f68', '#efcd97'],
    mauve: ['#33263a', '#524055', '#776174', '#9f8994', '#c4b2b4'],
    water: ['#0c2d42', '#125366', '#1a8189', '#36aea8', '#7ddbca', '#d1fff0'],
    metal: ['#1b1e28', '#2f3546', '#4a5369', '#727d97', '#a7b1c6', '#e1e7f1'],
    teal: ['#0e2a2d', '#174a4a', '#22706a', '#36978a', '#64c2ad'],
    hat: ['#563605', '#9d6b0b', '#dca119', '#ffc629', '#ffe58c'],
    sky: ['#4673c2', '#6290d6', '#82afe6', '#a6ccf0', '#cbe4f7', '#e6f3fb'],
    night: ['#08081a', '#11112d', '#1a1a42', '#262658', '#36336d', '#4e4386', '#6c579b'],
    aurora: ['#16584c', '#25977a', '#53d39b', '#a3f5c4', '#6a3f9f', '#9e6ccc'],
    glow: ['#6d2b0e', '#c4621b', '#f59a32', '#ffcb69', '#ffeaa8', '#fffbe6'],
    screen: ['#0c2a33', '#11545e', '#1f8c8c', '#4fd0b8', '#b6fbe0'],
    cream: ['#a9977b', '#cfc0a2', '#e8dcc2', '#f6eedc', '#fffaf0'],
    bone: ['#6c6252', '#a2967f', '#cfc4ab', '#ece4cf', '#fffbef'],
    rose: ['#5e1838', '#9a3160', '#d45f8c', '#f79bbd', '#ffd3e2'],
  };

  const COLORS = {};
  for (const [name, ramp] of Object.entries(RAMPS)) {
    ramp.forEach((hex, i) => {
      const n = parseInt(hex.slice(1), 16);
      COLORS[name + i] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    });
  }

  /* Night grade: moonlit blue, darker, a little violet lift in the shadows. */
  function gradeNight([r, g, b]) {
    const l = 0.3 * r + 0.59 * g + 0.11 * b;
    return [
      Math.min(255, r * 0.3 + l * 0.08 + 10),
      Math.min(255, g * 0.33 + l * 0.11 + 12),
      Math.min(255, b * 0.5 + l * 0.22 + 34),
    ];
  }

  /* ---------- Noise and dithering ---------- */
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  /** true where an ordered dither of coverage t (0..1) puts a pixel */
  const dither = (x, y, t) => t > (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16;

  function hash(x, y = 0, seed = 0) {
    let h = (x * 374761393 + y * 668265263 + seed * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  function noise1(x, seed = 0) {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return hash(i, 0, seed) * (1 - u) + hash(i + 1, 0, seed) * u;
  }

  function fbm(x, seed = 0, octaves = 4) {
    let v = 0;
    let a = 0.5;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      v += noise1(x, seed + o * 31) * a;
      norm += a;
      x *= 2.03;
      a *= 0.5;
    }
    return v / norm;
  }

  /* ---------- Sprites ---------- */
  /**
   * A sprite from rows of characters. '.' is empty. legend maps a character to a colour name
   * ('gold3') or a role ('@skin3': step 3 of whatever ramp the caller assigns to "skin").
   */
  function sprite(rows, legend) {
    const h = rows.length;
    const w = Math.max(...rows.map((r) => r.length));
    return { w, h, rows, legend };
  }

  /* ---------- Painter: an RGBA pixel buffer ---------- */
  class Painter {
    constructor(w, h) {
      this.w = w;
      this.h = h;
      this.data = new Uint8ClampedArray(w * h * 4);
      this.night = false;
      this.x0 = 0; // clip, so a scene can redraw only the part a canvas shows
      this.x1 = w;
      this._cache = {};
    }

    setNight(night) {
      if (night !== this.night) this._cache = {};
      this.night = night;
    }

    clip(x0, x1) {
      this.x0 = Math.max(0, x0 | 0);
      this.x1 = Math.min(this.w, Math.ceil(x1));
    }

    clear() {
      this.data.fill(0);
    }

    /** colour name -> graded rgb. glow skips the night grade. */
    rgb(name, glow = false) {
      const key = glow ? '*' + name : name;
      let c = this._cache[key];
      if (!c) {
        const base = COLORS[name];
        if (!base) throw new Error('pixel: unknown colour ' + name);
        c = this._cache[key] = this.night && !glow ? gradeNight(base) : base;
      }
      return c;
    }

    put(x, y, c) {
      x |= 0;
      y |= 0;
      if (x < this.x0 || x >= this.x1 || y < 0 || y >= this.h) return;
      const i = (y * this.w + x) * 4;
      this.data[i] = c[0];
      this.data[i + 1] = c[1];
      this.data[i + 2] = c[2];
      this.data[i + 3] = 255;
    }

    px(x, y, name, glow) {
      this.put(x, y, this.rgb(name, glow));
    }

    /** blend a colour over what is there (glow halos); a is 0..1 */
    mix(x, y, name, a, glow = true) {
      x |= 0;
      y |= 0;
      if (x < this.x0 || x >= this.x1 || y < 0 || y >= this.h) return;
      const i = (y * this.w + x) * 4;
      if (!this.data[i + 3]) return;
      const c = this.rgb(name, glow);
      for (let k = 0; k < 3; k++) this.data[i + k] += (c[k] - this.data[i + k]) * a;
    }

    has(x, y) {
      if (x < 0 || x >= this.w || y < 0 || y >= this.h) return false;
      return this.data[((y | 0) * this.w + (x | 0)) * 4 + 3] > 0;
    }

    erase(x, y) {
      if (x < 0 || x >= this.w || y < 0 || y >= this.h) return;
      this.data[((y | 0) * this.w + (x | 0)) * 4 + 3] = 0;
    }

    rect(x, y, w, h, name, glow) {
      const c = this.rgb(name, glow);
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.put(i, j, c);
    }

    hline(x0, x1, y, name, glow) {
      const c = this.rgb(name, glow);
      for (let i = Math.min(x0, x1); i <= Math.max(x0, x1); i++) this.put(i, y, c);
    }

    vline(x, y0, y1, name, glow) {
      const c = this.rgb(name, glow);
      for (let j = Math.min(y0, y1); j <= Math.max(y0, y1); j++) this.put(x, j, c);
    }

    line(x0, y0, x1, y1, name, glow) {
      const c = this.rgb(name, glow);
      x0 = Math.round(x0);
      y0 = Math.round(y0);
      x1 = Math.round(x1);
      y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0);
      const dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        this.put(x0, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
          err += dy;
          x0 += sx;
        }
        if (e2 <= dx) {
          err += dx;
          y0 += sy;
        }
      }
    }

    disc(cx, cy, r, name, glow) {
      const c = this.rgb(name, glow);
      for (let j = -r; j <= r; j++)
        for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r + r * 0.8) this.put(cx + i, cy + j, c);
    }

    /**
     * Draw a sprite. opts: flip (mirror), roles {skin: 'skinB', ...}, glow (true, or a string of
     * legend characters that glow), only (draw in a single colour: silhouettes).
     */
    sprite(s, x, y, opts = {}) {
      const { flip = false, roles = {}, glow = false, only } = opts;
      x = Math.round(x);
      y = Math.round(y);
      for (let j = 0; j < s.h; j++) {
        const row = s.rows[j];
        for (let i = 0; i < row.length; i++) {
          const ch = row[i];
          if (ch === '.' || ch === ' ') continue;
          let name = only || s.legend[ch];
          if (!name) continue;
          if (name[0] === '@') {
            const m = /^@([a-zA-Z]+)(\d+)$/.exec(name);
            name = (roles[m[1]] || m[1]) + m[2];
          }
          const g = glow === true || (typeof glow === 'string' && glow.includes(ch));
          this.px(flip ? x + s.w - 1 - i : x + i, y + j, name, g);
        }
      }
    }

    /** copy another painter's opaque pixels on top (same size) */
    over(src) {
      const d = this.data;
      const s = src.data;
      const w = this.w;
      for (let y = 0; y < this.h; y++) {
        for (let x = this.x0; x < this.x1; x++) {
          const i = (y * w + x) * 4;
          if (s[i + 3]) {
            d[i] = s[i];
            d[i + 1] = s[i + 1];
            d[i + 2] = s[i + 2];
            d[i + 3] = 255;
          }
        }
      }
    }

    /** copy another painter's pixels exactly (same size) */
    copy(src) {
      const w = this.w;
      for (let y = 0; y < this.h; y++) {
        const a = (y * w + this.x0) * 4;
        const b = (y * w + this.x1) * 4;
        this.data.set(src.data.subarray(a, b), a);
      }
    }
  }

  /* ---------- Runtime: mounting canvases, mode, motion, visibility ---------- */
  const env = typeof window !== 'undefined' && typeof document !== 'undefined';

  function isNight() {
    if (!env) return false;
    const mode = document.documentElement.getAttribute('data-mode');
    if (mode) return mode === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function onModeChange(cb) {
    if (!env) return;
    new MutationObserver(() => cb(isNight())).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode'],
    });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => cb(isNight()));
  }

  const reducedMotion = () => env && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** art pixel size in screen pixels */
  const scale = () => (env && window.innerWidth < 768 ? 2 : 3);

  /**
   * Run tick(t) at fps while any of the watched elements is on screen and the tab is visible.
   * With reduced motion, tick runs once (t = 0) and on demand only.
   */
  function loop(fps, elements, tick) {
    let visible = new Set();
    let raf = 0;
    let last = 0;
    const start = performance.now();
    const still = reducedMotion();

    function frame(now) {
      raf = 0;
      if (!visible.size || document.hidden) return;
      if (now - last >= 1000 / fps) {
        last = now;
        tick((now - start) / 1000);
      }
      raf = requestAnimationFrame(frame);
    }
    function wake() {
      if (!still && !raf && visible.size && !document.hidden) raf = requestAnimationFrame(frame);
    }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) e.isIntersecting ? visible.add(e.target) : visible.delete(e.target);
      wake();
    });
    elements.forEach((el) => io.observe(el));
    document.addEventListener('visibilitychange', wake);
    tick(still ? 12 : 0);
    return {
      redraw: () => tick(still ? 12 : (performance.now() - start) / 1000),
      watch: (el) => io.observe(el),
    };
  }

  /** show painter columns [sx, sx + w) on a canvas */
  function present(p, canvas, sx, w) {
    w = Math.max(1, Math.min(w, p.w - sx));
    if (canvas.width !== w || canvas.height !== p.h) {
      canvas.width = w;
      canvas.height = p.h;
    }
    if (!p._image || p._image.data !== p.data) p._image = new ImageData(p.data, p.w, p.h);
    canvas.getContext('2d').putImageData(p._image, -sx, 0, sx, 0, w, p.h);
  }

  root.Pixel = {
    RAMPS,
    COLORS,
    Painter,
    sprite,
    dither,
    hash,
    noise1,
    fbm,
    isNight,
    onModeChange,
    reducedMotion,
    scale,
    loop,
    present,
    scenes: {},
  };
})(typeof window !== 'undefined' ? window : globalThis);
