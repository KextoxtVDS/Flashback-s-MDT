local Server = LPMDT.Server
Server.People = Server.People or {}

local People = Server.People
local Utils = Server.Utils
local Db = Server.Database
local Loaders = Server.Loaders
local Framework = Server.Framework

function People.buildCitizenStats(baseRow, profileData, driverLicense)
    local defaults = Config.People.CitizenDefaultStats
    local data = profileData or {}
    local heightValue = data.height or baseRow.height or ''

    return {
        { label = 'Poids', value = tostring(data.weight or defaults.weight or '') },
        { label = 'Taille', value = tostring(heightValue or '') },
        { label = 'Sexe', value = data.gender or baseRow.sex or '' },
        { label = 'Adresse', value = data.address or defaults.address or '' },
        { label = 'Ethnie', value = data.ethnicity or defaults.ethnicity or '' },
        { label = 'Couleur de cheveux', value = data.hairColor or defaults.hairColor or '' },
        { label = 'Couleur des yeux', value = data.eyeColor or defaults.eyeColor or '' },
        { label = 'Appartenance', value = data.affiliation or defaults.affiliation or '' },
        { label = 'Emploi', value = data.employment or data.jobLabel or baseRow.job or defaults.employment or '' },
        { label = 'Permis de conduire', value = data.driverLicense or driverLicense or defaults.driverLicense or 'Non-valide' },
        { label = 'Décédé', value = data.deceased == true, dot = true },
        { label = 'Wanted', value = data.wanted == true, dot = true },
        { label = 'PPA civil', value = data.ppaCivil == true, dot = true },
        { label = 'PPA de chasse', value = data.ppaHunting == true, dot = true },
    }
end

function People.buildCitizenRecord(row, overlay, driverLicense)
    local firstName = Utils.trim(overlay.firstName or row.firstname)
    local lastName = Utils.trim(overlay.lastName or row.lastname)
    local fullName = Utils.trim(overlay.name or (firstName .. ' ' .. lastName))
    local stats = People.buildCitizenStats(row, overlay, driverLicense)
    local records = overlay.records or {}

    return {
        id = tostring(overlay.id or row.row_id or row.identifier),
        identifier = row.identifier,
        name = fullName ~= '' and fullName or row.identifier,
        birthDate = overlay.birthDate or row.dateofbirth or '',
        email = overlay.email or row.email or '',
        phone = overlay.phone or row.phone or '',
        censusAt = overlay.censusAt or '',
        portraitLabel = overlay.portraitLabel or Utils.initialsFromName(fullName),
        portraitTones = overlay.portraitTones or Utils.buildTones(row.identifier),
        stats = stats,
        records = {
            arrestation = records.arrestation or {},
            arrestReports = records.arrestReports or {},
            tickets = records.tickets or {},
            mandates = records.mandates or {},
            complaints = records.complaints or {},
            depositions = records.depositions or {},
            bracelets = records.bracelets or {},
        },
    }
end

function People.normalizeCitizenProfile(recordKey, profileData)
    local identifier = profileData.identifier or recordKey
    local firstName = Utils.trim(profileData.firstName)
    local lastName = Utils.trim(profileData.lastName)
    local fullName = Utils.trim(profileData.name or (firstName .. ' ' .. lastName))
    local records = profileData.records or {}
    local syntheticRow = {
        row_id = identifier,
        identifier = identifier,
        firstname = firstName,
        lastname = lastName,
        dateofbirth = profileData.birthDate,
        sex = profileData.gender,
        height = profileData.height,
        phone = profileData.phone,
        job = profileData.job,
        email = profileData.email,
        iban = profileData.iban,
    }

    return {
        id = tostring(profileData.id or identifier),
        identifier = identifier,
        name = fullName ~= '' and fullName or identifier,
        birthDate = profileData.birthDate or '',
        email = profileData.email or '',
        phone = profileData.phone or '',
        censusAt = profileData.censusAt or '',
        photo = type(profileData.photo) == 'string' and profileData.photo ~= '' and profileData.photo or nil,
        portraitLabel = profileData.portraitLabel or Utils.initialsFromName(fullName ~= '' and fullName or identifier),
        portraitTones = profileData.portraitTones or Utils.buildTones(identifier),
        stats = type(profileData.stats) == 'table' and profileData.stats or People.buildCitizenStats(syntheticRow, profileData, profileData.driverLicense),
        records = {
            arrestation = records.arrestation or {},
            arrestReports = records.arrestReports or {},
            tickets = records.tickets or {},
            mandates = records.mandates or {},
            complaints = records.complaints or {},
            depositions = records.depositions or {},
            bracelets = records.bracelets or {},
        },
    }
end

function People.loadCitizensSnapshot()
    local citizenProfiles = Loaders.loadJsonKeyedRows(Config.Database.CitizenProfiles)
    local citizens = {}

    for identifier, profileData in pairs(citizenProfiles) do
        if type(profileData) == 'table' then
            citizens[#citizens + 1] = People.normalizeCitizenProfile(identifier, profileData)
        end
    end

    table.sort(citizens, function(left, right)
        return (left.name or ''):lower() < (right.name or ''):lower()
    end)

    return citizens
end

function People.buildWantedPeople(citizens)
    local wanted = {}

    for _, citizen in ipairs(citizens) do
        if Utils.findStat(citizen.stats, 'Wanted') == true then
            wanted[#wanted + 1] = {
                id = citizen.id,
                identifier = citizen.identifier,
                name = citizen.name,
                gender = Utils.findStat(citizen.stats, 'Sexe') or '',
                phone = citizen.phone,
                birthDate = citizen.birthDate,
                photo = citizen.photo or nil,
                avatarLabel = citizen.portraitLabel or Utils.initialsFromName(citizen.name),
                tones = citizen.portraitTones or Utils.buildTones(citizen.identifier),
            }
        end
    end

    return wanted
end

function People.buildComplaintRegistryEntries(citizens)
    local complaints = {}

    for _, citizen in ipairs(citizens or {}) do
        local citizenComplaints = citizen.records and citizen.records.complaints or {}

        for _, complaint in ipairs(citizenComplaints) do
            complaints[#complaints + 1] = {
                id = complaint.id,
                date = complaint.date,
                citizen = citizen.name,
                status = complaint.status,
                officer = complaint.author or '--',
                against = complaint.against or '--',
                reasons = complaint.reason or 'Plainte',
                statusReason = complaint.statusReason or '--',
                body = complaint.body or '',
                lawyers = complaint.selectedLawyers or {},
                proofImages = complaint.proofImages or {},
            }
        end
    end

    table.sort(complaints, function(left, right)
        return tostring(left.id or '') > tostring(right.id or '')
    end)

    return complaints
end

function People.buildStaffDatasets()
    local citizenConfig = Config.Database.Citizens
    local gradeLabels = Loaders.loadJobGradeLabels()
    local allProfiles = Loaders.loadJsonKeyedRows(Config.Database.Profiles)
    local query = ('SELECT %s, %s, %s, %s, %s, %s, %s, %s, %s, %s FROM %s%s'):format(
        Db.sqlFieldIfExists(citizenConfig.Table, citizenConfig.Columns.Id, 'row_id'),
        Db.sqlFieldIfExists(citizenConfig.Table, citizenConfig.Columns.Identifier, 'identifier'),
        Db.sqlFieldIfExists(citizenConfig.Table, citizenConfig.Columns.FirstName, 'firstname'),
        Db.sqlFieldIfExists(citizenConfig.Table, citizenConfig.Columns.LastName, 'lastname'),
        Db.sqlFieldIfExists(citizenConfig.Table, citizenConfig.Columns.DateOfBirth, 'dateofbirth'),
        Db.sqlFieldIfExists(citizenConfig.Table, citizenConfig.Columns.Phone, 'phone'),
        Db.sqlFieldIfExists(citizenConfig.Table, citizenConfig.Columns.Email, 'email'),
        Db.sqlFieldIfExists(citizenConfig.Table, citizenConfig.Columns.Iban, 'iban'),
        Db.sqlFieldIfExists(citizenConfig.Table, citizenConfig.Columns.Job, 'job'),
        Db.sqlFieldIfExists(citizenConfig.Table, citizenConfig.Columns.JobGrade, 'job_grade'),
        Db.sqlIdentifier(citizenConfig.Table),
        Db.buildOrderByClause(citizenConfig.Table, {
            citizenConfig.Columns.FirstName,
            citizenConfig.Columns.LastName,
        }, citizenConfig.Columns.Identifier)
    )
    local rows = MySQL.query.await(query, {}) or {}
    local staffAgents = {}
    local officerOptions = {}
    local legalContacts = {}

    for _, row in ipairs(rows) do
        local jobName = row.job
        local fullName = Utils.trim(('%s %s'):format(row.firstname or '', row.lastname or ''))

        if Config.People.LegalJobs[jobName] then
            legalContacts[#legalContacts + 1] = fullName ~= '' and fullName or (row.identifier or 'Contact juridique')
        end

        if Config.Access.AllowedJobs[jobName] then
            local savedProfile = (row.identifier and allProfiles[row.identifier]) or {}
            local savedMatricule = type(savedProfile) == 'table' and Utils.trim(savedProfile.matricule or '') or ''
            local badgeId = savedMatricule ~= '' and savedMatricule or tostring(row.row_id or #staffAgents + 1)
            local gradeKey = ('%s:%s'):format(jobName or '', tostring(row.job_grade or '0'))
            local departmentLabel = Config.Access.AllowedJobs[jobName].label or string.upper(tostring(jobName or 'Inactifs'))

            staffAgents[#staffAgents + 1] = {
                id = badgeId,
                identifier = row.identifier,
                firstName = row.firstname or '',
                lastName = row.lastname or '',
                phone = row.phone or '',
                email = row.email or '',
                grade = gradeLabels[gradeKey] or tostring(row.job_grade or 0),
                iban = row.iban or '',
                birthDate = row.dateofbirth or '',
                job = jobName,
                department = departmentLabel,
            }

            officerOptions[#officerOptions + 1] = {
                id = badgeId,
                name = fullName ~= '' and fullName or (row.identifier or ('Agent ' .. badgeId)),
            }
        end
    end

    table.sort(staffAgents, function(left, right)
        return ('%s %s'):format(left.firstName, left.lastName) < ('%s %s'):format(right.firstName, right.lastName)
    end)

    table.sort(officerOptions, function(left, right)
        return left.name < right.name
    end)

    table.sort(legalContacts)

    return staffAgents, officerOptions, legalContacts
end

function People.buildUpdatedByStats(tableConfig)
    if not tableConfig or not tableConfig.Table or not Db.canLoadCatalogTable(tableConfig.Table) then
        return {}
    end

    local query = ('SELECT updated_by, COUNT(*) AS total, MIN(updated_at) AS first_activity FROM %s WHERE updated_by IS NOT NULL AND updated_by <> "" GROUP BY updated_by'):format(
        Db.sqlIdentifier(tableConfig.Table)
    )
    local rows = MySQL.query.await(query, {}) or {}
    local stats = {}

    for _, row in ipairs(rows) do
        stats[row.updated_by] = {
            total = tonumber(row.total) or 0,
            firstActivity = row.first_activity,
        }
    end

    return stats
end

function People.authorMatchesAgent(agent, record)
    if not agent or not record then
        return false
    end

    local agentName = Utils.trim(('%s %s'):format(agent.firstName or '', agent.lastName or ''))
    local author = Utils.trim(record.author or record.officer or record.encodedBy or '')
    local authorId = Utils.trim(tostring(record.authorId or ''))

    if authorId ~= '' and tostring(agent.id) == authorId then
        return true
    end

    if agentName ~= '' and author ~= '' and (author == agentName or author:find(agentName, 1, true)) then
        return true
    end

    return false
end

function People.countRegistryRecords(registry, agent)
    local total = 0

    for _, entry in ipairs(registry or {}) do
        if People.authorMatchesAgent(agent, entry) then
            total = total + 1
        end
    end

    return total
end

function People.countCitizenNestedRecords(citizens, recordKey, agent)
    local total = 0

    for _, citizen in ipairs(citizens or {}) do
        local records = citizen.records and citizen.records[recordKey] or {}

        for _, record in ipairs(records or {}) do
            if People.authorMatchesAgent(agent, record) then
                total = total + 1
            end
        end
    end

    return total
end

function People.buildAgentStatistics(staffAgents, citizens, interrogations, incidentReports, operationReports, weaponRegistry, vehicleOffenses, braceletRegistry, bootRegistry)
    -- Chargement groupé des stats (4 requêtes au lieu de N×4)
    local citizenProfileStats = People.buildUpdatedByStats(Config.Database.CitizenProfiles)
    local interrogationStats = People.buildUpdatedByStats(Config.Database.Interrogations)
    local incidentStats = People.buildUpdatedByStats(Config.Database.IncidentReports)
    local operationStats = People.buildUpdatedByStats(Config.Database.OperationReports)
    local statistics = {}

    for _, agent in ipairs(staffAgents or {}) do
        local firstActivity = nil

        local function registerActivity(activity)
            if not activity or not activity.firstActivity then
                return
            end

            if not firstActivity or tostring(activity.firstActivity) < tostring(firstActivity) then
                firstActivity = activity.firstActivity
            end
        end

        local recensementCount = citizenProfileStats[agent.identifier] and citizenProfileStats[agent.identifier].total or 0
        local interrogationCount = interrogationStats[agent.identifier] and interrogationStats[agent.identifier].total or 0
        local incidentCount = incidentStats[agent.identifier] and incidentStats[agent.identifier].total or 0
        local operationCount = operationStats[agent.identifier] and operationStats[agent.identifier].total or 0
        local complaintCount = People.countCitizenNestedRecords(citizens, 'complaints', agent)
        local depositionCount = People.countCitizenNestedRecords(citizens, 'depositions', agent)
        local arrestDossierCount = People.countCitizenNestedRecords(citizens, 'arrestation', agent)
        local arrestReportCount = People.countCitizenNestedRecords(citizens, 'arrestReports', agent)
        local mandateCount = People.countCitizenNestedRecords(citizens, 'mandates', agent)
        local ticketCount = People.countCitizenNestedRecords(citizens, 'tickets', agent)
        local braceletCount = People.countCitizenNestedRecords(citizens, 'bracelets', agent)
        local weaponCount = People.countRegistryRecords(weaponRegistry, agent)
        local bootCount = People.countRegistryRecords(bootRegistry, agent)

        registerActivity(citizenProfileStats[agent.identifier])
        registerActivity(interrogationStats[agent.identifier])
        registerActivity(incidentStats[agent.identifier])
        registerActivity(operationStats[agent.identifier])

        statistics[#statistics + 1] = {
            id = agent.id,
            identifier = agent.identifier,
            name = Utils.trim(('%s %s'):format(agent.firstName or '', agent.lastName or '')),
            email = agent.email or '',
            phone = agent.phone or '',
            arrivalDate = Utils.formatTimestampLabel(firstActivity),
            metrics = {
                { label = 'Grade', value = agent.grade or '-' },
                { label = 'Nombre de recensement', value = tostring(recensementCount) },
                { label = 'Nombre de mandat', value = tostring(mandateCount) },
                { label = 'Nombre de déposition', value = tostring(depositionCount) },
                { label = 'Nombre de plainte', value = tostring(complaintCount) },
                { label = 'Nombre de ticket routier', value = tostring(ticketCount) },
                { label = "Nombre de rapport d'arrestation", value = tostring(arrestReportCount) },
                { label = "Nombre de dossier d'arrestation", value = tostring(arrestDossierCount) },
                { label = "Nombre de rapport d'opération", value = tostring(operationCount) },
                { label = "Nombre de rapport d'incident", value = tostring(incidentCount) },
                { label = "Nombre d'arme enregistrée", value = tostring(weaponCount) },
                { label = "Nombre d'interrogatoire", value = tostring(interrogationCount) },
                { label = 'Nombre de sabot', value = tostring(bootCount) },
                { label = 'Nombre de bracelet', value = tostring(braceletCount) },
            },
        }
    end

    table.sort(statistics, function(left, right)
        return (left.name or '') < (right.name or '')
    end)

    return statistics
end

function People.buildProfilePayload(xPlayer, badgeLabel)
    local fullName = Framework.getPlayerNameValue(xPlayer)
    local identifier = Framework.getPlayerIdentifier(xPlayer)
    local savedProfile = Loaders.loadPlayerProfile(identifier)

    return {
        name = Utils.trim(savedProfile.name or '') ~= '' and savedProfile.name or (fullName or 'Joueur Inconnu'),
        badge = Utils.trim(savedProfile.badge or '') ~= '' and savedProfile.badge or (badgeLabel or Config.DefaultBadge),
        matricule = Utils.trim(savedProfile.matricule or ''),
        phone = savedProfile.phone or '',
        iban = savedProfile.iban or '',
        email = savedProfile.email or '',
    }
end

function People.buildAdminUserDepartments(staffAgents)
    local configuredDepartments = Utils.deepCopy(Config.Admin and Config.Admin.UserDepartments or { 'Tous' })
    local seen = {}
    local departments = {}

    for _, department in ipairs(configuredDepartments) do
        local label = Utils.trim(department)

        if label ~= '' and not seen[label] then
            seen[label] = true
            departments[#departments + 1] = label
        end
    end

    for _, agent in ipairs(staffAgents or {}) do
        local label = Utils.trim(agent.department or '')

        if label ~= '' and not seen[label] then
            seen[label] = true
            departments[#departments + 1] = label
        end
    end

    if not seen['Tous'] then
        table.insert(departments, 1, 'Tous')
    end

    return departments
end

function People.enrichStaffWithOnlinePlayers(staffAgents, officerOptions)
    local identifierSet = {}
    for _, agent in ipairs(staffAgents) do
        if agent.identifier then
            identifierSet[agent.identifier] = true
        end
    end

    for _, playerSource in ipairs(GetPlayers()) do
        local source = tonumber(playerSource)
        if source then
            local onlinePlayer = Framework.getPlayerObject(source)
            if onlinePlayer then
                local job = Framework.getPlayerJobData(onlinePlayer)
                local jobName = job.name
                local accessConfig = jobName and Config.Access.AllowedJobs[jobName] or nil

                if accessConfig and job.grade >= (accessConfig.minGrade or 0) then
                    local identifier = Framework.getPlayerIdentifier(onlinePlayer)

                    if identifier and not identifierSet[identifier] then
                        identifierSet[identifier] = true
                        local fullName = Framework.getPlayerNameValue(onlinePlayer)
                        local onlineProfile = Loaders.loadPlayerProfile(identifier)
                        local savedMatricule = type(onlineProfile) == 'table' and Utils.trim(onlineProfile.matricule or '') or ''
                        local badgeId = savedMatricule ~= '' and savedMatricule or tostring(source)
                        local departmentLabel = accessConfig.label or string.upper(tostring(jobName))

                        staffAgents[#staffAgents + 1] = {
                            id = badgeId,
                            identifier = identifier,
                            firstName = fullName:match('^(%S+)') or fullName,
                            lastName = fullName:match('%s(.+)$') or '',
                            phone = '',
                            email = '',
                            grade = tostring(job.grade),
                            iban = '',
                            birthDate = '',
                            job = jobName,
                            department = departmentLabel,
                            online = true,
                        }

                        officerOptions[#officerOptions + 1] = {
                            id = badgeId,
                            name = fullName,
                        }
                    end
                end
            end
        end
    end
end

function People.buildSnapshotForPlayer(xPlayer)
    local playerIdentifier = Framework.getPlayerIdentifier(xPlayer)

    -- Chargement parallèle des collections independantes (toutes sans dependances entre elles)
    -- Note: oxmysql ne supporte pas de vraie parallelisation, mais on evite les recalculs
    local citizens = People.loadCitizensSnapshot()
    local staffAgents, officerOptions, legalContacts = People.buildStaffDatasets()
    People.enrichStaffWithOnlinePlayers(staffAgents, officerOptions)

    local interrogations          = Loaders.loadJsonCollection(Config.Database.Interrogations)
    local incidentReports         = Loaders.loadJsonCollection(Config.Database.IncidentReports)
    local operationReports        = Loaders.loadJsonCollection(Config.Database.OperationReports)
    local autopsyReports          = Loaders.loadJsonCollection(Config.Database.AutopsyReports)
    local weaponRegistry          = Loaders.loadJsonCollection(Config.Database.WeaponRegistry)
    local vehicleOffenses         = Loaders.loadJsonCollection(Config.Database.VehicleOffenses)
    local braceletRegistry        = Loaders.loadJsonCollection(Config.Database.BraceletRegistry)
    local bootRegistry            = Loaders.loadJsonCollection(Config.Database.BootRegistry)
    local evidenceFolders         = Loaders.loadJsonCollection(Config.Database.EvidenceFolders)
    local evidenceFolderImages    = Loaders.loadJsonKeyedRows(Config.Database.EvidenceFolderImages)
    local chargeCatalog           = Loaders.loadChargeCatalog()
    local adminCharges            = Loaders.loadAdminCharges()
    local vehicleCatalog          = Loaders.loadVehicleCatalog()

    -- Calcul des listes derivees (en memoire, pas de SQL)
    local complaintRegistryEntries = People.buildComplaintRegistryEntries(citizens)
    local wantedPeople             = People.buildWantedPeople(citizens)
    local adminUserDepartments     = People.buildAdminUserDepartments(staffAgents)
    local agentStatistics          = People.buildAgentStatistics(
        staffAgents, citizens, interrogations, incidentReports,
        operationReports, weaponRegistry, vehicleOffenses, braceletRegistry, bootRegistry
    )

    -- Options vehicule/arme derivees des citoyens (boucle unique)
    local weaponCitizenOptions = {}
    local vehicleOwnerOptions  = {}

    for _, citizen in ipairs(citizens) do
        local label = citizen.phone and citizen.phone ~= ''
            and ('%s — %s'):format(citizen.name, citizen.phone)
            or citizen.name
        weaponCitizenOptions[#weaponCitizenOptions + 1] = label
        vehicleOwnerOptions[#vehicleOwnerOptions + 1] = label
    end

    -- Choix de rapport d'opération
    local operationReportChoices = {}
    for _, report in ipairs(operationReports) do
        local label = ('%s %s'):format(report.incidentType or 'Intervention', report.date or '')
        if label ~= 'Intervention ' then
            operationReportChoices[#operationReportChoices + 1] = Utils.trim(label)
        end
    end

    return {
        profile             = Loaders.loadPlayerProfile(playerIdentifier),
        personalNote        = Loaders.loadPersonalNote(playerIdentifier),
        citizens            = citizens,
        complaintRegistryEntries = complaintRegistryEntries,
        wantedPeople        = wantedPeople,
        staffAgents         = staffAgents,
        adminUserDepartments = adminUserDepartments,
        agentStatistics     = agentStatistics,
        officerOptions      = officerOptions,
        legalContacts       = legalContacts,
        interrogations      = interrogations,
        incidentReports     = incidentReports,
        operationReports    = operationReports,
        autopsyReports      = autopsyReports,
        evidenceFolders     = evidenceFolders,
        evidenceFolderImages = evidenceFolderImages,
        operationReportChoices = operationReportChoices,
        weaponRegistry      = weaponRegistry,
        vehicleOffenses     = vehicleOffenses,
        braceletRegistry    = braceletRegistry,
        bootRegistry        = bootRegistry,
        specialtyUnits      = Loaders.loadJsonCollection(Config.Database.Specialties),
        adminGrades         = Loaders.loadJsonCollectionOrDefaults(Config.Database.AdminGrades, Config.Admin and Config.Admin.Defaults and Config.Admin.Defaults.Grades),
        adminSpecialties    = Loaders.loadJsonCollectionOrDefaults(Config.Database.AdminSpecialties, Config.Admin and Config.Admin.Defaults and Config.Admin.Defaults.Specialties),
        adminDocumentTemplates = Loaders.loadJsonCollectionOrDefaults(Config.Database.AdminDocumentTemplates, Config.Admin and Config.Admin.Defaults and Config.Admin.Defaults.DocumentTemplates),
        adminPaFormQuestions = Loaders.loadJsonCollectionOrDefaults(Config.Database.AdminPaFormQuestions, Config.Admin and Config.Admin.Defaults and Config.Admin.Defaults.PaFormQuestions),
        adminRookieCriteria = Loaders.loadJsonCollectionOrDefaults(Config.Database.AdminRookieCriteria, Config.Admin and Config.Admin.Defaults and Config.Admin.Defaults.RookieCriteria),
        chargeCatalog       = chargeCatalog,
        adminCharges        = adminCharges,
        vehicleCatalog      = vehicleCatalog,
        weaponCitizenOptions = weaponCitizenOptions,
        vehicleOwnerOptions = vehicleOwnerOptions,
    }
end
