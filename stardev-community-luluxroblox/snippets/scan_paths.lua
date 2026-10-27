-- Pencari path: jalankan di executor, hasil disalin ke clipboard (tempel di Lulu Script Builder > Target > Impor)
local out, n = {}, 0
local want = { RemoteEvent = true, RemoteFunction = true, BindableEvent = true, BindableFunction = true, ProximityPrompt = true, ClickDetector = true,
  IntValue = true, NumberValue = true, StringValue = true, BoolValue = true, ObjectValue = true, Tool = true }
local function path(i)
  local names, c = {}, i
  while c and c ~= game do table.insert(names, 1, c.Name); c = c.Parent end
  local dot = false
  for _, nm in ipairs(names) do if nm:find("%.") then dot = true end end
  return table.concat(names, dot and "/" or ".")
end
local roots = { game:GetService("ReplicatedStorage"), workspace, game:GetService("Players").LocalPlayer, game:GetService("ReplicatedFirst") }
for _, r in ipairs(roots) do
  for _, d in ipairs(r:GetDescendants()) do
    if want[d.ClassName] and n < 1500 then n += 1; out[#out + 1] = path(d) .. " | " .. d.ClassName end
  end
end
local text = table.concat(out, "\n")
if setclipboard then setclipboard(text) end
print(text)
print("[Scan] " .. n .. " item" .. (setclipboard and " (sudah disalin)" or ""))
