--// Anchored Alpha ESP - by h6rnyx.v
--// Key System powered by h6rnyx-keyserver

-- ============================================================
-- KEY SYSTEM
-- ============================================================
local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local LP = Players.LocalPlayer

local KEY_SERVER = "https://h6rnyx-keyserver.vercel.app/api/checkkey"
local WORKINK_LINK = "https://work.ink/2tqZ/keyserver"

local function checkKey(key)
    local httpFunc = (syn and syn.request) or (http and http.request) or request
    if not httpFunc then return false, "Tu executor no soporta HTTP" end
    local ok, res = pcall(httpFunc, {
        Url = KEY_SERVER,
        Method = "POST",
        Headers = { ["Content-Type"] = "application/json" },
        Body = HttpService:JSONEncode({ key = key })
    })
    if not ok or not res then return false, "Error de conexión" end
    local parsed = pcall(function() res.Data = HttpService:JSONDecode(res.Body) end)
    if res.Data and res.Data.valid then
        return true, "OK"
    end
    return false, (res.Data and res.Data.message) or "Key inválida"
end

-- GUI de key
local keyGui = Instance.new("ScreenGui", LP.PlayerGui)
keyGui.Name = "KeySystem"
keyGui.ResetOnSpawn = false
keyGui.DisplayOrder = 9999

local bg = Instance.new("Frame", keyGui)
bg.Size = UDim2.new(1, 0, 1, 0)
bg.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
bg.BackgroundTransparency = 0.4
bg.BorderSizePixel = 0

local box = Instance.new("Frame", keyGui)
box.Size = UDim2.new(0, 340, 0, 200)
box.Position = UDim2.new(0.5, -170, 0.5, -100)
box.BackgroundColor3 = Color3.fromRGB(14, 14, 20)
box.BorderSizePixel = 0
Instance.new("UICorner", box).CornerRadius = UDim.new(0, 14)
local st = Instance.new("UIStroke", box)
st.Color = Color3.fromRGB(80, 40, 160)
st.Thickness = 1.5

local title = Instance.new("TextLabel", box)
title.Size = UDim2.new(1, 0, 0, 36)
title.Position = UDim2.new(0, 0, 0, 0)
title.Text = "Anchored Alpha ESP"
title.Font = Enum.Font.SourceSansBold
title.TextSize = 16
title.TextColor3 = Color3.fromRGB(200, 170, 255)
title.BackgroundTransparency = 1

local sub = Instance.new("TextLabel", box)
sub.Size = UDim2.new(1, 0, 0, 20)
sub.Position = UDim2.new(0, 0, 0, 32)
sub.Text = "Ingresa tu key para continuar"
sub.Font = Enum.Font.SourceSans
sub.TextSize = 12
sub.TextColor3 = Color3.fromRGB(120, 90, 180)
sub.BackgroundTransparency = 1

local inputBox = Instance.new("TextBox", box)
inputBox.Size = UDim2.new(1, -32, 0, 36)
inputBox.Position = UDim2.new(0, 16, 0, 66)
inputBox.PlaceholderText = "Pega tu key aquí..."
inputBox.Text = ""
inputBox.Font = Enum.Font.Code
inputBox.TextSize = 12
inputBox.TextColor3 = Color3.fromRGB(220, 220, 255)
inputBox.PlaceholderColor3 = Color3.fromRGB(90, 80, 120)
inputBox.BackgroundColor3 = Color3.fromRGB(22, 20, 36)
inputBox.BorderSizePixel = 0
inputBox.ClearTextOnFocus = false
Instance.new("UICorner", inputBox).CornerRadius = UDim.new(0, 8)

local statusLbl = Instance.new("TextLabel", box)
statusLbl.Size = UDim2.new(1, -32, 0, 20)
statusLbl.Position = UDim2.new(0, 16, 0, 108)
statusLbl.Text = ""
statusLbl.Font = Enum.Font.SourceSans
statusLbl.TextSize = 12
statusLbl.TextColor3 = Color3.fromRGB(255, 100, 100)
statusLbl.BackgroundTransparency = 1
statusLbl.TextXAlignment = Enum.TextXAlignment.Left

local getKeyBtn = Instance.new("TextButton", box)
getKeyBtn.Size = UDim2.new(0, 130, 0, 34)
getKeyBtn.Position = UDim2.new(0, 16, 0, 148)
getKeyBtn.BackgroundColor3 = Color3.fromRGB(40, 36, 60)
getKeyBtn.Text = "Obtener Key →"
getKeyBtn.Font = Enum.Font.SourceSansBold
getKeyBtn.TextSize = 12
getKeyBtn.TextColor3 = Color3.fromRGB(160, 130, 255)
getKeyBtn.BorderSizePixel = 0
Instance.new("UICorner", getKeyBtn).CornerRadius = UDim.new(0, 8)

local activateBtn = Instance.new("TextButton", box)
activateBtn.Size = UDim2.new(0, 150, 0, 34)
activateBtn.Position = UDim2.new(1, -166, 0, 148)
activateBtn.BackgroundColor3 = Color3.fromRGB(80, 40, 160)
activateBtn.Text = "Activar"
activateBtn.Font = Enum.Font.SourceSansBold
activateBtn.TextSize = 13
activateBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
activateBtn.BorderSizePixel = 0
Instance.new("UICorner", activateBtn).CornerRadius = UDim.new(0, 8)

getKeyBtn.MouseButton1Click:Connect(function()
    setclipboard(WORKINK_LINK)
    statusLbl.TextColor3 = Color3.fromRGB(160, 130, 255)
    statusLbl.Text = "Link copiado. Abriendo work.ink..."
end)

local checking = false
activateBtn.MouseButton1Click:Connect(function()
    if checking then return end
    local key = inputBox.Text
    if key == "" then
        statusLbl.TextColor3 = Color3.fromRGB(255, 100, 100)
        statusLbl.Text = "Ingresa una key primero."
        return
    end
    checking = true
    activateBtn.Text = "Verificando..."
    statusLbl.TextColor3 = Color3.fromRGB(200, 170, 255)
    statusLbl.Text = "Validando key..."

    local valid, msg = checkKey(key)
    if valid then
        statusLbl.TextColor3 = Color3.fromRGB(100, 255, 160)
        statusLbl.Text = "Key válida. Cargando ESP..."
        task.wait(0.8)
        keyGui:Destroy()
        -- El ESP carga a continuación
    else
        statusLbl.TextColor3 = Color3.fromRGB(255, 100, 100)
        statusLbl.Text = "❌ " .. msg
        activateBtn.Text = "Activar"
        checking = false
    end
end)

-- Esperar a que el usuario active la key antes de correr el ESP
repeat task.wait() until not keyGui.Parent

-- ============================================================
-- ESP (carga solo después de validar la key)
-- ============================================================
local RunService = game:GetService("RunService")
local Lighting = game:GetService("Lighting")
local UIS = game:GetService("UserInputService")
local TS = game:GetService("TweenService")

local gui = Instance.new("ScreenGui", LP.PlayerGui)
gui.Name = "AnchoredESP"
gui.ResetOnSpawn = false
gui.DisplayOrder = 999

local minimized = false

local Main = Instance.new("Frame", gui)
Main.Size = UDim2.new(0, 210, 0, 330)
Main.Position = UDim2.new(0, 8, 0.5, -165)
Main.BackgroundColor3 = Color3.fromRGB(14, 14, 20)
Main.BorderSizePixel = 0
Instance.new("UICorner", Main).CornerRadius = UDim.new(0, 12)
local stroke = Instance.new("UIStroke", Main)
stroke.Color = Color3.fromRGB(80, 40, 160)
stroke.Thickness = 1.5

local fullSize = Main.Size

-- TOP BAR
local Top = Instance.new("Frame", Main)
Top.Size = UDim2.new(1, 0, 0, 42)
Top.BackgroundColor3 = Color3.fromRGB(18, 18, 28)
Top.BorderSizePixel = 0
Instance.new("UICorner", Top).CornerRadius = UDim.new(0, 12)

local TopPatch = Instance.new("Frame", Top)
TopPatch.Size = UDim2.new(1, 0, 0.5, 0)
TopPatch.Position = UDim2.new(0, 0, 0.5, 0)
TopPatch.BackgroundColor3 = Top.BackgroundColor3
TopPatch.BorderSizePixel = 0

local TitleL = Instance.new("TextLabel", Top)
TitleL.Size = UDim2.new(1, -50, 0, 22)
TitleL.Position = UDim2.new(0, 10, 0, 4)
TitleL.Text = "Anchored Alpha ESP"
TitleL.Font = Enum.Font.SourceSansBold
TitleL.TextSize = 13
TitleL.TextColor3 = Color3.fromRGB(200, 170, 255)
TitleL.TextXAlignment = Enum.TextXAlignment.Left
TitleL.BackgroundTransparency = 1

local SubL = Instance.new("TextLabel", Top)
SubL.Size = UDim2.new(1, -50, 0, 13)
SubL.Position = UDim2.new(0, 10, 0, 24)
SubL.Text = "Made by h6rnyx.v"
SubL.Font = Enum.Font.SourceSans
SubL.TextSize = 10
SubL.TextColor3 = Color3.fromRGB(120, 90, 180)
SubL.TextXAlignment = Enum.TextXAlignment.Left
SubL.BackgroundTransparency = 1

local MinBtn = Instance.new("TextButton", Top)
MinBtn.Size = UDim2.new(0, 26, 0, 26)
MinBtn.Position = UDim2.new(1, -32, 0.5, -13)
MinBtn.BackgroundColor3 = Color3.fromRGB(255, 200, 50)
MinBtn.Text = "-"
MinBtn.Font = Enum.Font.SourceSansBold
MinBtn.TextSize = 18
MinBtn.TextColor3 = Color3.fromRGB(60, 40, 0)
MinBtn.BorderSizePixel = 0
Instance.new("UICorner", MinBtn).CornerRadius = UDim.new(1, 0)

MinBtn.MouseButton1Click:Connect(function()
    minimized = not minimized
    MinBtn.Text = minimized and "+" or "-"
    TS:Create(Main, TweenInfo.new(0.2, Enum.EasingStyle.Quad), {
        Size = minimized and UDim2.new(0, 210, 0, 42) or fullSize
    }):Play()
end)

-- DRAG
local dragging, dragStart, startPos = false, nil, nil
Top.InputBegan:Connect(function(i)
    if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
        dragging = true
        dragStart = i.Position
        startPos = Main.Position
        i.Changed:Connect(function()
            if i.UserInputState == Enum.UserInputState.End then dragging = false end
        end)
    end
end)
UIS.InputChanged:Connect(function(i)
    if dragging and (i.UserInputType == Enum.UserInputType.MouseMovement or i.UserInputType == Enum.UserInputType.Touch) then
        local d = i.Position - dragStart
        Main.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + d.X, startPos.Y.Scale, startPos.Y.Offset + d.Y)
    end
end)

-- CONTENT
local Content = Instance.new("Frame", Main)
Content.Size = UDim2.new(1, 0, 1, -42)
Content.Position = UDim2.new(0, 0, 0, 42)
Content.BackgroundTransparency = 1
Content.ClipsDescendants = true

local Layout = Instance.new("UIListLayout", Content)
Layout.Padding = UDim.new(0, 4)
local Pad = Instance.new("UIPadding", Content)
Pad.PaddingTop = UDim.new(0, 6)
Pad.PaddingLeft = UDim.new(0, 8)
Pad.PaddingRight = UDim.new(0, 8)

local fast = TweenInfo.new(0.15, Enum.EasingStyle.Quad)

local function Section(parent, text)
    local frame = Instance.new("Frame", parent)
    frame.Size = UDim2.new(1, 0, 0, 18)
    frame.BackgroundColor3 = Color3.fromRGB(30, 25, 50)
    frame.BorderSizePixel = 0
    Instance.new("UICorner", frame).CornerRadius = UDim.new(0, 6)
    local lbl = Instance.new("TextLabel", frame)
    lbl.Size = UDim2.new(1, 0, 1, 0)
    lbl.Text = text
    lbl.Font = Enum.Font.SourceSansBold
    lbl.TextSize = 10
    lbl.TextColor3 = Color3.fromRGB(160, 120, 255)
    lbl.BackgroundTransparency = 1
    lbl.TextXAlignment = Enum.TextXAlignment.Center
end

local function Toggle(parent, text, color, onChange)
    local state = false
    local row = Instance.new("Frame", parent)
    row.Size = UDim2.new(1, 0, 0, 34)
    row.BackgroundColor3 = Color3.fromRGB(22, 20, 36)
    row.BorderSizePixel = 0
    Instance.new("UICorner", row).CornerRadius = UDim.new(0, 8)

    local lbl = Instance.new("TextLabel", row)
    lbl.Size = UDim2.new(1, -56, 1, 0)
    lbl.Position = UDim2.new(0, 10, 0, 0)
    lbl.Text = text
    lbl.Font = Enum.Font.SourceSansBold
    lbl.TextSize = 12
    lbl.TextColor3 = Color3.fromRGB(210, 210, 255)
    lbl.TextXAlignment = Enum.TextXAlignment.Left
    lbl.BackgroundTransparency = 1

    local track = Instance.new("TextButton", row)
    track.Size = UDim2.new(0, 40, 0, 22)
    track.Position = UDim2.new(1, -48, 0.5, -11)
    track.BackgroundColor3 = Color3.fromRGB(40, 36, 60)
    track.Text = ""
    track.BorderSizePixel = 0
    Instance.new("UICorner", track).CornerRadius = UDim.new(1, 0)

    local thumb = Instance.new("Frame", track)
    thumb.Size = UDim2.new(0, 16, 0, 16)
    thumb.Position = UDim2.new(0, 3, 0.5, -8)
    thumb.BackgroundColor3 = Color3.new(1, 1, 1)
    thumb.BorderSizePixel = 0
    Instance.new("UICorner", thumb).CornerRadius = UDim.new(1, 0)

    track.MouseButton1Click:Connect(function()
        state = not state
        TS:Create(track, fast, { BackgroundColor3 = state and color or Color3.fromRGB(40, 36, 60) }):Play()
        TS:Create(thumb, fast, { Position = state and UDim2.new(1, -19, 0.5, -8) or UDim2.new(0, 3, 0.5, -8) }):Play()
        if onChange then onChange(state) end
    end)
end

-- ============================================================
-- VISUALS
-- ============================================================
Section(Content, "~ VISUALS ~")

local enemyESP = false
Toggle(Content, "Enemy ESP", Color3.fromRGB(255, 80, 80), function(v)
    enemyESP = v
    if not v then
        for _, obj in pairs(workspace:GetDescendants()) do
            local h = obj:FindFirstChild("EnemyESP")
            if h then h:Destroy() end
            local head = obj:FindFirstChild("Head")
            if head then
                local bb = head:FindFirstChild("EnemyName")
                if bb then bb:Destroy() end
            end
        end
    end
end)

task.spawn(function()
    while true do
        if enemyESP then
            for _, obj in pairs(workspace:GetDescendants()) do
                if obj:IsA("Model") and obj ~= LP.Character then
                    local hum = obj:FindFirstChildOfClass("Humanoid")
                    if hum and not Players:GetPlayerFromCharacter(obj) then
                        if not obj:FindFirstChild("EnemyESP") then
                            local h = Instance.new("Highlight", obj)
                            h.Name = "EnemyESP"
                            h.FillColor = Color3.fromRGB(255, 50, 50)
                            h.OutlineColor = Color3.fromRGB(255, 100, 0)
                            h.FillTransparency = 0.4
                            h.OutlineTransparency = 0
                            local head = obj:FindFirstChild("Head")
                            if head and not head:FindFirstChild("EnemyName") then
                                local bb = Instance.new("BillboardGui", head)
                                bb.Name = "EnemyName"
                                bb.Size = UDim2.new(0, 130, 0, 44)
                                bb.StudsOffset = Vector3.new(0, 3, 0)
                                bb.AlwaysOnTop = true
                                local nl = Instance.new("TextLabel", bb)
                                nl.Size = UDim2.new(1, 0, 0.55, 0)
                                nl.Text = obj.Name
                                nl.Font = Enum.Font.SourceSansBold
                                nl.TextSize = 13
                                nl.TextColor3 = Color3.fromRGB(255, 120, 120)
                                nl.BackgroundTransparency = 1
                                nl.TextStrokeTransparency = 0.3
                                local hpL = Instance.new("TextLabel", bb)
                                hpL.Size = UDim2.new(1, 0, 0.45, 0)
                                hpL.Position = UDim2.new(0, 0, 0.55, 0)
                                hpL.Font = Enum.Font.SourceSans
                                hpL.TextSize = 11
                                hpL.TextColor3 = Color3.fromRGB(100, 255, 100)
                                hpL.BackgroundTransparency = 1
                                hpL.TextStrokeTransparency = 0.3
                                task.spawn(function()
                                    while hum and hum.Parent do
                                        hpL.Text = "HP: " .. math.floor(hum.Health) .. "/" .. math.floor(hum.MaxHealth)
                                        task.wait(0.2)
                                    end
                                end)
                            end
                        end
                    end
                end
            end
        end
        task.wait(1)
    end
end)

local panelESPEnabled = false
Toggle(Content, "Panel ESP", Color3.fromRGB(0, 180, 255), function(v)
    panelESPEnabled = v
    local panelKeywords = { "panel", "button", "lever", "switch", "trigger", "interact", "press", "activate", "console", "terminal", "pad" }
    if v then
        task.spawn(function()
            while panelESPEnabled do
                for _, obj in pairs(workspace:GetDescendants()) do
                    if obj:IsA("Model") then
                        local name = obj.Name:lower()
                        for _, kw in pairs(panelKeywords) do
                            if name:find(kw) then
                                local target = obj.PrimaryPart or obj:FindFirstChildWhichIsA("BasePart")
                                if not target then break end
                                local isDone = false
                                for _, part in pairs(obj:GetDescendants()) do
                                    if part:IsA("BasePart") then
                                        local c = part.Color
                                        if c.G > 0.7 and c.R < 0.4 then isDone = true break end
                                    end
                                end
                                local h = obj:FindFirstChild("PanelESP")
                                if not h then
                                    h = Instance.new("Highlight", obj)
                                    h.Name = "PanelESP"
                                    local bb = Instance.new("BillboardGui", target)
                                    bb.Name = "PanelESP"
                                    bb.Size = UDim2.new(0, 120, 0, 24)
                                    bb.StudsOffset = Vector3.new(0, 3.5, 0)
                                    bb.AlwaysOnTop = true
                                    local lbl = Instance.new("TextLabel", bb)
                                    lbl.Name = "Label"
                                    lbl.Size = UDim2.new(1, 0, 1, 0)
                                    lbl.Font = Enum.Font.SourceSansBold
                                    lbl.TextSize = 12
                                    lbl.BackgroundTransparency = 1
                                    lbl.TextStrokeTransparency = 0.3
                                end
                                local bb = target:FindFirstChild("PanelESP")
                                local lbl = bb and bb:FindFirstChild("Label")
                                if isDone then
                                    h.FillColor = Color3.fromRGB(80, 255, 120)
                                    h.OutlineColor = Color3.fromRGB(120, 255, 160)
                                    if lbl then lbl.Text = "✔ COMPLETADO" lbl.TextColor3 = Color3.fromRGB(120, 255, 160) end
                                else
                                    h.FillColor = Color3.fromRGB(0, 180, 255)
                                    h.OutlineColor = Color3.fromRGB(100, 220, 255)
                                    if lbl then
                                        local mapNum = obj.Name:match("%d+")
                                        lbl.Text = mapNum and ("Panel - Map " .. mapNum) or obj.Name
                                        lbl.TextColor3 = Color3.fromRGB(100, 220, 255)
                                    end
                                end
                                h.FillTransparency = 0.4
                                h.OutlineTransparency = 0
                                break
                            end
                        end
                    end
                end
                task.wait(0.5)
            end
        end)
    else
        for _, obj in pairs(workspace:GetDescendants()) do
            local h = obj:FindFirstChild("PanelESP")
            if h then h:Destroy() end
        end
    end
end)

Toggle(Content, "Door ESP", Color3.fromRGB(100, 255, 160), function(v)
    local doorKeywords = { "door", "gate", "portal", "exit", "next", "floor", "stage", "level", "checkpoint", "warp", "teleport" }
    if v then
        for _, obj in pairs(workspace:GetDescendants()) do
            if obj:IsA("Model") then
                local name = obj.Name:lower()
                for _, kw in pairs(doorKeywords) do
                    if name:find(kw) then
                        if not obj:FindFirstChild("DoorESP") then
                            local target = obj.PrimaryPart or obj:FindFirstChildWhichIsA("BasePart")
                            if target then
                                local h = Instance.new("Highlight", obj)
                                h.Name = "DoorESP"
                                h.FillColor = Color3.fromRGB(100, 255, 160)
                                h.OutlineColor = Color3.fromRGB(150, 255, 200)
                                h.FillTransparency = 0.4
                                h.OutlineTransparency = 0
                                local bb = Instance.new("BillboardGui", target)
                                bb.Name = "DoorESP"
                                bb.Size = UDim2.new(0, 120, 0, 24)
                                bb.StudsOffset = Vector3.new(0, 3.5, 0)
                                bb.AlwaysOnTop = true
                                local lbl = Instance.new("TextLabel", bb)
                                lbl.Size = UDim2.new(1, 0, 1, 0)
                                lbl.Text = obj.Name
                                lbl.Font = Enum.Font.SourceSansBold
                                lbl.TextSize = 12
                                lbl.TextColor3 = Color3.fromRGB(150, 255, 200)
                                lbl.BackgroundTransparency = 1
                                lbl.TextStrokeTransparency = 0.3
                            end
                        end
                        break
                    end
                end
            end
        end
    else
        for _, obj in pairs(workspace:GetDescendants()) do
            local h = obj:FindFirstChild("DoorESP")
            if h then h:Destroy() end
        end
    end
end)

Toggle(Content, "Fullbright", Color3.fromRGB(255, 255, 100), function(v)
    local origAmbient = Lighting.Ambient
    local origBrightness = Lighting.Brightness
    local origFogEnd = Lighting.FogEnd
    local origShadows = Lighting.GlobalShadows
    local origClock = Lighting.ClockTime
    if v then
        Lighting.Ambient = Color3.fromRGB(255, 255, 255)
        Lighting.Brightness = 2
        Lighting.FogEnd = 100000
        Lighting.GlobalShadows = false
        Lighting.ClockTime = 14
    else
        Lighting.Ambient = origAmbient
        Lighting.Brightness = origBrightness
        Lighting.FogEnd = origFogEnd
        Lighting.GlobalShadows = origShadows
        Lighting.ClockTime = origClock
    end
end)

-- ============================================================
-- AUTOFARM
-- ============================================================
Section(Content, "~ AUTOFARM ~")

local coinESP = false
local coinFarmConn

Toggle(Content, "Coin Collector", Color3.fromRGB(255, 200, 0), function(v)
    coinESP = v
    if v then
        for _, obj in pairs(workspace:GetDescendants()) do
            if obj.Name == "SingleCipher" and not obj:FindFirstChild("CoinESP") then
                local target = obj:IsA("Model") and (obj.PrimaryPart or obj:FindFirstChildWhichIsA("BasePart")) or (obj:IsA("BasePart") and obj or nil)
                if target then
                    local h = Instance.new("Highlight", obj:IsA("Model") and obj or target)
                    h.Name = "CoinESP"
                    h.FillColor = Color3.fromRGB(255, 200, 0)
                    h.OutlineColor = Color3.fromRGB(255, 240, 100)
                    h.FillTransparency = 0.2
                    h.OutlineTransparency = 0
                    local bb = Instance.new("BillboardGui", target)
                    bb.Name = "CoinESP"
                    bb.Size = UDim2.new(0, 100, 0, 22)
                    bb.StudsOffset = Vector3.new(0, 2.5, 0)
                    bb.AlwaysOnTop = true
                    local lbl = Instance.new("TextLabel", bb)
                    lbl.Size = UDim2.new(1, 0, 1, 0)
                    lbl.Text = "SingleCipher"
                    lbl.Font = Enum.Font.SourceSansBold
                    lbl.TextSize = 11
                    lbl.TextColor3 = Color3.fromRGB(255, 220, 50)
                    lbl.BackgroundTransparency = 1
                    lbl.TextStrokeTransparency = 0.3
                end
            end
        end
        workspace.DescendantAdded:Connect(function(obj)
            if not coinESP then return end
            if obj.Name == "SingleCipher" and not obj:FindFirstChild("CoinESP") then
                local target = obj:IsA("BasePart") and obj
                    or (obj:IsA("Model") and (obj.PrimaryPart or obj:FindFirstChildWhichIsA("BasePart")))
                if target then
                    local h = Instance.new("Highlight", obj:IsA("Model") and obj or target)
                    h.Name = "CoinESP"
                    h.FillColor = Color3.fromRGB(255, 200, 0)
                    h.OutlineColor = Color3.fromRGB(255, 240, 100)
                    h.FillTransparency = 0.2
                    h.OutlineTransparency = 0
                end
            end
        end)
        coinFarmConn = task.spawn(function()
            while coinESP do
                local char = LP.Character
                local hrp = char and char:FindFirstChild("HumanoidRootPart")
                local hum = char and char:FindFirstChildOfClass("Humanoid")
                if hrp and hum and hum.Health > 0 then
                    for _, obj in pairs(workspace:GetDescendants()) do
                        if not coinESP then break end
                        if obj.Name == "SingleCipher" then
                            local part = obj:IsA("BasePart") and obj
                                or (obj:IsA("Model") and (obj.PrimaryPart or obj:FindFirstChildWhichIsA("BasePart")))
                            if part and part.Parent then
                                part.CFrame = hrp.CFrame
                                task.wait(0.08)
                            end
                        end
                    end
                end
                task.wait(0.1)
            end
        end)
    else
        coinESP = false
        if coinFarmConn then task.cancel(coinFarmConn) coinFarmConn = nil end
        for _, obj in pairs(workspace:GetDescendants()) do
            local h = obj:FindFirstChild("CoinESP")
            if h then h:Destroy() end
        end
    end
end)
