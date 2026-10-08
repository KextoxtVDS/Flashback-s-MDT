local Server = LPMDT.Server
Server.Loaders = Server.Loaders or {}

local Loaders = Server.Loaders
local Utils = Server.Utils
local Db = Server.Database

-- ============================================================
-- QUEUE D'ÉCRITURE SÉQUENTIELLE
-- Empêche les deadlocks : toutes les transactions SQL s'exécutent
-- l'une après l'autre, jamais en parallèle.
-- ============================================================
local WriteQueue = {
    running = false,
    items   = {},
}

local function writeQueueFlush()
    if WriteQueue.running or #WriteQueue.items == 0 then return end
    WriteQueue.running = true
    CreateThread(function()
        while #WriteQueue.items > 0 do
            local item = table.remove(WriteQueue.items, 1)
            local ok, err = pcall(item)
            if not ok then
                Utils.debugLog('[lpMDT] WriteQueue error: ' .. tostring(err))
            end
            Wait(0) -- yield pour ne pas bloquer le thread serveur
        end
        WriteQueue.running = false
    end)
end

local function queueWrite(fn)
    WriteQueue.items[#WriteQueue.items + 1] = fn
    writeQueueFlush()
end

function Loaders.loadDriverLicenses()
    local licenseConfig = Config.Database.Licenses

    if not licenseConfig or not licenseConfig.Table then
        return {}
    end

    local ownerField = Db.sqlField(licenseConfig.Columns.Owner, 'owner')
    local typeField = Db.sqlField(licenseConfig.Columns.Type, 'license_type')
    local query = ('SELECT %s, %s FROM %s'):format(ownerField, typeField, Db.sqlIdentifier(licenseConfig.Table))
    local rows = MySQL.query.await(query, {}) or {}
    local map = {}

    for _, row in ipairs(rows) do
        local owner = row.owner
        local licenseType = row.license_type

        if owner and licenseConfig.DriverTypes[licenseType] then
            map[owner] = 'Valide'
        end
    end

    return map
end

function Loaders.loadJobGradeLabels()
    local gradeConfig = Config.Database.JobGrades

    if not gradeConfig or not gradeConfig.Table then
        return {}
    end

    local query = ('SELECT %s, %s, %s FROM %s'):format(
        Db.sqlField(gradeConfig.Columns.JobName, 'job_name'),
        Db.sqlField(gradeConfig.Columns.Grade, 'grade'),
        Db.sqlField(gradeConfig.Columns.Label, 'label'),
        Db.sqlIdentifier(gradeConfig.Table)
    )
    local rows = MySQL.query.await(query, {}) or {}
    local map = {}

    for _, row in ipairs(rows) do
        map[('%s:%s'):format(row.job_name or '', tostring(row.grade or '0'))] = row.label or tostring(row.grade or '0')
    end

    return map
end

function Loaders.loadJsonKeyedRows(tableConfig)
    if not tableConfig or not tableConfig.Table then
        return {}
    end

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        Db.ensureJsonStorageTable(tableConfig)
    end

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        return {}
    end

    local query = ('SELECT %s AS record_key, %s AS payload FROM %s'):format(
        Db.sqlIdentifier(tableConfig.KeyColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.Table)
    )
    local rows = MySQL.query.await(query, {}) or {}
    local map = {}

    for _, row in ipairs(rows) do
        map[row.record_key] = Utils.decodeJson(row.payload, {}) or {}
    end

    return map
end

function Loaders.loadJsonCollection(tableConfig)
    if not tableConfig or not tableConfig.Table then
        return {}
    end

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        Db.ensureJsonStorageTable(tableConfig)
    end

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        return {}
    end

    local query = ('SELECT %s AS record_key, %s AS payload FROM %s ORDER BY %s DESC'):format(
        Db.sqlIdentifier(tableConfig.KeyColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.Table),
        Db.sqlIdentifier(tableConfig.OrderColumn or 'updated_at')
    )
    local rows = MySQL.query.await(query, {}) or {}
    local collection = {}

    for _, row in ipairs(rows) do
        local payload = Utils.decodeJson(row.payload, {})

        if type(payload) == 'table' then
            if payload.id == nil then
                payload.id = row.record_key
            end

            collection[#collection + 1] = payload
        end
    end

    return collection
end

function Loaders.loadJsonCollectionOrDefaults(tableConfig, defaults)
    local collection = Loaders.loadJsonCollection(tableConfig)

    if #collection > 0 then
        return collection
    end

    return Utils.deepCopy(defaults or {})
end

function Loaders.loadPlayerProfile(identifier)
    local profileConfig = Config.Database.Profiles

    if not identifier or not profileConfig or not profileConfig.Table or not Db.canLoadCatalogTable(profileConfig.Table) then
        return {}
    end

    local row = MySQL.single.await(
        ('SELECT %s AS payload FROM %s WHERE %s = ?'):format(
            Db.sqlIdentifier(profileConfig.PayloadColumn),
            Db.sqlIdentifier(profileConfig.Table),
            Db.sqlIdentifier(profileConfig.KeyColumn)
        ),
        { identifier }
    )

    return row and Utils.decodeJson(row.payload, {}) or {}
end

function Loaders.savePlayerProfile(identifier, profile)
    local profileConfig = Config.Database.Profiles

    if not identifier or not profileConfig or not profileConfig.Table or not Db.canLoadCatalogTable(profileConfig.Table) then
        return
    end

    local statement = ('INSERT INTO %s (%s, %s) VALUES (?, ?) ON DUPLICATE KEY UPDATE %s = VALUES(%s), updated_at = CURRENT_TIMESTAMP'):format(
        Db.sqlIdentifier(profileConfig.Table),
        Db.sqlIdentifier(profileConfig.KeyColumn),
        Db.sqlIdentifier(profileConfig.PayloadColumn),
        Db.sqlIdentifier(profileConfig.PayloadColumn),
        Db.sqlIdentifier(profileConfig.PayloadColumn)
    )

    MySQL.insert.await(statement, { identifier, Utils.encodeJson(profile or {}) })
end

-- Sauvegarde groupee via INSERT ... ON DUPLICATE KEY UPDATE en une seule requete par lot
function Loaders.saveJsonMap(tableConfig, map, actorIdentifier)
    if type(map) ~= 'table' or not tableConfig or not tableConfig.Table then
        return
    end

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        Db.ensureJsonStorageTable(tableConfig)
    end

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        return
    end

    local statement = ('INSERT INTO %s (%s, %s, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE %s = VALUES(%s), updated_by = VALUES(updated_by), updated_at = CURRENT_TIMESTAMP'):format(
        Db.sqlIdentifier(tableConfig.Table),
        Db.sqlIdentifier(tableConfig.KeyColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn)
    )

    -- Utilisation de MySQL.transaction pour grouper toutes les insertions en une seule transaction
    local queries = {}
    for key, value in pairs(map) do
        queries[#queries + 1] = {
            query = statement,
            values = { tostring(key), Utils.encodeJson(value), actorIdentifier },
        }
    end

    if #queries > 0 then
        queueWrite(function()
            MySQL.transaction.await(queries)
        end)
    end
end

-- Remplacement groupé : DELETE + INSERT en transaction unique
function Loaders.replaceJsonRows(tableConfig, rows, actorIdentifier)
    if type(rows) ~= 'table' or not tableConfig or not tableConfig.Table then
        return
    end

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        Db.ensureJsonStorageTable(tableConfig)
    end

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        return
    end

    local statement = ('INSERT INTO %s (%s, %s, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE %s = VALUES(%s), updated_by = VALUES(updated_by), updated_at = CURRENT_TIMESTAMP'):format(
        Db.sqlIdentifier(tableConfig.Table),
        Db.sqlIdentifier(tableConfig.KeyColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn)
    )

    local queries = {
        { query = ('DELETE FROM %s'):format(Db.sqlIdentifier(tableConfig.Table)), values = {} },
    }

    for _, row in ipairs(rows) do
        local key = row.id or row.identifier

        if key then
            queries[#queries + 1] = {
                query = statement,
                values = { key, Utils.encodeJson(row), actorIdentifier },
            }
        end
    end

    queueWrite(function()
        MySQL.transaction.await(queries)
    end)
end

function Loaders.replaceJsonMap(tableConfig, map, actorIdentifier)
    if type(map) ~= 'table' or not tableConfig or not tableConfig.Table then
        return
    end

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        Db.ensureJsonStorageTable(tableConfig)
    end

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        return
    end

    local statement = ('INSERT INTO %s (%s, %s, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE %s = VALUES(%s), updated_by = VALUES(updated_by), updated_at = CURRENT_TIMESTAMP'):format(
        Db.sqlIdentifier(tableConfig.Table),
        Db.sqlIdentifier(tableConfig.KeyColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn)
    )

    local queries = {
        { query = ('DELETE FROM %s'):format(Db.sqlIdentifier(tableConfig.Table)), values = {} },
    }

    for key, value in pairs(map) do
        queries[#queries + 1] = {
            query = statement,
            values = { tostring(key), Utils.encodeJson(value), actorIdentifier },
        }
    end

    queueWrite(function()
        MySQL.transaction.await(queries)
    end)
end

function Loaders.loadChargeCatalog()
    local tableConfig = Config.Database.ChargeCatalog

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        return {}
    end

    local query = Db.buildCatalogQuery(tableConfig.Table, tableConfig.Columns, {
        id = tableConfig.Columns.Id,
        name = tableConfig.Columns.Name,
        category = tableConfig.Columns.Category,
        fine = tableConfig.Columns.Fine,
        jail = tableConfig.Columns.Jail,
    })
    local ok, rows = pcall(MySQL.query.await, query, {})
    local catalog = {}

    if not ok then
        return catalog
    end

    for _, row in ipairs(rows) do
        catalog[#catalog + 1] = {
            id = tostring(row.id or ''),
            name = Utils.trim(row.name),
            category = Utils.trim(row.category),
            fine = tonumber(row.fine) or 0,
            jail = Utils.trim(row.jail) ~= '' and Utils.trim(row.jail) or '00:00:00',
        }
    end

    return catalog
end

function Loaders.loadAdminCharges()
    local tableConfig = Config.Database.AdminCharges

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        return {}
    end

    local query = Db.buildCatalogQuery(tableConfig.Table, tableConfig.Columns, {
        id = tableConfig.Columns.Id,
        name = tableConfig.Columns.Name,
        category = tableConfig.Columns.Category,
        type = tableConfig.Columns.Type,
        fine = tableConfig.Columns.Fine,
        jail = tableConfig.Columns.Jail,
        instruction = tableConfig.Columns.Instruction,
    })
    local ok, rows = pcall(MySQL.query.await, query, {})
    local catalog = {}

    if not ok then
        return catalog
    end

    for _, row in ipairs(rows) do
        catalog[#catalog + 1] = {
            id = tostring(row.id or ''),
            name = Utils.trim(row.name),
            category = Utils.trim(row.category),
            type = Utils.trim(row.type),
            fine = tonumber(row.fine) or 0,
            jail = Utils.trim(row.jail) ~= '' and Utils.trim(row.jail) or '00:00:00',
            instruction = Utils.trim(row.instruction),
        }
    end

    return catalog
end

function Loaders.saveAdminCharges(rows)
    local tableConfig = Config.Database.AdminCharges

    if type(rows) ~= 'table' or not Db.canLoadCatalogTable(tableConfig.Table) then
        return
    end

    local columns = tableConfig.Columns
    local statement = ('INSERT INTO %s (%s, %s, %s, %s, %s, %s, %s, %s, %s) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'):format(
        Db.sqlIdentifier(tableConfig.Table),
        Db.sqlIdentifier(columns.Id),
        Db.sqlIdentifier(columns.Name),
        Db.sqlIdentifier(columns.Category),
        Db.sqlIdentifier(columns.Type),
        Db.sqlIdentifier(columns.Fine),
        Db.sqlIdentifier(columns.Jail),
        Db.sqlIdentifier(columns.Instruction),
        Db.sqlIdentifier(columns.SortOrder),
        Db.sqlIdentifier(columns.Active)
    )

    local queries = {
        { query = ('DELETE FROM %s'):format(Db.sqlIdentifier(tableConfig.Table)), values = {} },
    }

    for index, row in ipairs(rows) do
        queries[#queries + 1] = {
            query = statement,
            values = {
                tostring(row.id or ''),
                Utils.trim(row.name),
                Utils.trim(row.category),
                Utils.trim(row.type),
                tonumber(row.fine) or 0,
                Utils.trim(row.jail) ~= '' and Utils.trim(row.jail) or '00:00:00',
                Utils.trim(row.instruction),
                tonumber(row.sortOrder) or index,
                1,
            },
        }
    end

    queueWrite(function()
        MySQL.transaction.await(queries)
    end)
end

function Loaders.loadVehicleCatalog()
    local tableConfig = Config.Database.VehicleCatalog

    if not Db.canLoadCatalogTable(tableConfig.Table) then
        return {}
    end

    local query = Db.buildCatalogQuery(tableConfig.Table, tableConfig.Columns, {
        id = tableConfig.Columns.Id,
        name = tableConfig.Columns.Name,
        model = tableConfig.Columns.Model,
        category = tableConfig.Columns.Category,
    })
    local ok, rows = pcall(MySQL.query.await, query, {})
    local catalog = {}

    if not ok then
        return catalog
    end

    for _, row in ipairs(rows) do
        catalog[#catalog + 1] = {
            id = tostring(row.id or ''),
            name = Utils.trim(row.name),
            model = Utils.trim(row.model),
            category = Utils.trim(row.category),
        }
    end

    return catalog
end

function Loaders.loadPersonalNote(identifier)
    local noteConfig = Config.Database.Notes

    if not noteConfig or not noteConfig.Table or not Db.canLoadCatalogTable(noteConfig.Table) then
        return ''
    end

    local row = MySQL.single.await(
        ('SELECT %s AS note_text FROM %s WHERE %s = ?'):format(
            Db.sqlIdentifier(noteConfig.PayloadColumn),
            Db.sqlIdentifier(noteConfig.Table),
            Db.sqlIdentifier(noteConfig.OwnerColumn)
        ),
        { identifier }
    )

    return row and row.note_text or ''
end

function Loaders.upsertJsonRows(tableConfig, rows, actorIdentifier)
    if type(rows) ~= 'table' then
        return
    end

    local statement = ('INSERT INTO %s (%s, %s, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE %s = VALUES(%s), updated_by = VALUES(updated_by), updated_at = CURRENT_TIMESTAMP'):format(
        Db.sqlIdentifier(tableConfig.Table),
        Db.sqlIdentifier(tableConfig.KeyColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn)
    )

    local queries = {}
    for _, row in ipairs(rows) do
        local key = row.id or row.identifier
        if key then
            queries[#queries + 1] = {
                query = statement,
                values = { key, Utils.encodeJson(row), actorIdentifier },
            }
        end
    end

    if #queries > 0 then
        queueWrite(function()
        MySQL.transaction.await(queries)
    end)
    end
end

function Loaders.saveCitizenProfiles(citizens, actorIdentifier)
    if type(citizens) ~= 'table' then
        return
    end

    local tableConfig = Config.Database.CitizenProfiles

    if not tableConfig or not tableConfig.Table or not Db.canLoadCatalogTable(tableConfig.Table) then
        return
    end

    local statement = ('INSERT INTO %s (%s, %s, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE %s = VALUES(%s), updated_by = VALUES(updated_by), updated_at = CURRENT_TIMESTAMP'):format(
        Db.sqlIdentifier(tableConfig.Table),
        Db.sqlIdentifier(tableConfig.KeyColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn)
    )

    local queries = {
        { query = ('DELETE FROM %s'):format(Db.sqlIdentifier(tableConfig.Table)), values = {} },
    }

    for _, citizen in ipairs(citizens) do
        if citizen.identifier then
            queries[#queries + 1] = {
                query = statement,
                values = { citizen.identifier, Utils.encodeJson(citizen), actorIdentifier },
            }
        end
    end

    queueWrite(function()
        MySQL.transaction.await(queries)
    end)
end

function Loaders.savePersonalNote(identifier, noteText)
    local noteConfig = Config.Database.Notes

    if not noteConfig or not noteConfig.Table or not Db.canLoadCatalogTable(noteConfig.Table) then
        return
    end

    local statement = ('INSERT INTO %s (%s, %s) VALUES (?, ?) ON DUPLICATE KEY UPDATE %s = VALUES(%s), updated_at = CURRENT_TIMESTAMP'):format(
        Db.sqlIdentifier(noteConfig.Table),
        Db.sqlIdentifier(noteConfig.OwnerColumn),
        Db.sqlIdentifier(noteConfig.PayloadColumn),
        Db.sqlIdentifier(noteConfig.PayloadColumn),
        Db.sqlIdentifier(noteConfig.PayloadColumn)
    )

    MySQL.insert.await(statement, { identifier, noteText or '' })
end
