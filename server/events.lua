local Server = LPMDT.Server
local Framework = Server.Framework
local Utils = Server.Utils
local Loaders = Server.Loaders
local People = Server.People

-- ============================================================
-- CACHE SERVEUR
-- Evite de recalculer les memes donnees a chaque broadcast
-- ============================================================
local Cache = {
    gradeLabels       = nil,
    gradeLabelsAt     = 0,
    sharedSnapshot    = nil,
    snapshotAt        = 0,
    -- TTL en ms
    GRADE_TTL         = 300000,  -- 5 min
    SNAPSHOT_TTL      = 10000,   -- 10 sec
}

local function getGradeLabels()
    local now = GetGameTimer()
    if Cache.gradeLabels and (now - Cache.gradeLabelsAt) < Cache.GRADE_TTL then
        return Cache.gradeLabels
    end
    Cache.gradeLabels  = Loaders.loadJobGradeLabels()
    Cache.gradeLabelsAt = now
    return Cache.gradeLabels
end

local function invalidateCache()
    Cache.sharedSnapshot = nil
    Cache.snapshotAt     = 0
end

local function getSharedSnapshot(xPlayer)
    local now = GetGameTimer()
    if Cache.sharedSnapshot and (now - Cache.snapshotAt) < Cache.SNAPSHOT_TTL then
        return Cache.sharedSnapshot
    end
    Cache.sharedSnapshot = People.buildSnapshotForPlayer(xPlayer)
    Cache.snapshotAt     = now
    return Cache.sharedSnapshot
end

-- ============================================================
-- DEBOUNCE DU BROADCAST
-- Evite N broadcasts en rafale — attend 500ms apres le dernier save
-- ============================================================
local broadcastTimer = nil

local function scheduleBroadcast()
    if broadcastTimer then
        ClearTimeout(broadcastTimer)
    end
    broadcastTimer = SetTimeout(500, function()
        broadcastTimer = nil
        invalidateCache()
        broadcastSharedSnapshot()
    end)
end

-- ============================================================

local function sendNuiResponse(target, requestId, payload)
    TriggerClientEvent('lpmdt:client:nuiResponse', target, requestId, payload)
end

local function sendSnapshotSync(target, payload)
    TriggerClientEvent('lpmdt:client:syncSnapshot', target, payload)
end

local function buildOpenPayload(xPlayer, isSupervisor, isStaff, badgeLabel, accessConfig)
    local jobData  = Framework.getPlayerJobData(xPlayer)
    local gradeLabels = getGradeLabels()
    local gradeKey = ('%s:%s'):format(jobData.name or '', tostring(jobData.grade or 0))

    return {
        profile = People.buildProfilePayload(xPlayer, badgeLabel),
        permissions = {
            isSupervisor  = isSupervisor,
            isStaff       = isStaff,
            accessKind    = accessConfig and accessConfig.accessKind or 'police',
            departmentLabel = accessConfig and accessConfig.label or badgeLabel or Config.DefaultBadge,
            canAccessMcd  = accessConfig and accessConfig.canAccessMcd ~= false or false,
            jobGrade      = jobData.grade or 0,
            jobGradeLabel = gradeLabels[gradeKey] or tostring(jobData.grade or 0),
        },
        snapshot = getSharedSnapshot(xPlayer),
    }
end

function broadcastSharedSnapshot()
    local activePlayers = {}

    for _, playerSource in ipairs(GetPlayers()) do
        local target = tonumber(playerSource)
        if target then
            local targetPlayer = Framework.getPlayerObject(target)
            local canAccess, isSupervisor, isStaff, badgeLabel, accessConfig = Framework.hasMdtAccess(targetPlayer)
            if canAccess then
                activePlayers[#activePlayers + 1] = {
                    target      = target,
                    player      = targetPlayer,
                    isSupervisor = isSupervisor,
                    isStaff     = isStaff,
                    badgeLabel  = badgeLabel,
                    accessConfig = accessConfig,
                }
            end
        end
    end

    if #activePlayers == 0 then return end

    -- Snapshot partagé construit une seule fois pour tous
    local shared      = getSharedSnapshot(activePlayers[1].player)
    local gradeLabels = getGradeLabels()

    for _, entry in ipairs(activePlayers) do
        local jobData      = Framework.getPlayerJobData(entry.player)
        local gradeKey     = ('%s:%s'):format(jobData.name or '', tostring(jobData.grade or 0))
        local playerIdent  = Framework.getPlayerIdentifier(entry.player)

        -- Copie legere : on surcharge uniquement les champs personnels
        local personalSnapshot = {}
        for k, v in pairs(shared) do personalSnapshot[k] = v end
        personalSnapshot.profile     = Loaders.loadPlayerProfile(playerIdent)
        personalSnapshot.personalNote = Loaders.loadPersonalNote(playerIdent)

        sendSnapshotSync(entry.target, {
            profile = People.buildProfilePayload(entry.player, entry.badgeLabel),
            permissions = {
                isSupervisor  = entry.isSupervisor,
                isStaff       = entry.isStaff,
                accessKind    = entry.accessConfig and entry.accessConfig.accessKind or 'police',
                departmentLabel = entry.accessConfig and entry.accessConfig.label or entry.badgeLabel or Config.DefaultBadge,
                canAccessMcd  = entry.accessConfig and entry.accessConfig.canAccessMcd ~= false or false,
                jobGrade      = jobData.grade or 0,
                jobGradeLabel = gradeLabels[gradeKey] or tostring(jobData.grade or 0),
            },
            snapshot = personalSnapshot,
        })
    end
end

-- ============================================================
-- HELPERS UPLOAD
-- ============================================================
local function getFiveManageConfig()
    local uploadConfig = Config.Uploads or {}
    local apiKey = Utils.trim(uploadConfig.FiveManageApiKey or '')
    if apiKey == '' then
        apiKey = Utils.trim(GetConvar('LPMDT_FIVEMANAGE_API_KEY', ''))
    end
    return {
        apiKey         = apiKey,
        baseUrl        = Utils.trim(uploadConfig.FiveManageBaseUrl or 'https://api.fivemanage.com/api/v3'),
        evidencePath   = Utils.trim(uploadConfig.EvidencePath or 'lpmdt/evidence'),
        retentionExempt = uploadConfig.RetentionExempt ~= false,
    }
end

local function buildEvidenceFilename(folderId, index, dataUrl)
    local extension = string.match(dataUrl or '', '^data:image/([%w%+%-]+);base64,') or 'png'
    if extension == 'jpeg' then extension = 'jpg' end
    -- Timestamp ms + index pour garantir un nom unique même en upload rapide
    return ('%s-%s-%s.%s'):format(folderId, tostring(math.floor(GetGameTimer())), tostring(index), extension)
end

local function uploadEvidenceImage(config, folderId, folderTitle, imageData, index, source, actorName, callback)
    local filename = buildEvidenceFilename(folderId, index, imageData)
    PerformHttpRequest(('%s/file/base64'):format(config.baseUrl), function(statusCode, responseText)
        local response     = Utils.decodeJson(responseText, {}) or {}
        local responseData = response.data or {}
        if statusCode < 200 or statusCode >= 300 or response.status ~= 'ok' or type(responseData.url) ~= 'string' or responseData.url == '' then
            callback(false, response.message or response.error or responseText or ('http_%s'):format(statusCode))
            return
        end
        callback(true, {
            id         = tostring(responseData.id or ''),
            url        = responseData.url,
            uploadedAt = os.date('%d/%m/%Y à %H:%M'),
            uploadedBy = actorName,
        })
    end, 'POST', json.encode({
        base64          = imageData,
        filename        = filename,
        path            = ('%s/%s'):format(config.evidencePath, folderId),
        metadata        = Utils.encodeJson({ folderId = folderId, folderTitle = folderTitle, source = source, uploadedBy = actorName }),
        retentionExempt = config.retentionExempt,
    }), { ['Content-Type'] = 'application/json', ['Authorization'] = config.apiKey })
end

local function uploadSingleImage(config, path, filename, imageData, callback)
    PerformHttpRequest(('%s/file/base64'):format(config.baseUrl), function(statusCode, responseText)
        local response     = Utils.decodeJson(responseText, {}) or {}
        local responseData = response.data or {}
        if statusCode < 200 or statusCode >= 300 or response.status ~= 'ok' or type(responseData.url) ~= 'string' or responseData.url == '' then
            callback(false, response.message or response.error or responseText or ('http_%s'):format(statusCode))
            return
        end
        callback(true, responseData.url)
    end, 'POST', json.encode({
        base64          = imageData,
        filename        = filename,
        path            = path,
        retentionExempt = config.retentionExempt,
    }), { ['Content-Type'] = 'application/json', ['Authorization'] = config.apiKey })
end

local function deleteEvidenceImage(config, imageId, callback)
    if Utils.trim(imageId) == '' then callback(true) return end
    -- FiveManage v3 : DELETE /file/{id}
    local deleteUrl = ('%s/file/%s'):format(config.baseUrl, imageId)
    print(('[lpMDT] DELETE url=%s id=%s'):format(deleteUrl, tostring(imageId)))
    PerformHttpRequest(deleteUrl, function(statusCode, responseText)
        print(('[lpMDT] DELETE status=%s body=%s'):format(tostring(statusCode), tostring(responseText):sub(1, 200)))
        if statusCode >= 200 and statusCode < 300 then callback(true) return end
        local response = Utils.decodeJson(responseText, {}) or {}
        callback(false, response.message or response.error or responseText or ('http_%s'):format(statusCode))
    end, 'DELETE', '', { ['Authorization'] = config.apiKey })
end

-- ============================================================
-- EVENEMENTS RESEAU
-- ============================================================

RegisterNetEvent('lpmdt:server:requestOpen', function()
    local source = source
    local xPlayer = Framework.getPlayerObject(source)
    local canAccess, isSupervisor, isStaff, badgeLabel, accessConfig = Framework.hasMdtAccess(xPlayer)

    if not canAccess then
        Utils.showNotification(source, 'Vous n\'avez pas acces au MDT.')
        return
    end

    TriggerClientEvent('lpmdt:client:open', source, buildOpenPayload(xPlayer, isSupervisor, isStaff, badgeLabel, accessConfig))
end)

RegisterNetEvent('lpmdt:server:saveSection', function(section, payload)
    local source = source
    local xPlayer = Framework.getPlayerObject(source)
    local canAccess = Framework.hasMdtAccess(xPlayer)
    local actorIdentifier = Framework.getPlayerIdentifier(xPlayer)

    if not canAccess then return end

    -- Sections sans broadcast (donnees purement personnelles)
    if section == 'profile' then
        Loaders.savePlayerProfile(actorIdentifier, payload)
        invalidateCache()
        return
    end

    if section == 'personalNote' then
        Loaders.savePersonalNote(actorIdentifier, tostring(payload or ''))
        return
    end

    -- Sections partagees → sauvegarde + broadcast debounce
    local sharedSections = {
        citizens              = function() Loaders.saveCitizenProfiles(payload, actorIdentifier) end,
        interrogations        = function() Loaders.replaceJsonRows(Config.Database.Interrogations, payload, actorIdentifier) end,
        incidentReports       = function() Loaders.replaceJsonRows(Config.Database.IncidentReports, payload, actorIdentifier) end,
        operationReports      = function() Loaders.replaceJsonRows(Config.Database.OperationReports, payload, actorIdentifier) end,
        autopsyReports        = function() Loaders.replaceJsonRows(Config.Database.AutopsyReports, payload, actorIdentifier) end,
        evidenceFolders       = function() Loaders.replaceJsonRows(Config.Database.EvidenceFolders, payload, actorIdentifier) end,
        evidenceFolderImages  = function() Loaders.replaceJsonMap(Config.Database.EvidenceFolderImages, payload, actorIdentifier) end,
        weaponRegistry        = function() Loaders.replaceJsonRows(Config.Database.WeaponRegistry, payload, actorIdentifier) end,
        vehicleOffenses       = function() Loaders.replaceJsonRows(Config.Database.VehicleOffenses, payload, actorIdentifier) end,
        braceletRegistry      = function() Loaders.replaceJsonRows(Config.Database.BraceletRegistry, payload, actorIdentifier) end,
        bootRegistry          = function() Loaders.replaceJsonRows(Config.Database.BootRegistry, payload, actorIdentifier) end,
        specialtyUnits        = function() Loaders.replaceJsonRows(Config.Database.Specialties, payload, actorIdentifier) end,
        adminGrades           = function() Loaders.replaceJsonRows(Config.Database.AdminGrades, payload, actorIdentifier) end,
        adminCharges          = function() Loaders.saveAdminCharges(payload) end,
        adminSpecialties      = function() Loaders.replaceJsonRows(Config.Database.AdminSpecialties, payload, actorIdentifier) end,
        adminDocumentTemplates = function() Loaders.replaceJsonRows(Config.Database.AdminDocumentTemplates, payload, actorIdentifier) end,
        adminPaFormQuestions  = function() Loaders.replaceJsonRows(Config.Database.AdminPaFormQuestions, payload, actorIdentifier) end,
        adminRookieCriteria   = function() Loaders.replaceJsonRows(Config.Database.AdminRookieCriteria, payload, actorIdentifier) end,
    }

    local handler = sharedSections[section]
    if handler then
        handler()
        scheduleBroadcast()
    else
        Utils.debugLog('Section ignoree', tostring(section))
    end
end)

RegisterNetEvent('lpmdt:server:uploadEvidenceImages', function(requestId, folderId, folderTitle, images)
    local source = source
    local xPlayer = Framework.getPlayerObject(source)
    if not Framework.hasMdtAccess(xPlayer) then
        sendNuiResponse(source, requestId, { ok = false, error = 'forbidden' })
        return
    end
    if type(requestId) ~= 'string' or type(folderId) ~= 'string' or type(images) ~= 'table' or #images == 0 then
        sendNuiResponse(source, requestId, { ok = false, error = 'invalid_payload' })
        return
    end
    local config = getFiveManageConfig()
    if config.apiKey == '' then
        sendNuiResponse(source, requestId, { ok = false, error = 'missing_api_key' })
        return
    end
    local actorName = People.buildProfilePayload(xPlayer).name or 'Joueur Inconnu'
    local uploadedImages = {}
    local index = 1
    local function processNext()
        local imageData = images[index]
        if imageData == nil then
            sendNuiResponse(source, requestId, { ok = true, images = uploadedImages })
            return
        end
        if type(imageData) ~= 'string' or not imageData:find('^data:image/.+;base64,') then
            sendNuiResponse(source, requestId, { ok = false, error = 'invalid_image_data' })
            return
        end
        uploadEvidenceImage(config, folderId, tostring(folderTitle or folderId), imageData, index, source, actorName, function(success, result)
            if not success then
                sendNuiResponse(source, requestId, { ok = false, error = 'upload_failed', detail = result })
                return
            end
            uploadedImages[#uploadedImages + 1] = result
            index = index + 1
            processNext()
        end)
    end
    processNext()
end)

RegisterNetEvent('lpmdt:server:deleteEvidenceImage', function(requestId, imageId)
    local source = source
    local xPlayer = Framework.getPlayerObject(source)
    if not Framework.hasMdtAccess(xPlayer) then
        sendNuiResponse(source, requestId, { ok = false, error = 'forbidden' })
        return
    end
    if type(requestId) ~= 'string' or type(imageId) ~= 'string' then
        sendNuiResponse(source, requestId, { ok = false, error = 'invalid_payload' })
        return
    end
    local config = getFiveManageConfig()
    if config.apiKey == '' then
        sendNuiResponse(source, requestId, { ok = true })
        return
    end
    deleteEvidenceImage(config, imageId, function(success, detail)
        sendNuiResponse(source, requestId, success and { ok = true } or { ok = false, error = 'delete_failed', detail = detail })
    end)
end)

RegisterNetEvent('lpmdt:server:uploadProofImages', function(requestId, context, images)
    local source = source
    local xPlayer = Framework.getPlayerObject(source)
    if not Framework.hasMdtAccess(xPlayer) then
        sendNuiResponse(source, requestId, { ok = false, error = 'forbidden' })
        return
    end
    if type(requestId) ~= 'string' or type(context) ~= 'string' or type(images) ~= 'table' or #images == 0 then
        sendNuiResponse(source, requestId, { ok = false, error = 'invalid_payload' })
        return
    end
    local config = getFiveManageConfig()
    if config.apiKey == '' then
        sendNuiResponse(source, requestId, { ok = false, error = 'missing_api_key' })
        return
    end
    local safeContext = context:gsub('[^%w%-_]', '')
    local uploadedUrls = {}
    local index = 1
    local function processNext()
        local imageData = images[index]
        if imageData == nil then
            sendNuiResponse(source, requestId, { ok = true, urls = uploadedUrls })
            return
        end
        if type(imageData) ~= 'string' or not imageData:find('^data:image/.+;base64,') then
            sendNuiResponse(source, requestId, { ok = false, error = 'invalid_image_data' })
            return
        end
        local extension = string.match(imageData, '^data:image/([%w%+%-]+);base64,') or 'png'
        if extension == 'jpeg' then extension = 'jpg' end
        local filename = ('%s-%d-%d.%s'):format(safeContext, math.floor(GetGameTimer()), index, extension)
        uploadSingleImage(config, ('lpmdt/proofs/%s'):format(safeContext), filename, imageData, function(success, url)
            if not success then
                sendNuiResponse(source, requestId, { ok = false, error = 'upload_failed', detail = url })
                return
            end
            uploadedUrls[#uploadedUrls + 1] = url
            index = index + 1
            processNext()
        end)
    end
    processNext()
end)

RegisterNetEvent('lpmdt:server:uploadCitizenPhoto', function(requestId, imageData)
    local source = source
    local xPlayer = Framework.getPlayerObject(source)
    if not Framework.hasMdtAccess(xPlayer) then
        sendNuiResponse(source, requestId, { ok = false, error = 'forbidden' })
        return
    end
    if type(requestId) ~= 'string' or type(imageData) ~= 'string' or not imageData:find('^data:image/.+;base64,') then
        sendNuiResponse(source, requestId, { ok = false, error = 'invalid_payload' })
        return
    end
    local config = getFiveManageConfig()
    if config.apiKey == '' then
        sendNuiResponse(source, requestId, { ok = false, error = 'missing_api_key' })
        return
    end
    local extension = string.match(imageData, '^data:image/([%w%+%-]+);base64,') or 'png'
    if extension == 'jpeg' then extension = 'jpg' end
    local filename = ('citizen-%d.%s'):format(math.floor(GetGameTimer()), extension)
    uploadSingleImage(config, 'lpmdt/citizens', filename, imageData, function(success, url)
        if not success then
            sendNuiResponse(source, requestId, { ok = false, error = 'upload_failed', detail = url })
            return
        end
        sendNuiResponse(source, requestId, { ok = true, url = url })
    end)
end)
