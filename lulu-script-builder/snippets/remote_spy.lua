-- Remote spy ringan: tekan aksi di game, lalu panggilan Remote tercatat. Hasil disalin tiap 20 panggilan / ketik _G.LSB_COPY()
local log, seen = {}, {}
local function path(i) local t, c = {}, i; while c and c ~= game do table.insert(t, 1, c.Name); c = c.Parent end; return table.concat(t, ".") end
local function lit(v)
  local ty = typeof(v)
  if ty == "string" then return string.format("%q", v) elseif ty == "number" or ty == "boolean" then return tostring(v) elseif v == nil then return "nil" end
  return "<" .. ty .. ">"
end
local old; old = hookmetamethod(game, "__namecall", function(self, ...)
  local m = getnamecallmethod()
  if (m == "FireServer" or m == "InvokeServer") and typeof(self) == "Instance" then
    local a = table.pack(...); local parts = {}
    for i = 1, a.n do parts[#parts + 1] = lit(a[i]) end
    local line = path(self) .. " | " .. self.ClassName .. " | " .. table.concat(parts, ", ")
    if not seen[line] then seen[line] = true; log[#log + 1] = line; if #log % 20 == 0 and setclipboard then setclipboard(table.concat(log, "\n")) end end
  end
  return old(self, ...)
end)
getgenv().LSB_COPY = function() if setclipboard then setclipboard(table.concat(log, "\n")) end print(table.concat(log, "\n")) end
print("[Spy] aktif. Panggil LSB_COPY() untuk menyalin hasil.")
