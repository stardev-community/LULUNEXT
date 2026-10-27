#!/usr/bin/env node
'use strict';
/*
 * build.js - CLI pembuat script LuluUI.
 *   node build.js --list-templates
 *   node build.js --template quest --out ./hasil [--url RAW_URL]
 *   node build.js --in project.json --out ./hasil [--url RAW_URL] [--check]
 * Keluaran stdout: JSON ringkas {ok, file, errors, warnings, issues[], lua:{ok,errors,globals}}
 * Kode keluar 1 bila ada error validasi/sintaks (file tetap ditulis bila --force).
 */
const fs = require('fs'), path = require('path');
const lib = path.join(__dirname, '..', 'lib');
['core', 'themes', 'luacheck', 'runtime', 'generator', 'validate', 'templates'].forEach((m) => require(path.join(lib, m + '.js')));
const F = LSB.make;

const args = process.argv.slice(2); const opt = {};
for (let i = 0; i < args.length; i++) { const a = args[i]; if (a.startsWith('--')) { const k = a.slice(2); const nx = args[i + 1]; if (nx && !nx.startsWith('--')) { opt[k] = nx; i++; } else opt[k] = true; } }

/* ---------- normalisasi: terima bentuk ringkas, isi default ---------- */
function op(x) {
  if (x && typeof x === 'object' && !Array.isArray(x)) return F.operand(x.src || 'fixed', x);
  if (typeof x === 'number') return F.fixed(String(x), 'number');
  if (typeof x === 'boolean') return F.fixed(String(x), 'boolean');
  if (x == null) return F.fixed('', 'nil');
  const s = String(x);
  let m;
  if ((m = /^@widget:(.+)$/.exec(s))) return F.operand('widget', { ref: m[1] });
  if ((m = /^@action:([^.]+)(?:\.(.+))?$/.exec(s))) return F.operand('action', { ref: m[1], field: m[2] || '' });
  if ((m = /^@watcher:([^.]+)(?:\.(.+))?$/.exec(s))) return F.operand('watcher', { ref: m[1], field: m[2] || 'value' });
  if ((m = /^@target:([^.]+)(?:\.(.+))?$/.exec(s))) return F.operand('target', { ref: m[1], field: m[2] || 'instance' });
  if ((m = /^@var:(.+)$/.exec(s))) return F.operand('var', { ref: m[1] });
  if ((m = /^@event:(.+)$/.exec(s))) return F.operand('event', { field: m[1] });
  if ((m = /^@random:([^:]+):(.+)$/.exec(s))) return F.operand('random', { min: m[1], max: m[2] });
  if ((m = /^@tpl:([\s\S]+)$/.exec(s))) return F.operand('template', { tpl: m[1] });
  if ((m = /^@expr:([\s\S]+)$/.exec(s))) return F.operand('expr', { expr: m[1] });
  if (/^@(player|character|hrp|humanoid)$/.test(s)) return F.operand(s.slice(1));
  if (/^-?\d+(\.\d+)?$/.test(s)) return F.fixed(s, 'number');
  if (s === 'true' || s === 'false') return F.fixed(s, 'boolean');
  return F.fixed(s, 'string');
}
// kondisi: ["@watcher:w1.value", ">=", 10] | {and:[...]} | {or:[...]} | {not:[...]} | bentuk penuh
function cond(c) {
  if (c == null) return null;
  if (Array.isArray(c)) { const x = F.cond(); x.left = op(c[0]); x.cmp = c[1]; x.right = c.length > 2 ? op(c[2]) : F.fixed('', 'auto'); return x; }
  if (c.and || c.or || c.not) { const key = c.and ? 'and' : c.or ? 'or' : 'not'; return { op: key.toUpperCase(), items: c[key].map(cond) }; }
  if (c.cmp) return { left: op(c.left), cmp: c.cmp, right: c.right === undefined ? F.fixed('', 'auto') : op(c.right) };
  if (c.items) return { op: c.op || 'AND', items: c.items.map(cond) };
  throw new Error('kondisi tidak dikenal: ' + JSON.stringify(c));
}
function widget(w) {
  const x = F.widget(w.type, w);
  if (x.src && !x.src.src) x.src = op(x.src); else if (w.src !== undefined) x.src = op(w.src);
  if (x.bind && !x.bind.kind) x.bind = { kind: 'none', ref: '' };
  if (w.type === 'Toggle' && typeof w.bind === 'string') x.bind = parseBind(w.bind);
  if (typeof w.bind === 'string') x.bind = parseBind(w.bind);
  if (typeof w.bind2 === 'string') x.bind2 = parseBind(w.bind2);
  if (w.type === 'Dropdown' && w.profiles) x.bind = { kind: 'profile', ref: '' };
  if (Array.isArray(x.children)) x.children = x.children.map(widget);
  return x;
}
function parseBind(s) { const m = /^([a-z]+)(?::(.+))?$/.exec(s); return { kind: m ? m[1] : 'none', ref: m && m[2] || '' }; } // "rule:r1", "macro:m1", "action:a1", "stopall", "save"...
function normalize(inp) {
  const c = F.config();
  c.project = Object.assign(F.project(), inp.project || {});
  if (opt.url) c.project.luluUrl = opt.url;
  c.targets = (inp.targets || []).map((t) => F.target(t));
  c.actions = (inp.actions || []).map((a) => { const x = F.action(a.kind, a); x.args = (a.args || []).map(op); if (a.until) x.until = cond(a.until); return x; });
  c.watchers = (inp.watchers || []).map((w) => { const x = F.watcher(w.kind, w); if (w.intervalOp != null) x.intervalOp = op(w.intervalOp); else if (w.interval != null) x.intervalOp = op(w.interval); return x; });
  c.rules = (inp.rules || []).map((r) => { const x = F.rule(r); x.steps = (r.steps || []).map((s) => typeof s === 'string' ? { id: s, delay: 0 } : s); x.cond = cond(r.cond); return x; });
  c.macros = (inp.macros || []).map((m) => { const x = F.macro(m); x.steps = (m.steps || []).map((s) => typeof s === 'string' ? { action: s } : typeof s === 'number' ? { wait: s } : s); return x; });
  c.profiles = (inp.profiles || []).map((p) => F.profile(p));
  const ui = inp.ui || {};
  c.ui = { tabs: (ui.tabs || c.ui.tabs).map((t) => ({ id: t.id || LSB.util.uid('tab'), name: t.name || 'Main', widgets: (t.widgets || []).map(widget) })),
    infoPanel: Object.assign({ enabled: false, title: 'Status', lines: [] }, ui.infoPanel || {}), locationPanel: !!ui.locationPanel, locationMode: ui.locationMode || 'walk', locations: ui.locations || [] };
  c.ui.infoPanel.lines = (c.ui.infoPanel.lines || []).map((l) => ({ label: l.label, src: op(l.src) }));
  return c;
}

/* ---------- main ---------- */
if (opt['list-templates']) { console.log(JSON.stringify(LSB.templates.map((t) => ({ id: t.id, name: t.name, desc: t.desc })), null, 2)); process.exit(0); }
let cfg;
try {
  if (opt.template) { const t = LSB.templateById(opt.template); if (!t) throw new Error('template tidak ada: ' + opt.template); cfg = LSB.migrate(t.build()); if (opt.url) cfg.project.luluUrl = opt.url; if (opt.name) cfg.project.name = opt.name; }
  else if (opt.in) { cfg = normalize(JSON.parse(fs.readFileSync(opt.in, 'utf8'))); if (opt.name) cfg.project.name = opt.name; }
  else { console.error('Pakai: --in project.json | --template ID | --list-templates   (opsi: --out DIR --url RAW --check --force --dump-config)'); process.exit(2); }
} catch (e) { console.log(JSON.stringify({ ok: false, fatal: String(e.message || e) })); process.exit(1); }

const v = LSB.validate(cfg);
const out = { ok: v.errors === 0, errors: v.errors, warnings: v.warnings, issues: v.issues.filter((i) => i.level !== 'info').map((i) => ({ level: i.level, msg: i.msg })) };
if (opt['dump-config']) fs.writeFileSync(path.join(opt.out || '.', 'normalized.json'), JSON.stringify(cfg, null, 2));
if (!opt.check) {
  const gen = LSB.generate(cfg, {});
  const chk = LSB.luacheck.check(gen.code);
  out.lua = { ok: chk.ok, errors: chk.errors.slice(0, 5), globals: chk.globals.map((g) => g.name), lines: gen.code.split('\n').length };
  out.generatorWarnings = gen.warnings || [];
  if (!chk.ok) out.ok = false;
  if (out.ok || opt.force) {
    const dir = opt.out || '.'; fs.mkdirSync(dir, { recursive: true });
    out.file = path.join(dir, gen.fileName); fs.writeFileSync(out.file, gen.code);
  }
}
console.log(JSON.stringify(out, null, 2));
process.exit(out.ok ? 0 : 1);
