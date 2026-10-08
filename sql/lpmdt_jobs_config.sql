INSERT INTO `jobs` (`name`, `label`) VALUES
  ('police', 'SASP'),
  ('sheriff', 'BCSO'),
  ('doj', 'DOJ'),
  ('ambulance', 'EMS'),
  ('ems', 'EMS')
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`);

INSERT INTO `job_grades` (`job_name`, `grade`, `name`, `label`, `salary`, `skin_male`, `skin_female`) VALUES
  ('police', 0, 'recruit', 'Recruit', 0, '{}', '{}'),
  ('police', 1, 'officer', 'Officer', 0, '{}', '{}'),
  ('police', 2, 'sergeant', 'Sergeant', 0, '{}', '{}'),
  ('police', 3, 'lieutenant', 'Lieutenant', 0, '{}', '{}'),
  ('police', 4, 'captain', 'Captain', 0, '{}', '{}'),
  ('sheriff', 0, 'deputy', 'Deputy', 0, '{}', '{}'),
  ('sheriff', 1, 'senior_deputy', 'Senior Deputy', 0, '{}', '{}'),
  ('sheriff', 2, 'sergeant', 'Sergeant', 0, '{}', '{}'),
  ('sheriff', 3, 'lieutenant', 'Lieutenant', 0, '{}', '{}'),
  ('sheriff', 4, 'captain', 'Captain', 0, '{}', '{}'),
  ('sheriff', 5, 'commander', 'Commander', 0, '{}', '{}'),
  ('sheriff', 6, 'sheriff', 'Sheriff', 0, '{}', '{}'),
  ('doj', 0, 'lawyer', 'Avocat', 0, '{}', '{}'),
  ('doj', 1, 'senior_lawyer', 'Avocat senior', 0, '{}', '{}'),
  ('doj', 2, 'prosecutor', 'Procureur', 0, '{}', '{}'),
  ('doj', 3, 'judge', 'Juge', 0, '{}', '{}'),
  ('ambulance', 0, 'ambulancier', 'Ambulancier', 0, '{}', '{}'),
  ('ambulance', 1, 'senior_ambulancier', 'Ambulancier senior', 0, '{}', '{}'),
  ('ambulance', 2, 'infirmier', 'Infirmier', 0, '{}', '{}'),
  ('ambulance', 3, 'medecin', 'Medecin', 0, '{}', '{}'),
  ('ambulance', 4, 'chief_medecin', 'Chef medecin', 0, '{}', '{}'),
  ('ems', 0, 'ambulancier', 'Ambulancier', 0, '{}', '{}'),
  ('ems', 1, 'senior_ambulancier', 'Ambulancier senior', 0, '{}', '{}'),
  ('ems', 2, 'infirmier', 'Infirmier', 0, '{}', '{}'),
  ('ems', 3, 'medecin', 'Medecin', 0, '{}', '{}'),
  ('ems', 4, 'chief_medecin', 'Chef medecin', 0, '{}', '{}')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `label` = VALUES(`label`),
  `salary` = VALUES(`salary`),
  `skin_male` = VALUES(`skin_male`),
  `skin_female` = VALUES(`skin_female`);