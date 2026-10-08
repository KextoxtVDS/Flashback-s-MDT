local Server = LPMDT.Server
Server.Database = Server.Database or {
    tableColumnsCache = {},
}

local Db = Server.Database

function Db.sqlIdentifier(name)
    return ('`%s`'):format(name)
end

function Db.sqlField(columnName, aliasName)
    if not columnName or columnName == '' then
        return ('NULL AS %s'):format(Db.sqlIdentifier(aliasName))
    end

    return ('%s AS %s'):format(Db.sqlIdentifier(columnName), Db.sqlIdentifier(aliasName))
end

function Db.getTableColumns(tableName)
    if Db.tableColumnsCache[tableName] then
        return Db.tableColumnsCache[tableName]
    end

    local rows = MySQL.query.await(('SHOW COLUMNS FROM %s'):format(Db.sqlIdentifier(tableName)), {}) or {}
    local columns = {}

    for _, row in ipairs(rows) do
        if row.Field then
            columns[row.Field] = true
        end
    end

    Db.tableColumnsCache[tableName] = columns
    return columns
end

function Db.sqlFieldIfExists(tableName, columnName, aliasName)
    if not columnName or columnName == '' then
        return ('NULL AS %s'):format(Db.sqlIdentifier(aliasName))
    end

    local columns = Db.getTableColumns(tableName)

    if not columns[columnName] then
        return ('NULL AS %s'):format(Db.sqlIdentifier(aliasName))
    end

    return ('%s AS %s'):format(Db.sqlIdentifier(columnName), Db.sqlIdentifier(aliasName))
end

function Db.buildOrderByClause(tableName, configuredColumns, fallbackColumn)
    local columns = Db.getTableColumns(tableName)
    local orderParts = {}

    for _, columnName in ipairs(configuredColumns or {}) do
        if columnName and columns[columnName] then
            orderParts[#orderParts + 1] = ('%s ASC'):format(Db.sqlIdentifier(columnName))
        end
    end

    if #orderParts == 0 and fallbackColumn and columns[fallbackColumn] then
        orderParts[#orderParts + 1] = ('%s ASC'):format(Db.sqlIdentifier(fallbackColumn))
    end

    if #orderParts == 0 then
        return ''
    end

    return ' ORDER BY ' .. table.concat(orderParts, ', ')
end

function Db.buildCatalogQuery(tableName, columnMap, aliases)
    local selectParts = {}
    local orderColumns = {}

    for aliasName, columnName in pairs(aliases) do
        selectParts[#selectParts + 1] = Db.sqlFieldIfExists(tableName, columnName, aliasName)
    end

    if columnMap.SortOrder then
        orderColumns[#orderColumns + 1] = columnMap.SortOrder
    end

    if columnMap.Name then
        orderColumns[#orderColumns + 1] = columnMap.Name
    end

    local whereClause = ''
    local columns = Db.getTableColumns(tableName)

    if columnMap.Active and columns[columnMap.Active] then
        whereClause = (' WHERE %s = 1'):format(Db.sqlIdentifier(columnMap.Active))
    end

    return ('SELECT %s FROM %s%s%s'):format(
        table.concat(selectParts, ', '),
        Db.sqlIdentifier(tableName),
        whereClause,
        Db.buildOrderByClause(tableName, orderColumns, columnMap.Name)
    )
end

function Db.canLoadCatalogTable(tableName)
    local ok = pcall(Db.getTableColumns, tableName)
    return ok
end

function Db.ensureJsonStorageTable(tableConfig)
    if not tableConfig or not tableConfig.Table or not tableConfig.KeyColumn or not tableConfig.PayloadColumn then
        return false
    end

    local statement = ('CREATE TABLE IF NOT EXISTS %s (%s varchar(80) NOT NULL, %s longtext NOT NULL, `updated_by` varchar(80) DEFAULT NULL, `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), PRIMARY KEY (%s)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'):format(
        Db.sqlIdentifier(tableConfig.Table),
        Db.sqlIdentifier(tableConfig.KeyColumn),
        Db.sqlIdentifier(tableConfig.PayloadColumn),
        Db.sqlIdentifier(tableConfig.KeyColumn)
    )

    local ok = pcall(MySQL.query.await, statement, {})

    if ok then
        Db.tableColumnsCache[tableConfig.Table] = nil
    end

    return ok
end