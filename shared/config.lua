Config = {}

Config.OpenCommand = 'mdt'
Config.OpenKey = 'F10'
Config.DefaultBadge = 'SASP'
Config.DefaultPolicePost = 'San Andreas State Police | Vespucci'
Config.DefaultCitizenSearch = ''
Config.Debug = false

Config.Uploads = {
  FiveManageApiKey = 'xj0I7it0XraSdPUxhB6rLoeFwaA6wciB',
  FiveManageBaseUrl = 'https://api.fivemanage.com/api/v3',
  EvidencePath = 'lpmdt/evidence',
  RetentionExempt = true,
}

Config.Framework = {
  Type = 'auto',
  ESXResource = 'es_extended',
  QBCoreResource = 'qb-core',
  NotifyEvent = '',
  IdentifierPriority = {
    'license',
    'fivem',
    'discord',
    'steam',
  },
}

Config.Access = {
  AllowedJobs = {
    police = {
      label = 'SASP',
      minGrade = 0,
      supervisorGrade = 4,
      accessKind = 'police',
      canAccessMcd = true,
    },
    sheriff = {
      label = 'BCSO',
      minGrade = 0,
      supervisorGrade = 6,
      accessKind = 'police',
      canAccessMcd = true,
    },
    doj = {
      label = 'DOJ',
      minGrade = 0,
      supervisorGrade = 3,
      accessKind = 'doj',
      canAccessMcd = false,
    },
    ambulance = {
      label = 'EMS',
      minGrade = 0,
      supervisorGrade = 4,
      accessKind = 'ems',
      canAccessMcd = false,
    },
    ems = {
      label = 'EMS',
      minGrade = 0,
      supervisorGrade = 4,
      accessKind = 'ems',
      canAccessMcd = false,
    },
  },
  StaffGroups = {
    admin = true,
    superadmin = true,
    _dev = true,
  },
}

Config.People = {
  LegalJobs = {
    doj = true,
  },
  CitizenDefaultStats = {
    weight = '',
    address = '',
    ethnicity = '',
    hairColor = '',
    eyeColor = '',
    affiliation = '',
    employment = '',
    driverLicense = 'Non-valide',
    deceased = false,
    wanted = false,
    ppaCivil = false,
    ppaHunting = false,
  },
}

Config.Database = {
  Citizens = {
    Table = 'users',
    Columns = {
      Id = 'id',
      Identifier = 'identifier',
      FirstName = 'firstname',
      LastName = 'lastname',
      DateOfBirth = 'dateofbirth',
      Sex = 'sex',
      Height = 'height',
      Phone = 'phone_number',
      Job = 'job',
      JobGrade = 'job_grade',
      Group = 'group',
      Email = 'email',
      Iban = 'iban',
    },
  },
  JobGrades = {
    Table = 'job_grades',
    Columns = {
      JobName = 'job_name',
      Grade = 'grade',
      Label = 'label',
    },
  },
  Licenses = {
    Table = 'user_licenses',
    Columns = {
      Owner = 'owner',
      Type = 'type',
    },
    DriverTypes = {
      drive = true,
      driver = true,
    },
  },
  Notes = {
    Table = 'lpmdt_notes',
    OwnerColumn = 'owner_identifier',
    PayloadColumn = 'note_text',
  },
  Profiles = {
    Table = 'lpmdt_profiles',
    KeyColumn = 'owner_identifier',
    PayloadColumn = 'data',
  },
  CitizenProfiles = {
    Table = 'lpmdt_citizen_profiles',
    KeyColumn = 'citizen_identifier',
    PayloadColumn = 'data',
  },
  Interrogations = {
    Table = 'lpmdt_interrogations',
    KeyColumn = 'entry_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  IncidentReports = {
    Table = 'lpmdt_incident_reports',
    KeyColumn = 'report_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  OperationReports = {
    Table = 'lpmdt_operation_reports',
    KeyColumn = 'report_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  AutopsyReports = {
    Table = 'lpmdt_autopsy_reports',
    KeyColumn = 'report_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  WeaponRegistry = {
    Table = 'lpmdt_weapon_registry',
    KeyColumn = 'weapon_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  VehicleOffenses = {
    Table = 'lpmdt_vehicle_offenses',
    KeyColumn = 'entry_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  BraceletRegistry = {
    Table = 'lpmdt_bracelet_registry',
    KeyColumn = 'entry_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  BootRegistry = {
    Table = 'lpmdt_boot_registry',
    KeyColumn = 'entry_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  Specialties = {
    Table = 'lpmdt_specialties',
    KeyColumn = 'unit_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  EvidenceFolders = {
    Table = 'lpmdt_evidence_folders',
    KeyColumn = 'folder_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  EvidenceFolderImages = {
    Table = 'lpmdt_evidence_folder_images',
    KeyColumn = 'folder_id',
    PayloadColumn = 'data',
  },
  AdminGrades = {
    Table = 'lpmdt_admin_grades',
    KeyColumn = 'grade_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  AdminSpecialties = {
    Table = 'lpmdt_admin_specialties',
    KeyColumn = 'specialty_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  AdminDocumentTemplates = {
    Table = 'lpmdt_admin_document_templates',
    KeyColumn = 'template_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  AdminPaFormQuestions = {
    Table = 'lpmdt_admin_pa_form_questions',
    KeyColumn = 'question_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  AdminRookieCriteria = {
    Table = 'lpmdt_admin_rookie_criteria',
    KeyColumn = 'criterion_id',
    PayloadColumn = 'data',
    OrderColumn = 'updated_at',
  },
  ChargeCatalog = {
    Table = 'lpmdt_charge_catalog',
    Columns = {
      Id = 'charge_id',
      Name = 'name',
      Category = 'category',
      Fine = 'fine',
      Jail = 'jail',
      SortOrder = 'sort_order',
      Active = 'is_active',
    },
  },
  AdminCharges = {
    Table = 'lpmdt_admin_charges',
    Columns = {
      Id = 'charge_id',
      Name = 'name',
      Category = 'category',
      Type = 'charge_type',
      Fine = 'fine',
      Jail = 'jail',
      Instruction = 'instruction',
      SortOrder = 'sort_order',
      Active = 'is_active',
    },
  },
  VehicleCatalog = {
    Table = 'lpmdt_vehicle_catalog',
    Columns = {
      Id = 'vehicle_id',
      Name = 'name',
      Model = 'model',
      Category = 'category',
      SortOrder = 'sort_order',
      Active = 'is_active',
    },
  },
}

Config.Admin = {
  UserDepartments = {
    'Tous',
    'Inactifs',
    'SASP',
    'BCSO',
    'DOJ',
    'EMS',
  },
  Defaults = {
    Grades = {
      { id = 'gr01', name = 'Cadet', faction = 'SASP', salary = 1200, supervisor = false, permissions = 'Consultation', count = 0 },
      { id = 'gr02', name = 'Officer I', faction = 'SASP', salary = 1800, supervisor = false, permissions = 'Patrouille', count = 0 },
      { id = 'gr03', name = 'Sergeant', faction = 'SASP', salary = 2600, supervisor = true, permissions = 'Supervision', count = 0 },
    },
    Specialties = {
      { id = 'sp01', name = 'Patrol', lead = 'Non assigné', coLead = 'Non assigné', members = 0 },
      { id = 'sp02', name = 'Detective Bureau', lead = 'Non assigné', coLead = 'Non assigné', members = 0 },
      { id = 'sp03', name = 'SWAT', lead = 'Non assigné', coLead = 'Non assigné', members = 0 },
    },
    DocumentTemplates = {
      { id = 'dt01', title = 'Rapport d\'incident', type = 'Incident', updatedAt = 'Non renseigné', author = 'Système' },
      { id = 'dt02', title = 'Rapport d\'arrestation', type = 'Arrestation', updatedAt = 'Non renseigné', author = 'Système' },
    },
    PaFormQuestions = {
      { id = 'pf01', label = 'Quelles sont vos motivations ?', category = 'Motivation', expectedAnswer = 'Réponse libre', required = 'Oui' },
      { id = 'pf02', label = 'Quelles sont vos disponibilités ?', category = 'Disponibilités', expectedAnswer = 'Réponse libre', required = 'Oui' },
    },
    RookieCriteria = {
      { id = 'rc01', label = 'Comportement', min = '0', max = '100', category = 'Général' },
      { id = 'rc02', label = 'Conduite radio', min = '0', max = '100', category = 'Terrain' },
      { id = 'rc03', label = 'Procédures', min = '0', max = '100', category = 'Administratif' },
    },
  },
}