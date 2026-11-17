/* The Alberta panorama along the bottom of every page: Rockies, boreal forest, aspen parkland with
   the Edmonton skyline, prairie farmland and the badlands, west to east. Day in light mode, night
   in dark mode. On desktop the sidebar strip shows the western end and a band fixed to the bottom
   of the viewport the rest, as one landscape. The sidebar icons stand on drawn stone markers and a
   lantern post, and the footer line is lettered on a roadside sign.
   Style rules: docs/pixel-art.md */
(function () {
  'use strict';
  const { Painter, dither, hash, noise1, fbm } = window.Pixel;

  const H = 72; // art pixels tall
  const GY = 56; // where the near ground starts
  const CY = 50; // where the distant city stands (its north bank)

  function zones(W) {
    const z = { mtn: [0, 0.2 * W], boreal: [0.2 * W, 0.355 * W], park: [0.355 * W, 0.5 * W] };
    z.prairie = [0.5 * W, 0.81 * W];
    z.bad = [0.81 * W, W];
    for (const k in z) z[k].push(z[k][1] - z[k][0]); // [start, end, width]
    return z;
  }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Where two biomes meet in the foreground: a ragged seam SEAM art px wide, dithered from one
  // side to the other, instead of a straight cut. True when (x, y) belongs to the east side of b.
  const SEAM = 8;
  const past = (x, y, b) => dither(x, y, clamp((x - b - (noise1(y * 0.6 + b, 61) - 0.5) * 4) / SEAM + 0.5, 0, 1));
  const ramp = (name, f, x, y, lo, hi) => {
    // a continuous step f along a ramp, dithered between neighbouring steps
    f = clamp(f, lo, hi);
    const i = Math.floor(f);
    return name + Math.min(hi, dither(x, y, f - i) ? i + 1 : i);
  };

  /* ---------------- sky (cached) ---------------- */

  // T is the first row that is shown (phones crop the top of the sky)
  function drawSky(p, W, night, T) {
    const fade = T ? 14 : 18;
    for (let y = T; y < GY + 2; y++) {
      for (let x = 0; x < W; x++) {
        // dissolve into the page at the top
        if (y < T + fade && !dither(x, y, (y - T + 1) / fade)) continue;
        const t = y / (GY - 6);
        const name = night ? ramp('night', 1 + t * 4.4, x, y, 0, 6) : ramp('sky', t * 4.7, x, y, 0, 5);
        p.px(x, y, name, true);
      }
    }
  }

  /* ---------------- terrain (cached) ---------------- */
  function farRidge(x, W, T) {
    const west = clamp(1 - x / (0.6 * W), 0, 1);
    const amp = 9 + 22 * west;
    return Math.max(T + 9, 50 - amp * (0.3 + 0.7 * fbm(x * 0.03, 3, 4)));
  }

  function nearPeaks(z, T) {
    const M = z.mtn[2];
    // [centre, top y, left slope, right slope]: gentle west slopes, steep east faces, like Rundle
    return [
      [0.06 * M, 22, 0.8, 1.3],
      [0.3 * M, 9, 0.75, 1.35],
      [0.55 * M, 15, 0.9, 1.2],
      [0.8 * M, 19, 0.7, 1.45],
      [1.05 * M, 27, 0.8, 1.2],
      [1.3 * M, 35, 0.9, 1.1],
    ].map(([c, top, ls, rs]) => [c, Math.max(top, T + 5), ls, rs]);
  }

  function nearRidge(x, peaks) {
    let y = 99;
    for (const [c, top, ls, rs] of peaks) y = Math.min(y, top + (x < c ? (c - x) * ls : (x - c) * rs));
    return y + Math.round(2.2 * (fbm(x * 0.35, 11, 3) - 0.5)) + (hash(x, 3) > 0.85 ? 1 : 0);
  }

  /** which face of the Rockies a column is on: true for the sunlit (west) face */
  function nearLit(x, y, peaks) {
    let best = 99;
    let lit = true;
    for (const [c, top, ls, rs] of peaks) {
      const v = top + (x < c ? (c - x) * ls : (x - c) * rs);
      if (v < best) (best = v), (lit = x < c + (y - top) * 0.3);
    }
    return lit;
  }

  function hillRidge(x) {
    return 50 - 3.5 * fbm(x * 0.045, 7, 3) - 2.5 * Math.max(0, Math.sin(x * 0.03 + 1.3));
  }

  function shadowed(ridge, x, y, reach = 60) {
    // light from the upper left: is there terrain between this pixel and the light?
    for (let i = 1; i < reach; i++) if (y - i >= ridge(x - i)) return true;
    return false;
  }

  function drawTerrain(p, W, z, T, city, portal) {
    /* far range: hazy, no outlines, lighter with distance */
    const far = (x) => Math.round(farRidge(x, W, T));
    for (let x = 0; x < W; x++) {
      const top = far(x);
      for (let y = top; y < GY; y++) {
        const d = y - top;
        const sh = shadowed(far, x, y, 30);
        let name = sh ? 'haze1' : 'haze2';
        if (top < 34 && d < 3 + 3 * noise1(x * 0.3, 5)) name = sh ? 'snow1' : 'snow2';
        else if (d === 0 && !sh) name = 'haze3';
        if (y > 49) name = sh ? 'haze0' : 'haze1';
        p.px(x, y, name);
      }
    }

    /* near Rockies */
    const peaks = nearPeaks(z, T);
    const near = (x) => nearRidge(x, peaks);
    const mEnd = z.mtn[1] + z.mtn[2] * 0.45;
    for (let x = 0; x < mEnd; x++) {
      const top = near(x);
      for (let y = Math.max(0, top); y < GY; y++) {
        const d = y - top;
        const sh = !nearLit(x, y, peaks);
        const strata = (y * 2 - x * 1 + 400) % 7 === 0;
        let name = sh ? (strata ? 'rock0' : 'rock1') : strata ? 'rock2' : 'rock3';
        if (!sh && d === 0) name = 'rock4';
        const snowLine = 30 + 5 * noise1(x * 0.2, 2);
        const gully = (x * 3 + y * 2) % 11 < 2 && hash(x >> 2, y >> 2, 4) > 0.4;
        if (y < snowLine && (d < 3 + 4 * noise1(x * 0.4, 8) || gully)) name = sh ? (d < 1 ? 'snow1' : 'snow0') : d < 1 ? 'snow3' : 'snow2';
        if (y > 47 + 3 * noise1(x * 0.3, 12)) name = sh ? 'spruce0' : 'spruce1'; // forested base
        p.px(x, y, name);
      }
    }
    /* treeline silhouettes at the foot of the mountains */
    for (let x = 0; x < mEnd + 10; x += 2) {
      const h = 3 + Math.floor(hash(x, 21) * 5);
      const base = 54 + Math.floor(hash(x, 22) * 2);
      for (let r = 0; r < h; r++) {
        const hw = Math.floor(r * 0.5);
        for (let i = -hw; i <= hw; i++) p.px(x + i, base - h + r, i < 0 ? 'spruce2' : 'spruce1');
      }
    }

    /* foothills behind the boreal and parkland; flattened into a plain where the city stands */
    const hill = (x) => {
      const h = hillRidge(x);
      const w = clamp(Math.min(x - city.x0 + 8, city.x1 + 8 - x) / 8, 0, 1);
      return Math.round(h + (CY + 1 - h) * w);
    };
    const h0 = Math.floor(z.boreal[0] - 20);
    for (let x = h0; x < z.prairie[0] + 30; x++) {
      const top = Math.max(hill(x), Math.round(GY - (x - h0) * 0.6));
      for (let y = top; y < GY; y++) {
        const sh = shadowed(hill, x, y, 12);
        let name = sh ? 'grass2' : y === top ? 'grass4' : 'grass3';
        if (hash(x, y, 31) > 0.9) name = 'spruce2';
        p.px(x, y, name);
      }
    }
    drawCity(p, city);
    drawPortal(p, portal);

    /* ground band across everything; in the foreground the biomes meet in ragged, dithered seams */
    const edges = [z.boreal[0], z.park[0], z.prairie[0], z.bad[0]];
    for (let x = 0; x < W; x++) {
      for (let y = GY - 4; y < H; y++) {
        let name = null;
        let k = 0;
        for (const b of edges) if (y < GY ? x >= b : past(x, y, b)) k++;
        if (k === 0) {
          if (y >= GY) name = hash(x, y, 7) > 0.9 ? 'grass4' : dither(x, y, 0.35 + (y - GY) / 30) ? 'grass2' : 'grass3';
        } else if (k === 1) {
          if (y >= GY) name = hash(x, y, 8) > 0.88 ? 'grass3' : dither(x, y, 0.5) ? 'spruce2' : 'spruce1';
        } else if (k === 2) {
          if (y >= GY) name = hash(x, y, 9) > 0.93 ? (hash(x, y, 10) > 0.5 ? 'rose3' : 'cream4') : y % 3 === 0 ? 'grass3' : 'grass4';
        } else if (k === 3) {
          name = field(x, y, z);
        } else if (y >= GY) {
          name = hash(x, y, 12) > 0.93 ? 'clay3' : (x * 7 + y * 13) % 23 === 0 ? 'clay2' : dither(x, y, 0.3) ? 'clay4' : 'clay5';
        }
        if (name) p.px(x, y, name);
      }
    }

    drawLake(p, z);
    drawBadlands(p, W, z);
    drawTrack(p, W, portal);
  }

  /* prairie patchwork: bands get taller toward the viewer */
  const BANDS = [52, 54, 56, 59, 63, H];
  function field(x, y, z) {
    if (y < BANDS[0]) return null;
    let b = 0;
    while (y >= BANDS[b + 1]) b++;
    const seg = Math.floor((x + b * 17 + (y - BANDS[b]) * (b - 2)) / (28 + b * 9));
    const kind = Math.floor(hash(seg, b, 41) * 4);
    const yy = y - BANDS[b];
    if (y === BANDS[b] && b > 0) return 'grass1'; // field edge
    const far = b < 2;
    switch (kind) {
      case 0: // wheat
        return yy % 2 ? (far ? 'gold4' : 'gold3') : far ? 'gold3' : 'gold2';
      case 1: // canola
        return hash(x, y, 43) > 0.75 ? 'canola4' : far ? 'canola3' : 'canola2';
      case 2: // pasture
        return hash(x, y, 44) > 0.8 ? 'grass5' : far ? 'grass4' : 'grass3';
      default: // summerfallow, furrows
        return (x + yy * 2) % 4 === 0 ? 'dirt2' : far ? 'dirt4' : 'dirt3';
    }
  }

  function lakeSpan(z) {
    const M = z.mtn[2];
    return { x0: Math.round(0.12 * M), x1: Math.round(0.78 * M), y0: GY - 2, y1: GY + 5 };
  }

  function drawLake(p, z) {
    const L = lakeSpan(z);
    for (let y = L.y0; y < L.y1; y++) {
      const inset = Math.round(Math.abs(y - (L.y0 + 2.5)) * 1.6);
      for (let x = L.x0 + inset; x < L.x1 - inset; x++) {
        // reflection of the mountains, tinted turquoise like the mountain lakes
        const ry = L.y0 - 1 - (y - L.y0) * 3;
        const i = (ry * p.w + x) * 4;
        const lum = p.data[i] * 0.3 + p.data[i + 1] * 0.59 + p.data[i + 2] * 0.11;
        let name = lum > 200 ? 'water4' : lum > 120 ? 'water3' : 'water2';
        if (y === L.y0) name = 'water4';
        if (y === L.y1 - 1) name = 'water1';
        p.px(x, y, name);
      }
      p.px(L.x0 + inset - 1, y, 'stone3');
      p.px(L.x1 - inset, y, 'stone2');
    }
  }

  function drawBadlands(p, W, z) {
    const [b0, , bw] = z.bad;
    // banded coulee walls, rising out of the prairie with a steep edge
    const top = (x) => {
      const mesa = 38 + 7 * fbm(x * 0.05, 51, 3) - 4 * Math.sin((x - b0) * 0.04);
      return Math.round(Math.max(mesa, GY + 1 - (x - b0 + 4) * 1.4));
    };
    const bands = ['clay4', 'clay3', 'mauve3', 'clay5', 'clay2', 'mauve2', 'clay4', 'ink2', 'clay3', 'mauve3'];
    for (let x = Math.floor(b0 - 4); x < W; x++) {
      const t = top(x);
      for (let y = t; y < GY + 1; y++) {
        const sh = shadowed(top, x, y, 10);
        const band = bands[Math.floor((y + Math.round(2 * noise1(x * 0.1, 52))) / 3) % bands.length];
        const k = +band.slice(-1);
        const rp = band.slice(0, -1);
        let name = band;
        if (sh && rp !== 'ink') name = rp + Math.max(0, k - 1);
        if (noise1(x * 0.6, 53) > 0.72 && y > t + 2) name = rp === 'ink' ? 'ink1' : rp + Math.max(0, k - 1); // gullies
        if (y === t) name = sh ? 'clay3' : 'clay5';
        p.px(x, y, name);
      }
    }
    // a tyrannosaur skull weathering out of the wall
    if (bw > 60) {
      const skull = window.Pixel.sprite(
        [
          '......bbbbbb.....',
          '...bbbBBBBBBbb...',
          '.bbBBBBBBBoBBBb..',
          'bBBBBBBBBBooBBBb.',
          'bBBBBBBBBBBBBBBb.',
          'bwBwBwBwBBBBBb.cc',
          '.bbbbbbbbbbb..c.c',
          '..w.w.w.w........',
        ],
        { b: 'bone1', B: 'bone3', o: 'ink1', w: 'bone4', c: 'bone2' }
      );
      p.sprite(skull, Math.round(b0 + bw * 0.55), 45);
    }

    // hoodoos: soft sandstone cones under a hard caprock
    const spots = [0.12, 0.33, 0.71, 0.9];
    spots.forEach((f, n) => {
      if (bw < 70 && n % 2) return;
      const hx = Math.round(b0 + bw * f);
      const h = 12 + Math.floor(hash(n, 61) * 7);
      const base = GY + 3 + (n % 2) * 2;
      for (let r = 0; r < h; r++) {
        const y = base - r;
        const hw = Math.round(1 + Math.pow(1 - r / h, 1.5) * 3.2);
        for (let i = -hw; i <= hw; i++) {
          const band = Math.floor((y + n) / 2) % 3;
          let name = i < 0 ? ['clay5', 'clay4', 'clay5'][band] : ['clay3', 'clay3', 'mauve3'][band];
          if (i === hw) name = 'clay1';
          else if (i === hw - 1) name = 'clay2';
          p.px(hx + i, y, name);
        }
      }
      const cy = base - h;
      for (let i = -3; i <= 3; i++) {
        p.px(hx + i, cy - 1, i < 0 ? 'stone4' : 'stone3');
        p.px(hx + i, cy, i < 1 ? 'stone2' : 'stone1');
        p.px(hx + i, cy + 1, Math.abs(i) < 2 ? 'ink1' : 'stone1');
      }
      for (let i = -2; i <= 2; i++) p.px(hx + i, cy - 2, i < 1 ? 'stone5' : 'stone4');
      p.px(hx - 3, cy + 1, 'ink1'), p.px(hx + 3, cy + 1, 'ink1');
    });

    // sagebrush
    for (let n = 0; n < bw / 10; n++) {
      const sx = Math.round(b0 + 4 + hash(n, 71) * (bw - 6));
      const sy = GY + 4 + Math.floor(hash(n, 72) * 11);
      p.px(sx, sy, 'haze1'), p.px(sx + 1, sy, 'haze2');
      p.px(sx - 1, sy + 1, 'teal3'), p.px(sx, sy + 1, 'teal3'), p.px(sx + 1, sy + 1, 'teal2'), p.px(sx + 2, sy + 1, 'teal1');
    }
  }

  /* ---------------- the Edmonton skyline (cached, in the parkland distance) ---------------- */
  // Seen from the south bank across the North Saskatchewan, west to east: the High Level Bridge,
  // the Legislature, the Walterdale Bridge down in the valley, downtown (Commerce Place, Manulife
  // Place, Epcor Tower, Stantec Tower set back in the ICE District, Bell Tower, CN Tower), the Hotel
  // Macdonald on the bank and the Muttart pyramids on the valley floor. Tower heights follow the
  // real ones (Stantec ~251 m = 27 art px).
  function cityPlan(z, W, phone) {
    const tier = phone ? 0 : z.park[2] >= 85 ? 2 : 1;
    const c = { tier, phone };
    const bl = [8, 10, 14][tier]; // High Level Bridge span
    const lw = [13, 17, 25][tier]; // Legislature width
    const mw = [0, 8, 10][tier]; // Hotel Macdonald width
    // downtown: [name, x offset, width, height], drawn in this order (Stantec first: it is set back)
    c.towers =
      tier === 0
        ? [['stantec', 7, 3, 20], ['manulife', 0, 4, 12], ['epcor', 3, 4, 13], ['bell', 10, 4, 11], ['cn', 14, 4, 10]]
        : [['stantec', 14, 4, 27], ['commerce', 0, 4, 12], ['manulife', 4, 5, 15], ['epcor', 9, 5, 16], ['bell', 18, 4, 14], ['cn', 23, 5, 12]];
    const dw = tier === 0 ? 18 : 28;
    const cw = bl + 2 + lw + 1 + dw + (mw ? mw + 1 : 0);
    // phones: the parkland is narrower than the city, so it runs west into the forest instead
    const x0 = Math.round(tier === 0 ? z.park[1] - cw : z.park[0] + z.park[2] * 0.5 - cw * 0.5);
    c.x0 = x0;
    c.bridge = [x0, x0 + bl];
    c.leg = x0 + bl + 2;
    c.lw = lw;
    c.dt = [c.leg + lw + 1, c.leg + lw + 1 + dw];
    c.mac = mw ? [c.dt[1] + 1, c.dt[1] + 1 + mw] : null;
    c.x1 = c.mac ? c.mac[1] : c.dt[1];
    const st = c.towers[0];
    c.stantec = c.dt[0] + st[1];
    c.beacon = [c.stantec + 1, CY - st[3] - 3];
    c.muttart = c.dt[0] + (tier === 0 ? 6 : 9);
    c.walter = tier ? [c.leg + lw - 5, c.dt[0] + 6] : null;
    return c;
  }

  function cityLights(p, x, y, n) {
    // lit office windows: night only, glow
    if (p.night && hash(x, y, n) > 0.5) p.px(x, y, hash(x, y, n + 1) > 0.7 ? 'glow4' : 'glow3', true);
  }

  // window colour: dark by day, sometimes lit at night
  function cityWindow(p, x, y, day, n) {
    p.px(x, y, day);
    cityLights(p, x, y, n);
  }

  /* the Legislature: sandstone wings, a columned portico, a drum with arched windows, the dome and
     its lantern. Lit from the upper left; floodlit at night. */
  function legislature(p, x0, w, night) {
    const cx = x0 + (w >> 1);
    const tier = w >= 25 ? 2 : w >= 17 ? 1 : 0;
    const wh = [3, 4, 4][tier]; // wing height
    const ch = wh + 2; // central block height
    const R = [3, 3, 4][tier]; // dome radius
    const hw = [3, 5, 7][tier]; // central block half width
    const wall = (x, xa, xb) => (x === xb ? 'mauve2' : x - xa < (xb - xa) * 0.55 ? 'cream2' : 'cream1');
    // wings
    for (let y = CY - wh + 1; y <= CY; y++)
      for (let x = x0; x < x0 + w; x++) {
        const r = y - (CY - wh + 1);
        let name = wall(x, x0, x0 + w - 1);
        if (r === 0) name = x === x0 + w - 1 ? 'mauve3' : 'cream3'; // cornice
        else if (y === CY) name = x === x0 + w - 1 ? 'mauve1' : 'cream0'; // rusticated base
        else if ((x - x0) % 2 === 1 && x < x0 + w - 1) {
          cityWindow(p, x, y, 'slate1', 201);
          continue;
        }
        p.px(x, y, name);
      }
    // central block
    const b0 = cx - hw;
    const b1 = cx + hw;
    for (let y = CY - ch + 1; y <= CY; y++)
      for (let x = b0; x <= b1; x++) {
        const r = y - (CY - ch + 1);
        let name = wall(x, b0, b1);
        if (r === 0) name = x === b1 ? 'mauve3' : 'cream3';
        else if (r === 1 && tier) name = x % 2 ? 'cream1' : x === b1 ? 'mauve2' : 'cream3'; // balustrade
        else if (y === CY) name = x === b1 ? 'mauve1' : 'cream0';
        else if ((x - b0) % 2 === 1 && x < b1 && Math.abs(x - cx) > 2) {
          cityWindow(p, x, y, 'slate1', 202);
          continue;
        }
        p.px(x, y, name);
      }
    // portico: columns and a pediment, standing a little proud of the block
    const pw = tier ? 3 : 2;
    const py = CY - ch + 2;
    for (let y = py + 1; y < CY; y++)
      for (let x = cx - pw; x <= cx + pw; x++) p.px(x, y, (x - cx + pw) % 2 ? 'mauve1' : x > cx ? 'cream2' : 'cream3');
    for (let x = cx - pw - 1; x <= cx + pw + 1; x++) p.px(x, py, x > cx ? 'cream2' : 'cream3');
    for (let i = -pw; i <= pw; i++) {
      const lift = pw - Math.abs(i);
      if (lift > 0) p.px(cx + i, py - 1, i > 0 ? 'mauve3' : 'cream3');
      if (lift > 2) p.px(cx + i, py - 2, i > 0 ? 'mauve3' : 'cream3');
    }
    p.px(cx - pw - 1, CY, 'cream1'), p.px(cx + pw + 1, CY, 'mauve1'); // steps
    for (let x = cx - pw; x <= cx + pw; x++) p.px(x, CY, 'cream2');
    // drum with arched windows
    const dr = R + 1;
    const dTop = CY - ch - (tier ? 2 : 1);
    for (let y = dTop; y < CY - ch + 1; y++)
      for (let x = cx - dr; x <= cx + dr; x++) {
        const edge = x === cx + dr;
        let name = edge ? 'mauve2' : x < cx ? 'cream3' : 'cream2';
        if (y === dTop) name = edge ? 'mauve3' : 'cream3'; // cornice
        else if ((x - cx + dr) % 2 === 1 && !edge) {
          cityWindow(p, x, y, y === dTop + 1 ? 'slate2' : 'slate1', 203);
          continue;
        }
        p.px(x, y, name);
      }
    // dome: ribbed, lit on the left
    for (let r = 0; r < R; r++) {
      const y = dTop - 1 - r;
      const half = Math.round(Math.sqrt(R * R - r * r) + 0.25);
      for (let i = -half; i <= half; i++) {
        const f = i / (half + 0.5);
        let name = f < -0.2 ? 'cream3' : f < 0.35 ? 'cream2' : 'mauve3';
        if (i === half) name = 'mauve2';
        if (tier && i !== 0 && i % 2 === 0 && Math.abs(i) < half && r < R - 1) name = f < 0.35 ? 'cream1' : 'mauve2'; // ribs
        p.px(cx + i, y, name);
      }
    }
    // lantern and finial
    const ly = dTop - R - 1;
    p.px(cx - 1, ly, 'cream3'), p.px(cx, ly, night ? 'glow3' : 'slate1', night), p.px(cx + 1, ly, 'mauve2');
    if (tier) p.px(cx - 1, ly - 1, 'cream2'), p.px(cx, ly - 1, 'cream2'), p.px(cx + 1, ly - 1, 'mauve2');
    const fy = ly - (tier ? 2 : 1);
    p.px(cx, fy, 'cream1'), p.px(cx, fy - 1, 'rock1');
    if (night) {
      // floodlights on the dome and the portico
      for (let r = 0; r < R - 1; r++) p.px(cx - 1, dTop - 1 - r, 'cream4', true), p.px(cx - 2, dTop - 1 - r, 'cream3', true);
      for (let x = cx - pw; x <= cx; x += 2) p.px(x, CY - 1, 'cream3', true);
    }
  }

  /* one downtown tower, by name: its material, window pattern and crown */
  const TOWERS = {
    // dark green-black glass in horizontal bands
    commerce: { lit: 'slate3', mid: 'slate2', shade: 'slate1', win: (i, r) => r % 2 === 1, wl: 'teal1', ws: 'slate0' },
    // bronze glass, a stepped top
    manulife: { lit: 'dirt4', mid: 'dirt3', shade: 'dirt2', win: (i, r) => i % 2 === 1, wl: 'dirt2', ws: 'dirt1', step: true },
    // blue glass, the roof slopes up to the east
    epcor: { lit: 'rock4', mid: 'rock3', shade: 'rock2', win: (i, r) => r % 2 === 1 && i % 2 === 1, wl: 'rock2', ws: 'rock1', slope: true },
    // tan precast, inset crown
    bell: { lit: 'bone3', mid: 'bone2', shade: 'bone1', win: (i, r) => r % 2 === 0 && i % 2 === 1, wl: 'bone1', ws: 'bone0', inset: true },
    // white, with its dark ribbon windows
    cn: { lit: 'birch4', mid: 'birch3', shade: 'birch2', win: (i, r) => r % 2 === 1, wl: 'slate2', ws: 'slate1' },
  };

  function tower(p, x, w, h, kind) {
    const m = TOWERS[kind];
    const top = CY - h;
    for (let y = top; y <= CY; y++)
      for (let i = 0; i < w; i++) {
        const r = y - top;
        if (m.slope && r < w - 2 && i < w - 2 - r) continue;
        if (m.step && r < 2 && (i === 0 || i === w - 1)) continue;
        if (m.inset && r === 0 && (i === 0 || i === w - 1)) continue;
        const shade = i === w - 1;
        let name = i === 0 ? m.lit : shade ? m.shade : m.mid;
        if (r > 1 && y < CY && m.win(i, r) && i > 0) {
          cityWindow(p, x + i, y, shade ? m.ws : m.wl, 178);
          continue;
        }
        if (m.slope && i === w - 2 - r) name = m.lit; // glass catching the light along the slope
        p.px(x + i, y, name);
      }
  }

  // Stantec Tower: the tallest, pale, its top cut on a slant to a point
  function stantec(p, x, w, h) {
    const top = CY - h;
    for (let y = top; y <= CY; y++) {
      const r = y - top;
      for (let i = 0; i < w; i++) {
        if (r < w * 2 && i > r >> 1) continue; // the slanted cut, high on the west
        let name = i === 0 ? 'snow2' : i === w - 1 ? 'rock2' : 'rock4';
        if (r > 6 && r % 3 === 0 && i > 0) name = i === w - 1 ? 'rock1' : 'rock3';
        p.px(x + i, y, name);
        if (r > 6 && r % 3 === 1 && i > 0) cityLights(p, x + i, y, 181);
      }
    }
    p.px(x, top - 1, 'rock2'), p.px(x, top - 2, 'rock2'); // spire
  }

  // Hotel Macdonald: a cream château with a steep copper roof, dormers and corner turrets
  function hotelMac(p, x0, w, night) {
    const x1 = x0 + w - 1;
    for (let y = CY - 3; y <= CY; y++)
      for (let x = x0; x <= x1; x++) {
        let name = x === x1 ? 'cream0' : x - x0 < w * 0.5 ? 'cream3' : 'cream2';
        if (y < CY && y > CY - 3 && (x - x0) % 2 === 1 && x < x1) {
          cityWindow(p, x, y, 'mauve2', 204);
          continue;
        }
        if (y === CY) name = x === x1 ? 'mauve1' : 'cream1';
        p.px(x, y, name);
      }
    // roof
    for (let r = 0; r < 3; r++) {
      const y = CY - 4 - r;
      for (let x = x0 + r; x <= x1 - r; x++) {
        let name = x === x1 - r ? 'teal1' : x - x0 < w * 0.45 ? 'teal4' : 'teal3';
        if (r === 0 && (x - x0) % 3 === 1 && x < x1 - 1) name = 'cream3'; // dormers
        p.px(x, y, name);
      }
    }
    // turrets with pointed caps at both ends, a chimney in the middle
    for (const tx of [x0, x1]) {
      p.px(tx, CY - 4, tx === x1 ? 'cream0' : 'cream2');
      p.px(tx, CY - 5, tx === x1 ? 'teal1' : 'teal3'), p.px(tx, CY - 6, tx === x1 ? 'teal1' : 'teal4');
    }
    p.px(x0 + (w >> 1), CY - 7, 'cream1');
    if (night) p.px(x0 + 1, CY - 6, 'glow3', true);
  }

  function drawCity(p, c) {
    const night = p.night;
    /* the valley: the north bank, the river, the south bank */
    for (let x = c.bridge[0] - 2; x < c.x1 + 3; x++) {
      p.px(x, CY + 1, dither(x, CY + 1, 0.5) ? 'spruce2' : 'grass2');
      p.px(x, CY + 2, hash(x, 175) > 0.8 ? 'haze2' : 'water2');
      p.px(x, CY + 3, x % 5 === 0 ? 'water2' : 'water1');
      p.px(x, CY + 4, dither(x, CY + 4, 0.5) ? 'grass2' : 'grass3');
    }
    const [b0, b1] = c.bridge;
    const mid = (b0 + b1) / 2;
    const dip = (x) => Math.round(4 * (1 - Math.pow((x - mid) / ((b1 - b0) / 2 + 1), 2)));
    for (let x = b0; x <= b1; x++) {
      // the valley seen in profile where the river bends toward us
      const d = dip(x);
      for (let y = CY - 1; y < CY + d; y++) p.px(x, y, y < CY ? 'haze1' : dither(x, y, 0.5) ? 'grass2' : 'haze0');
      p.px(x, CY + d, hash(x, 176) > 0.6 ? 'water4' : 'water3');
      p.px(x, CY + 1 + d, 'grass2');
    }
    /* High Level Bridge: a long steel truss on lattice towers */
    const deck = CY - 2;
    for (let x = b0 - 2; x <= b1 + 2; x++) {
      if (x % 2 === 0) p.px(x, deck - 2, 'rock1'); // truss panels
      p.px(x, deck - 1, x % 2 ? 'rock3' : 'rock1');
      p.px(x, deck, 'rock0');
      if ((x - b0) % 4 === 2 && x < b1) {
        // lattice towers down to the water
        for (let y = deck + 1; y <= CY + dip(x); y++) p.px(x, y, 'rock1'), p.px(x + 1, y, y % 2 ? 'rock2' : 'rock0');
      }
      if (night && x % 2 === 0) p.px(x, deck - 1, ['rose3', 'aurora2', 'glow3', 'aurora5'][(x >> 1) % 4], true);
    }

    /* downtown: a hazy back row first, then the named towers */
    for (let x = c.dt[0] - 1; x < c.dt[1] + 1; x += 3) {
      const h = 5 + Math.floor(hash(x, 173) * 6);
      for (let y = CY - h; y <= CY; y++)
        for (let i = 0; i < 3; i++) {
          p.px(x + i, y, i === 2 ? 'haze0' : 'haze1');
          if ((y - CY) % 2 === 0 && i < 2) cityLights(p, x + i, y, 179);
        }
    }
    for (const [name, dx, w, h] of c.towers) {
      if (name === 'stantec') stantec(p, c.dt[0] + dx, w, h);
      else tower(p, c.dt[0] + dx, w, h, name);
    }
    legislature(p, c.leg, c.lw, night);
    if (c.mac) hotelMac(p, c.mac[0], c.mac[1] - c.mac[0], night);

    /* the wooded north bank, in front of the bases so the city stands on the ground */
    for (let x = b1 + 3; x < c.x1 + 3; x++) {
      if (hash(x, 205) > 0.45) p.px(x, CY, hash(x, 206) > 0.5 ? 'spruce2' : 'grass2');
      p.px(x, CY + 1, dither(x, CY + 1, 0.4) ? 'spruce1' : 'spruce2');
    }

    /* Walterdale Bridge: a white arch over the river */
    if (c.walter) {
      const [w0, w1] = c.walter;
      const wm = (w0 + w1) / 2;
      for (let x = w0; x <= w1; x++) {
        p.px(x, CY + 2, 'stone1'); // deck
        const a = CY + 1 - Math.round(3 * (1 - Math.pow((x - wm) / ((w1 - w0) / 2), 2)));
        p.px(x, a, x < wm ? 'birch4' : 'birch3', night);
        if ((x - w0) % 2 === 0 && a < CY + 1) for (let y = a + 1; y <= CY + 1; y++) p.px(x, y, 'birch2'); // hangers
      }
    }

    /* Muttart Conservatory: glass pyramids on the valley floor, lit in colour at night */
    const pyr = c.tier === 0 ? [[0, 3], [4, 4], [9, 3]] : [[0, 4], [5, 5], [11, 3], [15, 3]];
    const lit = ['aurora2', 'rose3', 'glow3', 'aurora5'];
    const base = CY + 4;
    pyr.forEach(([dx, h], k) => {
      const cx = c.muttart + dx + h;
      for (let r = 0; r < h; r++) {
        const y = base - h + 1 + r;
        for (let i = -r; i <= r; i++) {
          let name = i <= 0 ? (i === -r ? 'snow3' : 'water4') : 'water2';
          if ((i + r + y) % 3 === 0 && r > 0 && i !== -r) name = i <= 0 ? 'water3' : 'water1'; // glazing bars
          if (night && i !== -r && i !== r && dither(cx + i, y, 0.55)) p.px(cx + i, y, lit[k], true);
          else p.px(cx + i, y, name);
        }
      }
    });
  }

  /* ---------------- the railway: track, tunnel portal ---------------- */
  // The train runs out of a tunnel in a wooded knoll at the east edge of the boreal forest
  function portalPlan(z, city) {
    const x = Math.round(Math.min(city.bridge[0] - 4, z.park[0]));
    return { x, y: GY + 2, mound: [x - 15, x + 1] };
  }

  function drawPortal(p, P) {
    const ty = P.y; // rail level
    const [m0, m1] = P.mound;
    const top = ty - 16;
    // the knoll: rounded west slope, cut face to the east
    const ridge = (x) => (x > P.x ? 99 : Math.round(top + Math.pow(Math.max(0, P.x - 3 - x) / (P.x - 3 - m0), 1.6) * 16));
    for (let x = m0; x <= P.x + 1; x++) {
      const t0 = ridge(x);
      for (let y = t0; y < GY + 1; y++) {
        const sh = shadowed(ridge, x, y, 8);
        let name = sh ? 'grass2' : y === t0 ? 'grass4' : 'grass3';
        if (!sh && y === t0 + 1 && hash(x, 191) > 0.5) name = 'grass4';
        if (hash(x, y, 192) > 0.88) name = 'spruce2';
        p.px(x, y, name);
      }
    }
    // spruce on the crown of the knoll
    for (const dx of [-11, -8, -5]) {
      const x = P.x + dx;
      const h = 5 + Math.floor(hash(x, 193) * 3);
      const b = ridge(x) + 1;
      for (let r = 0; r < h; r++) {
        const hw = Math.floor(r * 0.45);
        for (let i = -hw; i <= hw; i++) p.px(x + i, b - h + r, i < 0 ? 'spruce3' : i === hw ? 'spruce0' : 'spruce1');
      }
    }
    // stone portal: arch of voussoirs around a dark mouth, train-height plus clearance
    const ox0 = P.x - 3;
    const oy0 = ty - 13;
    for (let y = oy0 - 2; y <= ty; y++)
      for (let x = ox0 - 2; x <= P.x + 1; x++) {
        const inMouth = x >= ox0 && x <= P.x && y >= oy0 + (x === ox0 || x === P.x ? 1 : 0);
        if (inMouth) {
          // darkness, a little lighter toward the opening
          p.px(x, y, x === P.x && y > oy0 + 2 ? 'ink2' : x >= P.x - 1 ? 'ink1' : 'ink0');
          continue;
        }
        const course = (y + (x & 1)) % 3 === 0;
        let name = x < ox0 ? (course ? 'stone2' : 'stone3') : course ? 'stone1' : 'stone2';
        if (y === oy0 - 2) name = x <= ox0 ? 'stone4' : 'stone3'; // capstone, lit
        if (x === P.x + 1) name = 'ink0';
        p.px(x, y, name);
      }
    p.px(ox0 - 2, oy0 - 2, 'grass3'); // sod over the corner
  }

  function drawTrack(p, W, P) {
    for (let x = P.x - 3; x < W; x++) {
      p.px(x, P.y - 1, 'metal4');
      p.px(x, P.y, x % 3 === 0 ? 'bark2' : 'metal2');
      p.px(x, P.y + 1, hash(x, 81) > 0.5 ? 'stone3' : 'stone2');
    }
  }

  /* ---------------- animated sky ---------------- */
  function drawSkyLife(p, W, z, t, clouds, T) {
    if (p.night) {
      // stars
      for (let i = 0; i < W * 0.16; i++) {
        const x = Math.floor(hash(i, 1, 5) * W);
        const y = T + Math.floor(hash(i, 2, 5) * (40 - T * 0.6));
        if (!p.has(x, y) || x < p.x0 || x >= p.x1) continue;
        const tw = Math.sin(t * (1.2 + hash(i, 3) * 2) + i);
        if (hash(i, 4) > 0.9 && tw > 0) {
          p.px(x, y, 'glow5', true);
          p.px(x - 1, y, 'night6', true), p.px(x + 1, y, 'night6', true);
          p.px(x, y - 1, 'night6', true), p.px(x, y + 1, 'night6', true);
        } else p.px(x, y, tw > 0.3 ? 'snow3' : 'night6', true);
      }
      // aurora curtains over the north-west
      for (let x = p.x0; x < Math.min(p.x1, W * 0.7); x++) {
        const strength = clamp(1.4 * noise1(x * 0.025 + t * 0.04, 9) - 0.25, 0, 1) * clamp(1 - x / (W * 0.7), 0, 1) * 1.4;
        if (strength <= 0) continue;
        const base = T * 0.8 + 8 + 3 * Math.sin(x * 0.045 + t * 0.25) + 2 * Math.sin(x * 0.11 - t * 0.4);
        const len = 9 + 5 * noise1(x * 0.09 + t * 0.3, 10);
        const rays = 0.65 + 0.35 * Math.sin(x * 0.8 + t * 0.6 + Math.sin(x * 0.13) * 3);
        for (let k = 0; k < len; k++) {
          const y = Math.round(base + k);
          if (!p.has(x, y)) continue;
          const f = k / len;
          const name = f > 0.85 ? 'aurora3' : f > 0.6 ? 'aurora2' : f > 0.3 ? 'aurora1' : 'aurora4';
          if (dither(x, y, strength * rays * (0.25 + 0.75 * f))) p.px(x, y, name, true);
        }
      }
      // crescent moon
      const mx = Math.round(z.bad[0] + z.bad[2] * 0.45);
      const my = 13 + Math.round(T * 0.75);
      for (let j = -9; j <= 9; j++)
        for (let i = -9; i <= 9; i++) {
          const d = Math.hypot(i, j);
          if (d <= 4.6) {
            if (Math.hypot(i - 2, j - 1) <= 3.8) continue; // the bite that makes the crescent
            p.px(mx + i, my + j, d > 3.7 ? 'bone3' : i + j < -2 ? 'bone4' : 'cream4', true);
          } else if (d < 9 && p.has(mx + i, my + j) && dither(mx + i, my + j, 0.45 * (1 - d / 9))) {
            p.px(mx + i, my + j, 'night5', true);
          }
        }
    } else {
      // sun with a dithered halo
      const sx = Math.round(z.prairie[0] + z.prairie[2] * 0.3);
      const sy = 14 + Math.round(T * 0.75);
      for (let j = -11; j <= 11; j++)
        for (let i = -11; i <= 11; i++) {
          const d = Math.hypot(i, j);
          if (d <= 4.4) p.px(sx + i, sy + j, d > 3.5 ? 'glow4' : 'glow5', true);
          else if (d < 11 && p.has(sx + i, sy + j) && dither(sx + i, sy + j, 0.55 * (1 - d / 11))) p.px(sx + i, sy + j, 'sky5', true);
        }
    }
    // clouds drift east (moonlit at night)
    for (const c of clouds) {
      const span = W + 70;
      const cx = ((((c.x + t * c.speed) % span) + span) % span) - 35;
      if (cx + 30 < p.x0 || cx - 30 > p.x1) continue;
      drawCloud(p, Math.round(cx), c);
    }
  }

  function makeClouds(W, T) {
    const n = Math.max(3, Math.round(W / 85));
    const clouds = [];
    for (let i = 0; i < n; i++) {
      const puffs = [];
      const len = 14 + Math.floor(hash(i, 91) * 18);
      for (let k = 0; k < len; k += 4) puffs.push([k - len / 2, 2.6 + hash(i, k, 92) * 3.4 * Math.sin((Math.PI * (k + 2)) / (len + 4))]);
      clouds.push({ x: hash(i, 93) * W, y: 9 + Math.round(T * 0.7) + Math.floor(hash(i, 94) * (17 - T * 0.4)), speed: 0.6 + hash(i, 95) * 0.9, puffs });
    }
    return clouds;
  }

  function drawCloud(p, cx, c) {
    const inside = (x, y) => {
      if (y > c.y + 1) return false;
      for (const [dx, r] of c.puffs) {
        const ex = x - (cx + dx);
        const ey = (y - (c.y + 1 - r * 0.7)) / 0.72;
        if (ex * ex + ey * ey <= r * r) return true;
      }
      return false;
    };
    for (let y = c.y - 9; y <= c.y + 1; y++)
      for (let x = Math.max(p.x0, cx - 22); x <= Math.min(p.x1 - 1, cx + 22); x++) {
        if (!inside(x, y) || !p.has(x, y)) continue;
        let name = 'snow3';
        if (!inside(x - 1, y - 1)) name = 'cream4';
        else if (!inside(x + 1, y + 1) || !inside(x, y + 2)) name = y >= c.y ? 'snow1' : 'snow2';
        p.px(x, y, name);
      }
  }

  /* ---------------- trees ---------------- */
  function spruce(p, x, base, h, t, phase) {
    if (x + 8 < p.x0 || x - 8 > p.x1) return;
    p.px(x, base, 'bark1'), p.px(x, base - 1, 'bark2');
    for (let r = 0; r < h; r++) {
      const y = base - h + r - 1;
      const tier = r % 4;
      let hw = Math.floor((r + 2) * 0.36) + (tier === 3 ? 1 : 0) - (tier === 0 && r > 3 ? 1 : 0);
      if (r === 0) hw = 0;
      const sway = Math.round(Math.sin(t * 1.3 + phase) * 1.1 * Math.pow(1 - r / h, 2));
      for (let i = -hw; i <= hw; i++) {
        let name;
        if (i === hw) name = 'spruce0';
        else if (i === -hw) name = tier === 3 ? 'spruce2' : 'spruce3';
        else if (i < 0) name = tier === 1 && hash(x + i, y, 101) > 0.5 ? 'spruce5' : tier < 2 ? 'spruce4' : 'spruce3';
        else name = tier === 3 ? 'spruce1' : 'spruce2';
        if (r === 0) name = 'spruce4';
        p.px(x + i + sway, y, name);
      }
    }
  }

  function aspen(p, x, base, h, t, phase, gold) {
    if (x + 9 < p.x0 || x - 9 > p.x1) return;
    const L = gold ? 'gold' : 'leaf';
    const trunkTop = base - Math.round(h * 0.6);
    for (let y = trunkTop; y <= base; y++) {
      const mark = hash(x, y, 111) > 0.78;
      p.px(x, y, mark ? 'birch0' : 'birch4');
      p.px(x + 1, y, mark ? 'birch0' : 'birch2');
    }
    p.px(x - 1, base, 'birch1'), p.px(x + 2, base, 'birch1');
    const cy = base - Math.round(h * 0.68);
    const rx = 3.6 + h * 0.12;
    const ry = 2.8 + h * 0.22;
    const q = Math.floor(t * 4);
    const sway = Math.round(Math.sin(t * 1.1 + phase) * 0.8);
    const inside = (dx, dy) => {
      const a = Math.atan2(dy, dx);
      const lump = 1 + 0.2 * Math.sin(a * 5 + phase * 3) + 0.08 * Math.sin(a * 11);
      return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= lump * lump;
    };
    for (let dy = -Math.ceil(ry * 1.3); dy <= Math.ceil(ry * 1.3); dy++) {
      const s = dy < 0 ? sway : 0;
      for (let dx = -Math.ceil(rx * 1.3); dx <= Math.ceil(rx * 1.3); dx++) {
        if (!inside(dx + 0.5, dy + 0.5)) continue;
        const v = (-dx / rx - dy / ry) * 0.7 + (hash((x + dx) >> 1, (cy + dy) >> 1, 112) - 0.5) * 0.7;
        let k = v > 0.55 ? 4 : v > 0.05 ? 3 : v > -0.5 ? 2 : 1;
        if (!inside(dx + 1.5, dy + 1.5)) k = 0; // shadow-side outline
        else if (!inside(dx - 0.5, dy - 0.5)) k = Math.max(k, 3);
        let name = L + k;
        if (k > 1 && hash(x + dx, cy + dy, q) > 0.93) name = L + 5; // trembling leaves catch the light
        p.px(x + dx + s, cy + dy, name);
      }
    }
  }

  /* ---------------- buildings and machines ---------------- */
  function outlineBox(p, x, y, w, h, fill) {
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        const edge = i === 0 || j === 0 || i === w - 1 || j === h - 1;
        p.px(x + i, y + j, edge ? 'ink0' : fill(i, j));
      }
  }

  function windowPane(p, x, y, w, h) {
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        if (p.night) p.px(x + i, y + j, j === 0 ? 'glow4' : 'glow3', true);
        else p.px(x + i, y + j, i + j === 0 ? 'haze3' : j === h - 1 ? 'slate2' : 'haze1');
      }
  }

  function halo(p, x, y, r, strength = 0.5, a = 0.45) {
    if (!p.night) return;
    for (let j = -r; j <= r; j++)
      for (let i = -r; i <= r; i++) {
        const d = Math.hypot(i, j);
        if (d > 1 && d < r && dither(x + i, y + j, strength * (1 - d / r))) p.mix(x + i, y + j, 'glow2', a);
      }
  }

  function house(p, x, base) {
    const w = 11;
    const top = base - 6;
    outlineBox(p, x, top, w, 7, (i, j) => (j % 2 ? 'birch3' : i < 4 ? 'birch4' : 'birch3'));
    // roof
    for (let r = 0; r < 5; r++) {
      const y = top - 1 - r;
      for (let i = r - 1; i <= w - r; i++) {
        const edge = i === r - 1 || i === w - r;
        p.px(x + i, y, edge || r === 4 ? 'ink0' : i < w / 2 ? 'slate3' : 'slate1');
      }
    }
    p.hline(x - 1, x + w, top, 'ink0');
    // chimney
    p.rect(x + 7, top - 6, 2, 3, 'barn2'), p.px(x + 7, top - 6, 'barn4');
    p.hline(x + 6, x + 9, top - 7, 'ink0');
    windowPane(p, x + 2, top + 2, 2, 2);
    windowPane(p, x + 7, top + 2, 2, 2);
    p.rect(x + 5, top + 3, 1, 3, 'barn2');
    halo(p, x + 3, top + 2, 5), halo(p, x + 8, top + 2, 5);
    return { chimney: [x + 7, top - 8] };
  }

  function barn(p, x, base) {
    const w = 14;
    const top = base - 7;
    outlineBox(p, x, top, w, 8, (i) => (i < 4 ? 'barn4' : i < 10 ? 'barn3' : 'barn2'));
    // gambrel roof
    const prof = [0, 0, 1, 2, 3, 5];
    for (let r = 0; r < prof.length; r++) {
      const y = top - 1 - r;
      for (let i = prof[r] - 1; i <= w - prof[r]; i++) {
        const edge = i === prof[r] - 1 || i === w - prof[r] || r === prof.length - 1;
        p.px(x + i, y, edge ? 'ink0' : i < w / 2 ? 'barn1' : 'barn0');
      }
    }
    // white trim, X doors, hay loft
    p.hline(x + 1, x + w - 2, top, 'birch4');
    p.rect(x + 5, top + 3, 4, 4, 'barn1');
    p.line(x + 5, top + 3, x + 8, top + 6, 'birch3'), p.line(x + 8, top + 3, x + 5, top + 6, 'birch3');
    p.vline(x + 4, top + 3, top + 6, 'birch4'), p.vline(x + 9, top + 3, top + 6, 'birch3');
    p.hline(x + 4, x + 9, top + 2, 'birch4');
    if (p.night) p.px(x + 7, top - 3, 'glow3', true), p.px(x + 6, top - 3, 'glow2', true);
    else p.px(x + 6, top - 3, 'ink1'), p.px(x + 7, top - 3, 'ink1');
    halo(p, x + 7, top - 3, 4, 0.4);
  }

  function bins(p, x, base, n) {
    for (let k = 0; k < n; k++) {
      const bx = x + k * 6;
      outlineBox(p, bx, base - 6, 6, 7, (i, j) => (i === 1 ? 'metal5' : i === 2 ? 'metal4' : i === 3 ? 'metal3' : 'metal2'));
      for (let j = 1; j < 6; j += 2) p.px(bx + 1, base - 6 + j, 'metal4');
      p.hline(bx + 1, bx + 4, base - 7, 'metal3'), p.px(bx + 1, base - 7, 'metal5');
      p.hline(bx + 2, bx + 3, base - 8, 'metal4');
      p.px(bx, base - 7, 'ink0'), p.px(bx + 5, base - 7, 'ink0'), p.px(bx + 1, base - 8, 'ink0'), p.px(bx + 4, base - 8, 'ink0');
      p.hline(bx + 2, bx + 3, base - 9, 'ink0');
    }
  }

  function windmill(p, x, base, t) {
    const top = base - 17;
    p.line(x - 3, base, x, top + 2, 'metal2'), p.line(x + 3, base, x, top + 2, 'metal1');
    for (let y = base - 3; y > top + 3; y -= 4) {
      const hw = Math.round(((y - top) / 17) * 3);
      p.hline(x - hw, x + hw, y, 'metal2');
    }
    p.line(x, top, x + 6, top - 1, 'metal2'), p.px(x + 6, top - 2, 'metal3'), p.px(x + 6, top, 'metal1'); // tail vane
    const a0 = t * 2.4;
    for (let k = 0; k < 10; k++) {
      const a = a0 + (k * Math.PI) / 5;
      for (let r = 1; r <= 5; r++) p.px(Math.round(x + Math.cos(a) * r), Math.round(top + Math.sin(a) * r), r > 3 ? 'metal4' : 'metal3');
    }
    p.px(x, top, 'ink0');
  }

  function elevator(p, x, base) {
    // the main bin house
    const top = base - 24;
    outlineBox(p, x, top, 11, 25, (i, j) => {
      if (j >= 2 && j <= 3) return i < 4 ? 'birch4' : 'birch3'; // painted band
      if (i < 3) return j % 6 === 0 ? 'barn3' : 'barn4';
      if (i < 7) return 'barn3';
      return 'barn2';
    });
    // lettering dots on the band
    for (let i = 2; i < 9; i += 2) p.px(x + i, top + 2, 'barn1'), p.px(x + i + (i % 4 ? 0 : 1), top + 3, 'barn1');
    // sloped shoulders and the cupola
    for (let r = 1; r <= 3; r++) {
      for (let i = r - 1; i <= 11 - r; i++) p.px(x + i, top - r, i === r - 1 || i === 11 - r ? 'ink0' : i < 5 ? 'slate3' : 'slate1');
    }
    outlineBox(p, x + 3, top - 9, 5, 6, (i) => (i < 2 ? 'barn4' : 'barn2'));
    for (let i = 0; i < 7; i++) p.px(x + 2 + i, top - 10, i === 0 || i === 6 ? 'ink0' : i < 3 ? 'slate3' : 'slate1');
    p.hline(x + 4, x + 6, top - 11, 'ink0');
    // annex and office
    outlineBox(p, x + 10, base - 13, 6, 14, (i) => (i < 2 ? 'barn3' : 'barn2'));
    p.line(x + 10, base - 14, x + 15, base - 12, 'ink0');
    outlineBox(p, x - 6, base - 6, 7, 7, (i) => (i < 2 ? 'birch4' : 'birch3'));
    for (let r = 0; r < 3; r++) p.hline(x - 6 + r, x - r, base - 7 - r, r === 2 ? 'ink0' : 'slate2');
    windowPane(p, x - 4, base - 4, 2, 2);
    // ladder
    for (let y = top + 5; y < base - 1; y += 2) p.px(x + 8, y, 'barn1');
    // lamp
    p.px(x - 1, base - 9, p.night ? 'glow5' : 'metal4', true);
    halo(p, x - 1, base - 9, 7, 0.6);
  }

  function pumpjack(p, x, base, t) {
    const a = 0.32 * Math.sin(t * 1.4);
    const px = x + 9;
    const py = base - 12;
    // skid
    p.hline(x, x + 19, base, 'metal2'), p.hline(x, x + 19, base + 1, 'ink0');
    // samson post (A-frame)
    for (const [lx, n] of [[x + 5, 'metal3'], [x + 6, 'metal2'], [x + 13, 'metal1'], [x + 12, 'metal2']]) p.line(lx, base - 1, px, py + 1, n);
    // walking beam
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const end = (d) => [px - d * cos, py - d * sin];
    const [hx, hy] = end(8);
    const [tx, ty] = end(-7);
    p.line(hx, hy - 1, tx, ty - 1, 'metal4');
    p.line(hx, hy, tx, ty, 'metal2');
    p.line(hx, hy + 1, tx, ty + 1, 'ink0');
    // horsehead
    const HX = Math.round(hx);
    const HY = Math.round(hy);
    for (let j = -2; j <= 4; j++) {
      const curve = j < 0 || j > 2 ? 0 : 1;
      p.px(HX - 1 - curve, HY + j, 'ink0');
      p.px(HX - curve, HY + j, j < 1 ? 'barn5' : 'barn4');
      p.px(HX + 1 - curve, HY + j, 'barn3');
      p.px(HX + 1, HY + j, 'barn2');
    }
    // bridle and polished rod straight down to the wellhead
    const rx = HX - 2;
    p.vline(rx, HY + 5, base - 3, 'metal5');
    p.rect(rx - 1, base - 2, 3, 2, 'metal2'), p.px(rx - 1, base - 2, 'metal4');
    // gearbox, crank and counterweight
    const cx = x + 16;
    const cy = base - 4;
    p.rect(cx - 1, cy, 3, 4, 'metal1');
    const ca = t * 1.4 + Math.PI / 2;
    const wx = Math.round(cx + Math.cos(ca) * 3);
    const wy = Math.round(cy + Math.sin(ca) * 3);
    p.line(tx, ty + 1, wx, wy, 'metal3');
    p.rect(wx - 1, wy - 1, 3, 2, 'barn3'), p.px(wx - 1, wy - 1, 'barn5');
    p.px(cx, cy, 'hat3');
    p.px(px, py, 'hat4'), p.px(px, py + 1, 'ink0');
  }

  /** a grain train out of the tunnel, east across the prairie and off the edge of the world */
  function train(p, P, W, t) {
    const period = 75;
    const cars = 7;
    const len = 15 + cars * 11;
    const x0 = P.x - 3; // inside the tunnel mouth
    const travel = W - x0 + len + 2;
    const k = (t % period) / 34;
    if (k > 1) return;
    const head = x0 + k * travel;
    const y = P.y - 2;
    const clip = p.x0;
    p.x0 = Math.max(p.x0, x0); // nothing west of the mouth: the train is still in the hill
    const draw = (x, fn) => {
      if (x + 15 < p.x0 || x - 1 > p.x1) return;
      fn(Math.round(x));
    };
    // locomotive, facing east
    draw(head - 14, (x) => {
      outlineBox(p, x, y - 7, 14, 7, (i, j) => (j < 2 ? 'stone4' : i > 9 ? 'barn4' : 'barn3'));
      outlineBox(p, x + 9, y - 10, 5, 4, () => 'barn2');
      windowPane(p, x + 10, y - 9, 2, 1);
      p.px(x + 13, y - 4, p.night ? 'glow5' : 'glow3', true);
      halo(p, x + 15, y - 4, 6, 0.7);
      for (let i = 1; i < 13; i += 3) p.px(x + i, y, 'ink0'), p.px(x + i + 1, y, (Math.floor(t * 8) + i) % 2 ? 'metal3' : 'ink1');
    });
    // grain hopper cars
    for (let c = 1; c <= cars; c++) {
      draw(head - 14 - c * 11, (x) => {
        outlineBox(p, x, y - 6, 10, 6, (i, j) => (j === 1 ? 'metal5' : i % 3 === 0 ? 'metal2' : i < 5 ? 'metal4' : 'metal3'));
        p.px(x + 10, y - 2, 'ink1');
        p.px(x + 2, y, 'ink0'), p.px(x + 7, y, 'ink0');
      });
    }
    p.x0 = clip;
    // whatever is still in the tunnel mouth is in its shadow
    for (let yy = P.y - 13; yy < P.y; yy++) for (let xx = x0; xx <= P.x; xx++) p.mix(xx, yy, 'ink0', xx < P.x - 1 ? 0.7 : 0.45, false);
  }

  /* ---------------- foreground ---------------- */
  function wheatRow(p, x0, x1, t) {
    // the crop thins out into its neighbours over a seam at each end
    const inside = (x, y) => past(x, y, x0) && !past(x, y, x1);
    for (let x = Math.max(p.x0, Math.floor(x0 - SEAM)); x < Math.min(p.x1, x1 + SEAM); x++) {
      for (let y = 66; y < H; y++) if (inside(x, y)) p.px(x, y, dither(x, y, 0.5) ? 'gold2' : 'gold1');
      if (!inside(x, H - 1)) continue;
      const h = 5 + Math.floor(hash(x, 7) * 4) - (inside(x, H - 4) ? 0 : 2); // shorter at the edge
      const wave = Math.sin(x * 0.11 - t * 2.1) + 0.6 * Math.sin(x * 0.29 - t * 1.25);
      const lean = wave > 0.95 ? 1 : wave < -1.1 ? -1 : 0;
      const crest = wave > 0.8;
      for (let r = 0; r < h; r++) {
        const y = H - 1 - r;
        const sx = r > h - 4 ? lean : 0;
        let name = x % 2 ? 'gold2' : 'gold3';
        if (r >= h - 2) name = crest ? 'gold5' : x % 2 ? 'gold3' : 'gold4';
        else if (r === h - 3) name = 'gold3';
        p.px(x + sx, y - 2, name);
      }
    }
  }

  // grass blades from x0 to x1: spruce-dark in the forest, parkland green past the seam at `to`,
  // thinning out into the wheat past the seam at x1
  function grassRow(p, x0, x1, t, to, y0) {
    for (let x = Math.max(p.x0, Math.floor(x0)); x < Math.min(p.x1, x1 + SEAM); x++) {
      if (hash(x, 131) > 0.55 || past(x, y0, x1)) continue;
      const ramp = past(x, y0 - 1, to) ? 'grass' : 'spruce';
      const h = 1 + Math.floor(hash(x, 132) * 3);
      const lean = Math.sin(x * 0.15 - t * 1.6) > 0.85 ? 1 : 0;
      for (let r = 0; r < h; r++) p.px(x + (r === h - 1 ? lean : 0), y0 - r, r === h - 1 ? ramp + 4 : ramp + 3);
    }
  }

  function birds(p, W, t) {
    if (p.night) {
      const B = window.Pixel.sprite;
      const up = B(['o.....o', '.oo.oo.', '...o...'], { o: 'ink0' });
      const dn = B(['...o...', '.ooooo.', 'o.....o'], { o: 'ink0' });
      for (let i = 0; i < 3; i++) {
        const cx = W * (0.62 + 0.1 * i) + 22 * Math.sin(t * 0.7 + i * 2.1);
        const cy = 24 + 7 * Math.sin(t * 1.3 + i * 1.7) + 3 * Math.sin(t * 3.1 + i);
        p.sprite(Math.floor(t * 8 + i) % 2 ? up : dn, cx, cy, { glow: true });
      }
      return;
    }
    // a skein of geese heading south-east
    const span = W + 120;
    const lead = ((t * 5) % span) - 60;
    const ly = 20 + 3 * Math.sin(t * 0.3);
    for (let i = 0; i < 7; i++) {
      const side = i % 2 ? 1 : -1;
      const rank = Math.ceil(i / 2);
      const gx = Math.round(lead - rank * 4);
      const gy = Math.round(ly + rank * 2 * side * 0.9 + (side < 0 ? rank : 0));
      const flap = Math.floor(t * 6 + i * 0.7) % 3;
      if (flap === 0) p.px(gx - 2, gy - 1, 'ink1'), p.px(gx + 2, gy - 1, 'ink1');
      else if (flap === 2) p.px(gx - 2, gy + 1, 'ink1'), p.px(gx + 2, gy + 1, 'ink1');
      else p.px(gx - 2, gy, 'ink1'), p.px(gx + 2, gy, 'ink1');
      p.px(gx - 1, gy, 'ink1'), p.px(gx, gy, 'ink0'), p.px(gx + 1, gy, 'ink1'), p.px(gx + 1, gy - 1, 'ink0');
    }
  }

  function smoke(p, x, y, t) {
    for (let k = 0; k < 9; k++) {
      const age = (t * 0.45 + k / 9) % 1;
      const sx = Math.round(x + age * 9 + Math.sin(age * 7 + k) * 1.2);
      const sy = Math.round(y - age * 13);
      if (!dither(sx, sy, 1 - age * 0.9)) continue;
      const name = age < 0.4 ? 'stone4' : 'stone5';
      p.px(sx, sy, name);
      if (age > 0.3) p.px(sx + 1, sy, name);
      if (age > 0.6) p.px(sx, sy - 1, name);
    }
  }

  /* ---------------- bitmap font for the roadside sign ---------------- */
  // [top row, rows]: caps and digits stand on rows 0..4, lower case has its x-height on rows 1..4
  // with ascenders on row 0 and descenders on rows 5..6. '#' is ink.
  const GLYPHS = {
    A: [0, '.#.|#.#|###|#.#|#.#'], B: [0, '##.|#.#|##.|#.#|##.'], C: [0, '.##|#..|#..|#..|.##'],
    D: [0, '##.|#.#|#.#|#.#|##.'], E: [0, '###|#..|##.|#..|###'], F: [0, '###|#..|##.|#..|#..'],
    G: [0, '.##.|#...|#.##|#..#|.##.'], H: [0, '#.#|#.#|###|#.#|#.#'], I: [0, '###|.#.|.#.|.#.|###'],
    J: [0, '..#|..#|..#|#.#|.#.'], K: [0, '#..#|#.#.|##..|#.#.|#..#'], L: [0, '#..|#..|#..|#..|###'],
    M: [0, '#...#|##.##|#.#.#|#...#|#...#'], N: [0, '#..#|##.#|#.##|#..#|#..#'],
    O: [0, '.##.|#..#|#..#|#..#|.##.'], P: [0, '##.|#.#|##.|#..|#..'], Q: [0, '.##.|#..#|#..#|#.#.|.#.#'],
    R: [0, '##.|#.#|##.|#.#|#.#'], S: [0, '.##|#..|.#.|..#|##.'], T: [0, '###|.#.|.#.|.#.|.#.'],
    U: [0, '#..#|#..#|#..#|#..#|.##.'], V: [0, '#.#|#.#|#.#|.#.|.#.'],
    W: [0, '#...#|#...#|#.#.#|##.##|#...#'], X: [0, '#.#|#.#|.#.|#.#|#.#'], Y: [0, '#.#|#.#|.#.|.#.|.#.'],
    Z: [0, '###|..#|.#.|#..|###'],
    a: [1, '.##|#.#|#.#|.##'], b: [0, '#..|##.|#.#|#.#|##.'], c: [1, '.##|#..|#..|.##'],
    d: [0, '..#|.##|#.#|#.#|.##'], e: [1, '.#.|###|#..|.##'], f: [0, '.##|#..|###|#..|#..'],
    g: [1, '.##|#.#|#.#|.##|..#|##.'], h: [0, '#..|##.|#.#|#.#|#.#'], i: [0, '#|.|#|#|#'],
    j: [0, '.#|..|.#|.#|.#|.#|#.'], k: [0, '#..|#.#|##.|#.#|#.#'], l: [0, '#.|#.|#.|#.|.#'],
    m: [1, '##.#.|#.#.#|#.#.#|#.#.#'], n: [1, '##.|#.#|#.#|#.#'], o: [1, '.#.|#.#|#.#|.#.'],
    p: [1, '##.|#.#|#.#|##.|#..|#..'], q: [1, '.##|#.#|#.#|.##|..#|..#'], r: [1, '#.#|##.|#..|#..'],
    s: [1, '.##|#..|..#|##.'], t: [0, '.#.|###|.#.|.#.|..#'], u: [1, '#.#|#.#|#.#|.##'],
    v: [1, '#.#|#.#|#.#|.#.'], w: [1, '#...#|#.#.#|#.#.#|.#.#.'], x: [1, '#.#|.#.|.#.|#.#'],
    y: [1, '#.#|#.#|#.#|.##|..#|##.'], z: [1, '###|.#.|#..|###'],
    0: [0, '.#.|#.#|#.#|#.#|.#.'], 1: [0, '.#.|##.|.#.|.#.|###'], 2: [0, '##.|..#|.#.|#..|###'],
    3: [0, '##.|..#|.#.|..#|##.'], 4: [0, '#.#|#.#|###|..#|..#'], 5: [0, '###|#..|##.|..#|##.'],
    6: [0, '.##|#..|##.|#.#|.#.'], 7: [0, '###|..#|.#.|.#.|.#.'], 8: [0, '.#.|#.#|.#.|#.#|.#.'],
    9: [0, '.#.|#.#|.##|..#|##.'], '.': [4, '#'], ',': [4, '#|#'], "'": [0, '#|#'], '-': [2, '##'],
    '©': [-1, '..###..|.#...#.|#..##.#|#.#...#|#..##.#|.#...#.|..###..'],
  };
  for (const k in GLYPHS) {
    const [y0, rows] = GLYPHS[k];
    const r = rows.split('|');
    GLYPHS[k] = { y0, rows: r, w: Math.max(...r.map((s) => s.length)) };
  }
  const advance = (ch) => (ch === ' ' ? 2 : GLYPHS[ch] ? GLYPHS[ch].w + 1 : 0);
  const textWidth = (s) => [...s].reduce((a, ch) => a + advance(ch), 0) - 1;

  /** draw a string with its cap top at y; returns the x after it. Shadows first, then the ink. */
  function text(p, s, x, y, ink, shadow, glow) {
    for (const pass of [0, 1]) {
      let cx = x;
      for (const ch of s) {
        const g = GLYPHS[ch];
        if (g)
          g.rows.forEach((row, j) => {
            for (let i = 0; i < row.length; i++) {
              if (row[i] !== '#') continue;
              if (pass) p.px(cx + i, y + g.y0 + j, ink, glow);
              else p.px(cx + i + 1, y + g.y0 + j + 1, shadow);
            }
          });
        cx += advance(ch);
      }
    }
    return x + textWidth(s);
  }

  /* ---------------- standing signs: shared bits ---------------- */
  const FOOT = H - 5; // where posts meet the ground: everything stands on visible ground

  /** a square wooden post from y0 down into the grass at FOOT */
  function post(p, x, y0) {
    for (let y = y0; y <= FOOT; y++) p.px(x, y, 'bark3'), p.px(x + 1, y, 'bark1'), p.px(x + 2, y, 'ink0');
    // packed earth and a tuft at the foot
    p.px(x - 1, FOOT + 1, 'dirt2'), p.px(x, FOOT + 1, 'dirt3'), p.px(x + 1, FOOT + 1, 'dirt2'), p.px(x + 2, FOOT + 1, 'dirt1');
    p.px(x - 1, FOOT, 'grass4'), p.px(x + 3, FOOT, 'grass3');
  }

  /** a plank board with a lit top-left edge and ink on the shadow side; rows y0..y1 inclusive */
  function board(p, x0, x1, y0, y1, seed) {
    for (let j = y0; j <= y1; j++)
      for (let i = x0; i <= x1; i++) {
        let name;
        if (j === y1 || i === x1) name = 'ink0';
        else if (j === y0 || i === x0) name = 'bark1';
        else if (j === y0 + 1 || i === x0 + 1) name = 'bark4';
        else if (j === y1 - 1 || i === x1 - 1) name = 'bark2';
        else if ((j - y0) % 6 === 0) name = 'bark2'; // seam between planks
        else {
          const grain = noise1(i * 0.3 + j * 5.1, seed) > 0.72;
          name = grain ? 'bark2' : 'bark3';
        }
        p.px(i, j, name);
      }
    for (const [i, j] of [[x0 + 2, y0 + 2], [x1 - 2, y0 + 2]]) p.px(i, j, 'metal4');
  }

  /* ---------------- the footer sign ---------------- */
  function signPlan(W, z, opts) {
    if (!opts.sign) return null;
    const { year, name } = opts.sign;
    const a = '© ' + year + ' ';
    const b = name + '.';
    const c = 'Some rights reserved.';
    const tw = Math.max(textWidth(a + b), textWidth(c));
    const w = tw + 7;
    const h = 18;
    // near the left edge of the band, just right of the sidebar; on posts, right of the article
    const x = opts.signX != null ? opts.signX : opts.sideW + 2;
    if (x + w + 2 > W) return null; // no room beside the article: the footer stays for screen readers
    const y = FOOT - 4 - h + 1; // the board's bottom edge, then posts down into the grass
    const S = { x, y, w, h, lines: [a + b, c], a, b };
    S.textX = x + 3;
    S.textY = y + 3;
    const nx = S.textX + textWidth(a) + 1;
    S.name = { x: nx, y: S.textY - 1, w: textWidth(name) + 1, h: 8 };
    // a lantern hangs from an arm on the right post
    S.post = [x + 3, x + w - 6];
    S.lamp = { x: x + w - 2, y: y - 3 };
    return S;
  }

  function drawSign(p, S) {
    const { x, y, w, h } = S;
    const night = p.night;
    const [pl, pr] = S.post;
    post(p, pl, y + h);
    post(p, pr, y - 6); // the tall post carries the lantern arm
    board(p, x, x + w - 1, y, y + h - 1, 201);
    // the arm and the lantern's cage (its flame is drawn every frame)
    const L = S.lamp;
    p.hline(pr, L.x + 1, y - 6, 'metal1'), p.px(pr + 2, y - 5, 'metal1');
    p.px(L.x, y - 5, 'metal2');
    p.hline(L.x - 1, L.x + 1, y - 4, 'metal2'), p.px(L.x + 2, y - 4, 'ink0');
    for (let j = y - 3; j <= y - 1; j++) p.px(L.x - 1, j, 'metal2'), p.px(L.x + 1, j, 'ink0');
    p.hline(L.x - 1, L.x + 1, y, 'metal1');
    // lantern light on the board at night: a few stepped rings near the lantern, solid wood elsewhere
    if (night) {
      for (let j = 0; j < h; j++)
        for (let i = 0; i < w; i++) {
          const d = Math.hypot(x + i - L.x, (y + j - L.y) * 1.3);
          const a = d < 6 ? 0.34 : d < 10 ? 0.22 : d < 15 ? 0.11 : 0;
          if (a) p.mix(x + i, y + j, 'glow1', a);
        }
    }
    // lettering: painted cream by day, lantern-lit at night
    const ink = night ? 'bone4' : 'cream4';
    S.lines.forEach((line, k) => text(p, line, S.textX, S.textY + k * 7, ink, 'bark0', night));
  }

  function lanternFlame(p, S, t) {
    const L = S.lamp;
    const f = Math.floor(t * 6) % 3;
    if (p.night) {
      p.px(L.x, L.y - 1, f === 1 ? 'glow5' : 'glow4', true);
      p.px(L.x, L.y, 'glow3', true);
      p.px(L.x, L.y + 1, f === 2 ? 'glow3' : 'glow2', true);
    } else {
      p.px(L.x, L.y - 1, 'haze3'), p.px(L.x, L.y, 'haze2'), p.px(L.x, L.y + 1, 'slate2');
    }
  }

  /* ---------------- sidebar icon markers ---------------- */
  // Each icon's whole box sits inside its plate: the mode toggle in the glass of a lantern on a
  // post, the links in recesses carved into a trailhead board. Rects are in world pixels.
  function plateRects(icons) {
    // the plate's inner area holds the element's whole box (not just the glyph): 1px rim outside
    return (icons || []).map((r) => ({
      x0: Math.floor(r.x) - 1,
      x1: Math.ceil(r.x + r.w) + 1,
      y0: Math.floor(r.y) - 1,
      y1: Math.min(H, Math.ceil(r.y + r.h) + 1),
      kind: r.kind === 'mode' ? 'mode' : 'link',
    }));
  }

  /** a recess carved into wood: shadowed on the top-left inner edges, lit on the bottom-right */
  function recess(p, x0, y0, x1, y1, lit) {
    for (let j = y0; j < y1; j++)
      for (let i = x0; i < x1; i++) {
        let name;
        if (j === y0 || i === x0) name = 'ink0';
        else if (j === y1 - 1 || i === x1 - 1) name = 'bark4';
        else if (j === y0 + 1 || i === x0 + 1) name = lit ? 'bark1' : 'ink1';
        else name = lit ? 'bark1' : 'bark0';
        p.px(i, j, name);
      }
  }

  function drawLantern(p, R, lit) {
    const night = p.night;
    const { x0, x1, y0, y1 } = R;
    const w = x1 - x0;
    const cx = (x0 + x1 - 1) >> 1;
    // handle ring and a stepped roof with eaves
    p.px(cx - 1, y0 - 6, 'metal2'), p.px(cx, y0 - 7, 'metal3'), p.px(cx + 1, y0 - 6, 'ink0');
    p.px(cx, y0 - 5, 'metal1');
    const roof = [
      [cx - 1, cx + 1],
      [cx - 3, cx + 3],
      [x0 + 1, x1 - 2],
      [x0 - 1, x1],
    ];
    roof.forEach(([a, b], k) => {
      const y = y0 - 4 + k;
      for (let i = a; i <= b; i++) {
        let name = i === b ? 'ink0' : i === a ? 'metal4' : i < cx ? (lit ? 'metal4' : 'metal3') : 'metal2';
        if (k === 3) name = i === a || i === b ? 'ink0' : 'metal1'; // eave underside
        p.px(i, y, name);
      }
    });
    // the glass: smoky by day; at night a candle glows inside, low and behind the glyph
    const cy = y1 - 3;
    for (let j = y0; j < y1; j++)
      for (let i = x0; i < x1; i++) {
        if (i === x0) {
          p.px(i, j, 'metal3');
          continue;
        }
        if (i === x1 - 1) {
          p.px(i, j, 'ink0');
          continue;
        }
        if (night) {
          const d = Math.hypot(i - cx - 0.5, (j - cy) * 0.8);
          // dark amber glass, the flame low down, so the light glyph keeps its contrast
          const k = d < 1.6 ? 2 : d < 3.4 ? 1 : 0;
          p.px(i, j, 'glow' + (k + (lit ? 1 : 0)), true);
        } else {
          p.px(i, j, i === x0 + 1 ? (lit ? 'slate3' : 'slate2') : lit ? 'slate2' : 'slate1');
        }
      }
    if (!night) p.px(x0 + 1, y0, 'haze2'), p.px(x0 + 1, y0 + 1, 'haze1'); // glint on the glass
    // base and post down to the ground
    p.hline(x0 - 1, x1, y1, 'metal1'), p.px(x0 - 1, y1, 'metal3'), p.px(x1, y1, 'ink0');
    p.hline(x0 + 1, x1 - 2, y1 + 1, 'ink0');
    post(p, cx - 1, y1 + 2);
  }

  function drawTrailSign(p, rs, lit) {
    const x0 = Math.min(...rs.map((r) => r.x0)) - 3;
    const x1 = Math.max(...rs.map((r) => r.x1)) + 2;
    const y0 = Math.min(...rs.map((r) => r.y0)) - 3;
    const y1 = Math.max(...rs.map((r) => r.y1)) + 1;
    // posts behind the board, poking above it and down into the grass
    for (const px of [x0 + 2, x1 - 4]) {
      post(p, px, y0 - 3);
      p.px(px, y0 - 4, 'bark4'), p.px(px + 1, y0 - 4, 'bark3'), p.px(px + 2, y0 - 4, 'ink0');
    }
    board(p, x0, x1, y0, y1, 216);
    rs.forEach((r) => recess(p, r.x0, r.y0, r.x1, r.y1, lit === r));
  }

  function drawPlates(p, plates, hover) {
    const links = plates.filter((r) => r.kind === 'link');
    if (links.length) drawTrailSign(p, links, plates[hover]);
    plates.forEach((r, i) => r.kind === 'mode' && drawLantern(p, r, i === hover));
  }

  /* ---------------- the scene ---------------- */
  /**
   * build(W, night, opts): opts.sideW (world columns shown in the sidebar), opts.top (first shown
   * row; phones crop the sky), opts.icons ([{x, y, w, h, kind}] in art pixels, sidebar-relative =
   * world coordinates), opts.sign ({year, name}).
   */
  function build(W, night, opts = {}) {
    opts = Object.assign({ sideW: 0, top: 0, icons: [], sign: null }, opts);
    const T = opts.top | 0;
    const z = zones(W);
    const phone = W - opts.sideW < 250 && !opts.sideW;
    const city = cityPlan(z, W, phone);
    const portal = portalPlan(z, city);
    const back = new Painter(W, H);
    const terr = new Painter(W, H);
    back.setNight(night);
    terr.setNight(night);
    drawSky(back, W, night, T);
    drawTerrain(terr, W, z, T, city, portal);
    const clouds = makeClouds(W, T);

    // foreground decals: the sign and the icon markers, redrawn only when hover changes
    const S = signPlan(W, z, opts);
    const plates = plateRects(opts.icons);
    const fore = new Painter(W, H);
    fore.setNight(night);
    let hover = -1;
    const boxes = [];
    function paintFore() {
      fore.clear();
      boxes.length = 0;
      if (S) {
        drawSign(fore, S);
        boxes.push([S.x - 2, S.y - 8, S.x + S.w + 3, H]);
      }
      if (plates.length) {
        drawPlates(fore, plates, hover);
        const a = Math.min(...plates.map((r) => r.x0));
        const b = Math.max(...plates.map((r) => r.x1));
        const c = Math.min(...plates.map((r) => r.y0));
        boxes.push([a - 6, c - 9, b + 6, H]);
      }
    }
    paintFore();

    // placements
    const trees = [];
    const L = lakeSpan(z);
    const blocked = (x, pad) => plates.some((R) => x > R.x0 - pad && x < R.x1 + pad);
    for (let x = 2; x < z.mtn[1]; x += 3 + Math.floor(hash(x, 141) * 4)) {
      if (x > L.x0 - 2 && x < L.x1 + 2) continue;
      if (blocked(x, 3)) continue;
      trees.push({ kind: 's', x, base: GY + 4 + Math.floor(hash(x, 142) * 5), h: 9 + Math.floor(hash(x, 143) * 8) });
    }
    for (let x = z.mtn[1] - 4; x < z.boreal[1]; x += 2 + Math.floor(hash(x, 144) * 3)) {
      if (Math.abs(x - portal.x + 1) < 4) continue; // keep the tunnel mouth in view
      if (x > city.x0 - 5 && x < city.x1) continue; // keep the skyline in view
      if (blocked(x, 2)) continue;
      trees.push({ kind: 's', x, base: GY + 2 + Math.floor(hash(x, 145) * 9), h: 12 + Math.floor(hash(x, 146) * 12) });
    }
    const core = [city.leg - 2, city.x1 + 1];
    for (let x = z.park[0] + 2; x < z.park[1] + z.prairie[2] * 0.08; x += 5 + Math.floor(hash(x, 147) * 6)) {
      if (x < portal.x + 7) continue; // keep the tunnel mouth in view
      const base = GY + 3 + Math.floor(hash(x, 150) * 8);
      let h = 11 + Math.floor(hash(x, 151) * 8);
      if (x > core[0] - 4 && x < core[1] + 4) continue; // a clearing in front of the city
      if (x > city.x0 - 4 && x < city.x1 + 4) h = Math.min(h, 9); // low scrub in front of bridge and pyramids
      const gold = hash(x, 148) > 0.8;
      trees.push({ kind: hash(x, 149) > 0.85 ? 's' : 'a', x, base, h, gold });
    }
    trees.sort((a, b) => a.base - b.base);
    const P = z.prairie;
    const roomy = P[2] > 140;
    const place = {
      house: Math.round(P[0] + P[2] * 0.12),
      barn: Math.round(P[0] + P[2] * 0.25),
      bins: Math.round(P[0] + P[2] * 0.37),
      windmill: Math.round(P[0] + P[2] * 0.47),
      elevator: Math.round(P[0] + P[2] * 0.6),
      pump: Math.round(P[0] + P[2] * 0.84),
    };

    function overBoxes(p) {
      const d = p.data;
      const s = fore.data;
      for (const [a, b, c, e] of boxes) {
        const xa = Math.max(p.x0, a);
        const xb = Math.min(p.x1, c);
        if (xa >= xb) continue;
        for (let y = Math.max(0, b); y < Math.min(H, e); y++) {
          for (let x = xa; x < xb; x++) {
            const i = (y * W + x) * 4;
            if (s[i + 3]) (d[i] = s[i]), (d[i + 1] = s[i + 1]), (d[i + 2] = s[i + 2]), (d[i + 3] = 255);
          }
        }
      }
    }

    function frame(p, t) {
      p.copy(back);
      drawSkyLife(p, W, z, t, clouds, T);
      p.over(terr);
      // lake glints
      for (let i = 0; i < 6; i++) {
        const q = Math.floor(t * 2 + i * 0.37);
        const gx = Math.round(L.x0 + 3 + hash(i, q, 161) * (L.x1 - L.x0 - 6));
        const gy = L.y0 + 1 + Math.floor(hash(i, q, 162) * 3);
        p.px(gx, gy, p.night ? 'water3' : 'water5'), p.px(gx + 1, gy, p.night ? 'water2' : 'water4');
      }
      // Stantec Tower's beacon
      if (Math.floor(t * 10) % 20 < 3) p.px(city.beacon[0], city.beacon[1], 'barn5', true);
      train(p, portal, W, t);
      for (const tr of trees) {
        if (tr.kind === 's') spruce(p, tr.x, tr.base, tr.h, t, tr.x * 0.7);
        else aspen(p, tr.x, tr.base, tr.h, t, tr.x * 0.9, tr.gold);
      }
      const hs = house(p, place.house, GY + 4);
      barn(p, place.barn, GY + 4);
      if (roomy) bins(p, place.bins, GY + 4, 2), windmill(p, place.windmill, GY + 5, t);
      elevator(p, place.elevator, GY + 1);
      if (roomy) pumpjack(p, place.pump, GY + 7, t);
      smoke(p, hs.chimney[0], hs.chimney[1], t);
      grassRow(p, 0, P[0], t, z.park[0], H - 1);
      wheatRow(p, P[0], P[1], t);
      birds(p, W, t);
      overBoxes(p);
      if (S) {
        lanternFlame(p, S, t);
        if (p.night) halo(p, S.lamp.x, S.lamp.y, 8, 0.4 + 0.08 * Math.sin(t * 5), 0.3);
      }
      plates.forEach((R) => {
        if (R.kind === 'mode' && p.night) halo(p, (R.x0 + R.x1 - 1) >> 1, R.y1 - 3, 13, 0.42, 0.3);
      });
    }

    const layout = {
      sign: S && { x: S.x, y: S.y - 7, w: S.w + 2, h: FOOT + 2 - S.y + 7 },
      name: S && S.name,
      plates,
    };
    return {
      W,
      H,
      top: T,
      back,
      terr,
      frame,
      layout,
      /** light up one icon marker (-1: none); returns true if the picture changed */
      setHover(i) {
        if (i === hover) return false;
        hover = i;
        paintFore();
        return true;
      },
    };
  }

  window.Pixel.scenes.prairie = { build, H, text, textWidth };

  /* ---------------- mounting ---------------- */
  function boot() {
    const P = window.Pixel;
    const body = document.body;
    if (!body || !document.getElementById('main-wrapper')) return;
    const root = document.documentElement;
    const sidebar = document.getElementById('sidebar');
    const iconRow = sidebar && sidebar.querySelector('.sidebar-bottom');
    const footer = document.querySelector('#tail-wrapper footer');
    const footLink = footer && footer.querySelector('a[href]');
    const footNote = footer && footer.querySelector('[title], [data-bs-original-title]');
    const yearEl = footer && footer.querySelector('time');
    const year = ((yearEl && yearEl.textContent) || '').trim() || String(new Date().getFullYear());
    const name = ((footLink && footLink.textContent) || '').trim() || 'Michael Kummer';

    const make = (parent, cls) => {
      const wrap = document.createElement('div');
      wrap.className = 'px-scene ' + cls;
      wrap.setAttribute('aria-hidden', 'true');
      const canvas = document.createElement('canvas');
      wrap.appendChild(canvas);
      parent.appendChild(wrap);
      return canvas;
    };
    const ground = make(body, 'px-scene--ground');
    const groundWrap = ground.parentNode;
    const side = sidebar ? make(sidebar, 'px-scene--sidebar') : null;

    // the sign: a hover target with the licence note, and a transparent link over the name
    let signBox = null;
    let nameLink = null;
    if (footer) {
      signBox = document.createElement('div');
      signBox.className = 'px-sign';
      const note = footNote && (footNote.getAttribute('data-bs-original-title') || footNote.getAttribute('title'));
      if (note) signBox.title = note;
      groundWrap.appendChild(signBox);
      if (footLink) {
        nameLink = document.createElement('a');
        nameLink.className = 'px-sign__link';
        nameLink.href = footLink.href;
        nameLink.tabIndex = -1;
        nameLink.title = name;
        groundWrap.appendChild(nameLink);
      }
    }
    root.classList.add('has-px-ground');
    if (footer) root.classList.add('has-px-footer');

    const icons = iconRow ? [...iconRow.querySelectorAll('#mode-toggle, a')] : [];
    const isPost = !!document.querySelector('main article[data-toc], .post-tail-wrapper');
    // Posts: the band is fixed to the window and the article column is cut out of it, so text never
    // runs over the art. Other pages: the band sits at the end of the page, below the content.
    if (isPost) root.classList.add('px-ground-fixed', 'px-ground-post');
    const article = isPost ? document.querySelector('main') : null;
    const panel = isPost ? document.getElementById('panel-wrapper') : null;
    // the cut-out runs from the sidebar's edge to the contents column (or to the window edge when
    // the contents column is hidden), so its sides sit on the page's own column lines
    const holeRight = () => {
      const r = panel && panel.offsetWidth && getComputedStyle(panel).display !== 'none' ? panel.getBoundingClientRect() : null;
      return r ? r.left : window.innerWidth;
    };

    let scene = null;
    let painter = null;
    let s = 3;
    let sideW = 0; // world columns under the sidebar
    let g0 = 0; // first world column of the ground band
    let groundSeen = true;

    function rebuild() {
      s = P.scale();
      const vw = window.innerWidth || root.clientWidth; // a column too many is clipped, never too few
      const showSide = !!(side && sidebar.offsetWidth && window.innerWidth >= 850);
      const sbw = showSide ? sidebar.getBoundingClientRect().width : 0;
      const phone = !showSide && s === 2;
      const top = phone ? 12 : 0;
      const bandH = (H - top) * s;
      sideW = showSide ? Math.ceil(sbw / s) : 0;
      g0 = Math.floor(sbw / s);
      const W = Math.max(g0 + 1, Math.ceil(vw / s));
      root.style.setProperty('--px-ground-h', bandH + 'px');
      root.style.setProperty('--px-ground-left', g0 * s + 'px');
      root.style.setProperty('--px-side-w', sbw + 'px');

      // the icons sit in the strip (CSS); measure them in art pixels from the strip's top-left
      const stripTop = showSide ? side.parentNode.getBoundingClientRect().bottom - bandH : 0;
      const measured = showSide
        ? icons
            .map((el) => {
              const r = el.getBoundingClientRect();
              if (!r.width) return null;
              return {
                x: r.left / s,
                y: top + (r.top - stripTop) / s,
                w: r.width / s,
                h: r.height / s,
                kind: el.id === 'mode-toggle' ? 'mode' : 'link',
                el,
              };
            })
            .filter((r) => r && r.y > top && r.y + r.h < H)
        : [];
      const night = P.isNight();
      // posts: the article column is cut out of the band, so the sign stands right of it
      const signX = article ? Math.ceil(holeRight() / s) + 3 : null;
      scene = build(W, night, { sideW: g0, top, icons: measured, sign: footer ? { year, name } : null, signX });
      scene.icons = measured;
      painter = new Painter(W, H);
      painter.setNight(night);
      const cw = [ground, side];
      cw.forEach((c) => c && (c.style.height = bandH + 'px'));
      ground.style.width = (W - g0) * s + 'px';
      if (side) side.style.width = sideW * s + 'px';

      // overlays over the drawn sign, relative to the ground band
      const L = scene.layout;
      const place = (el, r) => {
        if (!el) return;
        if (!r) return void (el.style.display = 'none');
        el.style.display = '';
        el.style.left = (r.x - g0) * s + 'px';
        el.style.top = (r.y - top) * s + 'px';
        el.style.width = r.w * s + 'px';
        el.style.height = r.h * s + 'px';
      };
      place(signBox, L.sign);
      place(nameLink, L.name);
    }

    function present(c, x0, w) {
      if (!c || w <= 0) return;
      const top = scene.top;
      const h = H - top;
      if (c.width !== w || c.height !== h) (c.width = w), (c.height = h);
      if (!painter._image || painter._image.data !== painter.data) painter._image = new ImageData(painter.data, painter.w, H);
      const ctx = c.getContext('2d');
      if (ctx) ctx.putImageData(painter._image, -x0, -top, x0, top, w, h);
    }

    function tick(t) {
      if (!scene) return;
      const groundOn = groundSeen;
      const x1 = groundOn ? scene.W : sideW;
      if (!x1) return;
      painter.clip(0, x1);
      scene.frame(painter, t);
      if (sideW) present(side, 0, sideW);
      if (groundOn) present(ground, g0, scene.W - g0);
    }

    rebuild();
    const ctl = P.loop(10, [groundWrap, ...(side ? [side.parentNode] : [])], tick);
    new IntersectionObserver((entries) => {
      groundSeen = entries[entries.length - 1].isIntersecting;
      if (groundSeen) ctl.redraw();
    }).observe(groundWrap);

    // posts: keep the cut-out on the sidebar line and the contents-column line
    function updateFade() {
      if (!article) return;
      const w = groundWrap.getBoundingClientRect();
      const side = sidebar && window.innerWidth >= 850 ? sidebar.getBoundingClientRect().right : 0;
      groundWrap.style.setProperty('--px-hole-l', Math.round(side - w.left) + 'px');
      groundWrap.style.setProperty('--px-hole-r', Math.round(holeRight() - w.left) + 'px');
    }

    {
      let fadeQueued = false;
      window.addEventListener(
        'scroll',
        () => {
          if (fadeQueued) return;
          fadeQueued = true;
          requestAnimationFrame(() => {
            fadeQueued = false;
            updateFade();
          });
        },
        { passive: true }
      );
      updateFade();
    }

    // hover lights the marker under an icon
    icons.forEach((el) => {
      const on = (v) => () => {
        if (!scene || !scene.icons) return;
        const i = v ? scene.icons.findIndex((r) => r.el === el) : -1;
        if (scene.setHover(i)) ctl.redraw();
      };
      el.addEventListener('pointerenter', on(true));
      el.addEventListener('pointerleave', on(false));
      el.addEventListener('focus', on(true));
      el.addEventListener('blur', on(false));
    });

    let pending = 0;
    const later = () => {
      clearTimeout(pending);
      pending = setTimeout(() => {
        rebuild();
        ctl.redraw();
        onScroll();
        updateFade();
      }, 150);
    };
    window.addEventListener('resize', later);
    P.onModeChange(later);
  }

  if (typeof document !== 'undefined' && document.getElementById) {
    const start = () => {
      try {
        boot();
      } catch (e) {
        // decoration only: never break the page
        if (window.console) console.warn('pixel ground:', e);
      }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})();
