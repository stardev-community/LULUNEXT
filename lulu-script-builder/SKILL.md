---
name: lulu-script-builder
description: Membuat script Roblox (Lua) lengkap berbasis library LuluUI dari deskripsi pengguna — path Remote/Value, aksi, watcher, rule, makro, dan UI — menjadi satu file <nama>.lua yang siap dijalankan di executor. Gunakan saat pengguna minta dibuatkan script/tool Roblox dengan LuluUI (auto farm, auto collect, quest tracker, teleport menu, dll.).
---

# Lulu Script Builder (versi skill)

Mengubah permintaan pengguna → **project JSON** → `scripts/build.js` → **satu file `<NamaScript>.lua`**.
Generator, validator, dan pengecek sintaks Lua sudah ada di `lib/`; jangan menulis Lua script utama dengan tangan.

## Aturan keras
1. UI **hanya LuluUI**. Jangan pakai Rayfield/Orion/Kavo/dll. dan jangan `Instance.new("ScreenGui")`. Custom Lua hanya untuk logika, bukan UI.
2. Hasil **satu file** `<NamaScript>.lua`. LuluUI **tidak ditanam**; script memuatnya dari URL raw GitHub milik pengguna (`project.luluUrl`). Versi LuluUI yang benar: `references/LuluUI.patched.lua` (sudah ditambal, wajib diupload pengguna ke GitHub-nya sendiri; versi asli tidak kompatibel).
3. Jangan mengarang path. Path game harus dari pengguna atau dari hasil `snippets/scan_paths.lua` / `snippets/remote_spy.lua`. Bila belum ada, minta pengguna menjalankan snippet itu dan menempel hasilnya (format `Path | Class | argumen`).
4. Sampaikan jujur: hasil diuji di tiruan Roblox, **belum** di Roblox/Delta sungguhan; dukungan fungsi executor berbeda-beda; menjalankan script via executor melanggar ToS Roblox dan berisiko akun diblokir. Cukup satu kalimat di akhir, tanpa ceramah.

## Alur
1. **Tangkap kebutuhan** (tanya hanya yang benar-benar kurang, maksimal 1 putaran): apa yang dilakukan script, path/Remote + argumen, apa pemicunya (timer, nilai berubah, objek muncul, tombol), kondisi, UI yang diinginkan, URL raw LuluUI, nama script. Boleh mulai dari template: `node scripts/build.js --list-templates`.
2. **Tulis project JSON** mengikuti `references/schema.md` (bentuk ringkas: operand `@widget:ID`, kondisi `["@watcher:w.value", ">=", 10]`, bind `"rule:r1"`). Contoh jadi: `examples/auto-collect.json`, `examples/farm-advanced.json`. Pola desain tiga lapis: **Target** (path) → **Logic** (watcher → rule/kondisi → aksi, makro, profil) → **UI** (widget yang diikat ke logic).
3. **Bangun**: `node scripts/build.js --in project.json --out ./hasil --url <RAW_URL>`. Keluaran JSON: `ok`, `errors`, `issues[]`, `lua.ok`. Perbaiki project sampai `ok: true` dan tidak ada peringatan penting (kecuali yang sengaja). `--check` hanya validasi; `--dump-config` menyimpan bentuk lengkap.
4. **Serahkan** file `.lua` ke pengguna (kirim sebagai file), plus 3–5 baris: cara pakai (upload `LuluUI.lua` → isi URL raw → jalankan), fitur UI-nya, dan satu catatan batasan (poin 4 di atas). Jangan menempelkan seluruh kode di chat.

## Praktik desain yang baik
- Satu **Toggle** per fitur otomatis (ikat ke rule/makro), plus tombol **Stop Semua** (`"bind": "stopall"`).
- Nilai yang bisa diatur pengguna (jumlah, jeda, mode) → NumberInput/Segment/Dropdown, dipakai lewat `@widget:ID` agar terbaca saat aksi jalan.
- Beri `cooldown` pada rule yang dipicu event sering; jangan interval < 0.1 dtk; hindari rule yang mengubah Value yang ia pantau sendiri.
- Aksi `log` + widget `List` ber-`isLog:true` untuk riwayat; `notify` untuk kejadian penting.
- Game spesifik → isi `project.placeIds` dan `placeGuard`.
- Pakai `profiles` + Dropdown `"profiles": true` bila ada beberapa preset.
- Mode `enabled:false` pada rule/watcher yang dikendalikan Toggle.

## Menangani masalah
- `errors` validasi: baca `msg`, perbaiki referensi (ID target/aksi/watcher/widget harus ada, argumen wajib terisi).
- `lua.globals` tidak kosong biasanya dari `custom` Lua: deklarasikan `local` atau pakai variabel yang tersedia (ctx, S, R, T, LP, Log).
- Pengguna melaporkan error di executor: minta pesan error + baris, cari di file, perbaiki di project JSON lalu bangun ulang (jangan edit `.lua` manual kecuali diminta).

## Isi folder
- `scripts/build.js` CLI · `lib/` mesin (generator, validator, linter Lua, template, tema) · `references/schema.md` skema lengkap · `references/LuluUI.patched.lua` LuluUI hasil tambalan · `snippets/` pencari path & remote spy · `examples/` contoh project.
- Perlu Node.js ≥ 16. Tanpa dependensi.
