# Skema project (input `build.js --in`)

JSON; semua kunci kecuali yang ditandai wajib boleh dihilangkan (default diisi). ID bebas tapi unik (`t_…`, `a_…`, `wt_…`, `r_…`, `m_…`, `w_…`). Teks UI dalam bahasa pengguna.

## project
`name` (nama file, huruf/angka/_/-), `title`, `subtitle`, `theme` (Purple Ocean Matrix Crimson Luxury Sakura White Dark Tosca DarkPurple Midnight Carbon), `width` 330, `height` 300, `luluUrl` (URL raw LuluUI.lua; default https://raw.githubusercontent.com/stardev-community/XROBLOX/refs/heads/main/LuluUI.lua), `placeIds` [angka], `placeGuard` warn|stop|hold, `autosave` true, `infoTab` true, `skipLoading`, `resolveTimeout` 10, `maxActionsPerSecond` 30, `debug`, `minify`, `comments`.

## targets[]
`{id, alias, path, type, note}` — path dari service: `ReplicatedStorage.Remotes.Collect`, `Players.LocalPlayer.leaderstats.Coins`, `Workspace.Items`. Bila nama mengandung titik, pisah dengan `/`. type: auto remote function bindable value instance folder prompt click tool humanoid player.

## actions[]
`{id, name, kind, targetId, args[], retry, delay, after, cooldown, ignoreError}` + field per kind:

| kind | target | args | field lain |
|---|---|---|---|
| fire | wajib (Remote/Bindable) | argumen bebas | |
| invoke | wajib | argumen bebas | hasil tersimpan → `@action:id` |
| get | wajib | – | `mode`: property/attribute/children/childCount/exists, `prop` |
| set | wajib | [nilai baru] | `mode`: property/attribute, `prop` |
| prompt | ProximityPrompt | [tahan detik] | butuh fireproximityprompt |
| click | ClickDetector | [jarak] | butuh fireclickdetector |
| equip | opsional | [nama tool] | |
| unequip | – | – | |
| teleport | opsional | [tujuan Vector3/Instance, offsetY] | |
| walk | opsional | [tujuan, tunggu?, timeout] | |
| wait | – | [detik] | |
| loop | – | [interval, jumlah(0=tanpa batas)] | `steps`:[actionId], `until`: kondisi |
| log | – | [pesan] | `level`, `toNotify` (tulis ke widget List ber-`isLog`) |
| notify | – | [pesan] | `level` info/success/warning/error |
| setwidget | – | [nilai] | `widgetId` |
| setvar | – | [nilai] | `varName` |
| runrule / runmacro | – | – | `ref` |
| stopall | – | – | |
| custom | – | – | `code` (Lua; tersedia ctx, S, R, T("id"), LP, Log(msg)); JANGAN buat UI lain |

## Operand (argumen/kondisi/sumber nilai) – bentuk ringkas
Angka/boolean/teks biasa = nilai tetap. String berawalan `@`:
`@widget:ID` nilai widget · `@action:ID[.field]` hasil aksi · `@watcher:ID[.output]` output watcher terakhir · `@target:ID[.instance|position|cframe|name|value]` · `@var:nama` · `@event:field` payload event rule · `@random:min:max` · `@tpl:teks {w:id} {a:id} {v:var} {e:field} {wt:wid.field}` · `@expr:lua` (lanjut) · `@player` `@character` `@hrp` `@humanoid`.
Bentuk penuh: `{src, type, value, ref, field, min, max, list, expr, tpl}` (src juga `pick`/`rr` dengan `list`). `type` cast: auto number string boolean Vector3.
Vector3 tetap: `{"src":"fixed","type":"Vector3","value":"10,5,20"}`.

## watchers[]
`{id, name, kind, targetId, enabled, …}`: 
valueChanged(out value,old) · attributeChanged(`attr`) · propertyChanged(`prop`) · childAdded/childRemoved/descendantAdded(`nameFilter`,`classFilter`,`fireExisting`; out child,name,class) · remoteFired(`filter`:{enabled,index,op,value}; out a1,a2,a3,args,count) · interval(`interval`: operand detik, `startDelay`; out tick,time) · exists(`existsOn` appear|disappear|both) · distance(`radius`,`pollEvery`,`onlyEnter`; out value) · respawn(`fireOnStart`) · start(`startDelay`) · hotkey(`key` KeyCode, mis. "F") · manual (hanya dipicu tombol/aksi).

## rules[]
`{id, name, when:watcherId, cond, steps:[actionId | {id,delay}], cooldown, maxRuns, priority, mode sequence|parallel, onFail continue|stop|fallback, fallback:actionId, enabled(default true; false bila diikat Toggle), allowOverlap}`.
Kondisi: `["@watcher:wt1.value", ">=", 10]`; operator: `== ~= > < >= <= contains startsWith exists isNil between` (between: kanan "1,10"); gabung `{"and":[…]}` `{"or":[…]}` `{"not":[…]}`.

## macros[]
`{id, name, loop, interval, count, steps:[actionId | angka detik tunggu]}`.

## profiles[]
`{name, values:{widgetId: nilai}}` — dipilih lewat Dropdown dengan `"profiles": true`.

## ui
`{tabs:[{name, widgets[]}], infoPanel:{enabled,title,lines:[{label,src}]}, locationPanel, locationMode walk|teleport, locations:[{name,lanes:["x,y,z"]}]}`.
Widget `{id, type, label, subtext, locked, persist, …}`:
- Teks: Label(size,bold) · InfoLabel(`src` operand live) · Badge(color) · Separator · Divider
- Kontrol: Button(`bind`, color, confirm:{enabled,title,message}) · HalfButtons(label,label2,bind,bind2) · Toggle(default, bind)
- Input (bernilai, dipersist): NumberInput(default,min,max,step) · TextInput(default,placeholder) · Dropdown(options,default,optionsFrom:actionId,`profiles`) · MultiDropdown(options,default[]) · Segment(options,default)
- Tampilan: ProgressBar(src,max) · List(height,isLog) · Table(headers,rows) · CopyButton(value)
- Struktur: Accordion(open, children[]) · Custom(code)
`bind` ringkas: Toggle → `rule:ID` `watcher:ID` `macro:ID` `action:ID`(aksi loop); Button → `action:ID` `macro:ID` `rule:ID` `watcher:ID` `stopall` `save` `load` `reset` `refresh:dropdownId`.

## Pola umum
- Auto-farm ON/OFF: watcher interval + rule (`enabled:false`) + Toggle `rule:ID`; atau macro loop + Toggle `macro:ID`.
- Reaksi ke game: watcher valueChanged/childAdded/remoteFired + rule + kondisi.
- Nilai dari UI ke argumen: `@widget:ID` di args aksi (dibaca saat aksi jalan).
- Aksi bergantung hasil aksi lain: invoke/get → `@action:ID` di kondisi/argumen aksi berikutnya.
- Hindari: rule yang memicu dirinya sendiri (set Value yang di-watch), interval < 0.1 dtk, loop tanpa batas tanpa Toggle.
