local Client = LPMDT.Client
local Framework = Client.Framework

Client.State = Client.State or {
    nuiVisible = false,
    pendingRequests = {},
    tabletProp = nil,
}

local State = Client.State

local animDict = "amb@code_human_in_bus_passenger_idles@female@tablet@idle_a"
local animName = "idle_a"
local propModel = "prop_cs_tablet"
local propBone = 28422

-- Prechargement du dict d'anim et du modele au demarrage
CreateThread(function()
    RequestAnimDict(animDict)
    RequestModel(GetHashKey(propModel))
end)

local function playTabletAnim()
    local ped = PlayerPedId()

    if not HasAnimDictLoaded(animDict) then
        RequestAnimDict(animDict)
        while not HasAnimDictLoaded(animDict) do Wait(10) end
    end

    TaskPlayAnim(ped, animDict, animName, 8.0, -8.0, -1, 49, 0, false, false, false)

    local model = GetHashKey(propModel)
    if not HasModelLoaded(model) then
        RequestModel(model)
        while not HasModelLoaded(model) do Wait(10) end
    end

    local prop = CreateObject(model, 0.0, 0.0, 0.0, true, true, false)
    SetEntityAsMissionEntity(prop, true, true)
    AttachEntityToEntity(prop, ped, GetPedBoneIndex(ped, propBone),
        -0.05, 0.0, 0.0,
        0.0, -90.0, 0.0,
        true, true, false, true, 1, true)

    State.tabletProp = prop
end

local function stopTabletAnim()
    local ped = PlayerPedId()

    if State.tabletProp and DoesEntityExist(State.tabletProp) then
        DetachEntity(State.tabletProp, true, true)
        SetEntityAsMissionEntity(State.tabletProp, false, true)
        DeleteObject(State.tabletProp)
        State.tabletProp = nil
    end

    StopAnimTask(ped, animDict, animName, 3.0)
end

local function resolvePendingRequest(requestId, payload)
    if type(requestId) ~= 'string' then
        return
    end

    local pending = State.pendingRequests[requestId]

    if pending then
        State.pendingRequests[requestId] = nil

        if pending.timer then
            ClearTimeout(pending.timer)
        end

        pending.cb(payload)
    end
end

local function registerPendingRequest(requestId, cb)
    local timeoutId = SetTimeout(30000, function()
        resolvePendingRequest(requestId, { ok = false, error = 'timeout' })
    end)

    State.pendingRequests[requestId] = {
        cb = cb,
        timer = timeoutId,
    }
end

local function setMdtVisible(state, payload)
    State.nuiVisible = state
    SetNuiFocus(state, state)

    if state then
        CreateThread(playTabletAnim)
    else
        stopTabletAnim()
    end

    SendNUIMessage({
        type = 'lpmdt:toggle',
        visible = state,
        profile = (payload and payload.profile) or Framework.getMdtProfile(),
        permissions = payload and payload.permissions or nil,
        snapshot = payload and payload.snapshot or nil,
    })
end

-- Boucle unique de detection de la touche Escape (pas de recréation a chaque ouverture)
CreateThread(function()
    while true do
        Wait(0)
        if State.nuiVisible and IsDisabledControlJustPressed(0, 322) then
            setMdtVisible(false)
        end
    end
end)

RegisterNetEvent('lpmdt:client:open', function(payload)
    setMdtVisible(true, payload)
end)

RegisterNetEvent('lpmdt:client:syncSnapshot', function(payload)
    SendNUIMessage({
        type = 'lpmdt:syncSnapshot',
        profile = payload and payload.profile or nil,
        permissions = payload and payload.permissions or nil,
        snapshot = payload and payload.snapshot or nil,
    })
end)

RegisterNetEvent('lpmdt:client:nuiResponse', function(requestId, payload)
    resolvePendingRequest(requestId, payload)
end)

RegisterCommand(Config.OpenCommand or 'mdt', function()
    if State.nuiVisible then
        setMdtVisible(false)
        return
    end

    TriggerServerEvent('lpmdt:server:requestOpen')
end, false)

RegisterKeyMapping(Config.OpenCommand or 'mdt', 'Ouvrir le MDT', 'keyboard', Config.OpenKey or 'F10')

RegisterNUICallback('close', function(_, cb)
    setMdtVisible(false)
    cb({ ok = true })
end)

RegisterNUICallback('saveSection', function(data, cb)
    if type(data) ~= 'table' or type(data.section) ~= 'string' then
        cb({ ok = false })
        return
    end

    TriggerServerEvent('lpmdt:server:saveSection', data.section, data.payload)
    cb({ ok = true })
end)

RegisterNUICallback('uploadEvidenceImages', function(data, cb)
    if type(data) ~= 'table' or type(data.requestId) ~= 'string' or type(data.folderId) ~= 'string' or type(data.images) ~= 'table' then
        cb({ ok = false, error = 'invalid_payload' })
        return
    end

    registerPendingRequest(data.requestId, cb)
    TriggerServerEvent('lpmdt:server:uploadEvidenceImages', data.requestId, data.folderId, data.folderTitle, data.images)
end)

RegisterNUICallback('deleteEvidenceImage', function(data, cb)
    if type(data) ~= 'table' or type(data.requestId) ~= 'string' or type(data.imageId) ~= 'string' then
        cb({ ok = false, error = 'invalid_payload' })
        return
    end

    registerPendingRequest(data.requestId, cb)
    TriggerServerEvent('lpmdt:server:deleteEvidenceImage', data.requestId, data.imageId)
end)

RegisterNUICallback('uploadProofImages', function(data, cb)
    if type(data) ~= 'table' or type(data.requestId) ~= 'string' or type(data.context) ~= 'string' or type(data.images) ~= 'table' then
        cb({ ok = false, error = 'invalid_payload' })
        return
    end

    registerPendingRequest(data.requestId, cb)
    TriggerServerEvent('lpmdt:server:uploadProofImages', data.requestId, data.context, data.images)
end)

RegisterNUICallback('uploadCitizenPhoto', function(data, cb)
    if type(data) ~= 'table' or type(data.requestId) ~= 'string' or type(data.imageData) ~= 'string' then
        cb({ ok = false, error = 'invalid_payload' })
        return
    end

    registerPendingRequest(data.requestId, cb)
    TriggerServerEvent('lpmdt:server:uploadCitizenPhoto', data.requestId, data.imageData)
end)
