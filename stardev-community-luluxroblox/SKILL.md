---
name: stardev-community-luluxroblox
description: A Claude skill designed to help Claude understand how to create ready-to-run scripts compatible with Delta and other supported executors (support for other Delta-compatible environments is still to be determined). It uses the built-in UI library, Lulu UI v1.4.0. In future Skill version 1.0.1, integration with Dex++ and a customized version of Simple Spy will be added.
---

# StarDev Community LuluXRoblox

Mengubah permintaan pengguna → **project JSON** → `scripts/build.js` → **satu file `<NamaScript>.lua`**.
Generator, validator, dan pengecek sintaks Lua sudah ada di `lib/`; jangan menulis Lua script utama dengan tangan.

## Aturan keras
1. UI **hanya LuluUI**. Jangan pakai Rayfield/Orion/Kavo/dll. dan jangan `Instance.new("ScreenGui")`. Custom Lua hanya untuk logika, bukan UI.
2. Hasil **satu file** `<NamaScript>.lua`. LuluUI **tidak ditanam**; script memuatnya dari URL raw (`project.luluUrl`). **URL default: `https://raw.githubusercontent.com/stardev-community/XROBLOX/refs/heads/main/LuluUI.lua`** — pakai ini kecuali pengguna menyebut URL lain. Versi LuluUI yang benar: `references/LuluUI.patched.lua` (sudah ditambal; versi asli tidak kompatibel). **Jangan membaca file itu utuh** (±4.000 baris, boros token): cukup `references/schema.md`, dan bila perlu detail satu widget, cari dengan grep lalu baca bagian itu saja.
3. Jangan mengarang path. Path game harus dari pengguna atau dari hasil `snippets/scan_paths.lua` / `snippets/remote_spy.lua`. Bila belum ada, berikan alat yang sesuai ke pengguna sebagai file (present_files) dan minta ia menjalankannya lalu menempel hasilnya (format `Path | Class | argumen`):
   - `tools/Dex++.lua` → menjelajah Explorer game untuk mencari path/Instance (Remote, Value, dll.)
   - `tools/SimpleSpy.lua` → memantau Remote untuk mencari argumen yang dikirim
   - Jika file di `tools/` masih kosong, pakai `snippets/scan_paths.lua` dan `snippets/remote_spy.lua`.
4. Sampaikan jujur: hasil diuji di tiruan Roblox, **belum** di Roblox/Delta sungguhan; dukungan fungsi executor berbeda-beda; menjalankan script via executor melanggar ToS Roblox dan berisiko akun diblokir. Cukup satu kalimat di akhir, tanpa ceramah.

## Alur
1. **Tangkap kebutuhan** (tanya hanya yang benar-benar kurang, maksimal 1 putaran): apa yang dilakukan script, path/Remote + argumen, apa pemicunya (timer, nilai berubah, objek muncul, tombol), kondisi, UI yang diinginkan, nama script (URL LuluUI tidak perlu ditanyakan, pakai default). Boleh mulai dari template: `node scripts/build.js --list-templates`.
2. **Tulis project JSON** mengikuti `references/schema.md` (bentuk ringkas: operand `@widget:ID`, kondisi `["@watcher:w.value", ">=", 10]`, bind `"rule:r1"`). Contoh jadi: `examples/auto-collect.json`, `examples/farm-advanced.json`. Pola desain tiga lapis: **Target** (path) → **Logic** (watcher → rule/kondisi → aksi, makro, profil) → **UI** (widget yang diikat ke logic).
3. **Bangun**: `node scripts/build.js --in project.json --out ./hasil --url https://raw.githubusercontent.com/stardev-community/XROBLOX/refs/heads/main/LuluUI.lua` (bisa dihilangkan, default sudah terisi). Keluaran JSON: `ok`, `errors`, `issues[]`, `lua.ok`. Perbaiki project sampai `ok: true` dan tidak ada peringatan penting (kecuali yang sengaja). `--check` hanya validasi; `--dump-config` menyimpan bentuk lengkap.
4. **Serahkan** file `.lua` ke pengguna (kirim sebagai file), plus 3–5 baris: cara pakai (jalankan `<NamaScript>.lua` di executor; LuluUI dimuat otomatis dari URL default), fitur UI-nya, dan satu catatan batasan (poin 4 di atas). Jangan menempelkan seluruh kode di chat.

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
- `scripts/build.js` CLI · `lib/` mesin (generator, validator, linter Lua, template, tema) · `references/schema.md` skema lengkap · `references/LuluUI.patched.lua` LuluUI hasil tambalan · `tools/` Dex++ & Simple Spy · `snippets/` pencari path & remote spy ringan · `examples/` contoh project.
- Perlu Node.js ≥ 16. Tanpa dependensi.
