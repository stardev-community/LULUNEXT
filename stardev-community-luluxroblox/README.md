# Lulu Script Builder — Claude Skill

Folder ini adalah **Claude skill** (`SKILL.md`). Cara pakai:
- Upload folder `stardev-community-luluxroblox/` ke repo GitHub, atau zip foldernya lalu unggah di Claude (Settings → Capabilities → Skills).
- Lalu minta: "buatkan script auto collect pakai LuluUI…". Claude menulis project JSON, menjalankan `scripts/build.js`, dan mengirim `<Nama>.lua`.

LuluUI dimuat dari URL default `https://raw.githubusercontent.com/stardev-community/XROBLOX/refs/heads/main/LuluUI.lua`; ganti lewat `project.luluUrl` atau `--url` kalau pakai repo lain.

Uji cepat: `node scripts/build.js --in examples/auto-collect.json --out ./hasil`
