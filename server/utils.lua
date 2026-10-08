local Server = LPMDT.Server
Server.Utils = Server.Utils or {}

local Utils = Server.Utils
local Framework = Server.Framework

function Utils.deepCopy(value)
    if type(value) ~= 'table' then
        return value
    end

    local copy = {}

    for key, nestedValue in pairs(value) do
        copy[key] = Utils.deepCopy(nestedValue)
    end

    return copy
end

function Utils.debugLog(...)
    if not Config.Debug then
        return
    end

    print(('[lpMDT] %s'):format(table.concat({ ... }, ' ')))
end

function Utils.encodeJson(value)
    return json.encode(value or {})
end

function Utils.decodeJson(value, fallback)
    if type(value) ~= 'string' or value == '' then
        return fallback
    end

    local ok, decoded = pcall(json.decode, value)

    if not ok or decoded == nil then
        return fallback
    end

    return decoded
end

function Utils.trim(value)
    if type(value) ~= 'string' then
        return ''
    end

    return value:gsub('^%s+', ''):gsub('%s+$', '')
end

function Utils.showNotification(source, message)
    local customEvent = Config.Framework and Config.Framework.NotifyEvent or ''

    if customEvent ~= '' then
        TriggerClientEvent(customEvent, source, message)
        return
    end

    local frameworkType = Framework.resolveFrameworkType()

    if frameworkType == 'esx' then
        TriggerClientEvent('esx:showNotification', source, message)
        return
    end

    if frameworkType == 'qbcore' then
        TriggerClientEvent('QBCore:Notify', source, message, 'primary')
        return
    end

    TriggerClientEvent('chat:addMessage', source, {
        args = { 'lpMDT', tostring(message) }
    })
end

function Utils.initialsFromName(fullName)
    local first = '?'
    local second = ''

    for word in tostring(fullName):gmatch('%S+') do
        if first == '?' then
            first = word:sub(1, 1):upper()
        elseif second == '' then
            second = word:sub(1, 1):upper()
            break
        end
    end

    return first .. second
end

function Utils.buildTones(seed)
    local source = tostring(seed or 'lpmdt')
    local hash = 0

    for index = 1, #source do
        hash = (hash + (source:byte(index) * index)) % 255
    end

    local function hex(offset)
        return string.format('%02x', (hash + offset) % 255)
    end

    return {
        '#' .. hex(50) .. hex(90) .. hex(130),
        '#' .. hex(10) .. hex(40) .. hex(70),
        '#' .. hex(160) .. hex(190) .. hex(220),
    }
end

function Utils.findStat(stats, label)
    for _, entry in ipairs(stats or {}) do
        if entry.label == label then
            return entry.value
        end
    end

    return nil
end

function Utils.formatTimestampLabel(value)
    if not value or value == '' then
        return 'Non renseigne'
    end

    local year, month, day, hour, minute = tostring(value):match('^(%d%d%d%d)%-(%d%d)%-(%d%d) (%d%d):(%d%d)')

    if year then
        return ('%s/%s/%s %s:%s'):format(day, month, year, hour, minute)
    end

    return tostring(value)
end