local Client = LPMDT.Client
Client.Framework = Client.Framework or {}

local Framework = Client.Framework

local function trim(value)
    if type(value) ~= 'string' then
        return ''
    end

    return value:gsub('^%s+', ''):gsub('%s+$', '')
end

function Framework.resolveFrameworkType()
    local configuredType = string.lower(tostring(Config.Framework and Config.Framework.Type or 'auto'))

    if configuredType ~= 'auto' then
        return configuredType
    end

    local esxResource = Config.Framework and Config.Framework.ESXResource or 'es_extended'
    local qbResource = Config.Framework and Config.Framework.QBCoreResource or 'qb-core'

    if GetResourceState(esxResource) == 'started' then
        return 'esx'
    end

    if GetResourceState(qbResource) == 'started' then
        return 'qbcore'
    end

    return 'standalone'
end

function Framework.getFrameworkObject()
    if Framework._object ~= nil then
        return Framework._object
    end

    local frameworkType = Framework.resolveFrameworkType()

    if frameworkType == 'esx' then
        local resourceName = Config.Framework and Config.Framework.ESXResource or 'es_extended'
        local ok, object = pcall(function()
            return exports[resourceName]:getSharedObject()
        end)

        Framework._object = ok and object or false
        return Framework._object
    end

    if frameworkType == 'qbcore' then
        local resourceName = Config.Framework and Config.Framework.QBCoreResource or 'qb-core'
        local ok, object = pcall(function()
            return exports[resourceName]:GetCoreObject()
        end)

        Framework._object = ok and object or false
        return Framework._object
    end

    Framework._object = false
    return Framework._object
end

function Framework.getMdtProfile()
    local displayName = GetPlayerName(PlayerId()) or 'Joueur Inconnu'
    local frameworkType = Framework.resolveFrameworkType()
    local frameworkObject = Framework.getFrameworkObject()

    if frameworkType == 'esx' and frameworkObject and frameworkObject.GetPlayerData then
        local okData, playerData = pcall(function()
            return frameworkObject.GetPlayerData()
        end)

        if okData and type(playerData) == 'table' then
            local firstName = playerData.firstName or playerData.firstname
            local lastName = playerData.lastName or playerData.lastname

            if type(firstName) == 'string' and firstName ~= '' and type(lastName) == 'string' and lastName ~= '' then
                displayName = firstName .. ' ' .. lastName
            elseif type(playerData.name) == 'string' and playerData.name ~= '' then
                displayName = playerData.name
            end
        end
    elseif frameworkType == 'qbcore' and frameworkObject and frameworkObject.Functions and frameworkObject.Functions.GetPlayerData then
        local okData, playerData = pcall(function()
            return frameworkObject.Functions.GetPlayerData()
        end)

        if okData and type(playerData) == 'table' then
            local charinfo = playerData.charinfo or {}
            local firstName = charinfo.firstname
            local lastName = charinfo.lastname
            local fullName = trim(('%s %s'):format(firstName or '', lastName or ''))

            if fullName ~= '' then
                displayName = fullName
            elseif type(playerData.name) == 'string' and playerData.name ~= '' then
                displayName = playerData.name
            end
        end
    end

    return {
        name = displayName,
        badge = Config.DefaultBadge or 'SASP'
    }
end

function Framework.notify(message)
    local customEvent = Config.Framework and Config.Framework.NotifyEvent or ''

    if customEvent ~= '' then
        TriggerEvent(customEvent, message)
        return
    end

    local frameworkType = Framework.resolveFrameworkType()
    local frameworkObject = Framework.getFrameworkObject()

    if frameworkType == 'esx' and frameworkObject and frameworkObject.ShowNotification then
        frameworkObject.ShowNotification(message)
        return
    end

    if frameworkType == 'qbcore' then
        TriggerEvent('QBCore:Notify', message, 'primary')
        return
    end

    BeginTextCommandThefeedPost('STRING')
    AddTextComponentSubstringPlayerName(message)
    EndTextCommandThefeedPostTicker(false, false)
end