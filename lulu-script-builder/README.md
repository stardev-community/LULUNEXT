# Lulu Script Builder — Claude Skill

Folder ini adalah **Claude skill** (`SKILL.md`). Cara pakai:
- Upload folder `lulu-script-builder/` ke repo GitHub, atau zip foldernya lalu unggah di Claude (Settings → Capabilities → Skills).
- Lalu minta: "buatkan script auto collect pakai LuluUI…". Claude menulis project JSON, menjalankan `scripts/build.js`, dan mengirim `<Nama>.lua`.

Upload juga `references/LuluUI.patched.lua` sebagai `LuluUI.lua` ke repo GitHub Anda; URL raw-nya diisi ke `project.luluUrl`.

Uji cepat: `node scripts/build.js --in examples/auto-collect.json --out ./hasil`
