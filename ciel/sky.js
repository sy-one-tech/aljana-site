/* aljana · prototype v2 — ciel atmosphérique.
   Diffusion simple de Rayleigh et de Mie calculée par pixel (atmosphère terrestre standard), ombre de la Terre
   au crépuscule, disque solaire rougi par l'extinction, halo de Mie, brume d'horizon. Nuit : fond de ciel,
   lueur d'horizon, Voie lactée placée par ses vraies coordonnées galactiques (temps sidéral, latitude).
   Reliefs : deux plans très bas et flous, non géographiques. Projection partagée avec le calque des astres. */
(function () {
  'use strict'
  var VS = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }'
  var FS = [
    'precision highp float;',
    'uniform vec2 uRes; uniform vec3 uSun; uniform float uAzC, uPpd, uHzY, uLat, uLST, uExp, uNight, uMilky, uSeed, uMoonLit, uFloorW, uTime, uSunAz; uniform vec3 uTop, uMid, uHor;',
    'const float PI = 3.14159265; const float D2R = 0.01745329;',
    'const float Re = 6360e3; const float Ra = 6420e3; const float Hr = 7994.0; const float Hm = 1200.0;',
    'const vec3 bR = vec3(5.8e-6, 13.5e-6, 33.1e-6); const float bM = 21e-6; const vec3 bO = vec3(0.65e-6, 1.881e-6, 0.085e-6);',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }',
    'float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a*noise(p); p *= 2.03; a *= 0.5; } return s; }',
    'vec2 sph(vec3 o, vec3 d, float r){ float b = dot(o, d), c = dot(o, o) - r*r, h = b*b - c; if (h < 0.0) return vec2(-1.0); h = sqrt(h); return vec2(-b - h, -b + h); }',
    /* diffusion simple : renvoie la lumière diffusée, et la transmittance de la ligne de visée dans T */
    'vec3 atmo(vec3 d, vec3 s, out vec3 T, out float hitGround){',
    '  vec3 o = vec3(0.0, Re + 2.0, 0.0); vec2 ta = sph(o, d, Ra); float tmax = ta.y; vec2 tg = sph(o, d, Re); hitGround = 0.0;',
    '  if (tg.x > 0.0) { tmax = tg.x; hitGround = 1.0; }',
    '  float seg = tmax / 16.0, t = 0.0, odR = 0.0, odM = 0.0; vec3 sR = vec3(0.0), sM = vec3(0.0);',
    '  for (int i = 0; i < 16; i++){',
    '    vec3 x = o + d * (t + seg*0.5); float h = length(x) - Re; float hr = exp(-h/Hr)*seg, hm = exp(-h/Hm)*seg; odR += hr; odM += hm;',
    '    vec2 ls = sph(x, s, Ra); float sl = ls.y / 6.0, tl = 0.0, lR = 0.0, lM = 0.0; bool lit = sph(x, s, Re).x < 0.0;',
    '    for (int j = 0; j < 6; j++){ vec3 y = x + s * (tl + sl*0.5); float hh = length(y) - Re; lR += exp(-hh/Hr)*sl; lM += exp(-hh/Hm)*sl; tl += sl; }',
    '    if (lit) { vec3 tau = bR*(odR + lR) + bM*1.1*(odM + lM) + bO*0.6*(odR + lR)*2.0; vec3 at = exp(-tau); sR += at*hr; sM += at*hm; }',
    '    t += seg;',
    '  }',
    '  T = exp(-(bR*odR + bM*1.1*odM + bO*1.2*odR));',
    '  float mu = dot(d, s), g = 0.76, pR = 3.0/(16.0*PI)*(1.0+mu*mu), pM = 3.0/(8.0*PI)*((1.0-g*g)*(1.0+mu*mu))/((2.0+g*g)*pow(1.0+g*g-2.0*g*mu, 1.5));',
    '  return 20.0 * (sR*bR*pR + sM*bM*pM);',
    '}',
    'vec3 dirOf(float az, float alt){ return vec3(sin(az*D2R)*cos(alt*D2R), sin(alt*D2R), cos(az*D2R)*cos(alt*D2R)); }',
    /* Voie lactée : densité en coordonnées galactiques (bande, bulbe vers le centre, poussières) */
    'float milky(float az, float alt){',
    '  float la = uLat*D2R, A = az*D2R, h = alt*D2R;',
    '  float dec = asin(clamp(sin(la)*sin(h) + cos(la)*cos(h)*cos(A), -1.0, 1.0)); /* borné : au pôle céleste, l arrondi dépassait 1 (point noir) */',
    '  float H = atan(-sin(A)*cos(h), cos(la)*sin(h) - sin(la)*cos(h)*cos(A));',
    '  float ra = uLST*D2R - H;',
    '  vec3 e = vec3(cos(dec)*cos(ra), cos(dec)*sin(ra), sin(dec));',
    '  vec3 g = vec3(-0.0548755*e.x - 0.8734371*e.y - 0.4838350*e.z, 0.4941094*e.x - 0.4448296*e.y + 0.7469822*e.z, -0.8676661*e.x - 0.1980764*e.y + 0.4559838*e.z);',
    '  float b = asin(clamp(g.z, -1.0, 1.0)) / D2R, l = atan(g.y, g.x) / D2R;',
    '  float core = exp(-pow(b/9.0, 2.0)), wide = exp(-pow(b/22.0, 2.0))*0.35, bulge = 0.55 + 0.45*cos(l*D2R) + 0.6*exp(-pow(l/22.0,2.0) - pow(b/10.0,2.0));',
    '  float dust = smoothstep(0.45, 0.8, fbm(vec2(l*0.05, b*0.12) + 3.1)) * exp(-pow(b/3.0, 2.0)) * 0.6;',
    '  float cl = 0.65 + 0.7*fbm(vec2(l*0.05, b*0.08));',
    '  return (core*cl + wide) * bulge * (1.0 - 0.75*dust);',
    '}',
    'float ridge(float az, float s, float base, float amp){ return base + amp * (fbm(vec2(az*0.022 + s, s*1.7)) - 0.35); }',
    'void main(){',
    '  vec2 fc = gl_FragCoord.xy; float yTop = uRes.y - fc.y;',
    '  float az = uAzC + (fc.x - uRes.x*0.5) / uPpd, alt = (uHzY - yTop) / uPpd;',
    '  vec3 s = uSun; vec3 T; float hg;',
    '  float far = ridge(az, uSeed, 0.5, 1.5), mid = ridge(az, uSeed + 3.3, 0.22, 1.1), near = ridge(az, uSeed + 7.0, 0.06, 0.8);',
    '  float aV = max(alt, 0.02);',
    '  vec3 col = atmo(dirOf(az, aV), s, T, hg);',
    /* disque solaire : limbe assombri, rougi par la transmittance ; halo de Mie déjà dans la diffusion */
    '  float ang = acos(clamp(dot(dirOf(az, aV), s), -1.0, 1.0)) / D2R;',
    '  float sd = 0.62; float disk = smoothstep(sd, sd*0.86, ang); float limbD = 0.55 + 0.45*sqrt(max(0.0, 1.0 - pow(ang/sd, 2.0)));',
    '  col += disk * limbD * T * 42.0 * step(0.0, alt);',
    '  col += T * 0.9 * exp(-ang*0.9) * step(0.0, alt);',
    /* nuit : fond, lueur d horizon, Voie lactée */
    '  float n = uNight; float ca = cos(aV*D2R); float vr = 1.0 / sqrt(1.0 - 0.969*ca*ca);',
    '  float ag = fbm(vec2(az*0.03 + uTime*0.0035, aV*0.05 - uTime*0.0015) + uSeed*1.3);',
    '  vec3 night = vec3(0.0030, 0.0052, 0.0135) * (0.45 + 0.55*min(vr, 4.5)) * (0.78 + 0.44*ag);',
    '  float mw = milky(az, aV) * uMilky * n * (1.0 - 0.8*uMoonLit) * smoothstep(0.0, 18.0, aV);',
    '  float dAz = abs(mod(az - uSunAz + 540.0, 360.0) - 180.0); float sideK = exp(-dAz*dAz/(2.0*70.0*70.0));',
    '  vec3 hor = uHor * (0.72 + 0.55*sideK); vec3 midc = uMid * (0.86 + 0.26*sideK);',
    '  vec3 fl = mix(hor, midc, smoothstep(0.0, 18.0, aV)); fl = mix(fl, uTop * 0.82, smoothstep(14.0, 75.0, aV));',
    '  float dark = smoothstep(-3.0, -9.0, degrees(asin(clamp(s.y, -1.0, 1.0)))); fl *= mix(1.0, 0.86 + 0.28*ag, dark);',
'  vec3 ph = 1.0 - exp(-col * uExp); vec3 base = fl * uFloorW;',
'  vec3 c = base + ph - base * ph;',
    '  c += night * n + vec3(0.075, 0.082, 0.10) * mw;',
    /* reliefs : plans flous dans la brume, teintés par le ciel de l horizon */
    '  vec3 Th; float hg2; vec3 hzp = 1.0 - exp(-atmo(dirOf(az, 0.4), s, Th, hg2) * uExp); vec3 hb = uHor * uFloorW; vec3 hz = hb + hzp - hb*hzp + night*n*1.4;',
    '  vec3 farC = mix(hz*0.78, vec3(0.012, 0.018, 0.04), 0.22), midC = mix(hz*0.45, vec3(0.008, 0.013, 0.032), 0.42), nearC = mix(hz*0.2, vec3(0.006, 0.010, 0.026), 0.62);',
    '  float fFar = smoothstep(far + 0.16, far - 0.16, alt), fMid = smoothstep(mid + 0.12, mid - 0.12, alt), fNear = smoothstep(near + 0.1, near - 0.1, alt);',
    '  c = mix(c, farC, fFar * 0.85); c = mix(c, midC, fMid * 0.92); c = mix(c, nearC, fNear);',
    '  float haze = exp(-max(alt, 0.0) / 2.2) * (0.35 + 0.65*(1.0 - uNight)) * (0.8 + 0.4*fbm(vec2(az*0.045 + uTime*0.012, 2.0 + uSeed)));',
    '  c += hz * 0.10 * haze * step(near, alt);',
    '  float below = smoothstep(-0.5, -16.0, alt); c = mix(c, vec3(0.024, 0.043, 0.094), below);',
    '  c += (hash(fc + uSeed) - 0.5) / 255.0;',
    '  gl_FragColor = vec4(pow(max(c, 0.0), vec3(0.92)), 1.0);',
    '}'].join('\n')

  /* palette de l'app (skyPalette) aux mêmes paliers, crépuscules sans violet (teintes ardoise) */
  var PAL = [[-30, ['#03061A', '#060B22', '#0E1A3E']], [-18, ['#04081F', '#08112B', '#13224A']], [-12, ['#060C27', '#0D1A42', '#1F2D58']], [-6, ['#091235', '#18295A', '#3A4A72']],
    [-0.8, ['#0B1740', '#284076', '#5B6488']], [4, ['#0B1E4C', '#2A4E8E', '#8E9CBA']], [15, ['#081D4F', '#1E4A8E', '#7FA6D2']], [40, ['#061A4A', '#184186', '#5A88C2']], [90, ['#051747', '#143B7E', '#4A79B5']]]
  function mixHex(a, b, f) { var p = function (h, i) { return parseInt(h.slice(i, i + 2), 16) }, c = function (i) { return ('0' + Math.round(p(a, i) + (p(b, i) - p(a, i)) * f).toString(16)).slice(-2) }; return '#' + c(1) + c(3) + c(5) }
  function palette(alt) { var i = 0; while (i < PAL.length - 2 && alt > PAL[i + 1][0]) i++; var f = Math.min(1, Math.max(0, (alt - PAL[i][0]) / (PAL[i + 1][0] - PAL[i][0]))); return PAL[i][1].map(function (c, j) { return mixHex(c, PAL[i + 1][1][j], f) }) }
  function Sky(canvas, scale) {
    this.cv = canvas; this.scale = scale || 0.5
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true }) || canvas.getContext('experimental-webgl')
    if (!gl) { this.gl = null; return }
    this.gl = gl
    var sh = function (t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr)
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr))
    gl.useProgram(pr); this.pr = pr
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    this.u = {}; var self = this
    ;['uRes', 'uSun', 'uAzC', 'uPpd', 'uHzY', 'uLat', 'uLST', 'uExp', 'uNight', 'uMilky', 'uSeed', 'uMoonLit', 'uFloorW', 'uTop', 'uMid', 'uHor', 'uTime', 'uSunAz'].forEach(function (n) { self.u[n] = gl.getUniformLocation(pr, n) })
  }
  /* v : { W, H (px CSS), azC, ppd (px/°), hzY (px depuis le haut), sunAlt, sunAz, lat, lst (°), moonLit (0..1) } */
  Sky.prototype.render = function (v) {
    var gl = this.gl; if (!gl) return
    var dpr = Math.min(2, window.devicePixelRatio || 1), k = dpr * this.scale, w = Math.max(2, Math.round(v.W * k)), h = Math.max(2, Math.round(v.H * k))
    if (this.cv.width !== w || this.cv.height !== h) { this.cv.width = w; this.cv.height = h }
    gl.viewport(0, 0, w, h)
    var R = Math.PI / 180, sa = v.sunAlt * R, sz = v.sunAz * R
    gl.uniform2f(this.u.uRes, w, h)
    gl.uniform3f(this.u.uSun, Math.sin(sz) * Math.cos(sa), Math.sin(sa), Math.cos(sz) * Math.cos(sa))
    gl.uniform1f(this.u.uAzC, v.azC); gl.uniform1f(this.u.uPpd, v.ppd * k); gl.uniform1f(this.u.uHzY, v.hzY * k)
    gl.uniform1f(this.u.uLat, v.lat); gl.uniform1f(this.u.uLST, v.lst)
    /* exposition adaptée (comme l œil) : plus le Soleil descend, plus on expose, jusqu à la nuit */
    var alt = v.sunAlt, ex = alt >= 6 ? 1.25 : alt >= -1 ? 1.25 + (6 - alt) * 0.4 : 4 * Math.pow(10, Math.min(1.6, (-1 - alt) * 0.25))
    gl.uniform1f(this.u.uExp, ex)
    var P = palette(alt), lin = function (h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)].map(function (x) { return Math.pow(x / 255, 1.08) }) }
    gl.uniform3fv(this.u.uTop, lin(P[0])); gl.uniform3fv(this.u.uMid, lin(P[1])); gl.uniform3fv(this.u.uHor, lin(P[2]))
    gl.uniform1f(this.u.uFloorW, Math.min(1, Math.max(0.3, (5 - alt) / 7)))
    var night = Math.min(1, Math.max(0, (-alt - 6) / 10)); gl.uniform1f(this.u.uNight, night)
    gl.uniform1f(this.u.uTime, v.time || 0); gl.uniform1f(this.u.uSunAz, v.sunAz)
    gl.uniform1f(this.u.uMilky, v.milky == null ? 1 : v.milky); gl.uniform1f(this.u.uSeed, v.seed || 1.7); gl.uniform1f(this.u.uMoonLit, v.moonLit || 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  /* ---------- V4.2 : champ d'étoiles NASA (Deep Star Maps 2020, Gaia) ----------
     Calque WebGL à pleine résolution, ajouté au ciel en « screen » : densité réelle des étoiles faibles et vraie
     Voie lactée, projetées par temps sidéral et latitude (même projection que le ciel). Le seuil monte avec la
     clarté du ciel (crépuscule, clair de Lune) : seules restent les étoiles qu'on verrait. Masqué sous les reliefs. */
  var SFS = [
    'precision highp float;',
    'uniform vec2 uRes; uniform float uAzC, uPpd, uHzY, uLat, uLST, uGain, uThr, uSeed; uniform sampler2D uTex;',
    'const float D2R = 0.01745329; const float PI = 3.14159265;',
    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }',
    'float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a*noise(p); p *= 2.03; a *= 0.5; } return s; }',
    'float ridge(float az, float s, float base, float amp){ return base + amp * (fbm(vec2(az*0.022 + s, s*1.7)) - 0.35); }',
    'void main(){',
    '  vec2 fc = gl_FragCoord.xy; float yTop = uRes.y - fc.y;',
    '  float az = uAzC + (fc.x - uRes.x*0.5) / uPpd, alt = (uHzY - yTop) / uPpd;',
    '  float far = ridge(az, uSeed, 0.5, 1.5); float m = smoothstep(far - 0.05, far + 0.35, alt);',
    '  if (m <= 0.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }',
    '  float la = uLat*D2R, A = az*D2R, h = max(alt, 0.0)*D2R;',
    '  float dec = asin(clamp(sin(la)*sin(h) + cos(la)*cos(h)*cos(A), -1.0, 1.0)); /* borné : au pôle céleste, l arrondi dépassait 1 (point noir) */',
    '  float H = atan(-sin(A)*cos(h), cos(la)*sin(h) - sin(la)*cos(h)*cos(A));',
    '  float ra = uLST*D2R - H;',
    '  vec2 tc = vec2(fract(0.5 - ra / (2.0*PI)), 0.5 - dec / PI);',
    '  vec3 s = texture2D(uTex, tc).rgb; s = max(s - uThr, 0.0) / (1.0 - uThr);',
    '  float am = 1.0 / max(sin(h) + 0.025, 0.035); s *= exp(-0.16*(am - 1.0));',
    '  gl_FragColor = vec4(s * uGain * m, 1.0);',
    '}'].join('\n')
  function Stars(canvas, src) {
    this.cv = canvas; this.ready = false
    var gl = canvas.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: true }); if (!gl) return
    this.gl = gl
    var sh = function (t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, SFS)); gl.linkProgram(pr); gl.useProgram(pr); this.pr = pr
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    this.u = {}; var self = this
    ;['uRes', 'uAzC', 'uPpd', 'uHzY', 'uLat', 'uLST', 'uGain', 'uThr', 'uSeed', 'uTex'].forEach(function (n) { self.u[n] = gl.getUniformLocation(pr, n) })
    var big = gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096 && window.innerWidth >= 900
    /* carte 2048 d'abord (légère, prête avant la fin de l'écran de lancement), puis 4096 en arrière-plan sur grand écran */
    var load = function (name) { return new Promise(function (ok) { var img = new Image(); img.decoding = 'async'; img.onload = function () { ok(img) }; img.onerror = function () { ok(null) }; img.src = src + name + '?v=1' }) }
    var upload = function (img) {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img) /* sans mipmaps : près du pôle céleste et sur la couture de la carte, le choix de niveau donnait des traînées et un point noir */
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      if (self.tex) gl.deleteTexture(self.tex); self.tex = t; gl.uniform1i(self.u.uTex, 0); self.ready = true
    }
    this.loaded = load('starmap-2048.jpg').then(function (img) { if (!img) return false; upload(img)
      if (big) setTimeout(function () { load('starmap-4096.jpg').then(function (im) { if (im) { upload(im); if (self.onupgrade) self.onupgrade() } }) }, 2500)
      return true })
  }
  /* v : { W, H, azC, ppd, hzY, lat, lst, sunAlt, moonLit, seed } */
  Stars.prototype.render = function (v) {
    var gl = this.gl; if (!gl || !this.ready) return
    var dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(v.W * dpr), h = Math.round(v.H * dpr)
    if (this.cv.width !== w || this.cv.height !== h) { this.cv.width = w; this.cv.height = h }
    gl.viewport(0, 0, w, h)
    var night = Math.min(1, Math.max(0, (-v.sunAlt - 6) / 10)), ml = v.moonLit || 0
    gl.uniform2f(this.u.uRes, w, h); gl.uniform1f(this.u.uAzC, v.azC); gl.uniform1f(this.u.uPpd, v.ppd * dpr); gl.uniform1f(this.u.uHzY, v.hzY * dpr)
    gl.uniform1f(this.u.uLat, v.lat); gl.uniform1f(this.u.uLST, v.lst); gl.uniform1f(this.u.uSeed, v.seed || 1.7)
    gl.uniform1f(this.u.uGain, 0.95 * night * (1 - 0.7 * ml)); gl.uniform1f(this.u.uThr, 0.05 + 0.25 * (1 - night) + 0.12 * ml)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
  window.ALJ_STARS = Stars
  Sky.palette = palette
  window.ALJ_SKY = Sky
})()
