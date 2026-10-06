// Pre-paint script, inlined in <head> so the first frame already has the right theme, accent and season.
// Mirrors lib/settings/apply.ts; lib/prepaint.test.ts compares the two. Copied from sc-dashboard/index.html.
export const PREPAINT_SCRIPT = String.raw`
      // Prepaint: mirrors src/lib/settings/apply.ts so the first frame already has the right theme,
      // accent, season and appearance. Keep in sync (src/lib/prepaint.test.ts compares the two).
      (function () {
        var el = document.documentElement;
        var A = 'data-bleh--';
        var THEMES = ['light', 'ink', 'rose_pine_dawn', 'dark', 'darker', 'oled', 'rose_pine', 'kanagawa_dragon'];
        var LIGHT = ['light', 'ink', 'rose_pine_dawn'];
        // key: [default, allowed values]
        var BUBBLE = {
          solarium: [true], reduced_motion: [false], underline_links: [false], show_scroller: [false],
          grid_glow: [true], font_serif: [true], seasonal_overlays: [true], compact: [false],
          avatar_radius: ['circle', ['circle', 'squircle', 'square']],
          font_choice: ['font_2026', ['font_2026', 'font_2025', 'hyperlegible', 'custom']]
        };
        // key: [css name, default, min, max]
        var CSS = {
          noise: ['noise-opacity', 0.25, 0, 1], sat_bg: ['sat-bg', 1, 0, 5],
          font_weight: ['fw-regular', 400, 100, 600], font_weight_medium: ['fw-medium', 500, 400, 750],
          font_weight_bold: ['fw-bold', 600, 500, 900]
        };
        // id, start month, day, hour, end month, day, hour (null = whole day); sorted by start
        var SEASONS = [
          ['new_years', 1, 1, null, 1, 14, null], ['easter', 4, 2, null, 4, 30, null], ['pride', 6, 1, null, 6, 30, null],
          ['summer', 7, 1, null, 9, 10, null], ['halloween', 9, 24, null, 10, 31, null], ['pre_fall', 11, 1, null, 11, 12, null],
          ['fall', 11, 13, null, 11, 22, null], ['christmas', 11, 23, null, 12, 31, null]
        ];

        function num(v, d, min, max) {
          return typeof v === 'number' && isFinite(v) ? Math.min(max, Math.max(min, v)) : d;
        }
        function season(now) {
          var y = now.getFullYear(), t = now.getTime();
          for (var i = 0; i < SEASONS.length; i++) {
            var s = SEASONS[i];
            var start = new Date(y, s[1] - 1, s[2], s[3] || 0, 0, 0, 0).getTime();
            var end = s[6] === null ? new Date(y, s[4] - 1, s[5], 23, 59, 59, 999).getTime() : new Date(y, s[4] - 1, s[5], s[6], 0, 0, 0).getTime();
            if (start <= t && t <= end) return s[0];
          }
          return null;
        }
        function legacy() {
          var out = {};
          var t = localStorage.getItem('sc_theme');
          var a = null;
          try { a = JSON.parse(localStorage.getItem('sc_appearance') || 'null'); } catch (e) { a = null; }
          if (!a || typeof a !== 'object' || a instanceof Array) a = null;
          if (t === null && !a) return out;
          if (t === 'system') out.theme_schedule = true;
          else if (THEMES.indexOf(t) >= 0) out.theme = t;
          if (!a) return out;
          if (typeof a.glass === 'boolean') out.solarium = a.glass;
          if (typeof a.grain === 'boolean') out.noise = a.grain ? 0.25 : 0;
          if (typeof a.serifHeadings === 'boolean') out.font_serif = a.serifHeadings;
          if (a.font === 'funnel') out.font_choice = 'font_2025';
          else if (a.font === 'hyperlegible') out.font_choice = 'hyperlegible';
          else if (a.font === 'custom' && typeof a.customFont === 'string' && a.customFont.trim()) { out.font_choice = 'custom'; out.font = a.customFont.trim(); }
          if (typeof a.reducedMotion === 'boolean') out.reduced_motion = a.reducedMotion;
          if (typeof a.underlineLinks === 'boolean') out.underline_links = a.underlineLinks;
          if (typeof a.showScroller === 'boolean') out.show_scroller = a.showScroller;
          if (typeof a.gridGlow === 'boolean') out.grid_glow = a.gridGlow;
          if (a.avatarRadius === 'circle' || a.avatarRadius === 'squircle' || a.avatarRadius === 'square') out.avatar_radius = a.avatarRadius;
          if (typeof a.hue === 'number' && typeof a.sat === 'number' && typeof a.lit === 'number' && (a.hue !== 230 || a.sat !== 1.28 || a.lit !== 0.9)) {
            out.accent_type = 'colour'; out.hue = a.hue; out.sat = a.sat; out.lit = a.lit;
          }
          return out;
        }

        try {
          var s = {};
          var raw = localStorage.getItem('sc_settings');
          if (raw !== null) {
            try {
              var parsed = JSON.parse(raw);
              if (parsed && typeof parsed === 'object') s = parsed;
            } catch (e) { s = {}; }
          } else {
            s = legacy();
          }

          var theme = THEMES.indexOf(s.theme) >= 0 ? s.theme : 'oled';
          if (s.theme_schedule === true) {
            var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            var pick = dark ? s.theme_night : s.theme_day;
            theme = THEMES.indexOf(pick) >= 0 ? pick : (dark ? 'oled' : 'light');
          }
          var type = LIGHT.indexOf(theme) >= 0 ? 'light' : 'dark';
          el.setAttribute(A + 'theme', theme);
          el.setAttribute(A + 'theme_type', type);
          el.setAttribute('data-theme', type);

          for (var k in BUBBLE) {
            var def = BUBBLE[k][0], allowed = BUBBLE[k][1], v = s[k];
            var ok = typeof v === typeof def && (!allowed || allowed.indexOf(v) >= 0);
            if (ok && v !== def) el.setAttribute(A + k, String(v));
          }
          for (var c in CSS) {
            var cv = num(s[c], CSS[c][1], CSS[c][2], CSS[c][3]);
            if (cv !== CSS[c][1]) el.style.setProperty('--' + CSS[c][0], String(cv));
          }
          if (typeof s.font === 'string') {
            var font = s.font.replace(/[\u0000-\u001f\u007f;{}<>\\]/g, '').trim().slice(0, 120);
            if (font) el.style.setProperty('--custom-font', /[,"']/.test(font) ? font : '"' + font + '"');
          }

          var types = ['avatar', 'colour', 'customise'];
          if (types.indexOf(s.accent_type) >= 0) {
            var lit = num(s.lit, 0.9, 0, 1.5);
            el.style.setProperty('--hue-user', String(num(s.hue, 230, 0, 360)));
            el.style.setProperty('--sat-user', String(num(s.sat, 1.28, 0, 4)));
            el.style.setProperty('--lit-user', String(lit));
            if (lit <= 0.3) el.classList.add('increase-btn-contrast');
          }

          if (s.seasonal !== false) {
            var current = season(new Date());
            if (current) el.setAttribute(A + 'season', current);
          }
        } catch (e) {
          el.setAttribute('data-theme', 'dark');
          el.setAttribute(A + 'theme', 'oled');
          el.setAttribute(A + 'theme_type', 'dark');
        }
      })();
    `;
