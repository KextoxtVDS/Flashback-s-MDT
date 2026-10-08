local Server = LPMDT.Server
Server.Framework = Server.Framework or {
    detectedFramework = nil,
    frameworkObject = nil,
}

local Framework = Server.Framework

local function trim(value)
    if type(value) ~= 'string' then
        return ''
    end

    return value:gsub('^%s+', ''):gsub('%s+$', '')
end

function Framework.resolveFrameworkType()
    if Framework.detectedFramework then
        return Framework.detectedFramework
    end

    local configuredType = string.lower(tostring(Config.Framework and Config.Framework.Type or 'auto'))

    if configuredType ~= 'auto' then
        Framework.detectedFramework = configuredType
        return Framework.detectedFramework
    end

    local esxResource = Config.Framework and Config.Framework.ESXResource or 'es_extended'
    local qbResource = Config.Framework and Config.Framework.QBCoreResource or 'qb-core'

    if GetResourceState(esxResource) == 'started' then
        Framework.detectedFramework = 'esx'
    elseif GetResourceState(qbResource) == 'started' then
        Framework.detectedFramework = 'qbcore'
    else
        Framework.detectedFramework = 'standalone'
    end

    return Framework.detectedFramework
end

function Framework.getFrameworkObject()
    if Framework.frameworkObject ~= nil then
        return Framework.frameworkObject
    end

    local frameworkType = Framework.resolveFrameworkType()

    if frameworkType == 'esx' then
        local resourceName = Config.Framework and Config.Framework.ESXResource or 'es_extended'
        local ok, object = pcall(function()
            return exports[resourceName]:getSharedObject()
        end)

        Framework.frameworkObject = ok and object or false
        return Framework.frameworkObject
    end

    if frameworkType == 'qbcore' then
        local resourceName = Config.Framework and Config.Framework.QBCoreResource or 'qb-core'
        local ok, object = pcall(function()
            return exports[resourceName]:GetCoreObject()
        end)

        Framework.frameworkObject = ok and object or false
        return Framework.frameworkObject
    end

    Framework.frameworkObject = false
    return Framework.frameworkObject
end

function Framework.getPlayerObject(source)
    local frameworkType = Framework.resolveFrameworkType()
    local object = Framework.getFrameworkObject()

    if frameworkType == 'esx' and object and object.GetPlayerFromId then
        return object.GetPlayerFromId(source)
    end

    if frameworkType == 'qbcore' and object and object.Functions and object.Functions.GetPlayer then
        return object.Functions.GetPlayer(source)
    end

    return {
        source = source,
    }
end

function Framework.getIdentifierFromSource(source)
    local priorities = Config.Framework and Config.Framework.IdentifierPriority or {}
    local identifiers = GetPlayerIdentifiers(source)
    local byType = {}

    for _, identifier in ipairs(identifiers) do
        local identifierType = identifier:match('^([^:]+):')

        if identifierType then
            byType[identifierType] = identifier
        end
    end

    for _, identifierType in ipairs(priorities) do
        if byType[identifierType] then
            return byType[identifierType]
        end
    end

    return identifiers[1] or ('source:%s'):format(tostring(source))
end

function Framework.getPlayerIdentifier(xPlayer)
    if not xPlayer then
        return nil
    end

    local frameworkType = Framework.resolveFrameworkType()

    if frameworkType == 'esx' then
        return xPlayer.identifier or (xPlayer.getIdentifier and xPlayer.getIdentifier()) or Framework.getIdentifierFromSource(xPlayer.source)
    end

    if frameworkType == 'qbcore' then
        local playerData = xPlayer.PlayerData or {}
        local citizenId = playerData.citizenid

        if citizenId and citizenId ~= '' then
            return citizenId
        end

        return Framework.getIdentifierFromSource(playerData.source or xPlayer.source)
    end

    return Framework.getIdentifierFromSource(xPlayer.source)
end

function Framework.getPlayerNameValue(xPlayer)
    if not xPlayer then
        return 'Joueur Inconnu'
    end

    local frameworkType = Framework.resolveFrameworkType()

    if frameworkType == 'esx' then
        if type(xPlayer.getName) == 'function' then
            return xPlayer.getName() or GetPlayerName(xPlayer.source)
        end

        return xPlayer.name or GetPlayerName(xPlayer.source)
    end

    if frameworkType == 'qbcore' then
        local charinfo = xPlayer.PlayerData and xPlayer.PlayerData.charinfo or {}
        local fullName = trim(('%s %s'):format(charinfo.firstname or '', charinfo.lastname or ''))

        return fullName ~= '' and fullName or GetPlayerName(xPlayer.PlayerData and xPlayer.PlayerData.source or xPlayer.source)
    end

    return GetPlayerName(xPlayer.source) or 'Joueur Inconnu'
end

function Framework.getPlayerJobData(xPlayer)
    if not xPlayer then
        return {
            name = nil,
            grade = 0,
        }
    end

    local frameworkType = Framework.resolveFrameworkType()

    if frameworkType == 'esx' then
        local job = xPlayer.job or {}
        return {
            name = job.name,
            grade = tonumber(job.grade) or tonumber(job.grade_level) or 0,
        }
    end

    if frameworkType == 'qbcore' then
        local job = xPlayer.PlayerData and xPlayer.PlayerData.job or {}
        local grade = job.grade or {}
        return {
            name = job.name,
            grade = tonumber(grade.level) or tonumber(job.grade and job.grade.level) or tonumber(job.grade and job.grade.name) or 0,
        }
    end

    return {
        name = nil,
        grade = 0,
    }
end

function Framework.getPlayerGroup(xPlayer)
    if not xPlayer then
        return nil
    end

    local frameworkType = Framework.resolveFrameworkType()

    if frameworkType == 'esx' then
        if type(xPlayer.getGroup) == 'function' then
            return xPlayer.getGroup()
        end

        return xPlayer.group
    end

    if frameworkType == 'qbcore' then
        local permissions = xPlayer.PlayerData and xPlayer.PlayerData.permission or xPlayer.PlayerData and xPlayer.PlayerData.permissions

        if type(permissions) == 'string' then
            return permissions
        end

        if type(permissions) == 'table' then
            for permissionName, enabled in pairs(permissions) do
                if enabled then
                    return permissionName
                end
            end
        end
    end

    return nil
end

function Framework.hasMdtAccess(xPlayer)
    if not xPlayer then
        return false, false, false, nil, nil
    end

    local job = Framework.getPlayerJobData(xPlayer)
    local jobName = job.name
    local grade = job.grade
    local accessConfig = jobName and Config.Access.AllowedJobs[jobName] or nil
    local groupName = Framework.getPlayerGroup(xPlayer)
    local isStaff = groupName and Config.Access.StaffGroups[groupName] == true or false

    if accessConfig and grade >= (accessConfig.minGrade or 0) then
        return true, grade >= (accessConfig.supervisorGrade or 999), isStaff, accessConfig.label or Config.DefaultBadge, accessConfig
    end

    return false, false, false, Config.DefaultBadge, nil
end