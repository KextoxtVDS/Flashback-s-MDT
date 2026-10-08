CREATE TABLE IF NOT EXISTS `lpmdt_notes` (
  `owner_identifier` varchar(80) NOT NULL,
  `note_text` longtext DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`owner_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_citizen_profiles` (
  `citizen_identifier` varchar(80) NOT NULL,
  `data` longtext NOT NULL,
  `updated_by` varchar(80) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`citizen_identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_interrogations` (
  `entry_id` varchar(80) NOT NULL,
  `data` longtext NOT NULL,
  `updated_by` varchar(80) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`entry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_incident_reports` (
  `report_id` varchar(80) NOT NULL,
  `data` longtext NOT NULL,
  `updated_by` varchar(80) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_operation_reports` (
  `report_id` varchar(80) NOT NULL,
  `data` longtext NOT NULL,
  `updated_by` varchar(80) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_autopsy_reports` (
  `report_id` varchar(80) NOT NULL,
  `data` longtext NOT NULL,
  `updated_by` varchar(80) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_weapon_registry` (
  `weapon_id` varchar(80) NOT NULL,
  `data` longtext NOT NULL,
  `updated_by` varchar(80) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`weapon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_vehicle_offenses` (
  `entry_id` varchar(80) NOT NULL,
  `data` longtext NOT NULL,
  `updated_by` varchar(80) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`entry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_bracelet_registry` (
  `entry_id` varchar(80) NOT NULL,
  `data` longtext NOT NULL,
  `updated_by` varchar(80) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`entry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_boot_registry` (
  `entry_id` varchar(80) NOT NULL,
  `data` longtext NOT NULL,
  `updated_by` varchar(80) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`entry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_evidence_folders` (
  `folder_id` varchar(80) NOT NULL,
  `data` longtext NOT NULL,
  `updated_by` varchar(80) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`folder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_evidence_folder_images` (
  `folder_id` varchar(80) NOT NULL,
  `data` longtext NOT NULL,
  `updated_by` varchar(80) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`folder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_specialties` (
  `unit_id` varchar(80) NOT NULL,
  `data` longtext NOT NULL,
  `updated_by` varchar(80) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`unit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_charge_catalog` (
  `charge_id` varchar(80) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(120) NOT NULL,
  `fine` int NOT NULL DEFAULT 0,
  `jail` varchar(16) NOT NULL DEFAULT '00:00:00',
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`charge_id`),
  KEY `idx_lpmdt_charge_catalog_active_sort` (`is_active`, `sort_order`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_admin_charges` (
  `charge_id` varchar(80) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(120) NOT NULL,
  `charge_type` varchar(120) DEFAULT NULL,
  `fine` int NOT NULL DEFAULT 0,
  `jail` varchar(16) NOT NULL DEFAULT '00:00:00',
  `instruction` varchar(255) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`charge_id`),
  KEY `idx_lpmdt_admin_charges_active_sort` (`is_active`, `sort_order`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `lpmdt_vehicle_catalog` (
  `vehicle_id` varchar(80) NOT NULL,
  `name` varchar(255) NOT NULL,
  `model` varchar(120) NOT NULL,
  `category` varchar(120) NOT NULL,
  `sort_order` int NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`vehicle_id`),
  KEY `idx_lpmdt_vehicle_catalog_active_sort` (`is_active`, `sort_order`, `name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;