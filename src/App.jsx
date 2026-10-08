import { useEffect, useRef, useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import contourFrame from '../assets/images/contour.png'
import saspSeal from '../assets/images/sasp.png'
import { CHARGES } from './config_charges.js'
import { vehicleList } from './config_vehicles.js'

const navSections = [
  {
    title: 'Général',
    expanded: true,
    items: [
      { label: 'Accueil', key: 'home' },
      { label: 'Citoyens', key: 'citizens' },
      { label: 'Effectifs', key: 'effectifs' },
      { label: 'Pôles / spécialités', key: 'poles-specialties' },
    ],
  },
  {
    title: 'Registres',
    expanded: true,
    items: [
      { label: "Rapports d'opération", key: 'operation-reports' },
      { label: 'Registre des plaintes', key: 'complaint-registry' },
      { label: 'Registre des armes', key: 'weapon-registry' },
      { label: 'Registre des délits', key: 'offense-registry' },
      { label: 'Registre des bracelets', key: 'bracelet-registry' },
      { label: 'Registre des sabots', key: 'boot-registry' },
      { label: 'Véhicules en infraction', key: 'vehicle-offenses' },
    ],
  },
  {
    title: 'Preuves',
    expanded: true,
    items: [{ label: 'Photos / preuves', key: 'photo-proofs' }],
  },
  {
    title: 'Mes dossiers',
    expanded: true,
    items: [
      { label: 'Mes interrogatoires', key: 'interrogations' },
      { label: "Mes rapports d'incident", key: 'incident-reports' },
    ],
  },
  {
    title: 'Police academy',
    expanded: true,
    items: [
      { label: 'Suivi rookie', key: 'rookie-follow-up' },
      { label: 'Sessions', key: 'academy-sessions' },
      { label: 'Questions test final', key: 'final-test-questions' },
      { label: 'Template critères', key: 'academy-criteria-templates' },
    ],
  },
  {
    title: 'Superviseur',
    expanded: true,
    items: [
      { label: 'Liste des interrogatoires', key: 'supervisor-interrogations' },
      { label: "Liste des rapports d'incident", key: 'supervisor-incident-reports' },
      { label: 'Statistiques des agents', key: 'agent-statistics' },
    ],
  },
]

const adminNavSections = [
  {
    title: 'Utilisateurs',
    expanded: true,
    items: [{ label: 'Utilisateurs', key: 'admin-users' }],
  },
  {
    title: 'Configuration',
    expanded: true,
    items: [
      { label: 'Charges / Délits', key: 'admin-charges' },
      { label: 'Grades', key: 'admin-grades' },
      { label: 'Pôles / spécialités', key: 'admin-specialties' },
      { label: 'Templates documents', key: 'admin-document-templates' },
      { label: 'Questions formulaire PA', key: 'admin-pa-form-questions' },
      { label: 'Critères rookie', key: 'admin-rookie-criteria' },
    ],
  },
]

const mcdNavSections = [
  {
    title: 'Recensement',
    expanded: true,
    items: [
      { label: 'Groupuscules', key: 'mcd-groupuscules' },
      { label: 'Drogues', key: 'mcd-drogues' },
      { label: 'Interrogatoires', key: 'interrogations' },
      { label: 'Activités criminelles', key: 'mcd-activites-criminelles' },
    ],
  },
  {
    title: 'Registres',
    expanded: true,
    items: [
      { label: 'Photos / Preuves', key: 'photo-proofs' },
      { label: 'Registre balistique', key: 'weapon-registry' },
    ],
  },
  {
    title: 'Medico-légal',
    expanded: true,
    items: [{ label: 'Rapports légiste', key: 'mcd-rapports-legiste' }],
  },
  {
    title: 'Etat-Major',
    expanded: true,
    items: [{ label: "Dossiers d'enquête", key: 'mcd-dossiers-enquete' }],
  },
]

const autopsyReports = [
  { id: 355, date: 'Le 26 mars 2026', citizen: 'Jack Carter', sex: 'Homme', birthDate: '15/08/1988', weight: '82', height: '1m78', ethnicity: 'Caucasien', deathLocation: 'Vinewood Hills, près du panneau', deathLocationPhoto: '', callMessage: 'Message TPH 555-1010', internalInjuries: ['Fracture crânienne', 'Hémorragie cérébrale'], externalInjuries: ['Impact frontal', 'Lacérations multiples'], bloodTest: 'Taux alcoolémie élevé', bodyPhotos: [], inventoryPhotos: [], deathDate: 'Le 26 mars 2026 à 03:15', deathCause: 'Traumatisme crânien', deathNature: 'Accident', estimatedTime: 'Décédé sur le coup', psOnScene: 'Non', agentsOnScene: '45 | Marcus Webb' },
  { id: 354, date: 'Le 26 mars 2026', citizen: 'Shawn Clayton Jax', sex: 'Homme', birthDate: '02/11/1990', weight: '78', height: '1m82', ethnicity: 'Afro-américain', deathLocation: 'Strawberry Ave, devant le Vanilla Unicorn', deathLocationPhoto: '', callMessage: 'Message TPH 555-1100', internalInjuries: ['Perforation pulmonaire'], externalInjuries: ['Plaie par balle thorax'], bloodTest: 'RAS', bodyPhotos: [], inventoryPhotos: [], deathDate: 'Le 26 mars 2026 à 01:42', deathCause: 'Plaie par balle', deathNature: 'Homicide', estimatedTime: 'Mort vers 1h-2h du matin', psOnScene: 'Oui', agentsOnScene: '78 | Derek Stone' },
  { id: 353, date: 'Le 25 mars 2026', citizen: 'Lucia Moose Jimenez', sex: 'Femme', birthDate: '09/04/1993', weight: '55', height: '1m63', ethnicity: 'Hispanique', deathLocation: 'El Burro Heights, entrepôt désaffecté', deathLocationPhoto: '', callMessage: 'Message TPH 555-1212', internalInjuries: ['Hémorragie interne'], externalInjuries: ['Gorge tranchée'], bloodTest: "L'adn correspond au défunt", bodyPhotos: [], inventoryPhotos: [], deathDate: 'Le 25 mars 2026 à 19:30', deathCause: 'Gorge tranchée', deathNature: 'Homicide', estimatedTime: 'Morte vers 18h-19h', psOnScene: 'Oui', agentsOnScene: '112 | Sarah Lin' },
  { id: 352, date: 'Le 25 mars 2026', citizen: 'Jalen Bellin', sex: 'Homme', birthDate: '17/06/1997', weight: '70', height: '1m75', ethnicity: 'Afro-américain', deathLocation: 'Davis, terrain vague', deathLocationPhoto: '', callMessage: 'Message TPH 555-1313', internalInjuries: ['Lacération hépatique'], externalInjuries: ['Multiples coups de couteau'], bloodTest: 'RAS', bodyPhotos: [], inventoryPhotos: [], deathDate: 'Le 25 mars 2026 à 16:10', deathCause: 'Hémorragie massive', deathNature: 'Homicide', estimatedTime: 'Mort vers 15h-16h', psOnScene: 'Oui', agentsOnScene: '33 | James Cooper' },
  { id: 351, date: 'Le 25 mars 2026', citizen: 'Keisan Sleygun', sex: 'Homme', birthDate: '22/01/1985', weight: '90', height: '1m85', ethnicity: 'Caucasien', deathLocation: 'Sandy Shores, bord de route', deathLocationPhoto: '', callMessage: 'Message TPH 555-1414', internalInjuries: ['Rupture aortique'], externalInjuries: ['Brûlures au 3ème degré'], bloodTest: 'Traces de stupéfiants', bodyPhotos: [], inventoryPhotos: [], deathDate: 'Le 25 mars 2026 à 14:00', deathCause: 'Explosion véhicule', deathNature: 'Accident', estimatedTime: 'Décédé sur le coup', psOnScene: 'Non', agentsOnScene: '56 | Alex Turner' },
  { id: 350, date: 'Le 25 mars 2026', citizen: 'Charles Licheng', sex: 'Homme', birthDate: '05/09/1991', weight: '65', height: '1m70', ethnicity: 'Asiatique', deathLocation: 'Little Seoul, arrière-boutique', deathLocationPhoto: '', callMessage: 'Message TPH 555-1515', internalInjuries: ['Empoisonnement organique'], externalInjuries: ['Aucune'], bloodTest: 'Présence de cyanure', bodyPhotos: [], inventoryPhotos: [], deathDate: 'Le 25 mars 2026 à 11:20', deathCause: 'Empoisonnement', deathNature: 'Homicide', estimatedTime: 'Mort vers 10h-11h', psOnScene: 'Non', agentsOnScene: '89 | Kim Park' },
  { id: 349, date: 'Le 25 mars 2026', citizen: 'Yubin Sunwoo', sex: 'Femme', birthDate: '14/12/1996', weight: '50', height: '1m58', ethnicity: 'Asiatique', deathLocation: 'Vespucci Beach, sous la jetée', deathLocationPhoto: '', callMessage: 'Message TPH 555-1616', internalInjuries: ['Poumons remplis d\'eau'], externalInjuries: ['Contusions au visage'], bloodTest: 'RAS', bodyPhotos: [], inventoryPhotos: [], deathDate: 'Le 25 mars 2026 à 08:45', deathCause: 'Noyade', deathNature: 'Indéterminée', estimatedTime: 'Morte vers 6h-7h du matin', psOnScene: 'Oui', agentsOnScene: '21 | Ryan Brooks' },
  { id: 348, date: 'Le 25 mars 2026', citizen: 'Drew Clayton Jax', sex: 'Homme', birthDate: '30/07/1989', weight: '85', height: '1m80', ethnicity: 'Afro-américain', deathLocation: 'Rancho, parking souterrain', deathLocationPhoto: '', callMessage: 'Message TPH 555-1717', internalInjuries: ['Hémorragie interne massive'], externalInjuries: ['Plaies par balle multiples'], bloodTest: 'RAS', bodyPhotos: [], inventoryPhotos: [], deathDate: 'Le 25 mars 2026 à 04:30', deathCause: 'Multiples plaies par balle', deathNature: 'Homicide', estimatedTime: 'Mort vers 3h-4h du matin', psOnScene: 'Oui', agentsOnScene: '67 | Nathan Price' },
  { id: 347, date: 'Le 25 mars 2026', citizen: 'Maissa Parker', sex: 'Femme', birthDate: '11/03/1994', weight: '58', height: '1m65', ethnicity: 'Caucasienne', deathLocation: 'Mirror Park, lac', deathLocationPhoto: '', callMessage: 'Message TPH 555-1818', internalInjuries: ['Insuffisance cardiaque'], externalInjuries: ['Aucune'], bloodTest: 'Présence de sédatifs', bodyPhotos: [], inventoryPhotos: [], deathDate: 'Le 25 mars 2026 à 02:00', deathCause: 'Overdose médicamenteuse', deathNature: 'Suicide', estimatedTime: 'Morte vers minuit-1h', psOnScene: 'Non', agentsOnScene: '98 | Laura Chen' },
  { id: 346, date: 'Le 25 mars 2026', citizen: "K'eon Santana", sex: 'Homme', birthDate: '28/05/1992', weight: '75', height: '1m76', ethnicity: 'Hispanique', deathLocation: 'Cypress Flats, zone industrielle', deathLocationPhoto: '', callMessage: 'Message TPH 555-1919', internalInjuries: ['Fractures multiples'], externalInjuries: ['Écrasement thoracique'], bloodTest: 'RAS', bodyPhotos: [], inventoryPhotos: [], deathDate: 'Le 24 mars 2026 à 22:15', deathCause: 'Écrasement', deathNature: 'Accident', estimatedTime: 'Mort vers 21h-22h', psOnScene: 'Oui', agentsOnScene: '108 | Cody Hope' },
  { id: 345, date: 'Le 24 mars 2026', citizen: 'Rosa Vega', sex: 'Femme', birthDate: '02/02/1995', weight: '60', height: '1m60', ethnicity: 'Hispanique', deathLocation: 'Plage paleto, dans l\'eau', deathLocationPhoto: '', callMessage: 'Message TPH 555-1212', internalInjuries: ['Hémorragie interne', 'Poumons rempli d\'eau'], externalInjuries: ['Gorge tranchée', 'Trachée coupée'], bloodTest: "L'adn correspond au défunt", bodyPhotos: [], inventoryPhotos: [], deathDate: 'Le 23 mars 2026 à 21:36', deathCause: 'Gorge tranchée ainsi que noyade', deathNature: 'Homicide', estimatedTime: 'Morte vers 3-4h dans la nuit du 22 au 23 Mars', psOnScene: 'Oui', agentsOnScene: '108 | Cody Hope' },
]

const wantedPeople = [
  { id: '01', name: 'Robert James', gender: 'Homme', phone: '555-7506', birthDate: '23/07/1995', avatarLabel: 'RJ', tones: ['#8a7a3f', '#54472b', '#2f2416'] },
  { id: '02', name: 'Teddy Clark', gender: 'Homme', phone: '555-8277', birthDate: '04/02/1995', avatarLabel: 'TC', tones: ['#f4e9d4', '#cb7f3f', '#3b2b1f'] },
  { id: '03', name: 'Marcus Johnson', gender: 'Homme', phone: '555-59', birthDate: '10/06/1990', avatarLabel: 'MJ', tones: ['#b1836c', '#725144', '#352823'] },
  { id: '04', name: 'Tyler Harris', gender: 'Homme', phone: '555-0205', birthDate: '09/09/1989', avatarLabel: 'TH', tones: ['#8b9e78', '#536248', '#263124'] },
  { id: '05', name: 'Jason Brooks', gender: 'Homme', phone: '555-1190', birthDate: '14/11/1992', avatarLabel: 'JB', tones: ['#8ea2b5', '#455467', '#202836'] },
  { id: '06', name: 'Victor Parker', gender: 'Homme', phone: '555-4411', birthDate: '08/01/1986', avatarLabel: 'VP', tones: ['#9f8267', '#684f3c', '#33251d'] },
  { id: '07', name: 'Anthony Reed', gender: 'Homme', phone: '555-9115', birthDate: '27/08/1991', avatarLabel: 'AR', tones: ['#9d7375', '#654042', '#2f1d1f'] },
  { id: '08', name: 'Damian Stone', gender: 'Homme', phone: '555-0021', birthDate: '02/05/1987', avatarLabel: 'DS', tones: ['#9f9d71', '#5e5d3e', '#2f301e'] },
  { id: '09', name: 'Leon Cooper', gender: 'Homme', phone: '555-4419', birthDate: '18/03/1994', avatarLabel: 'LC', tones: ['#7f8c9f', '#485467', '#1f2631'] },
  { id: '10', name: 'Nathan Price', gender: 'Homme', phone: '555-1515', birthDate: '20/12/1988', avatarLabel: 'NP', tones: ['#8c7f6c', '#574839', '#2a2019'] },
  { id: '11', name: 'Aaron Lewis', gender: 'Homme', phone: '555-8170', birthDate: '13/04/1993', avatarLabel: 'AL', tones: ['#798a96', '#42515f', '#1f2730'] },
  { id: '12', name: 'Chris Moore', gender: 'Homme', phone: '555-6643', birthDate: '29/01/1990', avatarLabel: 'CM', tones: ['#8c7b92', '#55465f', '#281f30'] },
]

const citizens = [
  {
    id: '01',
    name: 'Charles Licheng',
    birthDate: '03 févr. 2004',
    email: 'charleslicheng@mail.loop',
    phone: '555-4577',
    censusAt: '23/02/2026 à 01:10',
    portraitLabel: 'CL',
    portraitTones: ['#bdb294', '#bb835f', '#2e2117'],
    stats: [
      { label: 'Poids', value: '76' },
      { label: 'Taille', value: '172' },
      { label: 'Sexe', value: 'Homme' },
      { label: 'Adresse', value: 'Foyer Grams' },
      { label: 'Ethnie', value: 'Asiatique' },
      { label: 'Couleur de cheveux', value: 'Noir' },
      { label: 'Couleur des yeux', value: 'Marron' },
      { label: 'Appartenance', value: 'SYR' },
      { label: 'Emploi', value: 'N/A' },
      { label: 'Permis de conduire', value: 'Non-valide' },
      { label: 'Décédé', value: false, dot: true },
      { label: 'Wanted', value: false, dot: true },
      { label: 'PPA civil', value: false, dot: true },
      { label: 'PPA de chasse', value: false, dot: true },
    ],
    records: {
      arrestation: [
        {
          id: 'ad-01',
          reportNumber: '#1220',
          author: 'Mike Delson',
          authorId: '21',
          date: '20 mars 2026 à 01:55',
          status: 'En attente de traitement',
          ...buildArrestDossierFormValues({ name: 'Charles Licheng', phone: '555-4577', email: 'charleslicheng@mail.loop' }),
        },
        {
          id: 'ad-02',
          reportNumber: '#1154',
          author: 'Koffi Diallo',
          authorId: '24',
          date: '10 mars 2026 à 00:20',
          status: 'Terminé',
          ...buildArrestDossierFormValues({ name: 'Charles Licheng', phone: '555-4577', email: 'charleslicheng@mail.loop' }, {
            arrestDateTime: '10/03/2026 00:20',
            rightsDateTime: '10/03/2026 00:18',
            selectedAgents: ['24 | Koffi Diallo'],
            reportNumber: '#1154',
            status: 'Terminé',
            report: "Le mis en cause a été interpellé après poursuite. Les droits ont été lus sur place puis transport au poste.",
            selectedCharges: ['Refus d’obtempérer'],
            chargeItems: [{ id: 'dc03', label: 'Refus d’obtempérer', quantity: 1, tentative: false, complicity: false }],
            fineScale: 'Nominal',
            proofFolder: '',
            vehicles: [],
            weapons: [],
            proofImages: [],
            selectedLead: {
              name: 'Aucun avocat désigné',
              role: '-',
              email: '-',
              phone: '-',
            },
          }),
        },
      ],
      complaints: [],
      depositions: [],
      bracelets: [],
    },
  },
  {
    id: '02',
    name: 'Charles Maxwell',
    birthDate: '30/06/1995',
    email: 'charlesmaxwell@mail.loop',
    phone: '555-3328',
    censusAt: '01/03/2026 à 10:24',
    portraitLabel: 'CM',
    portraitTones: ['#91816d', '#4f3a2a', '#211710'],
    stats: [
      { label: 'Poids', value: '74' },
      { label: 'Taille', value: '182' },
      { label: 'Sexe', value: 'Homme' },
      { label: 'Adresse', value: 'x' },
      { label: 'Ethnie', value: 'Noire' },
      { label: 'Couleur de cheveux', value: 'noir' },
      { label: 'Couleur des yeux', value: 'marron' },
      { label: 'Appartenance', value: 'x' },
      { label: 'Emploi', value: 'mécano' },
      { label: 'Permis de conduire', value: 'Valide' },
      { label: 'Décédé', value: false, dot: true },
      { label: 'Wanted', value: false, dot: true },
      { label: 'PPA civil', value: false, dot: true },
      { label: 'PPA de chasse', value: false, dot: true },
    ],
    records: {
      arrestation: [],
      complaints: [],
      depositions: [],
      bracelets: [],
    },
  },
  {
    id: '03',
    name: 'Charles Winslow',
    birthDate: '11/11/1996',
    email: 'charleswinslow@mail.loop',
    phone: '555-8870',
    censusAt: '28/02/2026 à 16:41',
    portraitLabel: 'CW',
    portraitTones: ['#9f876e', '#5b4636', '#261c16'],
    stats: [
      { label: 'Poids', value: '68' },
      { label: 'Taille', value: '177' },
      { label: 'Sexe', value: 'Homme' },
      { label: 'Adresse', value: 'x' },
      { label: 'Ethnie', value: 'Métisse' },
      { label: 'Couleur de cheveux', value: 'noir' },
      { label: 'Couleur des yeux', value: 'marron' },
      { label: 'Appartenance', value: 'x' },
      { label: 'Emploi', value: 'aucun' },
      { label: 'Permis de conduire', value: 'Valide' },
      { label: 'Décédé', value: false, dot: true },
      { label: 'Wanted', value: false, dot: true },
      { label: 'PPA civil', value: false, dot: true },
      { label: 'PPA de chasse', value: false, dot: true },
    ],
    records: {
      arrestation: [],
      complaints: [],
      depositions: [],
      bracelets: [],
    },
  },
  {
    id: '04',
    name: 'Miyabi Kameda',
    birthDate: '27 avr. 2000',
    email: 'mkameda@gmail.loop',
    phone: '555-9432',
    censusAt: '03/02/2026 à 23:09',
    portraitLabel: 'MK',
    portraitTones: ['#d1d0c9', '#f1d9d5', '#1a1a1d'],
    stats: [
      { label: 'Poids', value: '62' },
      { label: 'Taille', value: '169' },
      { label: 'Sexe', value: 'Femme' },
      { label: 'Adresse', value: 'x' },
      { label: 'Ethnie', value: 'Asiatique' },
      { label: 'Couleur de cheveux', value: 'noir' },
      { label: 'Couleur des yeux', value: 'brun' },
      { label: 'Appartenance', value: 'x' },
      { label: 'Emploi', value: 'pacifique' },
      { label: 'Permis de conduire', value: 'Non-valide' },
      { label: 'Décédé', value: false, dot: true },
      { label: 'Wanted', value: false, dot: true },
      { label: 'PPA civil', value: false, dot: true },
      { label: 'PPA de chasse', value: false, dot: true },
    ],
    records: {
      arrestation: [],
      complaints: [
        {
          id: 'pl-01',
          author: 'Camille Hope',
          date: '06 mars 2026 à 00:45',
          reason: 'Témoignage meurtre',
        },
      ],
      depositions: [
        {
          id: 'dep-01',
          author: 'Camille Hope',
          date: '06 mars 2026 à 00:45',
          reason: 'Témoignage meurtre',
        },
      ],
      bracelets: [],
    },
  },
  {
    id: '05',
    name: 'Pixie Sue Nakamoto',
    birthDate: '20/09/1997',
    email: 'psnakamoto@gmail.loop',
    phone: '555-2073',
    censusAt: '12/01/2026 à 08:17',
    portraitLabel: 'PN',
    portraitTones: ['#c0b49b', '#5c4338', '#261c19'],
    stats: [
      { label: 'Poids', value: '51' },
      { label: 'Taille', value: '160' },
      { label: 'Sexe', value: 'Femme' },
      { label: 'Adresse', value: 'x' },
      { label: 'Ethnie', value: 'Asiatique' },
      { label: 'Couleur de cheveux', value: 'brun' },
      { label: 'Couleur des yeux', value: 'marron' },
      { label: 'Appartenance', value: 'x' },
      { label: 'Emploi', value: 'aucun' },
      { label: 'Permis de conduire', value: 'Valide' },
      { label: 'Décédé', value: false, dot: true },
      { label: 'Wanted', value: false, dot: true },
      { label: 'PPA civil', value: false, dot: true },
      { label: 'PPA de chasse', value: false, dot: true },
    ],
    records: {
      arrestation: [],
      complaints: [],
      depositions: [],
      bracelets: [],
    },
  },
]

const recordTabs = [
  { key: 'arrestation', label: "Dossier d'Arrestation" },
  { key: 'arrestReports', label: "Rapports d'arrestation" },
  { key: 'tickets', label: 'Tickets routiers' },
  { key: 'mandates', label: "Mandats d'arrêt" },
  { key: 'complaints', label: 'Plaintes' },
  { key: 'depositions', label: 'Dépositions' },
  { key: 'bracelets', label: 'Bracelets électroniques' },
]

const citizenRecordKeys = recordTabs.map((tab) => tab.key)

function normalizeCitizenRecords(records) {
  const source = records && typeof records === 'object' ? records : {}

  return citizenRecordKeys.reduce((accumulator, key) => {
    accumulator[key] = Array.isArray(source[key]) ? source[key] : []
    return accumulator
  }, { ...source })
}

function normalizeCitizenProfile(citizen) {
  if (!citizen || typeof citizen !== 'object') {
    return citizen
  }

  return {
    ...citizen,
    records: normalizeCitizenRecords(citizen.records),
  }
}

const recordEmptyMessages = {
  arrestation: "Pas de dossier d'arrestation",
  arrestReports: "Pas de rapport d'arrestation",
  tickets: 'Pas de ticket routier',
  mandates: "Pas de mandat d'arrêt",
  complaints: 'Pas de plainte',
  depositions: 'Pas de déposition',
  bracelets: 'Pas de bracelet électronique',
}

const incidentReports = [
  {
    id: '450',
    officerId: '02',
    author: 'Ruben Serano',
    title: 'Transaction Locura',
    date: '13/03/2026',
    dateTime: '13/03/2026 à 02:47',
    location: 'Vespucci - San Andreas Avenue',
    suspect: 'Aucun suspect interpellé',
    status: 'Clos',
    participants: ['02 | Ruben Serano', '11 | Olivia Fletcher'],
    summary: 'Intervention sur une transaction suspecte au niveau de Locura. Contrôle de zone effectué et dispersion des individus.',
    details: "À l'arrivée des unités, plusieurs individus ont quitté la zone rapidement. Une fouille de secteur a été menée, sans retrouver de produit ni d'arme. Les témoignages indiquent une transaction interrompue à l'arrivée des forces de l'ordre.",
  },
  {
    id: '449',
    officerId: '13',
    author: 'Isaiah Foster',
    title: 'Fusillade',
    date: '13/03/2026',
    dateTime: '13/03/2026 à 01:18',
    location: 'Davis - Carson Avenue',
    suspect: 'Homme inconnu en fuite',
    status: 'En attente',
    participants: ['13 | Isaiah Foster', '24 | Giulia Alvarez'],
    summary: 'Fusillade signalée à Davis avec un tireur en fuite avant l’arrivée des patrouilles.',
    details: 'Plusieurs impacts relevés sur façade et deux douilles récupérées sur place. Une victime légère a été prise en charge par les secours. Le secteur a été gelé pour relevés complémentaires.',
  },
  {
    id: '448',
    officerId: '00',
    author: 'Sam Connors',
    title: 'Pompe',
    date: '12/03/2026',
    dateTime: '12/03/2026 à 23:55',
    location: 'Little Seoul - Station Xero',
    suspect: 'Groupe non identifié',
    status: 'Clos',
    participants: ['00 | Sam Connors'],
    summary: 'Dégradation et vol sur pompe à essence.',
    details: 'Constatation de dégradations sur la borne de paiement et fuite des auteurs avant interpellation. Exploitation des caméras demandée.',
  },
  {
    id: '447',
    officerId: '16',
    author: 'Vaniye Yazamët',
    title: 'Fusillade',
    date: '11/03/2026',
    dateTime: '11/03/2026 à 22:09',
    location: 'Strawberry',
    suspect: 'Deux suspects cagoulés',
    status: 'Clos',
    participants: ['16 | Vaniye Yazamët', '58 | Arthur Romano'],
    summary: 'Échange de tirs entre deux véhicules.',
    details: 'Poursuite engagée sans interpellation. Plusieurs témoignages recueillis et un véhicule abandonné saisi pour expertise.',
  },
  {
    id: '445',
    officerId: '121',
    author: 'William Sancrow',
    title: "Prise d'otage",
    date: '10/03/2026',
    dateTime: '10/03/2026 à 20:12',
    location: 'Murrieta Heights',
    suspect: 'Trois suspects armés',
    status: 'Clos',
    participants: ['121 | William Sancrow', '113 | Reese Kronos'],
    summary: 'Prise d’otage dans un commerce avec négociation aboutie.',
    details: 'L’otage a été libéré après négociation. Les suspects ont obtenu un véhicule de fuite et une enquête complémentaire a été ouverte.',
  },
  {
    id: '444',
    officerId: '24',
    author: 'Giulia Alvarez',
    title: 'Fusillade',
    date: '10/03/2026',
    dateTime: '10/03/2026 à 18:40',
    location: 'La Mesa',
    suspect: 'Suspect blessé non identifié',
    status: 'En attente',
    participants: ['24 | Giulia Alvarez'],
    summary: 'Faits de fusillade sur voie publique avec fuite des participants.',
    details: 'Scène sécurisée et balisée. Aucun témoin coopératif sur place au moment de la rédaction.',
  },
  {
    id: '446',
    officerId: '147',
    author: 'Naya Brooks',
    title: "Prise d'otage",
    date: '10/03/2026',
    dateTime: '10/03/2026 à 14:23',
    location: 'Harmony',
    suspect: 'Deux suspects armés',
    status: 'Clos',
    participants: ['147 | Naya Brooks', '119 | Josh Evans'],
    summary: 'Prise d’otage dans un point de vente isolé.',
    details: 'Les ravisseurs ont quitté les lieux après négociation courte. Un rapport complémentaire d’identification est en attente.',
  },
  {
    id: '442',
    officerId: '58',
    author: 'Arthur Romano',
    title: 'Braquage supérette',
    date: '09/03/2026',
    dateTime: '09/03/2026 à 21:07',
    location: 'Sandy Shores',
    suspect: 'Auteur masqué',
    status: 'Clos',
    participants: ['58 | Arthur Romano', '02 | Ruben Serano'],
    summary: 'Braquage de supérette avec fuite du suspect avant verrouillage du secteur.',
    details: 'Le gérant a remis l’enregistrement vidéo. Relevé d’empreintes demandé sur la caisse et les surfaces de contact.',
  },
]

const operationReports = [
  {
    id: 'op-1735',
    reportNumber: '#1735',
    author: '113 | Reese Kronos',
    incidentType: "Prise d'otage",
    date: '13/03/2026',
    dateTime: '13/03/2026 à 22:14',
    location: 'Vangelico - Del Perro',
    selectedOfficers: ['113 | Reese Kronos', '21 | Mike Delson', '11 | Olivia Fletcher'],
    selectedHostages: ['Martha Doyle'],
    claims: 'Demande d’un Buffalo STX, passage libre et ravitaillement en carburant.',
    negotiationLead: '113 | Reese Kronos',
    fieldLead: '21 | Mike Delson',
    proofFolders: ['Bijouterie sud — 13/03/2026'],
    proofImages: [],
    report: 'Déploiement des unités autour de Vangelico après signalement d’une prise d’otage. Un périmètre de sécurité a été établi, les négociations ont été ouvertes avec les auteurs et un protocole de sortie a été proposé. L’otage a été récupéré vivant. Les suspects ont obtenu un véhicule puis ont pris la fuite en direction de l’ouest.',
  },
  {
    id: 'op-1728',
    reportNumber: '#1728',
    author: '00 | Sam Connors',
    incidentType: 'Braquage de convoi',
    date: '12/03/2026',
    dateTime: '12/03/2026 à 19:42',
    location: 'Great Ocean Highway',
    selectedOfficers: ['00 | Sam Connors', '02 | Ruben Serano', '24 | Giulia Alvarez'],
    selectedHostages: [],
    claims: 'Aucune revendication, échange de tirs immédiat.',
    negotiationLead: '00 | Sam Connors',
    fieldLead: '02 | Ruben Serano',
    proofFolders: ['Convoi 2 — 13/03/2026'],
    proofImages: [],
    report: 'Intervention sur un convoi attaqué en sortie nord. Les suspects ont ouvert le feu à l’arrivée des premières unités. Deux véhicules ont été engagés dans la fuite. Les relevés balistiques et les traces de freinage ont été transmis au service enquête.',
  },
  {
    id: 'op-1714',
    reportNumber: '#1714',
    author: '13 | Isaiah Foster',
    incidentType: 'Fusillade',
    date: '11/03/2026',
    dateTime: '11/03/2026 à 23:08',
    location: 'Vinewood Boulevard',
    selectedOfficers: ['13 | Isaiah Foster', '24 | Giulia Alvarez'],
    selectedHostages: [],
    claims: 'Aucune revendication reçue.',
    negotiationLead: '13 | Isaiah Foster',
    fieldLead: '24 | Giulia Alvarez',
    proofFolders: ['Fusillade Sandy Shore — 13/03/2026'],
    proofImages: [],
    report: 'Plusieurs appels ont signalé des coups de feu sur Vinewood Boulevard. Les unités ont sécurisé la zone, récupéré deux douilles et identifié une trajectoire de fuite vers Mirror Park. Aucun suspect n’a été interpellé sur place.',
  },
]

const complaintStatusOptions = ['Tous les statuts', 'Non commencée', 'En cours', 'En attente', 'Terminée sans suite', 'Terminée classé']

const complaintStatusClassMap = {
  'Non commencée': 'complaint-status-not-started',
  'En cours': 'complaint-status-in-progress',
  'En attente': 'complaint-status-waiting',
  'Terminée sans suite': 'complaint-status-closed',
  'Terminée classé': 'complaint-status-filed',
}
const complaintsRegistry = [
  { id: 'pl-01', date: 'Le 17 juin 2025 à 23:10', citizen: 'Thomas Anderson', status: 'Terminée classé', officer: '25 | Terrance Johnson', against: 'Nanami Sano', reasons: 'Coup et blessure', statusReason: '--' },
  { id: 'pl-02', date: 'Le 09 mars 2026 à 00:02', citizen: 'Caleb Rivas', status: 'En cours', officer: '59 | Diana Singleton', against: 'Cabinet KRV', reasons: 'Plainte administrative', statusReason: 'Suivi de dossier en cours' },
  { id: 'pl-03', date: 'Le 08 mars 2026 à 22:51', citizen: 'Victor Grayson', status: 'En cours', officer: '12 | Roman Teva-Maere', against: 'Nanami Sano', reasons: 'Abus de confiance', statusReason: '--' },
  { id: 'pl-04', date: 'Le 06 mars 2026 à 00:18', citizen: 'Isamu Valerius Tanaka', status: 'En attente', officer: '49 | Rafael Ezequiel Rivera', against: 'Cabinet KRV', reasons: 'Diffamation', statusReason: 'Attente de procès' },
  { id: 'pl-05', date: 'Le 05 mars 2026 à 23:49', citizen: 'Melvin Ibarra', status: 'En attente', officer: '49 | Rafael Ezequiel Rivera', against: 'Kahaia Teva Maere', reasons: 'Escroquerie', statusReason: '--' },
  { id: 'pl-06', date: 'Le 03 mars 2026 à 23:15', citizen: 'Cataleya Romano', status: 'En cours', officer: '115 | Atlas Merrick', against: 'Kahaia Teva Maere', reasons: 'Diffamation', statusReason: '--' },
  { id: 'pl-07', date: 'Le 03 mars 2026 à 22:20', citizen: 'Cataleya Romano', status: 'Terminée classé', officer: '115 | Atlas Merrick', against: 'Kahaia Teva Maere', reasons: 'Diffamation', statusReason: '--' },
  { id: 'pl-08', date: 'Le 02 mars 2026 à 22:18', citizen: 'Shiny Mountares', status: 'En cours', officer: '91 | Calvin Clarks', against: 'Jane Doe', reasons: 'Menaces', statusReason: '--' },
  { id: 'pl-09', date: 'Le 02 mars 2026 à 00:21', citizen: 'Hadrya Watson', status: 'En cours', officer: '133 | Adrian Varela', against: 'John Doe', reasons: 'Agression', statusReason: '--' },
  { id: 'pl-10', date: 'Le 02 mars 2026 à 00:21', citizen: 'Bonnie Winters', status: 'En cours', officer: '136 | Liza Edward', against: 'John Doe', reasons: 'Vol', statusReason: '--' },
  { id: 'pl-11', date: 'Le 01 mars 2026 à 00:42', citizen: 'Melvin Ibarra', status: 'Terminée classé', officer: '24 | Giulia Alvarez', against: 'John Doe', reasons: 'Diffamation', statusReason: '--' },
]

const specialtyUnits = [
  {
    id: 'asd',
    title: 'Nord - ASD (3)',
    lead: '',
    coLead: '',
    members: [
      'Eiríkr Skardisson (555-8137)',
      'Lucas Leone (555-6584)',
      'William Sancrow (555-0419)',
    ],
  },
  {
    id: 'crime',
    title: 'Nord - Crime (8)',
    lead: 'Juda Matarata',
    coLead: 'Eiríkr Skardisson',
    members: [
      'Ashley Cruz (555-6773)',
      'Atlas Merrick (555-5602)',
      'Eiríkr Skardisson (555-8137)',
      'IT MDT (555-0303)',
      'Josh Evans (555-2093)',
      'Juda Matarata (555-4396)',
      'Marcus Ortega (555-9029)',
      'Paige Leone (555-9079)',
    ],
  },
  {
    id: 'doa',
    title: 'Nord - DOA (9)',
    lead: 'Khofy Morgan',
    coLead: 'Sylas Blackwood',
    members: [
      'Akarin Teva-Maere (555-4103)',
      'Braxton Winslow (555-5138)',
      'Cody Hope (555-8532)',
      'Doug McBernick (555-9091)',
      'Jackson Dawson (555-1637)',
      'Juda Matarata (555-4396)',
      'Khofy Morgan (555-0918)',
      'Sylas Blackwood (555-7542)',
      'Yamamoto Wang (555-8087)',
    ],
  },
  {
    id: 'pa',
    title: 'Nord - P.A (7)',
    lead: 'Cody Hope',
    coLead: '',
    members: [
      'Barry Blackwood (555-7222)',
      'Cody Hope (555-8532)',
      'IT MDT (555-0303)',
      'Josh Evans (555-2093)',
      'Lucas Leone (555-6584)',
      'Paige Leone (555-9079)',
      'Yamamoto Wang (555-8087)',
    ],
  },
  {
    id: 'traffic',
    title: 'Nord - Traffic Division (4)',
    lead: 'Juda Matarata',
    coLead: '',
    members: [
      'Akarin Teva-Maere (555-4103)',
      'Cody Hope (555-8532)',
      'Juda Matarata (555-4396)',
      'Lucas Leone (555-6584)',
    ],
  },
  {
    id: 'training',
    title: 'Nord - Training Officer (4)',
    lead: 'Cody Hope',
    coLead: '',
    members: [
      'Eiríkr Skardisson (555-8137)',
      'Liza Edward (555-4478)',
      'Sylas Blackwood (555-7542)',
      'William Sancrow (555-0419)',
    ],
  },
  {
    id: 'sud-asd',
    title: 'Sud - ASD (5)',
    lead: 'Ewan Wilson',
    coLead: '',
    members: [
      'Daniel Choi (555-1401)',
      'Ewan Wilson (555-4214)',
      'Jett Singleton (555-5978)',
      'Jinwoo Parks (555-1589)',
      'Silas Cross (555-5192)',
    ],
  },
  {
    id: 'sud-crime',
    title: 'Sud - Crime (12)',
    lead: 'Silas Cross',
    coLead: 'Mike Delson',
    supervisor: '02',
    members: [
      'Azumi Ishida (555-0017)',
      'Calvin Clarks (555-3022)',
      'Clara Grey (555-7009)',
      'Giulia Alvarez (555-5420)',
      'Isaiah Foster (555-6196)',
      'Jayson Murphy (555-5628)',
      'Jett Singleton (555-5978)',
      'Jinwoo Parks (555-1589)',
      'Mike Delson (555-5678)',
      'Olivia Fletcher (555-7302)',
      'Ruben Serano (555-0402)',
      'Silas Cross (555-5192)',
    ],
  },
  {
    id: 'sud-doa',
    title: 'Sud - DOA (6)',
    lead: '',
    coLead: '',
    supervisor: '03',
    members: [
      'Afonso Da Luz (555-5662)',
      'Brooklyn Blackwood (555-0955)',
      'Daniel Choi (555-1401)',
      'Ilir Kelmendi (555-4151)',
      'Koffi Diallo (555-6580)',
      'Otavio Lua Magalhaes (555-1830)',
    ],
  },
  {
    id: 'sud-irs',
    title: 'Sud - IRS (1)',
    lead: '',
    coLead: 'Reese Kronos',
    members: [
      'Reese Kronos (555-616)',
    ],
  },
  {
    id: 'sud-pa',
    title: 'Sud - P.A (6)',
    lead: 'Ewan Wilson',
    coLead: 'Mike Delson',
    supervisor: '88',
    members: [
      'Brooklyn Blackwood (555-0955)',
      'Caleb Rivas (555-5616)',
      'Diana Singleton (555-0199)',
      'Ewan Wilson (555-4214)',
      'Mike Delson (555-5678)',
      'Otavio Lua Magalhaes (555-1830)',
    ],
  },
  {
    id: 'sud-traffic',
    title: 'Sud - Traffic Division (3)',
    lead: 'Jett Singleton',
    coLead: 'Koffi Diallo',
    members: [
      'Calvin Clarks (555-3022)',
      'Ewan Wilson (555-4214)',
      'Samaël Jarper (555-4144)',
    ],
  },
  {
    id: 'sud-training',
    title: 'Sud - Training Officer (5)',
    lead: 'Ewan Wilson',
    coLead: 'Mike Delson',
    members: [
      'Azumi Ishida (555-0017)',
      'Clara Grey (555-7009)',
      'Daniel Choi (555-1401)',
      'Salva Martinez (555-0764)',
      'Silas Cross (555-5192)',
    ],
  },
]

const offenseVehicles = [
  { id: '01', type: 'Asterope', plate: 'P7PB0SJA', registeredAt: 'Le 18 mars 2026 à 00:18', facts: 1, owner: 'Caleb Ford', ownerSince: 'Le 18 mars 2026 à 00:18', linkedCase: 'PO Boubchouch', linkedCaseBadge: 'Rapport 1084', linkedCaseLabel: 'PO Boubchouch le 17 mars 2026 à 23:45' },
  { id: '02', type: 'Seminole XL', plate: 'JYRLWMEL', registeredAt: 'Le 17 mars 2026 à 22:04', facts: 1, owner: 'Milan Cortez', ownerSince: 'Le 17 mars 2026 à 22:04', linkedCase: 'PO Highway', linkedCaseBadge: 'Rapport 1077', linkedCaseLabel: 'PO Highway le 17 mars 2026 à 22:04' },
  { id: '03', type: 'Greenwood', plate: 'KONGLA82', registeredAt: 'Le 11 mars 2026 à 00:41', facts: 1, owner: 'Darius Kane', ownerSince: 'Le 11 mars 2026 à 00:41', linkedCase: 'PO Rodri & 86', linkedCaseBadge: 'Rapport 1029', linkedCaseLabel: 'PO Rodri & 86 le 11 mars 2026 à 00:41' },
  { id: '04', type: 'Gresley STX', plate: 'GO6TL9LM', registeredAt: 'Le 10 mars 2026 à 23:01', facts: 1, owner: 'Nohan Pierce', ownerSince: 'Le 10 mars 2026 à 23:01', linkedCase: 'PO South', linkedCaseBadge: 'Rapport 1014', linkedCaseLabel: 'PO South le 10 mars 2026 à 23:01' },
  { id: '05', type: 'Sultan2c', plate: '27DHV980', registeredAt: 'Le 06 mars 2026 à 03:50', facts: 1, owner: 'Yanis Morrow', ownerSince: 'Le 06 mars 2026 à 03:50', linkedCase: 'PO Drift', linkedCaseBadge: 'Rapport 0987', linkedCaseLabel: 'PO Drift le 06 mars 2026 à 03:50' },
  { id: '06', type: 'Schrauber', plate: 'UTVZMSP9', registeredAt: 'Le 06 mars 2026 à 02:26', facts: 1, owner: 'Troy Black', ownerSince: 'Le 06 mars 2026 à 02:26', linkedCase: 'PO Sandy', linkedCaseBadge: 'Rapport 0982', linkedCaseLabel: 'PO Sandy le 06 mars 2026 à 02:26' },
  { id: '07', type: 'Gresley STX', plate: '20YBK187', registeredAt: 'Le 06 mars 2026 à 01:20', facts: 1, owner: 'Jonas Reed', ownerSince: 'Le 06 mars 2026 à 01:20', linkedCase: 'PO Vespucci', linkedCaseBadge: 'Rapport 0974', linkedCaseLabel: 'PO Vespucci le 06 mars 2026 à 01:20' },
  { id: '08', type: 'Buffalo S', plate: 'RIJO6OV7', registeredAt: 'Le 05 mars 2026 à 01:37', facts: 4, owner: 'Riley Boone', ownerSince: 'Le 05 mars 2026 à 01:37', linkedCase: 'PO Bison', linkedCaseBadge: 'Rapport 0961', linkedCaseLabel: 'PO Bison le 05 mars 2026 à 01:37' },
  { id: '09', type: 'Sanchez', plate: 'IXUG6KPK', registeredAt: 'Le 04 mars 2026 à 23:53', facts: 1, owner: 'Lio Carter', ownerSince: 'Le 04 mars 2026 à 23:53', linkedCase: 'PO Cross', linkedCaseBadge: 'Rapport 0955', linkedCaseLabel: 'PO Cross le 04 mars 2026 à 23:53' },
  { id: '10', type: 'Sanchez', plate: 'NN7JUBYS', registeredAt: 'Le 04 mars 2026 à 23:52', facts: 1, owner: 'Lio Carter', ownerSince: 'Le 04 mars 2026 à 23:52', linkedCase: 'PO Cross', linkedCaseBadge: 'Rapport 0954', linkedCaseLabel: 'PO Cross le 04 mars 2026 à 23:52' },
]

const weaponRegistryEntries = [
  { id: 'w01', date: 'Le 04 nov. 2025', serial: 'adb3008d-c087-4702-9bf3-e8160059f617', model: 'Glock 20', status: '', origin: 'Arme police', reason: '', assignedOfficer: '21 | Mike Delson', stolen: false, archived: false, checkedPs: false, encodedBy: '21 | Mike Delson', state: 'Actif' },
  { id: 'w02', date: 'Le 13 mars 2026', serial: 'efac29fe-0966-4e2b-a2c4-75c8977301d0', model: 'Glock', status: '', origin: 'Arme saisie', reason: 'Saisie judiciaire', assignedOfficer: '24 | Giulia Alvarez', stolen: true, archived: false, checkedPs: true, encodedBy: '24 | Giulia Alvarez', state: 'Saisi' },
  { id: 'w03', date: 'Le 13 mars 2026', serial: 'e306914e-2f16-4ed5-af40-a74515788166', model: 'Glock', status: '', origin: 'Arme déclarée', reason: 'Enregistrement civil', assignedOfficer: '11 | Olivia Fletcher', stolen: false, archived: false, checkedPs: false, encodedBy: '11 | Olivia Fletcher', state: 'Actif' },
  { id: 'w04', date: 'Le 13 mars 2026', serial: 'def1cd42-1497-47a2-943d-fbcb81c8bfd4', model: 'Glock', status: '', origin: 'Arme saisie', reason: 'Scellé', assignedOfficer: '00 | Sam Connors', stolen: false, archived: true, checkedPs: true, encodedBy: '00 | Sam Connors', state: 'Saisi' },
  { id: 'w05', date: 'Le 13 mars 2026', serial: 'cc4d3470-1184-47eb-b43a-10b7c60092b7', model: 'Glock', status: '', origin: 'Arme déclarée', reason: 'Renouvellement', assignedOfficer: '02 | Ruben Serano', stolen: false, archived: false, checkedPs: false, encodedBy: '02 | Ruben Serano', state: 'Actif' },
  { id: 'w06', date: 'Le 13 mars 2026', serial: 'fd402da2-7d94-49ce-9898-f58cfa446818', model: 'Glock', status: '', origin: 'Arme saisie', reason: 'Instruction parquet', assignedOfficer: '21 | Mike Delson', stolen: false, archived: false, checkedPs: true, encodedBy: '21 | Mike Delson', state: 'Saisi' },
  { id: 'w07', date: 'Le 13 mars 2026', serial: '52cff931-4da8-466a-9bca-0705138e8f9a', model: 'Glock', status: '', origin: 'Arme déclarée', reason: '', assignedOfficer: '33 | Koffi Diallo', stolen: false, archived: false, checkedPs: false, encodedBy: '33 | Koffi Diallo', state: 'Actif' },
  { id: 'w08', date: 'Le 13 mars 2026', serial: '26c1dcea-b12f-478c-8dec-559cd48eb036', model: 'Glock', status: '', origin: 'Arme saisie', reason: 'Preuve', assignedOfficer: '13 | Isaiah Foster', stolen: true, archived: false, checkedPs: true, encodedBy: '13 | Isaiah Foster', state: 'Saisi' },
  { id: 'w09', date: 'Le 13 mars 2026', serial: 'a4ba99ac-aa30-48b0-b450-b9a653d42523', model: 'Glock', status: '', origin: 'Arme déclarée', reason: '', assignedOfficer: '16 | Vaniye Yazamët', stolen: false, archived: false, checkedPs: false, encodedBy: '16 | Vaniye Yazamët', state: 'Actif' },
  { id: 'w10', date: 'Le 13 mars 2026', serial: '2b737baa-f5ec-4dce-82c7-5a80a8485436', model: 'Glock', status: '', origin: 'Arme saisie', reason: 'Saisie judiciaire', assignedOfficer: '29 | Silas Cross', stolen: false, archived: true, checkedPs: false, encodedBy: '29 | Silas Cross', state: 'Saisi' },
]

const weaponOriginOptions = ['Toutes les origines', 'Arme saisie', 'Arme déclarée']
const weaponStateOptions = ['Tous les états', 'Actif', 'Saisi']
const weaponModelOptions = ['Pétoire', 'Glock', 'Glock 20', 'Calibre .50', 'Pistolet Perforant', 'Pistolet de combat', 'Pistolet', 'Pistolet Lourd']
const weaponCitizenOptions = [
  'Aguila Rosario — 555-9019',
  'Carlos Rosario — 555-6399',
  'Catalina Rosario — 555-1653',
  'Ernesto Rosario — 555-0745',
  'Fernando Rosario — 555-5404',
  'Joaquim Rosario — 555-4732',
  'Kurosawa Renji — 555-1629',
  'Rosa Wheeler — 555-1878',
]

const braceletRegistryEntries = [
  { id: 'br01', citizen: 'Ludwig Strauss', officer: '125 | Ashley Cruz', npre: 'SLUD', placedAt: 'Le 18 mars 2026 à 23:46', expiresAt: 'Le 21 mars 2026 à 23:59', lastCheckIn: 'Aucun pointage effectué', reasons: "Fusillade et possession d'arme de guerre" },
  { id: 'br02', citizen: 'Jake Sullivan', officer: '03 | Otavio Lua Magalhaes', npre: 'SJAK', placedAt: 'Le 17 mars 2026 à 21:12', expiresAt: 'Le 20 mars 2026 à 20:00', lastCheckIn: 'Le 19 mars 2026 à 18:21', reasons: 'Port d’arme non autorisé' },
  { id: 'br03', citizen: 'Caleb Brooks', officer: '29 | Silas Cross', npre: 'BCAL', placedAt: 'Le 17 mars 2026 à 18:03', expiresAt: 'Le 22 mars 2026 à 12:00', lastCheckIn: 'Le 19 mars 2026 à 17:02', reasons: 'Violation de contrôle judiciaire' },
  { id: 'br04', citizen: 'Joel birot', officer: '36 | Daniel Choi', npre: 'BJOE', placedAt: 'Le 16 mars 2026 à 16:10', expiresAt: 'Le 23 mars 2026 à 23:59', lastCheckIn: 'Le 19 mars 2026 à 14:43', reasons: 'Récidive de fuite' },
  { id: 'br05', citizen: 'Flavio Quintana', officer: '19 | Brookdyn Blackwood', npre: 'QFLA', placedAt: 'Le 15 mars 2026 à 09:20', expiresAt: 'Le 20 mars 2026 à 09:20', lastCheckIn: 'Le 19 mars 2026 à 08:17', reasons: 'Menaces aggravées' },
  { id: 'br06', citizen: 'Hadrya Watson', officer: '112 | Paige Leone', npre: 'WHAD', placedAt: 'Le 15 mars 2026 à 03:14', expiresAt: 'Le 24 mars 2026 à 23:59', lastCheckIn: 'Le 19 mars 2026 à 07:52', reasons: 'Agression et non-respect du couvre-feu' },
  { id: 'br07', citizen: 'Nahara Watson', officer: '112 | Paige Leone', npre: 'WNAH', placedAt: 'Le 14 mars 2026 à 19:48', expiresAt: 'Le 21 mars 2026 à 19:48', lastCheckIn: 'Le 19 mars 2026 à 10:03', reasons: 'Complicité de vol' },
  { id: 'br08', citizen: 'Corado Herrera', officer: '125 | Ashley Cruz', npre: 'HCOR', placedAt: 'Le 13 mars 2026 à 14:31', expiresAt: 'Le 25 mars 2026 à 14:31', lastCheckIn: 'Le 19 mars 2026 à 12:10', reasons: 'Braquage avec violence' },
  { id: 'br09', citizen: 'Sam Myers', officer: '79 | Clara Grey', npre: 'MSAM', placedAt: 'Le 13 mars 2026 à 11:27', expiresAt: 'Le 21 mars 2026 à 11:27', lastCheckIn: 'Le 19 mars 2026 à 09:44', reasons: 'Dégradation volontaire' },
  { id: 'br10', citizen: 'Caleb Brooks', officer: '79 | Clara Grey', npre: 'BCAL', placedAt: 'Le 12 mars 2026 à 05:58', expiresAt: 'Le 19 mars 2026 à 23:59', lastCheckIn: 'Le 18 mars 2026 à 22:09', reasons: 'Refus de pointage' },
]

const bootRegistryEntries = [
  { id: 'sb01', date: 'Le 14 mars 2026 à 01:40', model: 'Argento 7F Sportsback', plate: 'FMJETEUR' },
  { id: 'sb02', date: 'Le 14 mars 2026 à 01:39', model: 'Argento 7F Sportsback', plate: 'RIJO6OV7' },
  { id: 'sb03', date: 'Le 10 mars 2026 à 23:35', model: 'Tailgater S', plate: '20CVF089' },
  { id: 'sb04', date: 'Le 10 mars 2026 à 23:33', model: 'Jester RR (Véhicule de course)', plate: 'N/A' },
  { id: 'sb05', date: 'Le 08 mars 2026 à 03:57', model: 'Surano', plate: 'W0CAILDW' },
  { id: 'sb06', date: 'Le 06 mars 2026 à 01:37', model: 'GRESLEY STX', plate: '20YBK187' },
  { id: 'sb07', date: 'Le 05 mars 2026 à 23:01', model: 'Lowrider', plate: '6HJT2EX' },
  { id: 'sb08', date: 'Le 04 mars 2026 à 23:41', model: 'Buffalo4h', plate: 'YJRIEDK' },
  { id: 'sb09', date: 'Le 04 mars 2026 à 02:05', model: 'Schrauber', plate: 'LSV4EQGR' },
  { id: 'sb10', date: 'Le 28 févr. 2026 à 22:12', model: 'kalahari', plate: 'BY9C5EGD' },
]

const vehicleOwnerOptions = [
  'Adonis Grimshaw — 555-9995',
  'Andre Deshawn — 555-2678',
  'Darius Grimshaw — 555-0014',
  'Dayton Mcshayne — 555-5451',
  'Deshawn Brooks — 555-4518',
  'Deshawn Niang — 555-9111',
  'Deshawn Parker — 555-8732',
  'Deshawn Tate — 555-8300',
  'Shaheem Moose — 555-6071',
]

const proofFolderOptions = [
  'Bijouterie sud — 13/03/2026',
  'Tongva Convoi — 13/03/2026',
  'Fusillade Sandy Shore — 13/03/2026',
  'Convoi 2 — 13/03/2026',
  'Bijouterie 12/03 — 12/03/2026',
  'PO Rodri & 86 — 12/03/2026',
  'PO Unicors — 12/03/2026',
]

const operationReportOptions = [
  'Convoi Pacific 13/03/2026',
  'Braquage Route 68 12/03/2026',
  'Fusillade Vinewood 11/03/2026',
]

const officerOptions = [
  { id: '00', name: 'Sam Connors' },
  { id: '01', name: 'Rodri Serano' },
  { id: '02', name: 'Ruben Serano' },
  { id: '03', name: 'Otavio Lua Magalhaes' },
  { id: '04', name: 'Azumi Ishida' },
  { id: '05', name: 'Afonso Da Luz' },
  { id: '08', name: 'Jinwoo Parks' },
  { id: '11', name: 'Olivia Fletcher' },
  { id: '113', name: 'Reese Kronos' },
]

const staffAgents = [
  { id: '00', firstName: 'Sam', lastName: 'Connors', phone: '555-4708', email: 'Sam@gmail.loop', grade: 'Officer', iban: 'SAMCONNORS', birthDate: '14/01/1992' },
  { id: '01', firstName: 'Rodri', lastName: 'Serano', phone: '555-001', email: 'seranorodri@mail.loop', grade: 'Senior Officer', iban: 'RODRIS', birthDate: '02/11/1991' },
  { id: '02', firstName: 'Ruben', lastName: 'Serano', phone: '555-0402', email: 'rubenserano@gmail.loop', grade: 'Senior Officer', iban: 'RUBENS', birthDate: '18/08/1990' },
  { id: '03', firstName: 'Otavio', lastName: 'Lua Magalhaes', phone: '555-1830', email: 'otavio@gmail.loop', grade: 'Officer', iban: 'OTAVIOLM', birthDate: '25/12/1993' },
  { id: '04', firstName: 'Azumi', lastName: 'Ishida', phone: '555-0017', email: 'Azumi@gmail.loop', grade: 'Officer', iban: 'AZUMII', birthDate: '09/03/1996' },
  { id: '05', firstName: 'Afonso', lastName: 'Da Luz', phone: '555-5662', email: 'AfonsoD@gmail.loop', grade: 'Officer', iban: 'AFONSODL', birthDate: '11/06/1994' },
  { id: '08', firstName: 'Jinwoo', lastName: 'Parks', phone: '555-1589', email: 'jinwooparks@gmail.loop', grade: 'Officer', iban: 'JINWOOP', birthDate: '27/02/1998' },
  { id: '10', firstName: 'Jayden', lastName: 'Howard', phone: '555-6858', email: 'jaydenhoward@mail.loop', grade: 'Rookie', iban: 'JAYDENH', birthDate: '09/08/1998' },
  { id: '11', firstName: 'Olivia', lastName: 'Fletcher', phone: '555-7302', email: 'OliviaFLT@gmail.loop', grade: 'Officer', iban: 'OLIVIAF', birthDate: '06/01/1995' },
  { id: '12', firstName: 'Roman', lastName: 'Teva-Maere', phone: '555-8582', email: 'roman@gmail.loop', grade: 'Officer', iban: 'ROMANTM', birthDate: '15/04/1990' },
  { id: '13', firstName: 'Isaiah', lastName: 'Foster', phone: '555-6196', email: 'isaiahfoster@gmail.loop', grade: 'Officer', iban: 'ISAIAHF', birthDate: '22/09/1992' },
  { id: '16', firstName: 'Vaniye', lastName: 'Yazamet', phone: '555-1897', email: 'Vaniyefleure@gmail.loop', grade: 'Officer', iban: 'VANIYEY', birthDate: '03/10/1997' },
  { id: '17', firstName: 'Salva', lastName: 'Martinez', phone: '555-0764', email: 'SalvaMartinez@gmail.loop', grade: 'Officer', iban: 'SALVAM', birthDate: '19/02/1991' },
  { id: '18', firstName: 'Leandro', lastName: 'Cortes', phone: '555-7645', email: 'leandrocortes@gmail.loop', grade: 'Officer', iban: 'LEANDROC', birthDate: '01/12/1993' },
  { id: '19', firstName: 'Brooklyn', lastName: 'Blackwood', phone: '555-0955', email: 'Brookblackwood@gmail.loop', grade: 'Officer', iban: 'BROOKLYNB', birthDate: '12/07/1994' },
  { id: '20', firstName: 'Neyder', lastName: 'Perry', phone: '555-7076', email: 'nonoP@gmail.loop', grade: 'Officer', iban: 'NEYDERP', birthDate: '08/05/1992' },
  { id: '21', firstName: 'Mike', lastName: 'Delson', phone: '555-5678', email: 'Mikedelson@gmail.loop', grade: 'Sergeant', iban: 'MIKEDEL', birthDate: '30/03/1989' },
  { id: '22', firstName: 'Douglas', lastName: 'Davies', phone: '555-2114', email: 'douglasdavies@gmail.loop', grade: 'Officer', iban: 'DOUGLASD', birthDate: '13/11/1990' },
  { id: '23', firstName: 'Victor', lastName: 'Salinas', phone: '555-4190', email: 'VictorS@gmail.loop', grade: 'Officer', iban: 'VICTORS', birthDate: '02/06/1994' },
  { id: '24', firstName: 'Giulia', lastName: 'Alvarez', phone: '555-5420', email: 'Giulia@gmail.loop', grade: 'Officer', iban: 'GIULIAA', birthDate: '17/09/1995' },
  { id: '29', firstName: 'Silas', lastName: 'Cross', phone: '555-5192', email: 'silascross@gmail.loop', grade: 'Officer', iban: 'SILASC', birthDate: '20/12/1991' },
  { id: '32', firstName: 'Ilir', lastName: 'Kelmendi', phone: '555-4151', email: 'ilir@gmail.loop', grade: 'Officer', iban: 'ILIRK', birthDate: '29/01/1992' },
  { id: '33', firstName: 'Koffi', lastName: 'Diallo', phone: '555-6580', email: 'Koffi@gmail.loop', grade: 'Officer', iban: 'KOFFID', birthDate: '05/05/1990' },
]

const legalContacts = [
  'Aliénor De Courval',
  'Amanda Wilson',
  'Angelo Morecci',
  'Austin Turner',
  'Blue Ingram',
  'Calvin Allen',
  'Cataleya Romano',
  'Chaeyoung Sunwoo',
]

const interrogationRegistry = [
  {
    id: '192',
    dateTime: '18/03/2026 23:29',
    citizen: 'Charles Bell',
    startedAt: '18/03/2026 23:29',
    endedAt: '18/03/2026 23:29',
    participants: ['00 | Sam Connors', '21 | Mike Delson'],
    policePost: 'San Andreas State Police | Vespucci',
    report: '',
  },
  {
    id: '190',
    dateTime: '17/03/2026 22:11',
    citizen: 'Lina Moreau',
    startedAt: '17/03/2026 22:11',
    endedAt: '17/03/2026 22:41',
    participants: ['24 | Giulia Alvarez'],
    policePost: 'San Andreas State Police | Mission Row',
    report: '',
  },
  {
    id: '180',
    dateTime: '16/03/2026 18:03',
    citizen: 'Noah Ortega',
    startedAt: '16/03/2026 18:03',
    endedAt: '16/03/2026 18:36',
    participants: ['02 | Ruben Serano', '11 | Olivia Fletcher'],
    policePost: 'San Andreas State Police | Vespucci',
    report: '',
  },
  {
    id: '169',
    dateTime: '15/03/2026 21:48',
    citizen: 'Ava Rivera',
    startedAt: '15/03/2026 21:48',
    endedAt: '15/03/2026 22:17',
    participants: ['03 | Otavio Lua Magalhaes'],
    policePost: 'San Andreas State Police | Sandy Shores',
    report: '',
  },
  {
    id: '154',
    dateTime: '14/03/2026 20:29',
    citizen: 'Jonah Walker',
    startedAt: '14/03/2026 20:29',
    endedAt: '14/03/2026 21:04',
    participants: ['01 | Rodri Serano', '08 | Jinwoo Parks'],
    policePost: 'San Andreas State Police | Vespucci',
    report: '',
  },
  {
    id: '143',
    dateTime: '13/03/2026 23:05',
    citizen: 'Mila Navarro',
    startedAt: '13/03/2026 23:05',
    endedAt: '13/03/2026 23:47',
    participants: ['113 | Reese Kronos'],
    policePost: 'San Andreas State Police | Mission Row',
    report: '',
  },
]


const arrestDossierFineScaleOptions = ['Minimal', 'Réduit', 'Nominal', 'Aggravé', 'Maximum']
const arrestDossierFineScaleMultipliers = {
  'Minimal': 0.25,
  'Réduit': 0.5,
  'Nominal': 1,
  'Aggravé': 1.5,
  'Maximum': 2,
}
const arrestDossierPolicePostOptions = ['San Andreas State Police | Vespucci', 'San Andreas State Police | Mission Row', 'San Andreas State Police | Sandy Shores']

function secondsToDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

function durationToSeconds(value) {
  const [hours = '0', minutes = '0', seconds = '0'] = String(value ?? '00:00:00').split(':')
  return (Number(hours) * 3600) + (Number(minutes) * 60) + Number(seconds)
}

function normalizeChargeCatalogEntry(entry, fallbackId) {
  return {
    id: String(entry?.id ?? fallbackId),
    name: String(entry?.name ?? '').trim(),
    category: String(entry?.category ?? '').trim(),
    fine: Number(entry?.fine) || 0,
    jail: String(entry?.jail ?? '00:00:00').trim() || '00:00:00',
  }
}

function normalizeAdminChargeEntry(entry, fallbackId) {
  return {
    ...normalizeChargeCatalogEntry(entry, fallbackId),
    type: String(entry?.type ?? '').trim(),
    instruction: String(entry?.instruction ?? '').trim(),
  }
}

function normalizeVehicleCatalogEntry(entry, fallbackId) {
  return {
    id: String(entry?.id ?? fallbackId),
    name: String(entry?.name ?? '').trim(),
    model: String(entry?.model ?? '').trim(),
    category: String(entry?.category ?? '').trim(),
  }
}

function normalizeAdminGradeEntry(entry, fallbackId) {
  return {
    id: String(entry?.id ?? fallbackId),
    name: String(entry?.name ?? '').trim(),
    faction: String(entry?.faction ?? '').trim(),
    permissions: String(entry?.permissions ?? '').trim(),
    count: Number(entry?.count) || 0,
    salary: Number(entry?.salary) || 0,
    supervisor: entry?.supervisor === true,
  }
}

function normalizeAdminSpecialtyEntry(entry, fallbackId) {
  return {
    id: String(entry?.id ?? fallbackId),
    name: String(entry?.name ?? '').trim(),
    lead: String(entry?.lead ?? entry?.faction ?? '').trim(),
    coLead: String(entry?.coLead ?? entry?.permissions ?? '').trim(),
    members: Number(entry?.members ?? entry?.agents) || 0,
  }
}

function normalizeAdminDocumentTemplateEntry(entry, fallbackId) {
  return {
    id: String(entry?.id ?? fallbackId),
    title: String(entry?.title ?? '').trim(),
    type: String(entry?.type ?? entry?.description ?? '').trim(),
    updatedAt: String(entry?.updatedAt ?? entry?.permissions ?? '').trim(),
    author: String(entry?.author ?? '').trim(),
  }
}

function normalizeAdminPaFormQuestionEntry(entry, fallbackId) {
  return {
    id: String(entry?.id ?? fallbackId),
    label: String(entry?.label ?? entry?.name ?? '').trim(),
    category: String(entry?.category ?? '').trim(),
    expectedAnswer: String(entry?.expectedAnswer ?? '').trim(),
    required: String(entry?.required ?? '').trim(),
  }
}

function normalizeAdminRookieCriterionEntry(entry, fallbackId) {
  return {
    id: String(entry?.id ?? fallbackId),
    label: String(entry?.label ?? entry?.name ?? '').trim(),
    min: String(entry?.min ?? '').trim(),
    max: String(entry?.max ?? '').trim(),
    category: String(entry?.category ?? '').trim(),
  }
}

function buildArrestDossierChargeRows(chargeItems, fineScale, chargeCatalogByLabel = {}) {
  const multiplier = arrestDossierFineScaleMultipliers[fineScale] ?? 1

  return chargeItems.map((item) => {
    const catalogEntry = chargeCatalogByLabel[item.label] ?? { fine: 0, jail: '00:00:00', label: item.label }
    const quantity = Number(item.quantity) || 0
    const totalFine = catalogEntry.fine * quantity * multiplier
    const totalJailSeconds = Math.round(durationToSeconds(catalogEntry.jail) * quantity * multiplier)

    return {
      label: catalogEntry.label,
      quantity,
      tentative: item.tentative ? 'Oui' : 'Non',
      complicity: item.complicity ? 'Oui' : 'Non',
      fine: totalFine,
      jail: secondsToDuration(totalJailSeconds),
    }
  })
}

function buildArrestDossierFormValues(citizen, record) {
  return {
    arrestDateTime: record?.arrestDateTime ?? '',
    rightsDateTime: record?.rightsDateTime ?? '',
    policePost: record?.policePost ?? '',
    selectedAgents: record?.selectedAgents ?? [],
    peopleQuery: '',
    selectedLead: record?.selectedLead ?? {
      name: '',
      role: '',
      email: '',
      phone: '',
    },
    forceUsed: record?.forceUsed ?? false,
    report: record?.report ?? '',
    operationReport: record?.operationReport ?? '',
    proofFolder: record?.proofFolder ?? '',
    selectedCharges: record?.selectedCharges ?? [],
    chargeQuery: '',
    fineScale: record?.fineScale ?? '',
    chargeItems: record?.chargeItems ?? [],
    vehicles: record?.vehicles ?? [],
    weapons: record?.weapons ?? [],
    proofImages: record?.proofImages ?? [],
    reportNumber: record?.reportNumber ?? '',
    status: record?.status ?? '',
    judges: record?.judges ?? '',
  }
}

function formatOfficerDisplayName(value) {
  if (!value) {
    return '-'
  }

  const [, name] = String(value).split('|')
  return name ? name.trim() : String(value)
}

function formatArrestRecordDate(value) {
  const [datePart = '', timePart = '00:00'] = String(value ?? '').split(' ')
  const [day = '00', month = '00', year = '0000'] = datePart.split('/')
  const monthLabel = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'][Math.max(0, Number(month || '1') - 1)]

  return `${Number(day || '0')} ${monthLabel} ${year} à ${timePart}`
}

function buildArrestDossierPreviewPayload(citizen, form, chargeCatalogByLabel = {}) {
  const chargeRows = buildArrestDossierChargeRows(form.chargeItems, form.fineScale, chargeCatalogByLabel)
  const totalFine = chargeRows.reduce((sum, row) => sum + row.fine, 0)
  const totalJailSeconds = chargeRows.reduce((sum, row) => sum + durationToSeconds(row.jail), 0)

  return {
    citizenName: citizen.name,
    status: form.status,
    reportNumber: form.reportNumber,
    author: formatOfficerDisplayName(form.selectedAgents[1] ?? form.selectedAgents[0] ?? ''),
    dateTime: formatArrestRecordDate(form.arrestDateTime),
    rightsDateTime: formatArrestRecordDate(form.rightsDateTime),
    suspectLine: `${citizen.name} | ${citizen.phone} | ${citizen.email}`,
    lawyers: `${form.selectedLead.name} - ${form.selectedLead.email} - ${form.selectedLead.phone}`,
    judges: form.judges,
    agents: form.selectedAgents,
    report: form.report,
    chargeRows,
    fineScale: form.fineScale,
    totalFine: `${totalFine.toFixed(2)} $`,
    totalJail: secondsToDuration(totalJailSeconds),
    vehicles: form.vehicles,
    proofImages: form.proofImages,
  }
}

const editorToolbarItems = ['B', 'I', 'U', 'S', '-', '=', '::', 'undo', 'C', 'H1', 'H2', 'H3', 'a', 'link', 'link', 'link', 'link', 'link', 'link', 'oo']

const defaultState = {
  visible: false,
  profile: {
    name: 'Joueur Inconnu',
    badge: 'SASP',
    phone: '',
    iban: '',
    email: '',
  },
}

const defaultPermissions = {
  isSupervisor: false,
  isStaff: false,
}

function buildProfileFormValues(profile = {}) {
  return {
    name: profile.name || '',
    badge: profile.badge || '',
    phone: profile.phone || '',
    iban: profile.iban || '',
    email: profile.email || '',
  }
}

function buildFallbackTones(seed) {
  const source = String(seed ?? 'lpmdt')
  let hash = 0

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash + (source.charCodeAt(index) * (index + 1))) % 255
  }

  const toHex = (offset) => ((hash + offset) % 255).toString(16).padStart(2, '0')

  return [`#${toHex(50)}${toHex(90)}${toHex(130)}`, `#${toHex(10)}${toHex(40)}${toHex(70)}`, `#${toHex(160)}${toHex(190)}${toHex(220)}`]
}

function getCitizenBooleanStat(citizen, label) {
  return citizen?.stats?.find((item) => item.label === label)?.value === true
}

function buildWantedPeopleFromCitizens(citizensList) {
  return (citizensList ?? [])
    .filter((citizen) => getCitizenBooleanStat(citizen, 'Wanted'))
    .map((citizen) => ({
      id: citizen.id,
      name: citizen.name,
      gender: getCitizenStat(citizen, 'Sexe') || '',
      phone: citizen.phone || '',
      birthDate: citizen.birthDate || '',
      avatarLabel: citizen.portraitLabel || citizen.name.split(' ').map((part) => part[0] || '').join('').slice(0, 2).toUpperCase(),
      tones: citizen.portraitTones || buildFallbackTones(citizen.identifier || citizen.id || citizen.name),
    }))
}

function buildComplaintRegistryEntries(citizensList) {
  return (citizensList ?? [])
    .flatMap((citizen) => (citizen.records?.complaints ?? []).map((complaint) => ({
      id: complaint.id,
      date: complaint.date,
      citizen: citizen.name,
      status: complaint.status,
      officer: complaint.author || '--',
      against: complaint.against || '--',
      reasons: complaint.reason || 'Plainte',
      statusReason: complaint.statusReason || '--',
      body: complaint.body || '',
      lawyers: complaint.selectedLawyers || [],
      proofImages: complaint.proofImages || [],
    })))
}

function buildCitizenFromForm(baseCitizen, formValues, identifierOverride) {
  const firstName = formValues.firstName.trim()
  const lastName = formValues.lastName.trim()
  const name = `${firstName} ${lastName}`.trim() || baseCitizen?.name || 'Citoyen inconnu'
  const identifier = identifierOverride || baseCitizen?.identifier || `manual:${Date.now()}`
  const initialLabel = name.split(' ').map((part) => part[0] || '').join('').slice(0, 2).toUpperCase() || 'CI'

  return {
    id: baseCitizen?.id || identifier,
    identifier,
    name,
    birthDate: formValues.birthDate,
    email: formValues.email,
    phone: formValues.phone,
    censusAt: baseCitizen?.censusAt || new Date().toLocaleString('fr-FR'),
    portraitLabel: baseCitizen?.portraitLabel || initialLabel,
    portraitTones: baseCitizen?.portraitTones || buildFallbackTones(identifier),
    stats: [
      { label: 'Poids', value: formValues.weight },
      { label: 'Taille', value: formValues.height },
      { label: 'Sexe', value: formValues.gender },
      { label: 'Adresse', value: formValues.address },
      { label: 'Ethnie', value: formValues.ethnicity },
      { label: 'Couleur de cheveux', value: formValues.hairColor },
      { label: 'Couleur des yeux', value: formValues.eyeColor },
      { label: 'Appartenance', value: formValues.affiliation },
      { label: 'Emploi', value: formValues.job },
      { label: 'Permis de conduire', value: formValues.driverLicense },
      { label: 'Décédé', value: getCitizenBooleanStat(baseCitizen, 'Décédé'), dot: true },
      { label: 'Wanted', value: getCitizenBooleanStat(baseCitizen, 'Wanted'), dot: true },
      { label: 'PPA civil', value: getCitizenBooleanStat(baseCitizen, 'PPA civil'), dot: true },
      { label: 'PPA de chasse', value: getCitizenBooleanStat(baseCitizen, 'PPA de chasse'), dot: true },
    ],
    records: baseCitizen?.records || {
      arrestation: [],
      complaints: [],
      depositions: [],
      bracelets: [],
    },
  }
}

async function invokeNuiCallback(callbackName, payload = {}) {
  if (typeof fetch !== 'function' || typeof GetParentResourceName !== 'function') {
    return null
  }

  try {
    const response = await fetch(`https://${GetParentResourceName()}/${callbackName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return await response.json()
  } catch {
    return null
  }
}

function closeMdtNui() {
  if (typeof fetch !== 'function' || typeof GetParentResourceName !== 'function') {
    return
  }

  fetch(`https://${GetParentResourceName()}/close`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  }).catch(() => {})
}

function createAvatar(label, tones) {
  const [base, accent, shadow] = tones

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${base}" />
          <stop offset="100%" stop-color="${shadow}" />
        </linearGradient>
      </defs>
      <rect width="72" height="72" rx="4" fill="url(#bg)" />
      <circle cx="36" cy="27" r="12" fill="${accent}" opacity="0.92" />
      <path d="M18 60c2-12 12-19 18-19s16 7 18 19" fill="${accent}" opacity="0.88" />
      <rect x="6" y="6" width="60" height="60" rx="4" fill="none" stroke="rgba(255,255,255,0.12)" />
      <text x="36" y="67" text-anchor="middle" font-family="Arial" font-size="9" font-weight="700" fill="rgba(255,255,255,0.78)">${label}</text>
    </svg>
  `)}`
}

const REAL_PORTRAIT_IMAGE_URL = 'https://cdn.discordapp.com/attachments/1137158054505361590/1484951024270839998/12D5B2D3-B405-4F25-97FE-43CEAC333300.png?ex=69c017e9&is=69bec669&hm=85f8a4fd90203369218b05a3ab94671e517c4e2ddccbadfa11fe3b1ada65fcf8&'

function createPortraitAvatar(label, tones) {
  return REAL_PORTRAIT_IMAGE_URL
}

function createEvidencePreview(tones) {
  const [base, accent, glow] = tones

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${base}" />
          <stop offset="100%" stop-color="#120f1d" />
        </linearGradient>
      </defs>
      <rect width="180" height="180" rx="8" fill="url(#bg)"/>
      <rect x="0" y="0" width="180" height="180" fill="rgba(255,0,102,0.14)"/>
      <rect x="96" y="18" width="10" height="138" rx="2" fill="${glow}" opacity="0.95"/>
      <rect x="132" y="28" width="12" height="100" rx="2" fill="#18d882" opacity="0.9"/>
      <rect x="28" y="116" width="76" height="34" rx="4" fill="#2a2438" opacity="0.88"/>
      <circle cx="62" cy="84" r="26" fill="${accent}"/>
      <path d="M34 156c8-24 22-38 28-38s20 14 28 38" fill="#d4d8ea" opacity="0.92"/>
      <path d="M44 68c4-16 16-26 28-26 11 0 22 10 26 26" fill="#251c24" opacity="0.88"/>
      <rect x="16" y="16" width="148" height="148" rx="8" fill="none" stroke="rgba(255,255,255,0.12)"/>
    </svg>
  `)}`
}

function createAdminSeal(label, primary, secondary, border) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
      <defs>
        <radialGradient id="bg" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#f8f8f8" />
          <stop offset="100%" stop-color="#c6c6c6" />
        </radialGradient>
        <path id="circlePath" d="M90,90 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0" />
      </defs>
      <circle cx="90" cy="90" r="76" fill="url(#bg)" stroke="#8e8e8e" stroke-width="4" />
      <circle cx="90" cy="90" r="61" fill="#ececec" stroke="#8b8b8b" stroke-width="2.5" />
      <text font-family="Arial" font-size="10" font-weight="700" fill="#4e4e4e" letter-spacing="1.1">
        <textPath href="#circlePath" startOffset="8%">SAN ANDREAS STATE POLICE</textPath>
      </text>
      <polygon points="90,40 122,58 122,95 90,114 58,95 58,58" fill="#5b5b5b" opacity="0.2" />
      <polygon points="90,47 116,62 116,92 90,107 64,92 64,62" fill="#747474" />
      <circle cx="90" cy="78" r="17" fill="#ff8f36" stroke="#f0c48f" stroke-width="3" />
      <circle cx="90" cy="78" r="9" fill="#59b4d6" />
      <rect x="76" y="99" width="28" height="10" rx="2" fill="#c8ad6c" />
      <text x="90" y="107" text-anchor="middle" font-family="Arial" font-size="7" font-weight="800" fill="#4d3a1d">STATE</text>
      <text x="90" y="142" text-anchor="middle" font-family="Arial" font-size="16" font-weight="800" fill="#5a5a5a">${label}</text>
    </svg>
  `)}`
}

function createIdentityCardPreview(citizen) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#4f1966" />
          <stop offset="100%" stop-color="#150d25" />
        </linearGradient>
      </defs>
      <rect width="280" height="180" rx="12" fill="url(#bg)" />
      <rect x="10" y="10" width="260" height="160" rx="10" fill="none" stroke="rgba(255,255,255,0.14)" />
      <text x="220" y="20" text-anchor="end" font-family="Arial" font-size="11" font-weight="700" fill="#b995da">FiveM</text>
      <text x="30" y="38" font-family="Arial" font-size="24" font-weight="800" fill="#ff9af2">CARTE D'IDENTITE</text>
      <text x="30" y="60" font-family="Arial" font-size="9" font-weight="700" fill="#baa2d6">SAN ANDREAS</text>
      <text x="30" y="86" font-family="Arial" font-size="16" font-weight="800" fill="#ffffff">${citizen.name.toUpperCase()}</text>
      <text x="30" y="118" font-family="Arial" font-size="8" font-weight="700" fill="#baa2d6">DATE DE NAISSANCE</text>
      <text x="30" y="131" font-family="Arial" font-size="12" font-weight="700" fill="#ffffff">${citizen.birthDate}</text>
      <text x="150" y="118" font-family="Arial" font-size="8" font-weight="700" fill="#baa2d6">TÉLÉPHONE</text>
      <text x="150" y="131" font-family="Arial" font-size="12" font-weight="700" fill="#ffffff">${citizen.phone}</text>
      <text x="230" y="159" text-anchor="end" font-family="Arial" font-size="8" font-weight="700" fill="#aa8dc4">CITY OF LOS SANTOS</text>
    </svg>
  `)}`
}

function createArrestEvidencePreview(label) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 180">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#54111a" />
          <stop offset="100%" stop-color="#17131e" />
        </linearGradient>
      </defs>
      <rect width="280" height="180" rx="12" fill="url(#bg)" />
      <rect x="16" y="16" width="248" height="148" rx="10" fill="rgba(0,0,0,0.18)" stroke="rgba(255,255,255,0.09)" />
      <rect x="94" y="50" width="88" height="22" rx="4" transform="rotate(-20 138 61)" fill="#ff573d" />
      <rect x="109" y="45" width="11" height="33" rx="2" transform="rotate(-20 114 61)" fill="#ffd6a4" />
      <rect x="116" y="61" width="11" height="33" rx="2" transform="rotate(-20 121 77)" fill="#ffce97" opacity="0.65" />
      <text x="26" y="31" font-family="Arial" font-size="22" font-weight="800" fill="#ffffff">x14</text>
      <text x="24" y="151" font-family="Arial" font-size="17" font-weight="800" fill="#ffffff">${label}</text>
    </svg>
  `)}`
}

function sanitizeFileSegment(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Unable to read pasted image'))
    reader.readAsDataURL(file)
  })
}

async function extractClipboardImages(event) {
  const clipboardItems = Array.from(event.clipboardData?.items ?? [])
  const imageFiles = clipboardItems
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter(Boolean)

  if (imageFiles.length === 0) {
    return []
  }

  return Promise.all(imageFiles.map((file) => readFileAsDataUrl(file)))
}

function buildArrestChargeRows(chargesValue, chargeCatalogByLabel = {}) {
  const labels = Array.isArray(chargesValue)
    ? chargesValue.filter(Boolean)
    : String(chargesValue ?? '').split(/[,;]+/).map((item) => item.trim()).filter(Boolean)

  if (labels.length === 0) {
    return [{
      label: 'Non renseignée',
      quantity: 1,
      tentative: 'Non',
      complicity: 'Non',
      fine: 0,
      jail: '00:00:00',
    }]
  }

  return labels.map((label) => {
    const catalogEntry = chargeCatalogByLabel[label] ?? { fine: 0, jail: '00:00:00', label }

    return {
      label: catalogEntry.label,
      quantity: 1,
      tentative: 'Non',
      complicity: 'Non',
      fine: catalogEntry.fine,
      jail: catalogEntry.jail,
    }
  })
}

function dataUrlToPngDataUrl(dataUrl, backgroundColor = '#ffffff') {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.naturalWidth || image.width
      canvas.height = image.naturalHeight || image.height

      const context = canvas.getContext('2d')

      if (!context) {
        reject(new Error('Canvas 2D context unavailable'))
        return
      }

      context.fillStyle = backgroundColor
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }

    image.onerror = () => reject(new Error('Image conversion failed'))
    image.src = dataUrl
  })
}

async function buildArrestReportPdf(report) {
  const doc = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' })
  const sealImage = await dataUrlToPngDataUrl(report.sealImage)
  const identityImage = await dataUrlToPngDataUrl(report.identityImage)
  const evidenceImages = await Promise.all(
    (report.evidenceImages?.length ? report.evidenceImages : [report.evidenceImage])
      .filter(Boolean)
      .slice(0, 2)
      .map((image) => dataUrlToPngDataUrl(image))
  )
  const chargeRows = report.chargeRows?.length ? report.chargeRows : [{
    label: report.chargeLabel,
    quantity: 1,
    tentative: 'Non',
    complicity: 'Non',
    fine: Number.parseFloat(String(report.fineAmount).replace(/[^0-9.]/g, '')) || 0,
    jail: report.jailTime,
  }]
  const totalFine = chargeRows.reduce((sum, row) => sum + row.fine, 0)
  const primaryJailTime = chargeRows[0]?.jail || report.jailTime

  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, 210, 297, 'F')

  doc.addImage(sealImage, 'PNG', 5.5, 5.4, 29, 29)

  doc.setTextColor(52, 52, 52)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.9)
  doc.text('San Andreas Police Department', 182, 11.2, { align: 'right' })
  doc.text('San Andreas State Police | Vespucci', 182, 15.4, { align: 'right' })
  doc.text('Los Santos, San Andreas', 182, 19.6, { align: 'right' })
  doc.text('United States of America', 182, 23.8, { align: 'right' })

  doc.setDrawColor(187, 187, 187)
  doc.setLineWidth(0.28)
  doc.line(4.5, 34.8, 205.5, 34.8)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.1)
  doc.text(report.title, 105, 43.3, { align: 'center' })
  doc.line(4.5, 50.3, 205.5, 50.3)

  const sectionTitle = (label, y) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.15)
    doc.text(label, 5.5, y)
    doc.setDrawColor(226, 226, 226)
    doc.setLineWidth(0.2)
    doc.line(5.5, y + 1.6, 204.5, y + 1.6)
  }

  sectionTitle('Informations générales', 56.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.55)
  doc.text(`Numéro de rapport : ${report.reportNumber}`, 5.8, 64)
  doc.text(`Date : ${report.dateTime}`, 5.8, 69.1)
  doc.text(`Rédacteur : ${report.author}`, 5.8, 74.2)
  doc.text(`Suspect : ${report.suspectLine}`, 5.8, 79.3)

  sectionTitle('Agents impliqués', 88.8)
  let agentY = 96.2
  report.agents.forEach((agent) => {
    doc.circle(7.5, agentY - 1.05, 0.35, 'F')
    doc.text(agent, 10, agentY)
    agentY += 5.4
  })

  sectionTitle('Rapport détaillé', 111.8)
  doc.setDrawColor(231, 231, 231)
  doc.rect(5.5, 117.2, 199, 18.2)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.45)
  const detailedLines = doc.splitTextToSize(report.details, 192)
  doc.text(detailedLines, 8.3, 121.6)

  sectionTitle('Charges appliquées', 143.8)
  autoTable(doc, {
    startY: 149.1,
    margin: { left: 5.2, right: 5.2 },
    theme: 'grid',
    headStyles: {
      fillColor: [250, 250, 250],
      textColor: [84, 84, 84],
      lineColor: [223, 223, 223],
      lineWidth: 0.2,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fontSize: 5.15,
    },
    bodyStyles: {
      textColor: [73, 73, 73],
      lineColor: [227, 227, 227],
      lineWidth: 0.2,
      halign: 'center',
      fontSize: 5.1,
      cellPadding: 1.55,
    },
    styles: {
      overflow: 'linebreak',
      cellWidth: 'wrap',
      font: 'helvetica',
    },
    columnStyles: {
      0: { cellWidth: 47 },
      1: { cellWidth: 24 },
      2: { cellWidth: 29 },
      3: { cellWidth: 29 },
      4: { cellWidth: 23 },
      5: { cellWidth: 24 },
    },
    head: [['Charge', 'Quantité', 'Tentative', 'Complicité', 'Amende', 'Peine']],
    body: chargeRows.map((row) => [row.label, String(row.quantity), row.tentative, row.complicity, `${row.fine.toFixed(2)} $`, row.jail]),
  })

  const totalsY = (doc.lastAutoTable?.finalY ?? 160) + 3.8
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5.55)
  doc.text(report.fineScale, 201.2, totalsY, { align: 'right' })
  doc.text(`Total Amende : ${totalFine.toFixed(2)} $`, 201.2, totalsY + 5, { align: 'right' })
  doc.text(`Total UP : ${primaryJailTime}`, 201.2, totalsY + 10, { align: 'right' })

  sectionTitle('Photos jointes', totalsY + 19)
  doc.addImage(identityImage, 'PNG', 5.8, totalsY + 23.3, 36.8, 36.8)

  evidenceImages.forEach((image, index) => {
    doc.addImage(image, 'PNG', 46.6 + (index * 40.8), totalsY + 23.3, 36.8, 36.8)
  })

  doc.setTextColor(156, 156, 156)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.9)
  doc.text(report.policePost, 105, 283.5, { align: 'center' })

  return doc
}

function ChevronIcon({ expanded = false }) {
  return (
    <svg className={`chevron-icon${expanded ? ' chevron-icon-expanded' : ''}`} viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4.2 1.8c.4-.4 1-.5 1.5-.2l1.6.9c.5.3.7.8.6 1.4l-.4 1.7c0 .2 0 .5.2.7l1.6 1.6c.2.2.4.2.7.2l1.7-.4c.5-.1 1.1.1 1.4.6l.9 1.6c.3.5.2 1.1-.2 1.5l-1 1c-.7.7-1.8 1-2.8.7-1.8-.5-3.4-1.5-4.8-2.9C4.3 9 3.3 7.3 2.8 5.6c-.3-1 .1-2.1.7-2.8l.7-1Z" fill="currentColor" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 1.5a.75.75 0 0 1 1.5 0V2h5V1.5a.75.75 0 0 1 1.5 0V2h.7c.7 0 1.3.6 1.3 1.3v9.2c0 .7-.6 1.3-1.3 1.3H3.3c-.7 0-1.3-.6-1.3-1.3V3.3C2 2.6 2.6 2 3.3 2H4v-.5Zm8.5 4H3.5v6.8h9V5.5Z" fill="currentColor" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m6.8 1 .4 1.4c.5-.1 1-.1 1.5 0L9.2 1h1.6l.4 1.6c.4.2.8.4 1.2.7l1.5-.5.8 1.3-1.1 1.1c.2.4.3.8.4 1.3l1.5.4v1.6l-1.5.4c-.1.4-.2.9-.4 1.3l1.1 1.1-.8 1.3-1.5-.5c-.4.3-.8.5-1.2.7l-.4 1.6H9.2l-.5-1.4c-.5.1-1 .1-1.5 0L6.8 15H5.2l-.4-1.6c-.4-.2-.8-.4-1.2-.7l-1.5.5-.8-1.3 1.1-1.1a5 5 0 0 1-.4-1.3L.5 8.5V6.9l1.5-.4c.1-.4.2-.9.4-1.3L1.3 4.1l.8-1.3 1.5.5c.4-.3.8-.5 1.2-.7L5.2 1h1.6ZM8 10.5A2.5 2.5 0 1 0 8 5.5a2.5 2.5 0 0 0 0 5Z" fill="currentColor" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M9.5 2.5h-5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8h6M11.5 4.5 14 8l-2.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="3" r="1.3" fill="currentColor" />
      <circle cx="8" cy="8" r="1.3" fill="currentColor" />
      <circle cx="8" cy="13" r="1.3" fill="currentColor" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M11.9 1.8 14.2 4a.9.9 0 0 1 0 1.3L6 13.5 2.4 14.2 3 10.6l8.2-8.2a.9.9 0 0 1 1.3 0Z" fill="currentColor" />
      <path d="m10.8 3.3 1.9 1.9" fill="none" stroke="#0f2b6a" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M2.5 3.5h11v9h-11z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="6" cy="7" r="1.3" fill="currentColor" />
      <path d="m4 10.5 2.4-2 1.8 1.5 1.9-2 1.9 2.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function SelectCaretIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="m8 2 1.5 3 3.3.5-2.4 2.3.6 3.3L8 9.6 5 11.1l.6-3.3L3.2 5.5 6.5 5 8 2Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

const citizenMenuItems = [
  { key: 'edit', label: 'Modifier les informations', icon: EditIcon },
  { key: 'photo', label: 'Modifier la photo', icon: ImageIcon },
  { key: 'ppa-civil', label: 'Ajouté le PPA civil', icon: PlusIcon },
  { key: 'ppa-hunt', label: 'Ajouté le PPA de chasse', icon: PlusIcon },
  { key: 'wanted', label: 'Mettre en wanted', icon: PlusIcon },
]

const evidenceFolders = []

const agentStatistics = [
  {
    id: '00',
    name: 'Sam Connors',
    email: 'Sam@gmail.loop',
    phone: '555-4708',
    arrivalDate: '23/01/2026 à 23:44',
    metrics: [
      { label: 'Grade', value: 'Officier 1' },
      { label: 'Nombre de recensement', value: '4' },
      { label: 'Nombre de mandat', value: '1' },
      { label: 'Nombre de déposition', value: '0' },
      { label: 'Nombre de plainte', value: '1' },
      { label: 'Nombre de ticket routier', value: '61' },
      { label: "Nombre de rapport d'arrestation", value: '17' },
      { label: "Nombre de dossier d'arrestation", value: '10' },
      { label: "Nombre de rapport d'opération", value: '2' },
      { label: "Nombre de rapport d'incident", value: '0' },
      { label: "Nombre d'arme enregistrée", value: '7' },
      { label: "Nombre d'interrogatoire", value: '0' },
      { label: 'Nombre de sabot', value: '1' },
      { label: 'Nombre de bracelet', value: '0' },
    ],
  },
  { id: '01', name: 'Rodri Serano', email: 'Rodri@gmail.loop', phone: '555-7330', arrivalDate: '21/01/2026 à 14:02', metrics: [] },
  { id: '02', name: 'Ruben Serano', email: 'Ruben@gmail.loop', phone: '555-3832', arrivalDate: '21/01/2026 à 14:08', metrics: [] },
  { id: '03', name: 'Otavio Lua Magalhaes', email: 'Otavio@gmail.loop', phone: '555-1303', arrivalDate: '25/01/2026 à 11:20', metrics: [] },
  { id: '04', name: 'Azumi Ishida', email: 'Azumi@gmail.loop', phone: '555-5221', arrivalDate: '28/01/2026 à 18:44', metrics: [] },
  { id: '05', name: 'Afonso Da Luz', email: 'Afonso@gmail.loop', phone: '555-8105', arrivalDate: '29/01/2026 à 20:16', metrics: [] },
  { id: '08', name: 'Jinwoo Parks', email: 'Jinwoo@gmail.loop', phone: '555-4470', arrivalDate: '01/02/2026 à 23:08', metrics: [] },
  { id: '11', name: 'Olivia Fletcher', email: 'Olivia@gmail.loop', phone: '555-4411', arrivalDate: '02/02/2026 à 09:55', metrics: [] },
  { id: '12', name: 'Roman Teva-Maere', email: 'Roman@gmail.loop', phone: '555-5921', arrivalDate: '04/02/2026 à 17:40', metrics: [] },
  { id: '13', name: 'Isaiah Foster', email: 'Isaiah@gmail.loop', phone: '555-2913', arrivalDate: '06/02/2026 à 13:07', metrics: [] },
]

const citizenGenderOptions = ['Homme', 'Femme']
const citizenEthnicityOptions = ['Caucasien', 'Afro-Américain', 'Hispanique', 'Asiatique', 'Amérindien']
const citizenLicenseOptions = ['Valide', 'Non-valide']
const citizenBirthMonths = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const citizenBirthYears = Array.from({ length: 41 }, (_, index) => 1980 + index)
const rookieSessionOptions = ['Promotion Ella', 'Promotion Nina', 'Promotion Cole', 'Promotion Carol', 'Promotion Kyle']
const finalQuestionStatusOptions = ['Tous les statuts', 'Actif', 'Archivé']
const finalQuestionCategoryOptions = ['Toutes les catégories', 'Culture générale', 'Personnelle', 'Divers']
const academySessionTypeOptions = ['Tous les types', 'SASP sud', 'SASP nord']
const academyTemplateOptions = ['PA Sud Carol 2026', 'PA Nord X Cody', 'PA Nord Standard 2025']

const academySessions = [
  { id: 's01', name: 'Promotion Ella', type: 'SASP sud', status: 'Ouvert', candidates: 0, template: 'PA Sud Carol 2026', openedAt: '09/03/2026 21:30', closedAt: '16/03/2026 00:00' },
  { id: 's02', name: 'Promotion Nina', type: 'SASP nord', status: 'Fermée', candidates: 16, template: 'PA Nord X Cody', openedAt: '06/03/2026 20:00', closedAt: '13/03/2026 00:00' },
  { id: 's03', name: 'Promotion Cole', type: 'SASP nord', status: 'Fermée', candidates: 21, template: 'PA Nord X Cody', openedAt: '02/03/2026 20:00', closedAt: '09/03/2026 00:00' },
  { id: 's04', name: 'Promotion Carol', type: 'SASP sud', status: 'Fermée', candidates: 28, template: 'PA Sud Carol 2026', openedAt: '24/02/2026 20:00', closedAt: '03/03/2026 00:00' },
  { id: 's05', name: 'Promotion Kyle', type: 'SASP nord', status: 'Fermée', candidates: 19, template: 'PA Nord X Cody', openedAt: '18/02/2026 20:00', closedAt: '25/02/2026 00:00' },
]

const rookieFollowUpEntries = [
  { id: 'rookie-01', name: 'Justin Bizot', arrivedAt: 'Le 19 mars 2026 à 23:34', session: 'Promotion Ella', referent: '21 | Mike Delson', status: 'FL en attente', reportsLabel: 'Rapports First Lincoln', completedCriteria: [] },
  { id: 'rookie-02', name: 'Hinaauri Teva-Maere', arrivedAt: 'Le 18 mars 2026 à 23:46', session: 'Promotion Ella', referent: '21 | Mike Delson', status: 'FL en attente', reportsLabel: 'Rapports First Lincoln', completedCriteria: [] },
  { id: 'rookie-03', name: 'Rowane Torres', arrivedAt: 'Le 18 mars 2026 à 23:45', session: 'Promotion Ella', referent: '21 | Mike Delson', status: 'FL en attente', reportsLabel: 'Rapports First Lincoln', completedCriteria: [] },
  { id: 'rookie-04', name: 'Itzel Figueroa', arrivedAt: 'Le 18 mars 2026 à 23:45', session: 'Promotion Ella', referent: '21 | Mike Delson', status: 'FL en attente', reportsLabel: 'Rapports First Lincoln', completedCriteria: [] },
  { id: 'rookie-05', name: 'Lunabela Suarez', arrivedAt: 'Le 18 mars 2026 à 23:45', session: 'Promotion Ella', referent: '21 | Mike Delson', status: 'FL en attente', reportsLabel: 'Rapports First Lincoln', completedCriteria: [] },
  { id: 'rookie-06', name: "L'Angelo Castenada", arrivedAt: 'Le 18 mars 2026 à 23:45', session: 'Promotion Ella', referent: '21 | Mike Delson', status: 'FL en attente', reportsLabel: 'Rapports First Lincoln', completedCriteria: [] },
  { id: 'rookie-07', name: 'Victor Salinas', arrivedAt: 'Le 18 mars 2026 à 23:44', session: 'Promotion Ella', referent: '21 | Mike Delson', status: 'FL en attente', reportsLabel: 'Rapports First Lincoln', completedCriteria: [] },
  { id: 'rookie-08', name: 'Camille Ross', arrivedAt: 'Le 18 mars 2026 à 23:43', session: 'Promotion Ella', referent: '21 | Mike Delson', status: 'FL en attente', reportsLabel: 'Rapports First Lincoln', completedCriteria: [] },
  { id: 'rookie-09', name: 'Tariq Coleman', arrivedAt: 'Le 18 mars 2026 à 23:43', session: 'Promotion Ella', referent: '21 | Mike Delson', status: 'FL en attente', reportsLabel: 'Rapports First Lincoln', completedCriteria: [] },
  { id: 'rookie-10', name: 'Tamatoa Teva-Maere', arrivedAt: 'Le 18 mars 2026 à 23:42', session: 'Promotion Ella', referent: '21 | Mike Delson', status: 'FL en attente', reportsLabel: 'Rapports First Lincoln', completedCriteria: [] },
]

const buildRookieChecklistDefaults = () => rookieFollowUpEntries.reduce((accumulator, rookie) => {
  accumulator[rookie.id] = adminRookieCriteria.reduce((criteriaAccumulator, criterion) => {
    criteriaAccumulator[criterion.id] = rookie.completedCriteria.includes(criterion.id)
    return criteriaAccumulator
  }, {})

  return accumulator
}, {})

const adminRookieCriteria = [
  { id: 'rc01', name: 'Comportement' },
  { id: 'rc02', name: 'D.O.A / R.A' },
  { id: 'rc03', name: 'Formation DOJ' },
  { id: 'rc04', name: 'Formation Mary' },
  { id: 'rc05', name: 'Formation Premiers Secours' },
  { id: 'rc06', name: 'Lead négo' },
  { id: 'rc07', name: 'Lead terrain' },
  { id: 'rc08', name: 'Plainte' },
  { id: 'rc09', name: 'Ticket routier' },
]

const adminPaFormQuestions = [
  { id: 'pf01', name: 'Quelles sont vos motivations ?' },
  { id: 'pf02', name: 'Quelles sont vos disponibilités ? (indiquez votre day off)' },
]

const adminDocumentTemplates = [
  { id: 'dt01', title: 'Annexe | Arrêt de travail', description: 'Document pour les arrêts de travail', permissions: '-' },
  { id: 'dt02', title: 'Annexe | Certificat de préjudice', description: 'Modèle standard du certificat de préjudice', permissions: '-' },
  { id: 'dt03', title: 'Annexe | Ordonnance Médicale', description: "Modèle standard d'ordonnance médical", permissions: '-' },
  { id: 'dt04', title: 'Annexe | Sortie contre avis médical', description: 'Modèle standard de sortie contre avis médical', permissions: '-' },
  { id: 'dt05', title: 'Biologie | Antibiogramme', description: "Modèle standard d'antibiogramme", permissions: 'Biologie' },
  { id: 'dt06', title: 'Biologie | Bilan Allergie', description: 'Modèle de bilan allergie', permissions: 'Biologie' },
  { id: 'dt07', title: 'Biologie | Bilan Intoxication Gazeuse', description: "Document standard pour une recherche d'intoxication aux gaz", permissions: 'Biologie' },
  { id: 'dt08', title: 'Biologie | Bilan Standard', description: 'Modèle basique du bilan standard', permissions: 'Biologie' },
  { id: 'dt09', title: 'Biologie | Bilan Toxicologique', description: 'Modèle standard du rapport toxicologique', permissions: 'Biologie' },
  { id: 'dt10', title: 'Biologie | Bilan Vitaminique', description: 'Modèle standard du bilan vitaminique', permissions: 'Biologie' },
  { id: 'dt11', title: 'Biologie | Biopsie', description: 'Modèle de biopsie', permissions: 'Biologie' },
  { id: 'dt12', title: 'Biologie | Groupe Sanguin', description: 'Modèle standard détermination groupe sanguin', permissions: 'Biologie' },
]

const adminSpecialties = [
  { id: 'sp01', name: 'Addictologie', faction: 'SAMD', permissions: '—', agents: 3 },
  { id: 'sp02', name: 'ASD', faction: 'SAMD', permissions: '—', agents: 6 },
  { id: 'sp03', name: 'Biologie', faction: 'SAMD', permissions: '—', agents: 10 },
  { id: 'sp04', name: 'Biologie PS', faction: 'SAMD', permissions: 'Biologie PS', agents: 2 },
  { id: 'sp05', name: 'Cardiologie / Pneumologie', faction: 'SAMD', permissions: '—', agents: 3 },
  { id: 'sp06', name: 'Esthétique', faction: 'SAMD', permissions: '—', agents: 2 },
  { id: 'sp07', name: 'Formation', faction: 'SAMD', permissions: '—', agents: 12 },
  { id: 'sp08', name: 'Gynécologie', faction: 'SAMD', permissions: 'Gynecologie', agents: 7 },
  { id: 'sp09', name: 'Kiné', faction: 'SAMD', permissions: '—', agents: 6 },
  { id: 'sp10', name: 'Légiste', faction: 'SAMD', permissions: 'Médecin légiste', agents: 8 },
  { id: 'sp11', name: 'Neurochirurgie', faction: 'SAMD', permissions: '—', agents: 8 },
  { id: 'sp12', name: 'Oncologie / cancerologie', faction: 'SAMD', permissions: '—', agents: 2 },
  { id: 'sp13', name: 'Ophtalmologie', faction: 'SAMD', permissions: '—', agents: 4 },
]

const adminGrades = [
  { id: 'gr01', name: 'Directeur', salary: 8000, faction: 'SAMD', supervisor: true, permissions: 'Editer les pôles et spécialités, Editer les formations, Ajouter une formation', count: 1 },
  { id: 'gr02', name: 'Directeur Adjoint', salary: 7500, faction: 'SAMD', supervisor: true, permissions: 'Editer les pôles et spécialités, Editer les formations, Ajouter une formation', count: 1 },
  { id: 'gr03', name: 'Chef de service', salary: 6800, faction: 'SAMD', supervisor: true, permissions: 'Editer les pôles et spécialités, Editer les formations, Ajouter une formation', count: 1 },
  { id: 'gr04', name: 'Médecin Chef', salary: 8500, faction: 'SAMD', supervisor: true, permissions: 'Editer les formations, Ajouter une formation, Editer les pôles et spécialités', count: 2 },
  { id: 'gr05', name: 'Médecin Titulaire', salary: 8000, faction: 'SAMD', supervisor: false, permissions: '—', count: 1 },
  { id: 'gr06', name: 'Médecin', salary: 5000, faction: 'SAMD', supervisor: false, permissions: '—', count: 8 },
  { id: 'gr07', name: 'Résident', salary: 4500, faction: 'SAMD', supervisor: false, permissions: '—', count: 5 },
  { id: 'gr08', name: 'Interne', salary: 3500, faction: 'SAMD', supervisor: false, permissions: '—', count: 13 },
  { id: 'gr09', name: 'Externe', salary: 3000, faction: 'SAMD', supervisor: false, permissions: '—', count: 18 },
]

const adminUserDepartments = ['Inactifs', 'SASP', 'SAMD', 'SAFD', 'DOJ']

const adminCharges = [
  // ── CIRCULATION ──
  { id: 'ch01', name: 'Excès de vitesse mineur (< 20 km/h)', type: 'Contravention', fine: 150, instruction: 'Ticket routier – 1 point retiré', jail: '00:00:00', category: 'Circulation' },
  { id: 'ch02', name: 'Excès de vitesse modéré (20–40 km/h)', type: 'Contravention', fine: 300, instruction: 'Ticket routier – 2 points retirés', jail: '00:00:00', category: 'Circulation' },
  { id: 'ch03', name: 'Excès de vitesse grave (> 40 km/h)', type: 'Délit', fine: 800, instruction: 'Saisie du véhicule possible – 3 points retirés', jail: '00:00:00', category: 'Circulation' },
  { id: 'ch04', name: 'Conduite sans permis valide', type: 'Délit', fine: 600, instruction: 'Saisie du véhicule', jail: '00:00:00', category: 'Circulation' },
  { id: 'ch05', name: "Conduite sous l'emprise d'alcool", type: 'Délit', fine: 1000, instruction: 'Saisie du permis – alcootest obligatoire', jail: '00:15:00', category: 'Circulation' },
  { id: 'ch06', name: 'Conduite sous emprise de stupéfiants', type: 'Délit', fine: 1200, instruction: 'Saisie du permis – test obligatoire', jail: '00:20:00', category: 'Circulation' },
  { id: 'ch07', name: "Refus d'obtempérer", type: 'Délit', fine: 1500, instruction: 'Inscription au casier', jail: '00:20:00', category: 'Circulation' },
  { id: 'ch08', name: 'Fuite en véhicule', type: 'Délit majeur', fine: 2500, instruction: 'Saisie du véhicule – Inscription au casier', jail: '00:30:00', category: 'Circulation' },
  { id: 'ch09', name: "Mise en danger délibérée d'autrui", type: 'Délit', fine: 1000, instruction: 'Inscription au casier', jail: '00:15:00', category: 'Circulation' },
  { id: 'ch10', name: 'Conduite sans assurance', type: 'Contravention', fine: 400, instruction: 'Saisie du véhicule', jail: '00:00:00', category: 'Circulation' },
  { id: 'ch11', name: 'Circulation sans plaque immatriculée', type: 'Contravention', fine: 300, instruction: 'Saisie du véhicule', jail: '00:00:00', category: 'Circulation' },
  { id: 'ch12', name: 'Grillage de feu rouge / stop', type: 'Contravention', fine: 200, instruction: 'Ticket routier – 1 point retiré', jail: '00:00:00', category: 'Circulation' },
  { id: 'ch13', name: 'Usage du téléphone au volant', type: 'Contravention', fine: 200, instruction: 'Ticket routier – 1 point retiré', jail: '00:00:00', category: 'Circulation' },
  { id: 'ch14', name: 'Non-respect des priorités', type: 'Contravention', fine: 200, instruction: 'Ticket routier', jail: '00:00:00', category: 'Circulation' },
  { id: 'ch15', name: 'Conduite en sens interdit', type: 'Contravention', fine: 250, instruction: 'Ticket routier – 1 point retiré', jail: '00:00:00', category: 'Circulation' },
  { id: 'ch16', name: 'Conduite sans ceinture de sécurité', type: 'Contravention', fine: 135, instruction: 'Ticket routier', jail: '00:00:00', category: 'Circulation' },
  { id: 'ch17', name: 'Conduite sans casque (deux-roues)', type: 'Contravention', fine: 200, instruction: 'Ticket routier – 1 point retiré', jail: '00:00:00', category: 'Circulation' },
  { id: 'ch18', name: 'Délit de fuite après accident', type: 'Délit', fine: 1000, instruction: 'Inscription au casier', jail: '00:15:00', category: 'Circulation' },
  { id: 'ch19', name: 'Collision volontaire avec un véhicule', type: 'Délit', fine: 1200, instruction: 'Saisie du véhicule', jail: '00:15:00', category: 'Circulation' },
  { id: 'ch20', name: 'Stationnement gênant ou dangereux', type: 'Contravention', fine: 150, instruction: 'Mise en fourrière possible', jail: '00:00:00', category: 'Circulation' },

  // ── ATTEINTES AUX PERSONNES ──
  { id: 'ch21', name: 'Violence volontaire légère (ITT < 8 jours)', type: 'Contravention', fine: 500, instruction: 'Rappel à la loi', jail: '00:00:00', category: 'Atteintes aux personnes' },
  { id: 'ch22', name: 'Violence volontaire (ITT > 8 jours)', type: 'Délit', fine: 1500, instruction: 'Inscription au casier', jail: '00:20:00', category: 'Atteintes aux personnes' },
  { id: 'ch23', name: 'Violence aggravée avec arme', type: 'Délit majeur', fine: 3000, instruction: 'Saisie de l\'arme – Inscription au casier', jail: '00:45:00', category: 'Atteintes aux personnes' },
  { id: 'ch24', name: "Violence sur agent de l'État", type: 'Délit majeur', fine: 3500, instruction: 'Inscription au casier – PPA possible', jail: '00:45:00', category: 'Atteintes aux personnes' },
  { id: 'ch25', name: 'Violence sur personne vulnérable', type: 'Délit majeur', fine: 3000, instruction: 'Inscription au casier', jail: '00:45:00', category: 'Atteintes aux personnes' },
  { id: 'ch26', name: 'Menaces de mort', type: 'Délit', fine: 2000, instruction: 'Inscription au casier', jail: '00:20:00', category: 'Atteintes aux personnes' },
  { id: 'ch27', name: 'Harcèlement moral ou physique', type: 'Délit', fine: 1500, instruction: 'Inscription au casier', jail: '00:15:00', category: 'Atteintes aux personnes' },
  { id: 'ch28', name: 'Séquestration', type: 'Délit majeur', fine: 4000, instruction: 'Saisie Armes – Inscription au casier', jail: '01:00:00', category: 'Atteintes aux personnes' },
  { id: 'ch29', name: "Prise d'otage (civil)", type: 'Crime', fine: 8000, instruction: 'Saisie Armes – PPA', jail: '01:30:00', category: 'Atteintes aux personnes' },
  { id: 'ch30', name: "Prise d'otage (agent de l'État)", type: 'Crime', fine: 12000, instruction: 'Saisie Armes – PPA', jail: '02:00:00', category: 'Atteintes aux personnes' },
  { id: 'ch31', name: 'Tentative de meurtre', type: 'Crime', fine: 15000, instruction: 'Saisie Armes – PPA', jail: '02:30:00', category: 'Atteintes aux personnes' },
  { id: 'ch32', name: 'Meurtre / Homicide volontaire', type: 'Crime', fine: 25000, instruction: 'Saisie Armes – PPA', jail: '03:00:00', category: 'Atteintes aux personnes' },
  { id: 'ch33', name: 'Meurtre aggravé (préméditation)', type: 'Crime', fine: 35000, instruction: 'Saisie Armes – PPA à vie', jail: '04:00:00', category: 'Atteintes aux personnes' },
  { id: 'ch34', name: 'Torture et actes de barbarie', type: 'Crime', fine: 20000, instruction: 'Saisie Armes – PPA', jail: '03:00:00', category: 'Atteintes aux personnes' },

  // ── ATTEINTES AUX BIENS ──
  { id: 'ch35', name: 'Vol simple', type: 'Délit', fine: 800, instruction: 'Restitution du bien', jail: '00:15:00', category: 'Atteintes aux biens' },
  { id: 'ch36', name: 'Vol avec violence', type: 'Délit majeur', fine: 3000, instruction: 'Saisie Armes – Inscription au casier', jail: '00:45:00', category: 'Atteintes aux biens' },
  { id: 'ch37', name: 'Vol à main armée', type: 'Crime', fine: 6000, instruction: 'Saisie Armes – PPA', jail: '01:30:00', category: 'Atteintes aux biens' },
  { id: 'ch38', name: 'Cambriolage', type: 'Délit majeur', fine: 2500, instruction: 'Inscription au casier', jail: '00:30:00', category: 'Atteintes aux biens' },
  { id: 'ch39', name: 'Braquage de commerce armé', type: 'Crime', fine: 10000, instruction: 'Saisie Armes – PPA', jail: '02:00:00', category: 'Atteintes aux biens' },
  { id: 'ch40', name: 'Braquage de banque / fourgon', type: 'Crime', fine: 20000, instruction: 'Saisie Armes – PPA', jail: '03:00:00', category: 'Atteintes aux biens' },
  { id: 'ch41', name: 'Destruction de bien (dégradation)', type: 'Contravention', fine: 500, instruction: 'Réparation du préjudice', jail: '00:00:00', category: 'Atteintes aux biens' },
  { id: 'ch42', name: 'Destruction de bien aggravée', type: 'Délit', fine: 1500, instruction: 'Inscription au casier – Réparation', jail: '00:15:00', category: 'Atteintes aux biens' },
  { id: 'ch43', name: 'Incendie volontaire', type: 'Crime', fine: 8000, instruction: 'Inscription au casier – PPA possible', jail: '01:30:00', category: 'Atteintes aux biens' },
  { id: 'ch44', name: 'Escroquerie', type: 'Délit', fine: 2000, instruction: 'Inscription au casier', jail: '00:20:00', category: 'Atteintes aux biens' },
  { id: 'ch45', name: 'Recel de vol', type: 'Délit', fine: 1500, instruction: 'Saisie du bien', jail: '00:20:00', category: 'Atteintes aux biens' },
  { id: 'ch46', name: 'Extorsion', type: 'Crime', fine: 6000, instruction: 'Inscription au casier – PPA possible', jail: '01:30:00', category: 'Atteintes aux biens' },
  { id: 'ch47', name: 'Blanchiment de capitaux', type: 'Crime', fine: 12000, instruction: 'Saisie des fonds – PPA', jail: '02:00:00', category: 'Atteintes aux biens' },
  { id: 'ch48', name: 'Fraude / Faux et usage de faux', type: 'Délit', fine: 2000, instruction: 'Inscription au casier', jail: '00:20:00', category: 'Atteintes aux biens' },

  // ── STUPÉFIANTS ──
  { id: 'ch49', name: 'Usage simple de stupéfiants', type: 'Contravention', fine: 500, instruction: 'Rappel à la loi / Stage de sensibilisation', jail: '00:00:00', category: 'Stupéfiants' },
  { id: 'ch50', name: 'Usage aggravé de stupéfiants', type: 'Délit', fine: 1000, instruction: 'Inscription au casier', jail: '00:15:00', category: 'Stupéfiants' },
  { id: 'ch51', name: 'Détention de stupéfiants', type: 'Délit', fine: 2000, instruction: 'Saisie du produit – Inscription au casier', jail: '00:20:00', category: 'Stupéfiants' },
  { id: 'ch52', name: 'Transport de stupéfiants', type: 'Délit majeur', fine: 4000, instruction: 'Saisie véhicule et produit – Inscription au casier', jail: '00:45:00', category: 'Stupéfiants' },
  { id: 'ch53', name: 'Trafic de stupéfiants', type: 'Crime', fine: 10000, instruction: 'Saisie – PPA possible', jail: '02:00:00', category: 'Stupéfiants' },
  { id: 'ch54', name: 'Trafic international de stupéfiants', type: 'Crime', fine: 20000, instruction: 'Saisie – PPA', jail: '03:00:00', category: 'Stupéfiants' },

  // ── ARMES ──
  { id: 'ch55', name: 'Port d\'arme blanche sans motif légitime', type: 'Contravention', fine: 500, instruction: 'Saisie de l\'arme', jail: '00:00:00', category: 'Armes' },
  { id: 'ch56', name: 'Détention d\'arme de poing (sans autorisation)', type: 'Délit', fine: 1200, instruction: 'Saisie de l\'arme – Inscription au casier', jail: '00:15:00', category: 'Armes' },
  { id: 'ch57', name: 'Port d\'arme de poing (sans autorisation)', type: 'Délit', fine: 1500, instruction: 'Saisie de l\'arme – Inscription au casier', jail: '00:20:00', category: 'Armes' },
  { id: 'ch58', name: 'Détention d\'arme longue (sans autorisation)', type: 'Délit majeur', fine: 2500, instruction: 'Saisie de l\'arme – Inscription au casier', jail: '00:30:00', category: 'Armes' },
  { id: 'ch59', name: 'Port d\'arme longue (sans autorisation)', type: 'Délit majeur', fine: 3000, instruction: 'Saisie de l\'arme – Inscription au casier', jail: '00:45:00', category: 'Armes' },
  { id: 'ch60', name: 'Détention d\'arme de guerre', type: 'Crime', fine: 6000, instruction: 'Saisie – PPA possible', jail: '01:00:00', category: 'Armes' },
  { id: 'ch61', name: 'Port d\'arme de guerre', type: 'Crime', fine: 8000, instruction: 'Saisie – PPA', jail: '01:30:00', category: 'Armes' },
  { id: 'ch62', name: 'Trafic d\'armes', type: 'Crime', fine: 20000, instruction: 'Saisie totale – PPA', jail: '03:00:00', category: 'Armes' },
  { id: 'ch63', name: 'Détention de munitions non autorisées', type: 'Délit', fine: 1000, instruction: 'Saisie des munitions', jail: '00:15:00', category: 'Armes' },

  // ── ORDRE PUBLIC ──
  { id: 'ch64', name: "Trouble à l'ordre public", type: 'Contravention', fine: 300, instruction: 'Rappel à la loi', jail: '00:00:00', category: 'Ordre public' },
  { id: 'ch65', name: 'Outrage à agent de la force publique', type: 'Contravention', fine: 500, instruction: 'Inscription au casier', jail: '00:00:00', category: 'Ordre public' },
  { id: 'ch66', name: 'Rébellion / résistance à l\'arrestation', type: 'Délit', fine: 1000, instruction: 'Inscription au casier', jail: '00:20:00', category: 'Ordre public' },
  { id: 'ch67', name: 'Évasion de garde à vue ou prison', type: 'Délit majeur', fine: 2500, instruction: 'Inscription au casier', jail: '00:30:00', category: 'Ordre public' },
  { id: 'ch68', name: 'Aide à l\'évasion', type: 'Délit majeur', fine: 2000, instruction: 'Inscription au casier', jail: '00:30:00', category: 'Ordre public' },
  { id: 'ch69', name: 'Participation à une émeute armée', type: 'Délit majeur', fine: 2000, instruction: 'Inscription au casier', jail: '00:30:00', category: 'Ordre public' },
  { id: 'ch70', name: 'Entrave à la justice', type: 'Délit', fine: 2000, instruction: 'Inscription au casier', jail: '00:20:00', category: 'Ordre public' },
  { id: 'ch71', name: 'Faux témoignage', type: 'Délit', fine: 2000, instruction: 'Inscription au casier', jail: '00:20:00', category: 'Ordre public' },
  { id: 'ch72', name: 'Dissimulation illicite du visage en espace public', type: 'Contravention', fine: 300, instruction: 'Rappel à la loi', jail: '00:00:00', category: 'Ordre public' },
  { id: 'ch73', name: 'Non-assistance à personne en danger', type: 'Délit', fine: 1500, instruction: 'Inscription au casier', jail: '00:15:00', category: 'Ordre public' },
  { id: 'ch74', name: 'Dénonciation calomnieuse', type: 'Délit', fine: 1500, instruction: 'Inscription au casier', jail: '00:15:00', category: 'Ordre public' },

  // ── CRIME ORGANISÉ ──
  { id: 'ch75', name: 'Association de malfaiteurs', type: 'Crime', fine: 6000, instruction: 'Inscription au casier – PPA possible', jail: '01:30:00', category: 'Crime organisé' },
  { id: 'ch76', name: 'Direction d\'une organisation criminelle', type: 'Crime', fine: 15000, instruction: 'Saisie des biens – PPA', jail: '03:00:00', category: 'Crime organisé' },
  { id: 'ch77', name: 'Participation à une organisation criminelle', type: 'Crime', fine: 8000, instruction: 'Inscription au casier – PPA possible', jail: '02:00:00', category: 'Crime organisé' },
  { id: 'ch78', name: 'Corruption active (corrompre un agent)', type: 'Crime', fine: 8000, instruction: 'Inscription au casier – PPA', jail: '01:30:00', category: 'Crime organisé' },
  { id: 'ch79', name: "Corruption passive (agent de l'État)", type: 'Crime', fine: 10000, instruction: 'Révocation + Inscription au casier', jail: '02:00:00', category: 'Crime organisé' },
  { id: 'ch80', name: 'Complicité (peine du complice)', type: 'Crime', fine: 0, instruction: 'Même peine que l\'auteur principal', jail: '00:00:00', category: 'Crime organisé' },

  // ── ATTEINTES À L'ÉTAT ──
  { id: 'ch81', name: "Usurpation de titre ou de fonction d'agent", type: 'Délit majeur', fine: 3000, instruction: 'Saisie de l\'uniforme – Inscription au casier', jail: '00:30:00', category: "Atteintes à l'État" },
  { id: 'ch82', name: "Port illégal d'uniforme de forces de l'ordre", type: 'Délit', fine: 1500, instruction: 'Saisie de l\'uniforme', jail: '00:20:00', category: "Atteintes à l'État" },
  { id: 'ch83', name: 'Attentat contre les institutions', type: 'Crime', fine: 30000, instruction: 'PPA à vie', jail: '05:00:00', category: "Atteintes à l'État" },
  { id: 'ch84', name: "Rébellion armée contre l'État", type: 'Crime', fine: 25000, instruction: 'PPA à vie', jail: '04:00:00', category: "Atteintes à l'État" },

  // ── INFRACTIONS DIVERSES ──
  { id: 'ch85', name: 'Usurpation d\'identité', type: 'Délit', fine: 2000, instruction: 'Inscription au casier', jail: '00:20:00', category: 'Infractions diverses' },
  { id: 'ch86', name: 'Diffamation publique', type: 'Contravention', fine: 500, instruction: 'Dommages et intérêts possibles', jail: '00:00:00', category: 'Infractions diverses' },
  { id: 'ch87', name: 'Injure publique', type: 'Contravention', fine: 300, instruction: 'Rappel à la loi', jail: '00:00:00', category: 'Infractions diverses' },
  { id: 'ch88', name: 'Menace par voie électronique', type: 'Délit', fine: 1000, instruction: 'Inscription au casier', jail: '00:15:00', category: 'Infractions diverses' },
  { id: 'ch89', name: 'Hameçonnage / Arnaque en ligne', type: 'Délit', fine: 1500, instruction: 'Inscription au casier', jail: '00:15:00', category: 'Infractions diverses' },
  { id: 'ch90', name: "Violation de domicile", type: 'Délit', fine: 1200, instruction: 'Inscription au casier', jail: '00:15:00', category: 'Infractions diverses' },
  { id: 'ch91', name: 'Travail dissimulé / emploi non déclaré', type: 'Contravention', fine: 500, instruction: 'Par salarié non déclaré', jail: '00:00:00', category: 'Infractions diverses' },
  { id: 'ch92', name: 'Ivresse publique manifeste', type: 'Contravention', fine: 200, instruction: 'Dégrisement obligatoire', jail: '00:00:00', category: 'Infractions diverses' },
]

const adminChargeCategories = [
  'Toutes les catégories',
  'Circulation',
  'Atteintes aux personnes',
  'Atteintes aux biens',
  'Stupéfiants',
  'Armes',
  'Ordre public',
  'Crime organisé',
  "Atteintes à l'État",
  'Infractions diverses',
]

const defaultChargeCatalogEntries = CHARGES.map((charge, index) => normalizeChargeCatalogEntry(charge, `cfg-charge-${index + 1}`))
const defaultAdminChargeEntries = adminCharges.map((charge, index) => normalizeAdminChargeEntry(charge, `cfg-admin-charge-${index + 1}`))
const defaultVehicleCatalogEntries = vehicleList.map((vehicle, index) => normalizeVehicleCatalogEntry(vehicle, `cfg-vehicle-${index + 1}`))
const defaultAdminGradeEntries = adminGrades.map((grade, index) => normalizeAdminGradeEntry(grade, `cfg-admin-grade-${index + 1}`))
const defaultAdminSpecialtyEntries = adminSpecialties.map((specialty, index) => normalizeAdminSpecialtyEntry(specialty, `cfg-admin-specialty-${index + 1}`))
const defaultAdminDocumentTemplateEntries = adminDocumentTemplates.map((template, index) => normalizeAdminDocumentTemplateEntry(template, `cfg-admin-template-${index + 1}`))
const defaultAdminPaQuestionEntries = adminPaFormQuestions.map((question, index) => normalizeAdminPaFormQuestionEntry(question, `cfg-admin-question-${index + 1}`))
const defaultAdminRookieCriterionEntries = adminRookieCriteria.map((criterion, index) => normalizeAdminRookieCriterionEntry(criterion, `cfg-admin-rookie-${index + 1}`))
const defaultAdminUserDepartments = ['Tous', ...adminUserDepartments.filter((department) => department !== 'Tous')]

const academyCriteriaTemplates = [
  { id: 'ct01', name: 'PA Sud Carol 2026', description: 'Template complet Sud Carol pour sessions 2026', criteriaCount: 8 },
  { id: 'ct02', name: 'PA Nord X Cody', description: 'Template de notation nord utilisé avec Cody', criteriaCount: 8 },
  { id: 'ct03', name: 'PA Nord Standard 2025', description: 'Template standard nord conservé pour les promotions 2025', criteriaCount: 8 },
]

const academyCandidateStatusOptions = ['Tous les statuts', 'Candidature en cours de traitement', 'Acceptée', 'Refusée']

const academyCandidates = [
  {
    id: 'cand01',
    firstName: 'Elio',
    lastName: 'Dantes',
    email: 'Eliodantes@mail.loop',
    phone: '555-7704',
    status: 'Candidature en cours de traitement',
    note: '-',
    contacted: false,
    avatarLabel: 'ED',
    portraitTones: ['#efe6d0', '#c36f42', '#111214'],
    formSections: [
      {
        id: 'form01',
        title: 'Réponses au formulaire',
        blocks: [
          {
            id: 'block01',
            title: 'QUELLES SONT VOS MOTIVATIONS ?',
            content: [
              'Permis de conduire : Valide',
              'Test médical : Valide',
              "Problème financier : Non - Attiré par les jeux d'argents de temps à autre",
              'Consommation de stup : Aucune consommation alcool ou drogue / Fumeur de temps en temps',
              "Lieu de vie : Motel proche de l'hôpital sur Liberty Street",
              'Véhicule : Pas de véhicule perso',
              'Expérience similaire à la police : Non',
              "Grade maximum souhaité : Pas d'ambition",
              'Division : DOA ou Crime',
              'Journée porte ouverte : Oui avec Rafael et Neyder',
              '',
              'Motivations :',
              "Grâce à The Rookie je me suis intéressé au métier.",
              "Je me doute qu'il y a un monde entre le métier et la série mais tout ce qui est entraide m'intéresse.",
              'Découvrir un nouveau corps de métier aussi.',
              'Je pourrais apporter un vent de fraîcheur.',
              "Je suis quelqu'un de sociable et honnêtement je m'adapte à mon environnement ce qui fait que je pourrais m'améliorer vite.",
            ],
          },
          {
            id: 'block02',
            title: 'QUELLES SONT VOS DISPONIBILITÉS ? (INDIQUEZ VOTRE DAY OFF)',
            content: [
              'Je peux être dispo 6j/7 de 21h30 à 03h00',
              'En général je suis off le Samedi',
            ],
          },
        ],
      },
    ],
  },
  { id: 'cand02', firstName: 'Hinaurii', lastName: 'Teva Maere', email: 'hinaurii@mail.loop', phone: '555-7002', status: 'Candidature en cours de traitement', note: '-', contacted: false, avatarLabel: 'HT', portraitTones: ['#d5c6af', '#7b573f', '#221815'], formSections: [] },
  { id: 'cand03', firstName: 'Larsen', lastName: 'Maso', email: 'larsen@mail.loop', phone: '555-7003', status: 'Candidature en cours de traitement', note: '-', contacted: false, avatarLabel: 'LM', portraitTones: ['#d4bca1', '#9a6048', '#251812'], formSections: [] },
  { id: 'cand04', firstName: 'Riley', lastName: 'Carter', email: 'riley@mail.loop', phone: '555-7004', status: 'Candidature en cours de traitement', note: '-', contacted: false, avatarLabel: 'RC', portraitTones: ['#d2c6b7', '#89573d', '#271c16'], formSections: [] },
  { id: 'cand05', firstName: 'Tamatoa', lastName: 'Teva Maere', email: 'tamatoa@mail.loop', phone: '555-7005', status: 'Candidature en cours de traitement', note: '-', contacted: false, avatarLabel: 'TT', portraitTones: ['#ccb38f', '#80563a', '#241913'], formSections: [] },
  { id: 'cand06', firstName: 'Tonowari', lastName: 'Teva-Maere', email: 'tonowari@mail.loop', phone: '555-7006', status: 'Candidature en cours de traitement', note: '-', contacted: false, avatarLabel: 'TM', portraitTones: ['#d3bb9e', '#7b5437', '#241814'], formSections: [] },
  { id: 'cand07', firstName: 'Vivienne', lastName: 'Vaughn', email: 'vivienne@mail.loop', phone: '555-7007', status: 'Candidature en cours de traitement', note: '-', contacted: false, avatarLabel: 'VV', portraitTones: ['#dbc8b8', '#9c6a52', '#281c17'], formSections: [] },
]

const finalTestQuestions = [
  { id: 'q01', question: "Qui est l'auteur de la Déclaration d’Indépendance des États-Unis ?", expectedAnswer: 'Thomas Jefferson', points: 1, category: 'Culture générale', status: 'Actif' },
  { id: 'q02', question: 'Quelle est la ville la plus peuplée des USA ?', expectedAnswer: 'NYC', points: 1, category: 'Culture générale', status: 'Actif' },
  { id: 'q03', question: "Dans quel pays a eu lieu l'incident de la baie des cochons ?", expectedAnswer: 'Cuba', points: 1, category: 'Culture générale', status: 'Actif' },
  { id: 'q04', question: 'Que pensez-vous du SASP Nord ? Êtes vous prêt à travailler avec eux ?', expectedAnswer: 'Appréciation (pas juste un oui ou non)', points: 1, category: 'Personnelle', status: 'Actif' },
  { id: 'q05', question: "De quoi est composé l'armée de Cassidy", expectedAnswer: 'Dindon', points: 1, category: 'Culture générale', status: 'Actif' },
  { id: 'q06', question: 'Quel est le gouverneur actuel ?', expectedAnswer: 'Aucun', points: 1, category: 'Culture générale', status: 'Actif' },
  { id: 'q07', question: 'Pouvez-vous citer le nom de deux montagnes parmi les plus hautes de Los Santos ?', expectedAnswer: 'Mont Chiliad / Gordo / Josiah', points: 1, category: 'Culture générale', status: 'Actif' },
  { id: 'q08', question: 'Quel est le nom du dernier dictateur connu à Los Santos ?', expectedAnswer: 'Morrigan', points: 1, category: 'Culture générale', status: 'Actif' },
  { id: 'q09', question: 'Qui suis-je ?', expectedAnswer: 'Grade + matricule', points: 1, category: 'Divers', status: 'Actif' },
  { id: 'q10', question: 'Selon vous, pourquoi la hiérarchie passe avant toutes choses ?', expectedAnswer: "à l'appréciation", points: 1, category: 'Divers', status: 'Actif' },
]

function buildEncodeCitizenFormValues() {
  return {
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    gender: '',
    email: '',
    weight: '',
    height: '',
    address: '',
    ethnicity: '',
    hairColor: '',
    eyeColor: '',
    affiliation: '',
    job: '',
    driverLicense: '',
  }
}

function buildAcademySessionFormValues(session) {
  if (!session) {
    return {
      name: 'Promotion X',
      template: '',
      status: 'Ouvert',
      type: '',
      openedAt: '',
      closedAt: '',
    }
  }

  return {
    name: session.name,
    template: session.template,
    status: session.status,
    type: session.type,
    openedAt: session.openedAt,
    closedAt: session.closedAt,
  }
}

function parseBirthDateParts(value) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)

  if (!match) {
    return null
  }

  return {
    day: Number(match[1]),
    monthIndex: Number(match[2]) - 1,
    year: Number(match[3]),
  }
}

function formatBirthDate(day, monthIndex, year) {
  const formattedDay = String(day).padStart(2, '0')
  const formattedMonth = String(monthIndex + 1).padStart(2, '0')

  return `${formattedDay}/${formattedMonth}/${year}`
}

function getCitizenStat(citizen, label) {
  return citizen.stats.find((item) => item.label === label)?.value ?? ''
}

function formatOfficerOption(officer) {
  return `${officer.id} | ${officer.name}`
}

function buildOperationReportFormValues(report = null) {
  return {
    dateTime: report?.dateTime?.replace(' à ', ' ') ?? '',
    incidentType: report?.incidentType ?? '',
    officersQuery: '',
    selectedOfficers: report?.selectedOfficers ?? [],
    hostagesQuery: '',
    selectedHostages: report?.selectedHostages ?? [],
    location: report?.location ?? '',
    claims: report?.claims ?? '',
    negotiationLead: report?.negotiationLead ?? '',
    fieldLead: report?.fieldLead ?? '',
    report: report?.report ?? '',
    selectedProofFolders: report?.proofFolders ?? [],
  }
}

function buildMandatFormValues() {
  return { dateTime: '', officersQuery: '', selectedOfficers: [], reasonQuery: '', selectedReasons: [], description: '' }
}

function buildTicketRoutierFormValues() {
  return { dateTime: '', officersQuery: '', selectedOfficers: [], location: '', infractionQuery: '', selectedInfractions: [], fine: '', points: '' }
}

function buildDepositionFormValues() {
  return { dateTime: '', officersQuery: '', selectedOfficers: [], reason: '', body: '' }
}

function buildBraceletEncodeFormValues(citizen) {
  return { citizen: citizen?.name ?? '', officersQuery: '', selectedOfficers: [], npre: '', placedAt: '', expiresAt: '', reasons: '' }
}

function buildCitizenComplaintFormValues(citizen) {
  return {
    dateTime: '',
    officersQuery: '',
    selectedOfficers: [],
    lawyersQuery: '',
    selectedLawyers: [],
    reason: '',
    against: '',
    status: '',
    body: '',
  }
}

function buildInterrogationFormValues(record = null) {
  return {
    citizenQuery: record?.citizen ?? '',
    citizenName: record?.citizen ?? '',
    startedAt: record?.startedAt ?? '',
    endedAt: record?.endedAt ?? '',
    participantsQuery: '',
    selectedParticipants: record?.participants ?? [],
    policePost: record?.policePost ?? '',
    report: record?.report ?? '',
  }
}

function buildEvidenceFolderFormValues() {
  return {
    title: '',
  }
}

function buildWeaponEncodeFormValues() {
  return {
    dateTime: '',
    origin: '',
    model: '',
    serial: '',
    reason: '',
    citizenQuery: '',
    selectedCitizen: '',
    usedForCrime: false,
  }
}

function buildArrestReportFormValues() {
  return {
    dateTime: '',
    possession: '',
    policePost: '',
    lawyer: '',
    agentsQuery: '',
    selectedAgents: [],
    report: '',
    charges: [],
    chargeQuery: '',
    fineScale: '',
  }
}

function buildWeaponEditFormValues(weapon) {
  return {
    serial: weapon?.serial ?? '',
    reason: weapon?.reason ?? '',
    model: weapon?.model ?? '',
    origin: weapon?.origin ?? 'Arme saisie',
    assignedOfficer: weapon?.assignedOfficer ?? '',
    stolen: weapon?.stolen ?? false,
    archived: weapon?.archived ?? false,
    checkedPs: weapon?.checkedPs ?? false,
  }
}

function buildIncidentPdfPayload(report) {
  return {
    title: `Rapport d'incident : ${report.title}`,
    reportNumber: `#${report.id}`,
    dateTime: report.dateTime || report.date,
    author: `${report.officerId} | ${report.author}`,
    suspectLine: report.suspect || 'Aucun suspect interpellé',
    agents: report.participants?.length ? report.participants : [`${report.officerId} | ${report.author}`],
    details: report.details || report.summary || 'Aucun détail fourni.',
    chargeLabel: report.title,
    fineAmount: report.fineAmount || '0.00 $',
    jailTime: report.jailTime || '00:00:00',
    fineScale: report.status === 'Clos' ? 'Clos' : 'En attente',
    identityImage: createIdentityCardPreview({
      name: report.title,
      birthDate: report.date,
      phone: report.officerId,
    }),
    evidenceImage: createArrestEvidencePreview(report.title),
    sealImage: createAdminSeal('SA', '#d2d4d8', '#ffffff', '#85888f'),
    policePost: report.location || 'San Andreas State Police | Vespucci',
  }
}

function buildCitizenFormValues(citizen) {
  const [firstName, ...lastNameParts] = citizen.name.split(' ')

  return {
    firstName: firstName ?? '',
    lastName: lastNameParts.join(' '),
    phone: citizen.phone,
    birthDate: citizen.birthDate.includes('avr.') ? '27/04/2000' : citizen.birthDate,
    gender: getCitizenStat(citizen, 'Sexe'),
    email: citizen.email,
    weight: getCitizenStat(citizen, 'Poids'),
    height: getCitizenStat(citizen, 'Taille'),
    address: getCitizenStat(citizen, 'Adresse') === 'x' ? '' : getCitizenStat(citizen, 'Adresse'),
    hairColor: getCitizenStat(citizen, 'Couleur de cheveux'),
    eyeColor: getCitizenStat(citizen, 'Couleur des yeux') === 'brun' ? '' : getCitizenStat(citizen, 'Couleur des yeux'),
    affiliation: getCitizenStat(citizen, 'Appartenance') === 'x' ? '' : getCitizenStat(citizen, 'Appartenance'),
    job: getCitizenStat(citizen, 'Emploi') === 'pacifique' ? '' : getCitizenStat(citizen, 'Emploi'),
    ethnicity: getCitizenStat(citizen, 'Ethnie') === 'Asiatique' ? '' : getCitizenStat(citizen, 'Ethnie'),
    driverLicense: getCitizenStat(citizen, 'Permis de conduire'),
  }
}

const editorToolsDef = [
  { key: 'bold',          cmd: () => document.execCommand('bold'),                icon: <strong style={{fontFamily:'serif',fontSize:'13px'}}>B</strong> },
  { key: 'italic',        cmd: () => document.execCommand('italic'),              icon: <em style={{fontFamily:'serif',fontSize:'13px',fontStyle:'italic'}}>I</em> },
  { key: 'underline',     cmd: () => document.execCommand('underline'),           icon: <span style={{textDecoration:'underline',fontSize:'12px'}}>U</span> },
  { key: 'strike',        cmd: () => document.execCommand('strikeThrough'),       icon: <span style={{textDecoration:'line-through',fontSize:'12px'}}>S</span> },
  { key: 'ul',            cmd: () => document.execCommand('insertUnorderedList'), icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor"><circle cx="2" cy="3.5" r="1.2"/><rect x="5" y="3" width="8" height="1"/><circle cx="2" cy="7" r="1.2"/><rect x="5" y="6.5" width="8" height="1"/><circle cx="2" cy="10.5" r="1.2"/><rect x="5" y="10" width="8" height="1"/></svg> },
  { key: 'ol',            cmd: () => document.execCommand('insertOrderedList'),   icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor"><text x="0" y="5" fontSize="5">1.</text><rect x="5" y="3" width="8" height="1"/><text x="0" y="9" fontSize="5">2.</text><rect x="5" y="7" width="8" height="1"/><text x="0" y="13" fontSize="5">3.</text><rect x="5" y="11" width="8" height="1"/></svg> },
  { key: 'indent',        cmd: () => document.execCommand('indent'),              icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><line x1="1" y1="3.5" x2="13" y2="3.5"/><line x1="5" y1="7" x2="13" y2="7"/><line x1="5" y1="10.5" x2="13" y2="10.5"/><polyline points="1,6 3.5,7 1,8" fill="currentColor" stroke="none"/></svg> },
  { key: 'undo',          cmd: () => document.execCommand('undo'),                icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7 C2 4 5 2 8 2 C11 2 12.5 4 12.5 7 C12.5 10 11 12 8 12"/><polyline points="2,4 2,7 5,7" fill="currentColor" stroke="currentColor" strokeWidth="0"/><path d="M2 4 L2 7 L5 7" fill="none"/></svg> },
  { key: 'clear',         cmd: null,                                              icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><line x1="3" y1="3" x2="11" y2="11"/><line x1="11" y1="3" x2="3" y2="11"/></svg>, active: true },
  { key: 'h1',            cmd: () => document.execCommand('formatBlock', false, 'h1'), icon: <span style={{fontSize:'11px',fontWeight:900}}>H1</span> },
  { key: 'h2',            cmd: () => document.execCommand('formatBlock', false, 'h2'), icon: <span style={{fontSize:'11px',fontWeight:900}}>H2</span> },
  { key: 'h3',            cmd: () => document.execCommand('formatBlock', false, 'h3'), icon: <span style={{fontSize:'11px',fontWeight:900}}>H3</span> },
  { key: 'link1',         cmd: () => document.execCommand('createLink', false, 'https://'), icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M5.5 8.5 L8.5 5.5"/><path d="M4 9.5 C3 9.5 1.5 8.5 1.5 7 C1.5 5.5 3 4.5 4 4.5 L5.5 4.5"/><path d="M8.5 9.5 L10 9.5 C11 9.5 12.5 8.5 12.5 7 C12.5 5.5 11 4.5 10 4.5 L8.5 4.5"/></svg> },
  { key: 'link2',         cmd: () => document.execCommand('unlink'),              icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"><path d="M5.5 8.5 L8.5 5.5"/><path d="M4 9.5 C3 9.5 1.5 8.5 1.5 7 C1.5 5.5 3 4.5 4 4.5 L5.5 4.5"/><path d="M8.5 9.5 L10 9.5 C11 9.5 12.5 8.5 12.5 7 C12.5 5.5 11 4.5 10 4.5 L8.5 4.5"/><line x1="10" y1="10" x2="12" y2="12"/><line x1="2" y1="2" x2="4" y2="4"/></svg> },
  { key: 'alignL',        cmd: () => document.execCommand('justifyLeft'),         icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><line x1="1" y1="3" x2="13" y2="3"/><line x1="1" y1="6" x2="9" y2="6"/><line x1="1" y1="9" x2="13" y2="9"/><line x1="1" y1="12" x2="9" y2="12"/></svg> },
  { key: 'alignC',        cmd: () => document.execCommand('justifyCenter'),       icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><line x1="1" y1="3" x2="13" y2="3"/><line x1="3" y1="6" x2="11" y2="6"/><line x1="1" y1="9" x2="13" y2="9"/><line x1="3" y1="12" x2="11" y2="12"/></svg> },
  { key: 'alignR',        cmd: () => document.execCommand('justifyRight'),        icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><line x1="1" y1="3" x2="13" y2="3"/><line x1="5" y1="6" x2="13" y2="6"/><line x1="1" y1="9" x2="13" y2="9"/><line x1="5" y1="12" x2="13" y2="12"/></svg> },
  { key: 'alignJ',        cmd: () => document.execCommand('justifyFull'),         icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><line x1="1" y1="3" x2="13" y2="3"/><line x1="1" y1="6" x2="13" y2="6"/><line x1="1" y1="9" x2="13" y2="9"/><line x1="1" y1="12" x2="13" y2="12"/></svg> },
  { key: 'hr',            cmd: () => document.execCommand('insertHorizontalRule'), icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><line x1="1" y1="7" x2="13" y2="7"/></svg> },
  { key: 'removeFormat',  cmd: () => document.execCommand('removeFormat'),        icon: <svg viewBox="0 0 14 14" width="13" height="13" fill="currentColor"><text x="1" y="11" fontSize="10" fontFamily="serif" fontWeight="bold">T</text><line x1="9" y1="5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>, active: true },
]

function EditorShell({ value, onChange, textareaClassName = '', shellClassName = '', placeholder = '' }) {
  const ref = useRef(null)
  const isFocused = useRef(false)

  useEffect(() => {
    if (ref.current && !isFocused.current) {
      ref.current.innerHTML = value || ''
    }
  }, [value])

  return (
    <div className={`case-editor-shell${shellClassName ? ` ${shellClassName}` : ''}`}>
      <div className="case-editor-toolbar">
        {editorToolsDef.map((tool) => (
          <button
            className={`case-editor-tool${tool.active ? ' case-editor-tool-active' : ''}`}
            key={tool.key}
            type="button"
            title={tool.key}
            onMouseDown={(e) => {
              e.preventDefault()
              if (tool.key === 'clear') {
                if (ref.current) { ref.current.innerHTML = ''; onChange('') }
              } else if (tool.cmd) {
                ref.current?.focus()
                tool.cmd()
                if (ref.current) onChange(ref.current.innerHTML)
              }
            }}
          >
            {tool.icon}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        className={`case-editor-area${textareaClassName ? ` ${textareaClassName}` : ''}`}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onFocus={() => { isFocused.current = true }}
        onBlur={() => { isFocused.current = false; if (ref.current) onChange(ref.current.innerHTML) }}
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML) }}
      />
    </div>
  )
}

function EditorToolbar() {
  return null
}

function buildPaginationItems(currentPage, totalPages) {
  const safeTotalPages = Math.max(1, totalPages)
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), safeTotalPages)

  if (safeTotalPages <= 7) {
    return Array.from({ length: safeTotalPages }, (_, index) => index + 1)
  }

  if (safeCurrentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', safeTotalPages]
  }

  if (safeCurrentPage >= safeTotalPages - 3) {
    return [1, '...', safeTotalPages - 4, safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages]
  }

  return [1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', safeTotalPages]
}

function paginateItems(items, currentPage, itemsPerPage) {
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)

  return {
    currentPage: safeCurrentPage,
    totalPages,
    items: items.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage),
  }
}

function Pagination({ className, ariaLabel, currentPage, totalPages, onPageChange }) {
  const paginationItems = buildPaginationItems(currentPage, totalPages)

  return (
    <div className={className} aria-label={ariaLabel}>
      {paginationItems.map((item, index) => (
        item === '...'
          ? <span className="pagination-ellipsis" key={`ellipsis-${currentPage}-${index}`}>...</span>
          : <button className={`pagination-item${item === currentPage ? ' pagination-item-active' : ''}`} key={item} type="button" onClick={() => onPageChange(item)}>{item}</button>
      ))}
      <button className="pagination-arrow" type="button" aria-label="Page suivante" disabled={currentPage >= totalPages} onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}>
        <ChevronIcon />
      </button>
    </div>
  )
}

function App() {
  const RECORD_TABS_VISIBLE_COUNT = 4
  const ADMIN_CHARGES_PER_PAGE = 10
  const EVIDENCE_FOLDERS_PER_PAGE = 10
  const ROOKIES_PER_PAGE = 8
  const AGENT_STATISTICS_PER_PAGE = 8
  const COMPLAINTS_PER_PAGE = 8
  const OFFENSE_CHARGES_PER_PAGE = 10
  const BRACELETS_PER_PAGE = 8
  const BOOTS_PER_PAGE = 8
  const WEAPONS_PER_PAGE = 8
  const VEHICLE_OFFENSES_PER_PAGE = 8
  const AUTOPSY_REPORTS_PER_PAGE = 10
  const [uiState, setUiState] = useState(defaultState)
  const [permissions, setPermissions] = useState(defaultPermissions)
  const [activePage, setActivePage] = useState('home')
  const [mdtMode, setMdtMode] = useState('sasp')
  const [collapsedNavSections, setCollapsedNavSections] = useState(() => new Set([...navSections, ...adminNavSections, ...mcdNavSections].map((s) => s.title)))
  const [personalNote, setPersonalNote] = useState('')
  const [autopsySearch, setAutopsySearch] = useState('')
  const [autopsyReportsState] = useState(() => autopsyReports)
  const [selectedAutopsyReportId, setSelectedAutopsyReportId] = useState(null)
  const [citizenProfiles, setCitizenProfiles] = useState(() => citizens.map(normalizeCitizenProfile))
  const [citizenSearch, setCitizenSearch] = useState('')
  const [citizenPage, setCitizenPage] = useState(1)
  const [listPages, setListPages] = useState(() => ({
    adminCharges: 1,
    evidenceFolders: 1,
    rookies: 1,
    agentStatistics: 1,
    complaints: 1,
    offenseCharges: 1,
    bracelets: 1,
    boots: 1,
    weapons: 1,
    vehicleOffenses: 1,
    autopsyReports: 1,
  }))
  const [selectedCitizenId, setSelectedCitizenId] = useState(null)
  const [activeRecordTab, setActiveRecordTab] = useState('arrestation')
  const [recordTabsOffset, setRecordTabsOffset] = useState(0)
  const [openCitizenRecordMenuId, setOpenCitizenRecordMenuId] = useState(null)
  const [effectifsSearch, setEffectifsSearch] = useState('')
  const [staffAgentsState, setStaffAgentsState] = useState(() => staffAgents)
  const [expandedStaffAgentId, setExpandedStaffAgentId] = useState('10')
  const [interrogationSearch, setInterrogationSearch] = useState('')
  const [interrogationEntries, setInterrogationEntries] = useState(() => interrogationRegistry)
  const [isInterrogationModalOpen, setIsInterrogationModalOpen] = useState(false)
  const [isInterrogationCitizenDropdownOpen, setIsInterrogationCitizenDropdownOpen] = useState(false)
  const [isInterrogationParticipantsDropdownOpen, setIsInterrogationParticipantsDropdownOpen] = useState(false)
  const [isInterrogationPolicePostDropdownOpen, setIsInterrogationPolicePostDropdownOpen] = useState(false)
  const [interrogationForm, setInterrogationForm] = useState(() => buildInterrogationFormValues())
  const [complaintSearch, setComplaintSearch] = useState('')
  const [complaintStatus, setComplaintStatus] = useState('Tous les statuts')
  const [isComplaintStatusDropdownOpen, setIsComplaintStatusDropdownOpen] = useState(false)
  const [complaintRegistryEntries, setComplaintRegistryEntries] = useState(() => complaintsRegistry)
  const [selectedComplaintId, setSelectedComplaintId] = useState('pl-01')
  const [isCitizenComplaintModalOpen, setIsCitizenComplaintModalOpen] = useState(false)
  const [isCitizenComplaintOfficersDropdownOpen, setIsCitizenComplaintOfficersDropdownOpen] = useState(false)
  const [isCitizenComplaintLawyersDropdownOpen, setIsCitizenComplaintLawyersDropdownOpen] = useState(false)
  const [isCitizenComplaintStatusDropdownOpen, setIsCitizenComplaintStatusDropdownOpen] = useState(false)
  const [citizenComplaintPastedImages, setCitizenComplaintPastedImages] = useState([])
  const [isCasierModalOpen, setIsCasierModalOpen] = useState(false)
  const [isMandatModalOpen, setIsMandatModalOpen] = useState(false)
  const [mandatForm, setMandatForm] = useState(() => buildMandatFormValues())
  const [isMandatOfficersDropdownOpen, setIsMandatOfficersDropdownOpen] = useState(false)
  const [isMandatReasonDropdownOpen, setIsMandatReasonDropdownOpen] = useState(false)
  const [isTicketRoutierModalOpen, setIsTicketRoutierModalOpen] = useState(false)
  const [ticketRoutierForm, setTicketRoutierForm] = useState(() => buildTicketRoutierFormValues())
  const [isTicketOfficersDropdownOpen, setIsTicketOfficersDropdownOpen] = useState(false)
  const [isTicketInfractionDropdownOpen, setIsTicketInfractionDropdownOpen] = useState(false)
  const [isDepositionModalOpen, setIsDepositionModalOpen] = useState(false)
  const [depositionForm, setDepositionForm] = useState(() => buildDepositionFormValues())
  const [isDepositionOfficersDropdownOpen, setIsDepositionOfficersDropdownOpen] = useState(false)
  const [isBraceletEncodeModalOpen, setIsBraceletEncodeModalOpen] = useState(false)
  const [braceletEncodeForm, setBraceletEncodeForm] = useState(() => buildBraceletEncodeFormValues(null))
  const [isBraceletOfficersDropdownOpen, setIsBraceletOfficersDropdownOpen] = useState(false)
  const [citizenComplaintForm, setCitizenComplaintForm] = useState(() => buildCitizenComplaintFormValues(citizens.find((citizen) => citizen.id === '01') ?? citizens[0]))
  const [selectedIncidentReportId, setSelectedIncidentReportId] = useState('450')
  const [incidentReportsState, setIncidentReportsState] = useState(() => incidentReports)
  const [operationReportEntries, setOperationReportEntries] = useState(() => operationReports)
  const [operationReportChoices, setOperationReportChoices] = useState(() => operationReportOptions)
  const [operationReportsSearch, setOperationReportsSearch] = useState('')
  const [selectedOperationReportId, setSelectedOperationReportId] = useState(null)
  const [isOperationReportCreateModalOpen, setIsOperationReportCreateModalOpen] = useState(false)
  const [isOperationOfficersDropdownOpen, setIsOperationOfficersDropdownOpen] = useState(false)
  const [isOperationHostagesDropdownOpen, setIsOperationHostagesDropdownOpen] = useState(false)
  const [isOperationNegotiationLeadDropdownOpen, setIsOperationNegotiationLeadDropdownOpen] = useState(false)
  const [isOperationFieldLeadDropdownOpen, setIsOperationFieldLeadDropdownOpen] = useState(false)
  const [isOperationProofDropdownOpen, setIsOperationProofDropdownOpen] = useState(false)
  const [operationReportPastedImages, setOperationReportPastedImages] = useState([])
  const [operationReportForm, setOperationReportForm] = useState(() => buildOperationReportFormValues())
  const [evidenceSearch, setEvidenceSearch] = useState('')
  const [evidenceFoldersState, setEvidenceFoldersState] = useState(() => evidenceFolders)
  const [selectedEvidenceFolderId, setSelectedEvidenceFolderId] = useState(null)
  const [evidenceFolderImages, setEvidenceFolderImages] = useState({})
  const [isEvidenceFolderModalOpen, setIsEvidenceFolderModalOpen] = useState(false)
  const [evidenceFolderForm, setEvidenceFolderForm] = useState(() => buildEvidenceFolderFormValues())
  const [isProfileSettingsModalOpen, setIsProfileSettingsModalOpen] = useState(false)
  const [profileSettingsForm, setProfileSettingsForm] = useState(() => buildProfileFormValues(defaultState.profile))
  const [gradeSearch, setGradeSearch] = useState('')
  const [adminUserSearch, setAdminUserSearch] = useState('')
  const [adminUserDepartment, setAdminUserDepartment] = useState('Tous')
  const [adminUserDepartmentsState, setAdminUserDepartmentsState] = useState(() => defaultAdminUserDepartments)
  const [specialtyUnitsState, setSpecialtyUnitsState] = useState(() => specialtyUnits)
  const [legalContactsState, setLegalContactsState] = useState(() => legalContacts)
  const [chargeSearch, setChargeSearch] = useState('')
  const [chargeCategory, setChargeCategory] = useState('Toutes les catégories')
  const [isChargeCategoryDropdownOpen, setIsChargeCategoryDropdownOpen] = useState(false)
  const [offenseSearch, setOffenseSearch] = useState('')
  const [offenseCategory, setOffenseCategory] = useState('Toutes les catégories')
  const [isOffenseCategoryDropdownOpen, setIsOffenseCategoryDropdownOpen] = useState(false)
  const [rookieSession, setRookieSession] = useState('Promotion Ella')
  const [rookieSearch, setRookieSearch] = useState('')
  const [isRookieSessionDropdownOpen, setIsRookieSessionDropdownOpen] = useState(false)
  const [selectedRookieId, setSelectedRookieId] = useState('rookie-03')
  const [rookieChecklist, setRookieChecklist] = useState(() => buildRookieChecklistDefaults())
  const [candidateSearch, setCandidateSearch] = useState('')
  const [candidateStatus, setCandidateStatus] = useState('Tous les statuts')
  const [isCandidateStatusDropdownOpen, setIsCandidateStatusDropdownOpen] = useState(false)
  const [sessionSearch, setSessionSearch] = useState('')
  const [sessionTypeFilter, setSessionTypeFilter] = useState('Tous les types')
  const [isSessionTypeDropdownOpen, setIsSessionTypeDropdownOpen] = useState(false)
  const [openSessionMenuId, setOpenSessionMenuId] = useState(null)
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)
  const [isEditSessionModalOpen, setIsEditSessionModalOpen] = useState(false)
  const [isDeleteSessionModalOpen, setIsDeleteSessionModalOpen] = useState(false)
  const [isAddSessionTemplateDropdownOpen, setIsAddSessionTemplateDropdownOpen] = useState(false)
  const [isEditSessionStatusDropdownOpen, setIsEditSessionStatusDropdownOpen] = useState(false)
  const [isEditSessionTypeDropdownOpen, setIsEditSessionTypeDropdownOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState('s01')
  const [selectedCandidateId, setSelectedCandidateId] = useState('cand01')
  const [addSessionForm, setAddSessionForm] = useState(() => buildAcademySessionFormValues())
  const [editSessionForm, setEditSessionForm] = useState(() => buildAcademySessionFormValues(academySessions[0]))
  const [finalQuestionSearch, setFinalQuestionSearch] = useState('')
  const [finalQuestionStatus, setFinalQuestionStatus] = useState('Tous les statuts')
  const [finalQuestionCategory, setFinalQuestionCategory] = useState('Toutes les catégories')
  const [isFinalQuestionStatusDropdownOpen, setIsFinalQuestionStatusDropdownOpen] = useState(false)
  const [isFinalQuestionCategoryDropdownOpen, setIsFinalQuestionCategoryDropdownOpen] = useState(false)
  const [agentSearch, setAgentSearch] = useState('')
  const [selectedAgentStatisticId, setSelectedAgentStatisticId] = useState(null)
  const [agentStatisticsState, setAgentStatisticsState] = useState([])
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [adminGradesState, setAdminGradesState] = useState(() => defaultAdminGradeEntries)
  const [adminSpecialtiesState, setAdminSpecialtiesState] = useState(() => defaultAdminSpecialtyEntries)
  const [adminDocumentTemplatesState, setAdminDocumentTemplatesState] = useState(() => defaultAdminDocumentTemplateEntries)
  const [adminPaFormQuestionsState, setAdminPaFormQuestionsState] = useState(() => defaultAdminPaQuestionEntries)
  const [adminRookieCriteriaState, setAdminRookieCriteriaState] = useState(() => defaultAdminRookieCriterionEntries)
  const [adminChargesState, setAdminChargesState] = useState(() => defaultAdminChargeEntries)
  const [chargeCatalogState, setChargeCatalogState] = useState(() => defaultChargeCatalogEntries)
  const [vehicleCatalogState, setVehicleCatalogState] = useState(() => defaultVehicleCatalogEntries)
  const [offenseVehiclesState, setOffenseVehiclesState] = useState(() => offenseVehicles)
  const [expandedOffenseVehicleId, setExpandedOffenseVehicleId] = useState('01')
  const [braceletSearch, setBraceletSearch] = useState('')
  const [bootSearch, setBootSearch] = useState('')
  const [braceletRegistryState, setBraceletRegistryState] = useState(() => braceletRegistryEntries)
  const [bootRegistryState, setBootRegistryState] = useState(() => bootRegistryEntries)
  const [expandedBraceletId, setExpandedBraceletId] = useState('br01')
  const [weaponSearch, setWeaponSearch] = useState('')
  const [weaponOriginFilter, setWeaponOriginFilter] = useState('Toutes les origines')
  const [weaponStateFilter, setWeaponStateFilter] = useState('Tous les états')
  const [isWeaponOriginFilterDropdownOpen, setIsWeaponOriginFilterDropdownOpen] = useState(false)
  const [isWeaponStateFilterDropdownOpen, setIsWeaponStateFilterDropdownOpen] = useState(false)
  const [weaponRegistryState, setWeaponRegistryState] = useState(() => weaponRegistryEntries)
  const [expandedWeaponId, setExpandedWeaponId] = useState('w01')
  const [openWeaponMenuId, setOpenWeaponMenuId] = useState(null)
  const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false)
  const [isWeaponEncodeModalOpen, setIsWeaponEncodeModalOpen] = useState(false)
  const [isWeaponEditModalOpen, setIsWeaponEditModalOpen] = useState(false)
  const [isVehicleTypeDropdownOpen, setIsVehicleTypeDropdownOpen] = useState(false)
  const [isVehicleOwnerDropdownOpen, setIsVehicleOwnerDropdownOpen] = useState(false)
  const [isVehicleProofDropdownOpen, setIsVehicleProofDropdownOpen] = useState(false)
  const [isVehicleOperationDropdownOpen, setIsVehicleOperationDropdownOpen] = useState(false)
  const [isWeaponModelDropdownOpen, setIsWeaponModelDropdownOpen] = useState(false)
  const [isWeaponCitizenDropdownOpen, setIsWeaponCitizenDropdownOpen] = useState(false)
  const [isWeaponEditModelDropdownOpen, setIsWeaponEditModelDropdownOpen] = useState(false)
  const [isWeaponEditOfficerDropdownOpen, setIsWeaponEditOfficerDropdownOpen] = useState(false)
  const [isWeaponEditOriginDropdownOpen, setIsWeaponEditOriginDropdownOpen] = useState(false)
  const [showWeaponSuccessToast, setShowWeaponSuccessToast] = useState(false)
  const [vehicleOffenseForm, setVehicleOffenseForm] = useState({
    vehicleType: '',
    plate: '',
    title: '',
    ownerQuery: '',
    selectedOwner: '',
    proofFolder: '',
    operationReport: '',
  })
  const [weaponEncodeForm, setWeaponEncodeForm] = useState(() => buildWeaponEncodeFormValues())
  const [editingWeaponId, setEditingWeaponId] = useState('w01')
  const [weaponEditForm, setWeaponEditForm] = useState(() => buildWeaponEditFormValues(weaponRegistryEntries[0]))
  const [isCitizenMenuOpen, setIsCitizenMenuOpen] = useState(true)
  const [isEncodeCitizenModalOpen, setIsEncodeCitizenModalOpen] = useState(false)
  const [isEditCitizenModalOpen, setIsEditCitizenModalOpen] = useState(false)
  const [isEncodeCitizenGenderOpen, setIsEncodeCitizenGenderOpen] = useState(false)
  const [isEncodeCitizenEthnicityOpen, setIsEncodeCitizenEthnicityOpen] = useState(false)
  const [isEncodeCitizenLicenseOpen, setIsEncodeCitizenLicenseOpen] = useState(false)
  const [isEncodeCitizenBirthDatePickerOpen, setIsEncodeCitizenBirthDatePickerOpen] = useState(false)
  const [isEncodeCitizenMonthDropdownOpen, setIsEncodeCitizenMonthDropdownOpen] = useState(false)
  const [isEncodeCitizenYearDropdownOpen, setIsEncodeCitizenYearDropdownOpen] = useState(false)
  const [encodeCitizenBirthMonth, setEncodeCitizenBirthMonth] = useState(0)
  const [encodeCitizenBirthYear, setEncodeCitizenBirthYear] = useState(2000)
  const [encodeCitizenPhoto, setEncodeCitizenPhoto] = useState('')
  const [encodeCitizenForm, setEncodeCitizenForm] = useState(() => buildEncodeCitizenFormValues())
  const [encodeCitizenErrors, setEncodeCitizenErrors] = useState({})
  const [editCitizenForm, setEditCitizenForm] = useState(() => buildCitizenFormValues(citizens.find((citizen) => citizen.id === '01') ?? citizens[0]))
  const [isArrestReportModalOpen, setIsArrestReportModalOpen] = useState(false)
  const [isArrestDossierModalOpen, setIsArrestDossierModalOpen] = useState(false)
  const [editingArrestDossierRecordId, setEditingArrestDossierRecordId] = useState(null)
  const [isReportAgentsDropdownOpen, setIsReportAgentsDropdownOpen] = useState(false)
  const [isReportChargesDropdownOpen, setIsReportChargesDropdownOpen] = useState(false)
  const [isReportFineScaleDropdownOpen, setIsReportFineScaleDropdownOpen] = useState(false)
  const [isDossierAgentsDropdownOpen, setIsDossierAgentsDropdownOpen] = useState(false)
  const [isDossierPeopleDropdownOpen, setIsDossierPeopleDropdownOpen] = useState(false)
  const [isDossierOperationDropdownOpen, setIsDossierOperationDropdownOpen] = useState(false)
  const [isDossierProofDropdownOpen, setIsDossierProofDropdownOpen] = useState(false)
  const [isDossierChargesDropdownOpen, setIsDossierChargesDropdownOpen] = useState(false)
  const [isDossierFineScaleDropdownOpen, setIsDossierFineScaleDropdownOpen] = useState(false)
  const [showArrestDossierSuccessToast, setShowArrestDossierSuccessToast] = useState(false)
  const [showArrestDossierPreview, setShowArrestDossierPreview] = useState(false)
  const [currentArrestDossierPreview, setCurrentArrestDossierPreview] = useState(null)
  const [arrestReportStep, setArrestReportStep] = useState(1)
  const [arrestReportPastedImages, setArrestReportPastedImages] = useState([])
  const [arrestDossierPastedImages, setArrestDossierPastedImages] = useState([])
  const [arrestReportForm, setArrestReportForm] = useState(() => buildArrestReportFormValues())
  const [arrestDossierForm, setArrestDossierForm] = useState(() => buildArrestDossierFormValues(citizens.find((citizen) => citizen.id === '01') ?? citizens[0], citizens[0]?.records?.arrestation?.[0]))
  const [hasHydratedSnapshot, setHasHydratedSnapshot] = useState(false)
  const persistedSectionsRef = useRef({})
  const wantedPeopleData = buildWantedPeopleFromCitizens(citizenProfiles)
  const officerOptionsData = staffAgentsState.map((agent) => ({
    id: agent.id,
    name: `${agent.firstName} ${agent.lastName}`.trim(),
  }))
  const adminChargeCategoryOptions = Array.from(new Set([
    'Toutes les catégories',
    ...adminChargesState.map((charge) => charge.category).filter(Boolean),
  ]))
  const chargeOptionsData = chargeCatalogState.map((charge) => charge.name).filter(Boolean)
  const arrestChargeCatalogData = chargeCatalogState.reduce((catalog, charge) => {
    catalog[charge.name] = {
      fine: Number(charge.fine) || 0,
      jail: charge.jail || '00:00:00',
      label: charge.name,
    }

    return catalog
  }, {})
  const vehicleTypeOptionsData = vehicleCatalogState
    .map((vehicle) => vehicle.name)
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, 'fr'))
  const weaponCitizenOptionsData = citizenProfiles.map((citizen) => citizen.phone ? `${citizen.name} — ${citizen.phone}` : citizen.name)
  const vehicleOwnerOptionsData = citizenProfiles.map((citizen) => citizen.phone ? `${citizen.name} — ${citizen.phone}` : citizen.name)

  useEffect(() => {
    const onMessage = (event) => {
      const { data } = event

      if (!data || data.type !== 'lpmdt:toggle') {
        return
      }

      setUiState((current) => ({
        ...current,
        visible: typeof data.visible === 'boolean' ? data.visible : !current.visible,
        profile: data.profile && typeof data.profile === 'object'
          ? {
              ...current.profile,
              ...data.profile,
            }
          : current.profile,
      }))

      if (data.visible === true) {
        setActivePage('home')
      }

      if (data.permissions && typeof data.permissions === 'object') {
        setPermissions((current) => ({
          ...current,
          ...data.permissions,
        }))
      }

      if (data.snapshot && typeof data.snapshot === 'object') {
        const snapshotCitizens = Array.isArray(data.snapshot.citizens) ? data.snapshot.citizens.map(normalizeCitizenProfile) : []
        const snapshotComplaints = Array.isArray(data.snapshot.complaintRegistryEntries)
          ? data.snapshot.complaintRegistryEntries
          : buildComplaintRegistryEntries(snapshotCitizens)
        const snapshotIncidentReports = Array.isArray(data.snapshot.incidentReports) ? data.snapshot.incidentReports : []
        const snapshotOperationReports = Array.isArray(data.snapshot.operationReports) ? data.snapshot.operationReports : []
        const snapshotAdminCharges = Array.isArray(data.snapshot.adminCharges)
          ? data.snapshot.adminCharges.map((charge, index) => normalizeAdminChargeEntry(charge, `sql-admin-charge-${index + 1}`)).filter((charge) => charge.name)
          : []
        const snapshotAdminGrades = Array.isArray(data.snapshot.adminGrades)
          ? data.snapshot.adminGrades.map((grade, index) => normalizeAdminGradeEntry(grade, `sql-admin-grade-${index + 1}`)).filter((grade) => grade.name)
          : []
        const snapshotAdminSpecialties = Array.isArray(data.snapshot.adminSpecialties)
          ? data.snapshot.adminSpecialties.map((specialty, index) => normalizeAdminSpecialtyEntry(specialty, `sql-admin-specialty-${index + 1}`)).filter((specialty) => specialty.name)
          : []
        const snapshotAdminDocumentTemplates = Array.isArray(data.snapshot.adminDocumentTemplates)
          ? data.snapshot.adminDocumentTemplates.map((template, index) => normalizeAdminDocumentTemplateEntry(template, `sql-admin-template-${index + 1}`)).filter((template) => template.title)
          : []
        const snapshotAdminPaQuestions = Array.isArray(data.snapshot.adminPaFormQuestions)
          ? data.snapshot.adminPaFormQuestions.map((question, index) => normalizeAdminPaFormQuestionEntry(question, `sql-admin-question-${index + 1}`)).filter((question) => question.label)
          : []
        const snapshotAdminRookieCriteria = Array.isArray(data.snapshot.adminRookieCriteria)
          ? data.snapshot.adminRookieCriteria.map((criterion, index) => normalizeAdminRookieCriterionEntry(criterion, `sql-admin-rookie-${index + 1}`)).filter((criterion) => criterion.label)
          : []
        const snapshotChargeCatalog = Array.isArray(data.snapshot.chargeCatalog)
          ? data.snapshot.chargeCatalog.map((charge, index) => normalizeChargeCatalogEntry(charge, `sql-charge-${index + 1}`)).filter((charge) => charge.name)
          : []
        const snapshotVehicleCatalog = Array.isArray(data.snapshot.vehicleCatalog)
          ? data.snapshot.vehicleCatalog.map((vehicle, index) => normalizeVehicleCatalogEntry(vehicle, `sql-vehicle-${index + 1}`)).filter((vehicle) => vehicle.name)
          : []

        setHasHydratedSnapshot(false)
        persistedSectionsRef.current = {}
        if (data.snapshot.profile && typeof data.snapshot.profile === 'object') {
          setUiState((current) => ({
            ...current,
            profile: {
              ...current.profile,
              ...data.snapshot.profile,
            },
          }))
        }
        setPersonalNote(typeof data.snapshot.personalNote === 'string' ? data.snapshot.personalNote : '')
        setCitizenProfiles(snapshotCitizens)
        setComplaintRegistryEntries(snapshotComplaints)
        setStaffAgentsState(Array.isArray(data.snapshot.staffAgents) ? data.snapshot.staffAgents : [])
        setAdminUserDepartmentsState(Array.isArray(data.snapshot.adminUserDepartments) && data.snapshot.adminUserDepartments.length > 0 ? data.snapshot.adminUserDepartments : defaultAdminUserDepartments)
        setAgentStatisticsState(Array.isArray(data.snapshot.agentStatistics) ? data.snapshot.agentStatistics : [])
        setLegalContactsState(Array.isArray(data.snapshot.legalContacts) ? data.snapshot.legalContacts : [])
        setInterrogationEntries(Array.isArray(data.snapshot.interrogations) ? data.snapshot.interrogations : [])
        setIncidentReportsState(snapshotIncidentReports)
        setOperationReportEntries(snapshotOperationReports)
        setOperationReportChoices(Array.isArray(data.snapshot.operationReportChoices) ? data.snapshot.operationReportChoices : [])
        setEvidenceFoldersState(Array.isArray(data.snapshot.evidenceFolders) ? data.snapshot.evidenceFolders : [])
        setEvidenceFolderImages(data.snapshot.evidenceFolderImages && typeof data.snapshot.evidenceFolderImages === 'object' ? data.snapshot.evidenceFolderImages : {})
        setSpecialtyUnitsState(Array.isArray(data.snapshot.specialtyUnits) ? data.snapshot.specialtyUnits : [])
        setAdminGradesState(snapshotAdminGrades.length > 0 ? snapshotAdminGrades : defaultAdminGradeEntries)
        setAdminSpecialtiesState(snapshotAdminSpecialties.length > 0 ? snapshotAdminSpecialties : defaultAdminSpecialtyEntries)
        setAdminDocumentTemplatesState(snapshotAdminDocumentTemplates.length > 0 ? snapshotAdminDocumentTemplates : defaultAdminDocumentTemplateEntries)
        setAdminPaFormQuestionsState(snapshotAdminPaQuestions.length > 0 ? snapshotAdminPaQuestions : defaultAdminPaQuestionEntries)
        setAdminRookieCriteriaState(snapshotAdminRookieCriteria.length > 0 ? snapshotAdminRookieCriteria : defaultAdminRookieCriterionEntries)
        setAdminChargesState(snapshotAdminCharges.length > 0 ? snapshotAdminCharges : defaultAdminChargeEntries)
        setChargeCatalogState(snapshotChargeCatalog.length > 0 ? snapshotChargeCatalog : defaultChargeCatalogEntries)
        setVehicleCatalogState(snapshotVehicleCatalog.length > 0 ? snapshotVehicleCatalog : defaultVehicleCatalogEntries)
        setOffenseVehiclesState(Array.isArray(data.snapshot.vehicleOffenses) ? data.snapshot.vehicleOffenses : [])
        setWeaponRegistryState(Array.isArray(data.snapshot.weaponRegistry) ? data.snapshot.weaponRegistry : [])
        setBraceletRegistryState(Array.isArray(data.snapshot.braceletRegistry) ? data.snapshot.braceletRegistry : [])
        setBootRegistryState(Array.isArray(data.snapshot.bootRegistry) ? data.snapshot.bootRegistry : [])
        setSelectedCitizenId((current) => current && snapshotCitizens.some((citizen) => citizen.id === current) ? current : null)
        setSelectedComplaintId((current) => snapshotComplaints.some((complaint) => complaint.id === current) ? current : (snapshotComplaints[0]?.id ?? null))
        setSelectedIncidentReportId((current) => snapshotIncidentReports.some((report) => report.id === current) ? current : (snapshotIncidentReports[0]?.id ?? null))
        setSelectedOperationReportId((current) => snapshotOperationReports.some((report) => report.id === current) ? current : null)
        setSelectedAgentStatisticId((current) => {
          const snapshotAgentStatistics = Array.isArray(data.snapshot.agentStatistics) ? data.snapshot.agentStatistics : []
          return current && snapshotAgentStatistics.some((agent) => agent.id === current) ? current : null
        })
        setHasHydratedSnapshot(true)
      }
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsCitizenMenuOpen(false)
        setIsEncodeCitizenModalOpen(false)
        setIsEditCitizenModalOpen(false)
        setIsArrestReportModalOpen(false)
        setIsArrestDossierModalOpen(false)
        setIsInterrogationModalOpen(false)
        setIsCitizenComplaintModalOpen(false)
        setIsOperationReportCreateModalOpen(false)
        setIsEvidenceFolderModalOpen(false)
        setIsProfileSettingsModalOpen(false)
        setShowArrestDossierPreview(false)
        setIsAddVehicleModalOpen(false)
        setIsWeaponEncodeModalOpen(false)
        setIsWeaponEditModalOpen(false)
        setIsEncodeCitizenGenderOpen(false)
        setIsEncodeCitizenEthnicityOpen(false)
        setIsEncodeCitizenLicenseOpen(false)
        setIsEncodeCitizenBirthDatePickerOpen(false)
        setIsEncodeCitizenMonthDropdownOpen(false)
        setIsEncodeCitizenYearDropdownOpen(false)
        setIsRookieSessionDropdownOpen(false)
        setIsChargeCategoryDropdownOpen(false)
        setIsOffenseCategoryDropdownOpen(false)
        setIsCandidateStatusDropdownOpen(false)
        setIsComplaintStatusDropdownOpen(false)
        setIsInterrogationCitizenDropdownOpen(false)
        setIsInterrogationParticipantsDropdownOpen(false)
        setIsInterrogationPolicePostDropdownOpen(false)
        setIsCitizenComplaintOfficersDropdownOpen(false)
        setIsCitizenComplaintLawyersDropdownOpen(false)
        setIsCitizenComplaintStatusDropdownOpen(false)
        setIsSessionTypeDropdownOpen(false)
        setOpenSessionMenuId(null)
        setIsAddSessionModalOpen(false)
        setIsEditSessionModalOpen(false)
        setIsDeleteSessionModalOpen(false)
        setIsAddSessionTemplateDropdownOpen(false)
        setIsEditSessionStatusDropdownOpen(false)
        setIsEditSessionTypeDropdownOpen(false)
        setIsFinalQuestionStatusDropdownOpen(false)
        setIsFinalQuestionCategoryDropdownOpen(false)
        setIsReportAgentsDropdownOpen(false)
        setIsReportChargesDropdownOpen(false)
        setIsReportFineScaleDropdownOpen(false)
        setIsOperationOfficersDropdownOpen(false)
        setIsOperationHostagesDropdownOpen(false)
        setIsOperationNegotiationLeadDropdownOpen(false)
        setIsOperationFieldLeadDropdownOpen(false)
        setIsOperationProofDropdownOpen(false)
        setIsDossierAgentsDropdownOpen(false)
        setIsDossierPeopleDropdownOpen(false)
        setIsDossierOperationDropdownOpen(false)
        setIsDossierProofDropdownOpen(false)
        setIsDossierChargesDropdownOpen(false)
        setIsDossierFineScaleDropdownOpen(false)
        setIsVehicleTypeDropdownOpen(false)
        setIsVehicleOwnerDropdownOpen(false)
        setIsVehicleProofDropdownOpen(false)
        setIsVehicleOperationDropdownOpen(false)
        setIsWeaponModelDropdownOpen(false)
        setIsWeaponCitizenDropdownOpen(false)
        setIsWeaponOriginFilterDropdownOpen(false)
        setIsWeaponStateFilterDropdownOpen(false)
        setIsWeaponEditModelDropdownOpen(false)
        setIsWeaponEditOfficerDropdownOpen(false)
        setIsWeaponEditOriginDropdownOpen(false)
        setShowWeaponSuccessToast(false)
        setShowArrestDossierSuccessToast(false)
        setOpenCitizenRecordMenuId(null)
        setOpenWeaponMenuId(null)
        setIsCasierModalOpen(false)
        setIsMandatModalOpen(false)
        setIsMandatOfficersDropdownOpen(false)
        setIsMandatReasonDropdownOpen(false)
        setIsTicketRoutierModalOpen(false)
        setIsTicketOfficersDropdownOpen(false)
        setIsTicketInfractionDropdownOpen(false)
        setIsDepositionModalOpen(false)
        setIsDepositionOfficersDropdownOpen(false)
        setIsBraceletEncodeModalOpen(false)
        setIsBraceletOfficersDropdownOpen(false)
        setUiState((current) => ({ ...current, visible: false }))
        closeMdtNui()
      }
    }

    const onPointerDown = (event) => {
      const target = event.target
      const rect = target.getBoundingClientRect()
      const hasVerticalScrollbar = target.scrollHeight > target.clientHeight
      const hasHorizontalScrollbar = target.scrollWidth > target.clientWidth
      if (hasVerticalScrollbar && event.clientX > rect.right - (rect.width - target.clientWidth + 1)) return
      if (hasHorizontalScrollbar && event.clientY > rect.bottom - (rect.height - target.clientHeight + 1)) return
      setIsCitizenMenuOpen(false)
      setIsEncodeCitizenGenderOpen(false)
      setIsEncodeCitizenEthnicityOpen(false)
      setIsEncodeCitizenLicenseOpen(false)
      setIsEncodeCitizenBirthDatePickerOpen(false)
      setIsEncodeCitizenMonthDropdownOpen(false)
      setIsEncodeCitizenYearDropdownOpen(false)
      setIsRookieSessionDropdownOpen(false)
      setIsChargeCategoryDropdownOpen(false)
      setIsOffenseCategoryDropdownOpen(false)
      setIsCandidateStatusDropdownOpen(false)
      setIsComplaintStatusDropdownOpen(false)
      setIsInterrogationCitizenDropdownOpen(false)
      setIsInterrogationParticipantsDropdownOpen(false)
      setIsInterrogationPolicePostDropdownOpen(false)
      setIsCitizenComplaintOfficersDropdownOpen(false)
      setIsCitizenComplaintLawyersDropdownOpen(false)
      setIsCitizenComplaintStatusDropdownOpen(false)
      setIsSessionTypeDropdownOpen(false)
      setOpenSessionMenuId(null)
      setIsAddSessionTemplateDropdownOpen(false)
      setIsEditSessionStatusDropdownOpen(false)
      setIsEditSessionTypeDropdownOpen(false)
      setIsFinalQuestionStatusDropdownOpen(false)
      setIsFinalQuestionCategoryDropdownOpen(false)
      setIsReportAgentsDropdownOpen(false)
      setIsReportChargesDropdownOpen(false)
      setIsReportFineScaleDropdownOpen(false)
      setIsOperationOfficersDropdownOpen(false)
      setIsOperationHostagesDropdownOpen(false)
      setIsOperationNegotiationLeadDropdownOpen(false)
      setIsOperationFieldLeadDropdownOpen(false)
      setIsOperationProofDropdownOpen(false)
      setIsDossierAgentsDropdownOpen(false)
      setIsDossierPeopleDropdownOpen(false)
      setIsDossierOperationDropdownOpen(false)
      setIsDossierProofDropdownOpen(false)
      setIsDossierChargesDropdownOpen(false)
      setIsDossierFineScaleDropdownOpen(false)
      setIsVehicleTypeDropdownOpen(false)
      setIsVehicleOwnerDropdownOpen(false)
      setIsVehicleProofDropdownOpen(false)
      setIsVehicleOperationDropdownOpen(false)
      setIsWeaponModelDropdownOpen(false)
      setIsWeaponCitizenDropdownOpen(false)
      setIsWeaponOriginFilterDropdownOpen(false)
      setIsWeaponStateFilterDropdownOpen(false)
      setIsWeaponEditModelDropdownOpen(false)
      setIsWeaponEditOfficerDropdownOpen(false)
      setIsWeaponEditOriginDropdownOpen(false)
      setIsMandatReasonDropdownOpen(false)
      setIsTicketInfractionDropdownOpen(false)
      setOpenCitizenRecordMenuId(null)
      setOpenWeaponMenuId(null)
    }

    window.addEventListener('message', onMessage)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)

    return () => {
      window.removeEventListener('message', onMessage)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [])

  useEffect(() => {
    if (selectedCitizenId && !citizenProfiles.some((citizen) => citizen.id === selectedCitizenId)) {
      setSelectedCitizenId(null)
    }
  }, [citizenProfiles, selectedCitizenId])

  useEffect(() => {
    const activeIndex = recordTabs.findIndex((tab) => tab.key === activeRecordTab)

    if (activeIndex === -1) {
      return
    }

    setRecordTabsOffset((current) => {
      const maxOffset = Math.max(0, recordTabs.length - RECORD_TABS_VISIBLE_COUNT)

      if (activeIndex < current) {
        return activeIndex
      }

      if (activeIndex >= current + RECORD_TABS_VISIBLE_COUNT) {
        return Math.min(activeIndex - RECORD_TABS_VISIBLE_COUNT + 1, maxOffset)
      }

      return Math.min(current, maxOffset)
    })
  }, [RECORD_TABS_VISIBLE_COUNT, activeRecordTab])

  useEffect(() => {
    if (!permissions.isStaff && mdtMode === 'admin') {
      setMdtMode('sasp')
      setActivePage('home')
    }
  }, [mdtMode, permissions.isStaff])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return undefined
    }

    if (!persistedSectionsRef.current.personalNote) {
      persistedSectionsRef.current.personalNote = true
      return undefined
    }

    const timeout = window.setTimeout(() => {
      invokeNuiCallback('saveSection', { section: 'personalNote', payload: personalNote })
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [hasHydratedSnapshot, personalNote])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.profile) {
      persistedSectionsRef.current.profile = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'profile', payload: uiState.profile })
  }, [hasHydratedSnapshot, uiState.profile])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.citizens) {
      persistedSectionsRef.current.citizens = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'citizens', payload: citizenProfiles })
  }, [citizenProfiles, hasHydratedSnapshot])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.interrogations) {
      persistedSectionsRef.current.interrogations = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'interrogations', payload: interrogationEntries })
  }, [hasHydratedSnapshot, interrogationEntries])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.incidentReports) {
      persistedSectionsRef.current.incidentReports = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'incidentReports', payload: incidentReportsState })
  }, [hasHydratedSnapshot, incidentReportsState])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.operationReports) {
      persistedSectionsRef.current.operationReports = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'operationReports', payload: operationReportEntries })
  }, [hasHydratedSnapshot, operationReportEntries])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.evidenceFolders) {
      persistedSectionsRef.current.evidenceFolders = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'evidenceFolders', payload: evidenceFoldersState })
  }, [evidenceFoldersState, hasHydratedSnapshot])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.evidenceFolderImages) {
      persistedSectionsRef.current.evidenceFolderImages = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'evidenceFolderImages', payload: evidenceFolderImages })
  }, [evidenceFolderImages, hasHydratedSnapshot])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.weaponRegistry) {
      persistedSectionsRef.current.weaponRegistry = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'weaponRegistry', payload: weaponRegistryState })
  }, [hasHydratedSnapshot, weaponRegistryState])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.vehicleOffenses) {
      persistedSectionsRef.current.vehicleOffenses = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'vehicleOffenses', payload: offenseVehiclesState })
  }, [hasHydratedSnapshot, offenseVehiclesState])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.adminCharges) {
      persistedSectionsRef.current.adminCharges = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'adminCharges', payload: adminChargesState })
  }, [adminChargesState, hasHydratedSnapshot])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.adminGrades) {
      persistedSectionsRef.current.adminGrades = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'adminGrades', payload: adminGradesState })
  }, [adminGradesState, hasHydratedSnapshot])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.adminSpecialties) {
      persistedSectionsRef.current.adminSpecialties = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'adminSpecialties', payload: adminSpecialtiesState })
  }, [adminSpecialtiesState, hasHydratedSnapshot])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.adminDocumentTemplates) {
      persistedSectionsRef.current.adminDocumentTemplates = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'adminDocumentTemplates', payload: adminDocumentTemplatesState })
  }, [adminDocumentTemplatesState, hasHydratedSnapshot])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.adminPaFormQuestions) {
      persistedSectionsRef.current.adminPaFormQuestions = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'adminPaFormQuestions', payload: adminPaFormQuestionsState })
  }, [adminPaFormQuestionsState, hasHydratedSnapshot])

  useEffect(() => {
    if (!hasHydratedSnapshot) {
      return
    }

    if (!persistedSectionsRef.current.adminRookieCriteria) {
      persistedSectionsRef.current.adminRookieCriteria = true
      return
    }

    invokeNuiCallback('saveSection', { section: 'adminRookieCriteria', payload: adminRookieCriteriaState })
  }, [adminRookieCriteriaState, hasHydratedSnapshot])

  useEffect(() => {
    if (!adminUserDepartmentsState.includes(adminUserDepartment)) {
      setAdminUserDepartment(adminUserDepartmentsState[0] ?? 'Tous')
    }
  }, [adminUserDepartment, adminUserDepartmentsState])

  useEffect(() => {
    setRookieChecklist((current) => rookieFollowUpEntries.reduce((accumulator, rookie) => {
      const existing = current[rookie.id] || {}
      accumulator[rookie.id] = adminRookieCriteriaState.reduce((criteriaAccumulator, criterion) => {
        criteriaAccumulator[criterion.id] = existing[criterion.id] === true
        return criteriaAccumulator
      }, {})
      return accumulator
    }, {}))
  }, [adminRookieCriteriaState])

  const filteredRookies = rookieFollowUpEntries.filter((rookie) => {
    const query = rookieSearch.trim().toLowerCase()
    const matchesSession = !rookieSession || rookie.session === rookieSession
    const matchesSearch = !query || `${rookie.name} ${rookie.arrivedAt} ${rookie.status}`.toLowerCase().includes(query)

    return matchesSession && matchesSearch
  })

  useEffect(() => {
    if (!filteredRookies.length) {
      if (selectedRookieId !== null) {
        setSelectedRookieId(null)
      }

      return
    }

    if (!filteredRookies.some((rookie) => rookie.id === selectedRookieId)) {
      setSelectedRookieId(filteredRookies[0].id)
    }
  }, [filteredRookies, selectedRookieId])

  if (!uiState.visible) {
    return null
  }

  const filteredCitizens = citizenProfiles.filter((citizen) => {
    const normalizedQuery = citizenSearch.trim().toLowerCase()

    if (!normalizedQuery) {
      return true
    }

    return `${citizen.name} ${citizen.birthDate}`.toLowerCase().includes(normalizedQuery)
  })

  const CITIZENS_PER_PAGE = 8
  const totalCitizenPages = Math.max(1, Math.ceil(filteredCitizens.length / CITIZENS_PER_PAGE))
  const safecitizenPage = Math.min(citizenPage, totalCitizenPages)
  const pagedCitizens = filteredCitizens.slice((safecitizenPage - 1) * CITIZENS_PER_PAGE, safecitizenPage * CITIZENS_PER_PAGE)

  const filteredStaffAgents = staffAgentsState.filter((agent) => {
    const query = effectifsSearch.trim().toLowerCase()

    if (!query) {
      return true
    }

    return `${agent.id} ${agent.firstName} ${agent.lastName} ${agent.phone} ${agent.email}`.toLowerCase().includes(query)
  })

  const selectedCitizen = citizenProfiles.find((citizen) => citizen.id === selectedCitizenId) ?? null
  const selectedRecords = selectedCitizen?.records?.[activeRecordTab] ?? []
  const maxRecordTabsOffset = Math.max(0, recordTabs.length - RECORD_TABS_VISIBLE_COUNT)
  const visibleRecordTabs = recordTabs.slice(recordTabsOffset, recordTabsOffset + RECORD_TABS_VISIBLE_COUNT)
  const encodeBirthDateParts = parseBirthDateParts(encodeCitizenForm.birthDate)
  const encodeBirthMonth = encodeBirthDateParts?.monthIndex ?? encodeCitizenBirthMonth
  const encodeBirthYear = encodeBirthDateParts?.year ?? encodeCitizenBirthYear
  const encodeBirthSelectedDay = encodeBirthDateParts?.day ?? null
  const encodeBirthFirstDay = new Date(encodeBirthYear, encodeBirthMonth, 1).getDay()
  const encodeBirthOffset = (encodeBirthFirstDay + 6) % 7
  const encodeBirthDaysInMonth = new Date(encodeBirthYear, encodeBirthMonth + 1, 0).getDate()
  const encodeBirthCalendarDays = Array.from({ length: 35 }, (_, index) => {
    const dayValue = index - encodeBirthOffset + 1

    if (dayValue < 1 || dayValue > encodeBirthDaysInMonth) {
      return null
    }

    return dayValue
  })

  const openEditCitizenModal = () => {
    setEditCitizenForm(buildCitizenFormValues(selectedCitizen))
    setIsEditCitizenModalOpen(true)
    setIsCitizenMenuOpen(false)
  }

  const handleCitizenMenuAction = (actionKey) => {
    if (actionKey === 'edit') {
      openEditCitizenModal()
      return
    }

    setIsCitizenMenuOpen(false)
  }

  const handleEditCitizenFieldChange = (field, value) => {
    setEditCitizenForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const openEncodeCitizenModal = () => {
    const initialForm = buildEncodeCitizenFormValues()

    setEncodeCitizenForm(initialForm)
    setEncodeCitizenErrors({})
    setEncodeCitizenPhoto('')
    setEncodeCitizenBirthMonth(0)
    setEncodeCitizenBirthYear(2000)
    setIsEncodeCitizenModalOpen(true)
  }

  const openCasierModal = () => {
    setIsCasierModalOpen(true)
    setIsCitizenMenuOpen(false)
  }

  const openMandatModal = () => {
    setMandatForm(buildMandatFormValues())
    setIsMandatReasonDropdownOpen(false)
    setIsMandatModalOpen(true)
    setIsCitizenMenuOpen(false)
  }

  const handleMandatFieldChange = (field, value) => {
    setMandatForm((current) => ({ ...current, [field]: value }))
  }

  const addMandatOfficer = (officer) => {
    const formatted = formatOfficerOption(officer)
    setMandatForm((current) => ({
      ...current,
      officersQuery: '',
      selectedOfficers: current.selectedOfficers.includes(formatted) ? current.selectedOfficers : [...current.selectedOfficers, formatted],
    }))
    setIsMandatOfficersDropdownOpen(false)
  }
  const removeMandatOfficer = (officer) => {
    setMandatForm((current) => ({ ...current, selectedOfficers: current.selectedOfficers.filter((o) => o !== officer) }))
  }

    const addMandatReason = (reason) => {
      setMandatForm((current) => ({
        ...current,
        reasonQuery: '',
        selectedReasons: current.selectedReasons.includes(reason) ? current.selectedReasons : [...current.selectedReasons, reason],
      }))
    }

    const removeMandatReason = (reason) => {
      setMandatForm((current) => ({
        ...current,
        selectedReasons: current.selectedReasons.filter((item) => item !== reason),
      }))
    }

  const submitMandatForm = () => {
    const officer = mandatForm.selectedOfficers[0] || `${uiState.profile.badge} | ${uiState.profile.name}`
      const mandatReasons = mandatForm.selectedReasons.join(', ')
    const recordEntry = {
      id: `md-${Date.now()}`,
      author: officer,
      date: mandatForm.dateTime ? `Le ${mandatForm.dateTime.replace(' ', ' à ')}` : 'Date non précisée',
        reason: mandatReasons || 'Mandat d\'arrêt',
        reasons: mandatForm.selectedReasons,
      description: mandatForm.description || '',
      selectedOfficers: mandatForm.selectedOfficers,
    }

    setCitizenProfiles((current) => current.map((citizen) => {
      if (citizen.id !== selectedCitizen.id) return citizen
      return {
        ...citizen,
        records: normalizeCitizenRecords({
          ...citizen.records,
          mandates: [recordEntry, ...(citizen.records?.mandates ?? [])],
        }),
      }
    }))

    setActiveRecordTab('mandates')
    setIsMandatOfficersDropdownOpen(false)
    setIsMandatReasonDropdownOpen(false)
    setIsMandatModalOpen(false)
  }

  const openTicketRoutierModal = () => {
    setTicketRoutierForm(buildTicketRoutierFormValues())
    setIsTicketInfractionDropdownOpen(false)
    setIsTicketRoutierModalOpen(true)
    setIsCitizenMenuOpen(false)
  }

  const handleTicketRoutierFieldChange = (field, value) => {
    setTicketRoutierForm((current) => ({ ...current, [field]: value }))
  }

  const addTicketOfficer = (officer) => {
    const formatted = formatOfficerOption(officer)
    setTicketRoutierForm((current) => ({
      ...current,
      officersQuery: '',
      selectedOfficers: current.selectedOfficers.includes(formatted) ? current.selectedOfficers : [...current.selectedOfficers, formatted],
    }))
    setIsTicketOfficersDropdownOpen(false)
  }
  const removeTicketOfficer = (officer) => {
    setTicketRoutierForm((current) => ({ ...current, selectedOfficers: current.selectedOfficers.filter((o) => o !== officer) }))
  }

  const addTicketInfraction = (infraction) => {
    setTicketRoutierForm((current) => ({
      ...current,
      infractionQuery: '',
      selectedInfractions: current.selectedInfractions.includes(infraction) ? current.selectedInfractions : [...current.selectedInfractions, infraction],
    }))
  }

  const removeTicketInfraction = (infraction) => {
    setTicketRoutierForm((current) => ({
      ...current,
      selectedInfractions: current.selectedInfractions.filter((item) => item !== infraction),
    }))
  }

  const submitTicketRoutierForm = () => {
    const officer = ticketRoutierForm.selectedOfficers[0] || `${uiState.profile.badge} | ${uiState.profile.name}`
    const ticketInfractions = ticketRoutierForm.selectedInfractions.join(', ')
    const recordEntry = {
      id: `tr-${Date.now()}`,
      author: officer,
      date: ticketRoutierForm.dateTime ? `Le ${ticketRoutierForm.dateTime.replace(' ', ' à ')}` : 'Date non précisée',
      reason: ticketInfractions || 'Ticket routier',
      infractions: ticketRoutierForm.selectedInfractions,
      location: ticketRoutierForm.location || 'Lieu non précisé',
      fine: ticketRoutierForm.fine || '0',
      points: ticketRoutierForm.points || '0',
      selectedOfficers: ticketRoutierForm.selectedOfficers,
    }

    setCitizenProfiles((current) => current.map((citizen) => {
      if (citizen.id !== selectedCitizen.id) return citizen
      return {
        ...citizen,
        records: normalizeCitizenRecords({
          ...citizen.records,
          tickets: [recordEntry, ...(citizen.records?.tickets ?? [])],
        }),
      }
    }))

    setActiveRecordTab('tickets')
    setIsTicketOfficersDropdownOpen(false)
    setIsTicketInfractionDropdownOpen(false)
    setIsTicketRoutierModalOpen(false)
  }

  const openDepositionModal = () => {
    setDepositionForm(buildDepositionFormValues())
    setIsDepositionModalOpen(true)
    setIsCitizenMenuOpen(false)
  }

  const handleDepositionFieldChange = (field, value) => {
    setDepositionForm((current) => ({ ...current, [field]: value }))
  }

  const addDepositionOfficer = (officer) => {
    const formatted = formatOfficerOption(officer)
    setDepositionForm((current) => ({
      ...current,
      officersQuery: '',
      selectedOfficers: current.selectedOfficers.includes(formatted) ? current.selectedOfficers : [...current.selectedOfficers, formatted],
    }))
    setIsDepositionOfficersDropdownOpen(false)
  }
  const removeDepositionOfficer = (officer) => {
    setDepositionForm((current) => ({ ...current, selectedOfficers: current.selectedOfficers.filter((o) => o !== officer) }))
  }

  const submitDepositionForm = () => {
    const recordEntry = {
      id: `dep-${Date.now()}`,
      author: depositionForm.selectedOfficers[0] || `${uiState.profile.badge} | ${uiState.profile.name}`,
      date: depositionForm.dateTime,
      reason: depositionForm.reason,
      body: depositionForm.body,
    }
    setCitizenProfiles((current) => current.map((citizen) => {
      if (citizen.id !== selectedCitizen.id) return citizen
      return {
        ...citizen,
        records: normalizeCitizenRecords({
          ...citizen.records,
          depositions: [recordEntry, ...(citizen.records?.depositions ?? [])],
        }),
      }
    }))
    setActiveRecordTab('depositions')
    setIsDepositionOfficersDropdownOpen(false)
    setIsDepositionModalOpen(false)
  }

  const openBraceletEncodeModal = () => {
    setBraceletEncodeForm(buildBraceletEncodeFormValues(selectedCitizen))
    setIsBraceletEncodeModalOpen(true)
    setIsCitizenMenuOpen(false)
  }

  const handleBraceletEncodeFieldChange = (field, value) => {
    setBraceletEncodeForm((current) => ({ ...current, [field]: value }))
  }

  const addBraceletOfficer = (officer) => {
    const formatted = formatOfficerOption(officer)
    setBraceletEncodeForm((current) => ({
      ...current,
      officersQuery: '',
      selectedOfficers: current.selectedOfficers.includes(formatted) ? current.selectedOfficers : [...current.selectedOfficers, formatted],
    }))
    setIsBraceletOfficersDropdownOpen(false)
  }
  const removeBraceletOfficer = (officer) => {
    setBraceletEncodeForm((current) => ({ ...current, selectedOfficers: current.selectedOfficers.filter((o) => o !== officer) }))
  }

  const submitBraceletEncodeForm = () => {
    const id = `br${String(braceletRegistryState.length + 1).padStart(2, '0')}`
    const officer = braceletEncodeForm.selectedOfficers[0] || `${uiState.profile.badge} | ${uiState.profile.name}`
    const registryEntry = {
      id,
      citizen: braceletEncodeForm.citizen,
      officer,
      npre: braceletEncodeForm.npre,
      placedAt: braceletEncodeForm.placedAt,
      expiresAt: braceletEncodeForm.expiresAt,
      lastCheckIn: 'Aucun pointage effectué',
      reasons: braceletEncodeForm.reasons,
    }
    const recordEntry = { id, officer, npre: braceletEncodeForm.npre, placedAt: braceletEncodeForm.placedAt, expiresAt: braceletEncodeForm.expiresAt, reasons: braceletEncodeForm.reasons }
    setBraceletRegistryState((current) => [registryEntry, ...current])
    setCitizenProfiles((current) => current.map((citizen) => {
      if (citizen.id !== selectedCitizen.id) return citizen
      return {
        ...citizen,
        records: normalizeCitizenRecords({
          ...citizen.records,
          bracelets: [recordEntry, ...(citizen.records?.bracelets ?? [])],
        }),
      }
    }))
    setActiveRecordTab('bracelets')
    setIsBraceletOfficersDropdownOpen(false)
    setIsBraceletEncodeModalOpen(false)
  }

  const openCitizenComplaintModal = () => {
    setCitizenComplaintForm(buildCitizenComplaintFormValues(selectedCitizen))
    setCitizenComplaintPastedImages([])
    setIsCitizenComplaintOfficersDropdownOpen(false)
    setIsCitizenComplaintLawyersDropdownOpen(false)
    setIsCitizenComplaintStatusDropdownOpen(false)
    setIsCitizenComplaintModalOpen(true)
    setIsCitizenMenuOpen(false)
  }

  const openInterrogationModal = () => {
    setInterrogationForm(buildInterrogationFormValues())
    setIsInterrogationCitizenDropdownOpen(false)
    setIsInterrogationParticipantsDropdownOpen(false)
    setIsInterrogationPolicePostDropdownOpen(false)
    setIsInterrogationModalOpen(true)
  }

  const handleInterrogationFieldChange = (field, value) => {
    setInterrogationForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const addInterrogationParticipant = (officer) => {
    const formattedOfficer = formatOfficerOption(officer)

    setInterrogationForm((current) => ({
      ...current,
      selectedParticipants: current.selectedParticipants.includes(formattedOfficer)
        ? current.selectedParticipants
        : [...current.selectedParticipants, formattedOfficer],
      participantsQuery: '',
    }))
  }

  const removeInterrogationParticipant = (participantValue) => {
    setInterrogationForm((current) => ({
      ...current,
      selectedParticipants: current.selectedParticipants.filter((participant) => participant !== participantValue),
    }))
  }

  const submitInterrogationForm = () => {
    const nextNumber = interrogationEntries.reduce((max, entry) => Math.max(max, Number(entry.id) || 0), 0) + 1
    const nextEntry = {
      id: String(nextNumber),
      dateTime: interrogationForm.startedAt,
      citizen: interrogationForm.citizenName || interrogationForm.citizenQuery || 'Citoyen inconnu',
      startedAt: interrogationForm.startedAt,
      endedAt: interrogationForm.endedAt,
      participants: interrogationForm.selectedParticipants,
      policePost: interrogationForm.policePost,
      report: interrogationForm.report,
    }

    setInterrogationEntries((current) => [nextEntry, ...current])
    setInterrogationSearch('')
    setIsInterrogationModalOpen(false)
    setIsInterrogationCitizenDropdownOpen(false)
    setIsInterrogationParticipantsDropdownOpen(false)
    setIsInterrogationPolicePostDropdownOpen(false)
  }

  const handleCitizenComplaintFieldChange = (field, value) => {
    setCitizenComplaintForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const addCitizenComplaintOfficer = (officer) => {
    const formattedOfficer = formatOfficerOption(officer)

    setCitizenComplaintForm((current) => ({
      ...current,
      selectedOfficers: current.selectedOfficers.includes(formattedOfficer)
        ? current.selectedOfficers
        : [...current.selectedOfficers, formattedOfficer],
      officersQuery: '',
    }))
  }

  const removeCitizenComplaintOfficer = (officerValue) => {
    setCitizenComplaintForm((current) => ({
      ...current,
      selectedOfficers: current.selectedOfficers.filter((officer) => officer !== officerValue),
    }))
  }

  const addCitizenComplaintLawyer = (lawyer) => {
    setCitizenComplaintForm((current) => ({
      ...current,
      selectedLawyers: current.selectedLawyers.includes(lawyer)
        ? current.selectedLawyers
        : [...current.selectedLawyers, lawyer],
      lawyersQuery: '',
    }))
  }

  const removeCitizenComplaintLawyer = (lawyerValue) => {
    setCitizenComplaintForm((current) => ({
      ...current,
      selectedLawyers: current.selectedLawyers.filter((lawyer) => lawyer !== lawyerValue),
    }))
  }

  const handlePasteIntoCitizenComplaint = async (event) => {
    event.preventDefault()
    const images = await extractClipboardImages(event)

    if (images.length > 0) {
      setCitizenComplaintPastedImages((current) => [...current, ...images].slice(0, 6))
    }
  }

  const removeCitizenComplaintImage = (imageIndex) => {
    setCitizenComplaintPastedImages((current) => current.filter((_, index) => index !== imageIndex))
  }

  const submitCitizenComplaintForm = () => {
    const nextNumber = complaintRegistryEntries.reduce((max, complaint) => {
      const value = Number(complaint.id.replace(/[^0-9]/g, ''))
      return Number.isNaN(value) ? max : Math.max(max, value)
    }, 0) + 1
    const complaintId = `pl-${String(nextNumber).padStart(2, '0')}`
    const formattedDate = `Le ${citizenComplaintForm.dateTime.replace(' ', ' à ')}`
    const officer = citizenComplaintForm.selectedOfficers[0] || `${uiState.profile.badge} | ${uiState.profile.name}`
    const recordEntry = {
      id: complaintId,
      author: officer,
      date: formattedDate,
      reason: citizenComplaintForm.reason || 'Plainte',
      status: citizenComplaintForm.status,
      against: citizenComplaintForm.against,
      body: citizenComplaintForm.body,
      selectedLawyers: citizenComplaintForm.selectedLawyers,
      proofImages: citizenComplaintPastedImages,
    }
    const registryEntry = {
      id: complaintId,
      date: formattedDate,
      citizen: selectedCitizen.name,
      status: citizenComplaintForm.status,
      officer,
      against: citizenComplaintForm.against || '--',
      reasons: citizenComplaintForm.reason || 'Plainte',
      statusReason: '--',
      body: citizenComplaintForm.body,
      lawyers: citizenComplaintForm.selectedLawyers,
      proofImages: citizenComplaintPastedImages,
    }

    setCitizenProfiles((current) => current.map((citizen) => {
      if (citizen.id !== selectedCitizen.id) {
        return citizen
      }

      return {
        ...citizen,
        records: normalizeCitizenRecords({
          ...citizen.records,
          complaints: [recordEntry, ...(citizen.records?.complaints ?? [])],
        }),
      }
    }))
    setComplaintRegistryEntries((current) => [registryEntry, ...current])
    setSelectedComplaintId(complaintId)
    setActiveRecordTab('complaints')
    setIsCitizenComplaintModalOpen(false)
    setIsCitizenComplaintOfficersDropdownOpen(false)
    setIsCitizenComplaintLawyersDropdownOpen(false)
    setIsCitizenComplaintStatusDropdownOpen(false)
  }

  const handlePasteIntoEncodeCitizen = async (event) => {
    event.preventDefault()
    const images = await extractClipboardImages(event)

    if (images.length > 0) {
      setEncodeCitizenPhoto(images[0])
    }
  }

  const handleEncodeCitizenFieldChange = (field, value) => {
    setEncodeCitizenForm((current) => ({
      ...current,
      [field]: value,
    }))

    setEncodeCitizenErrors((current) => {
      if (!current[field]) {
        return current
      }

      const nextErrors = { ...current }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const toggleEncodeCitizenDatePicker = () => {
    const parsedValue = parseBirthDateParts(encodeCitizenForm.birthDate)

    if (parsedValue) {
      setEncodeCitizenBirthMonth(parsedValue.monthIndex)
      setEncodeCitizenBirthYear(parsedValue.year)
    }

    setIsEncodeCitizenBirthDatePickerOpen((current) => !current)
    setIsEncodeCitizenMonthDropdownOpen(false)
    setIsEncodeCitizenYearDropdownOpen(false)
  }

  const updateEncodeCitizenBirthView = (monthIndex, year) => {
    setEncodeCitizenBirthMonth(monthIndex)
    setEncodeCitizenBirthYear(year)
  }

  const selectEncodeCitizenBirthDate = (day) => {
    handleEncodeCitizenFieldChange('birthDate', formatBirthDate(day, encodeBirthMonth, encodeBirthYear))
    setIsEncodeCitizenBirthDatePickerOpen(false)
    setIsEncodeCitizenMonthDropdownOpen(false)
    setIsEncodeCitizenYearDropdownOpen(false)
  }

  const validateEncodeCitizenForm = () => {
    const nextErrors = {}

    if (!encodeCitizenForm.firstName.trim()) {
      nextErrors.firstName = 'Ce champ est requis'
    }

    if (!encodeCitizenForm.lastName.trim()) {
      nextErrors.lastName = 'Ce champ est requis'
    }

    if (!encodeCitizenForm.phone.trim()) {
      nextErrors.phone = 'Ce champ est requis'
    }

    if (!encodeCitizenForm.birthDate.trim()) {
      nextErrors.birthDate = 'Ce champ est requis'
    }

    if (!encodeCitizenForm.email.trim()) {
      nextErrors.email = 'Ce champ est requis'
    } else if (!/^[a-z0-9]+@mail\.loop$/i.test(encodeCitizenForm.email.trim())) {
      nextErrors.email = "L'email doit se finir par @mail.loop et ne doit pas contenir de caractère spécial"
    }

    setEncodeCitizenErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submitEncodeCitizenForm = () => {
    if (!validateEncodeCitizenForm()) {
      return
    }

    const nextCitizen = buildCitizenFromForm(null, encodeCitizenForm, `manual:${Date.now()}`)

    setCitizenProfiles((current) => [nextCitizen, ...current])
    setCitizenSearch('')
    setSelectedCitizenId(nextCitizen.id)
    setActivePage('citizens')
    setIsEncodeCitizenModalOpen(false)
  }

  const submitEditCitizenForm = () => {
    const nextCitizen = buildCitizenFromForm(selectedCitizen, editCitizenForm)

    setCitizenProfiles((current) => current.map((citizen) => {
      if (citizen.id !== selectedCitizen.id) {
        return citizen
      }

      return nextCitizen
    }))

    setIsEditCitizenModalOpen(false)
    setIsCitizenMenuOpen(false)
  }

  const filteredOfficerOptions = officerOptionsData.filter((officer) => {
    const query = arrestReportForm.agentsQuery.trim().toLowerCase()

    if (!query) {
      return true
    }

    return formatOfficerOption(officer).toLowerCase().includes(query)
  })

  const interrogationCitizenOptions = citizenProfiles.map((citizen) => citizen.name)

  const filteredInterrogationCitizenOptions = interrogationCitizenOptions.filter((citizen) => {
    const query = interrogationForm.citizenQuery.trim().toLowerCase()

    if (!query) {
      return true
    }

    return citizen.toLowerCase().includes(query)
  })

  const filteredInterrogationParticipantOptions = officerOptionsData.filter((officer) => {
    const formattedOfficer = formatOfficerOption(officer)
    const query = interrogationForm.participantsQuery.trim().toLowerCase()

    if (interrogationForm.selectedParticipants.includes(formattedOfficer)) {
      return false
    }

    if (!query) {
      return true
    }

    return formattedOfficer.toLowerCase().includes(query)
  })

  const filteredInterrogationEntries = interrogationEntries.filter((entry) => {
    const query = interrogationSearch.trim().toLowerCase()

    if (!query) {
      return true
    }

    return `${entry.id} ${entry.dateTime} ${entry.citizen}`.toLowerCase().includes(query)
  })

  const filteredOperationOfficerOptions = officerOptionsData.filter((officer) => {
    const query = operationReportForm.officersQuery.trim().toLowerCase()

    if (!query) {
      return true
    }

    return formatOfficerOption(officer).toLowerCase().includes(query)
  })

  const operationHostageOptions = citizenProfiles.map((citizen) => citizen.name)

  const filteredOperationHostageOptions = operationHostageOptions.filter((hostage) => {
    const query = operationReportForm.hostagesQuery.trim().toLowerCase()

    if (!query) {
      return true
    }

    return hostage.toLowerCase().includes(query)
  })

  const filteredPeopleOptions = legalContactsState.filter((person) => {
    const query = arrestDossierForm.peopleQuery.trim().toLowerCase()

    if (!query) {
      return true
    }

    return person.toLowerCase().includes(query)
  })

  const filteredDossierOperationOptions = operationReportChoices.filter((option) => {
    const query = arrestDossierForm.operationReport.trim().toLowerCase()

    if (!query) {
      return true
    }

    return option.toLowerCase().includes(query)
  })

  const filteredDossierProofOptions = proofFolderOptions.filter((option) => {
    const query = arrestDossierForm.proofFolder.trim().toLowerCase()

    if (!query) {
      return true
    }

    return option.toLowerCase().includes(query)
  })

  const filteredDossierChargeOptions = chargeOptionsData.filter((option) => {
    const query = arrestDossierForm.chargeQuery.trim().toLowerCase()

    if (!query) {
      return true
    }

    return option.toLowerCase().includes(query)
  })

  const filteredMandatReasonOptions = chargeOptionsData.filter((option) => {
    const query = mandatForm.reasonQuery.trim().toLowerCase()

    if (mandatForm.selectedReasons.includes(option)) {
      return false
    }

    if (!query) {
      return true
    }

    return option.toLowerCase().includes(query)
  }).slice(0, 60)

  const ticketInfractionOptions = adminChargesState
    .filter((charge) => charge.category === 'Circulation')
    .map((charge) => charge.name)

  const filteredTicketInfractionOptions = ticketInfractionOptions.filter((option) => {
    const query = ticketRoutierForm.infractionQuery.trim().toLowerCase()

    if (ticketRoutierForm.selectedInfractions.includes(option)) {
      return false
    }

    if (!query) {
      return true
    }

    return option.toLowerCase().includes(query)
  })

  const filteredOffenseVehicles = offenseVehiclesState.filter((vehicle) => {
    const query = vehicleSearch.trim().toLowerCase()

    if (!query) {
      return true
    }

    return `${vehicle.type} ${vehicle.plate} ${vehicle.registeredAt}`.toLowerCase().includes(query)
  })

  const filteredEvidenceFolders = evidenceFoldersState.filter((folder) => {
    const query = evidenceSearch.trim().toLowerCase()

    if (!query) {
      return true
    }

    return `${folder.title} ${folder.createdAt} ${folder.createdBy}`.toLowerCase().includes(query)
  })

  const filteredAgentStatistics = agentStatisticsState.filter((agent) => {
    const query = agentSearch.trim().toLowerCase()

    if (!query) {
      return true
    }

    return `${agent.id} ${agent.name}`.toLowerCase().includes(query)
  })

  const filteredAdminUsers = staffAgentsState.filter((agent) => {
    const query = adminUserSearch.trim().toLowerCase()
    const matchesDepartment = adminUserDepartment === 'Tous' || agent.department === adminUserDepartment

    if (!query) {
      return matchesDepartment
    }

    return matchesDepartment && `${agent.id} ${agent.firstName} ${agent.lastName} ${agent.phone} ${agent.email} ${agent.department}`.toLowerCase().includes(query)
  })

  const filteredAdminGrades = adminGradesState.filter((grade) => {
    const query = gradeSearch.trim().toLowerCase()

    if (!query) {
      return true
    }

    return `${grade.name} ${grade.faction} ${grade.permissions}`.toLowerCase().includes(query)
  })

  const filteredAdminCharges = adminChargesState.filter((charge) => {
    const query = chargeSearch.trim().toLowerCase()
    const matchesSearch = !query || `${charge.name} ${charge.type} ${charge.instruction}`.toLowerCase().includes(query)
    const matchesCategory = chargeCategory === 'Toutes les catégories' || charge.category === chargeCategory

    return matchesSearch && matchesCategory
  })

  const filteredOffenseCharges = adminChargesState.filter((charge) => {
    const query = offenseSearch.trim().toLowerCase()
    const matchesSearch = !query || `${charge.name} ${charge.type} ${charge.instruction}`.toLowerCase().includes(query)
    const matchesCategory = offenseCategory === 'Toutes les catégories' || charge.category === offenseCategory

    return matchesSearch && matchesCategory
  })

  const filteredComplaints = complaintRegistryEntries.filter((complaint) => {
    const query = complaintSearch.trim().toLowerCase()
    const matchesSearch = !query || `${complaint.citizen} ${complaint.officer} ${complaint.against} ${complaint.reasons} ${complaint.status}`.toLowerCase().includes(query)
    const matchesStatus = complaintStatus === 'Tous les statuts' || complaint.status === complaintStatus

    return matchesSearch && matchesStatus
  })

  const filteredMandatOfficerOptions = officerOptionsData.filter((officer) =>
    !mandatForm.officersQuery.trim() || formatOfficerOption(officer).toLowerCase().includes(mandatForm.officersQuery.trim().toLowerCase())
  )
  const filteredTicketOfficerOptions = officerOptionsData.filter((officer) =>
    !ticketRoutierForm.officersQuery.trim() || formatOfficerOption(officer).toLowerCase().includes(ticketRoutierForm.officersQuery.trim().toLowerCase())
  )
  const filteredDepositionOfficerOptions = officerOptionsData.filter((officer) =>
    !depositionForm.officersQuery.trim() || formatOfficerOption(officer).toLowerCase().includes(depositionForm.officersQuery.trim().toLowerCase())
  )
  const filteredBraceletOfficerOptions = officerOptionsData.filter((officer) =>
    !braceletEncodeForm.officersQuery.trim() || formatOfficerOption(officer).toLowerCase().includes(braceletEncodeForm.officersQuery.trim().toLowerCase())
  )

  const filteredCitizenComplaintOfficerOptions = officerOptionsData.filter((officer) => {
    const query = citizenComplaintForm.officersQuery.trim().toLowerCase()

    if (!query) {
      return true
    }

    return formatOfficerOption(officer).toLowerCase().includes(query)
  })

  const filteredCitizenComplaintLawyerOptions = legalContactsState.filter((contact) => {
    const query = citizenComplaintForm.lawyersQuery.trim().toLowerCase()

    if (!query) {
      return true
    }

    return contact.toLowerCase().includes(query)
  })

  const complaintFormStatusOptions = complaintStatusOptions.slice(1)

  const filteredAcademyCandidates = academyCandidates.filter((candidate) => {
    const query = candidateSearch.trim().toLowerCase()
    const matchesSearch = !query || `${candidate.firstName} ${candidate.lastName} ${candidate.status}`.toLowerCase().includes(query)
    const matchesStatus = candidateStatus === 'Tous les statuts' || candidate.status === candidateStatus

    return matchesSearch && matchesStatus
  })

  const filteredFinalTestQuestions = finalTestQuestions.filter((item) => {
    const query = finalQuestionSearch.trim().toLowerCase()
    const matchesSearch = !query || `${item.question} ${item.expectedAnswer} ${item.category}`.toLowerCase().includes(query)
    const matchesStatus = finalQuestionStatus === 'Tous les statuts' || item.status === finalQuestionStatus
    const matchesCategory = finalQuestionCategory === 'Toutes les catégories' || item.category === finalQuestionCategory

    return matchesSearch && matchesStatus && matchesCategory
  })

  const filteredAcademySessions = academySessions.filter((session) => {
    const query = sessionSearch.trim().toLowerCase()
    const matchesSearch = !query || `${session.name} ${session.type} ${session.template}`.toLowerCase().includes(query)
    const matchesType = sessionTypeFilter === 'Tous les types' || session.type === sessionTypeFilter

    return matchesSearch && matchesType
  })

  const filteredWeaponEntries = weaponRegistryState.filter((weapon) => {
    const query = weaponSearch.trim().toLowerCase()
    const matchesOrigin = weaponOriginFilter === 'Toutes les origines' || weapon.origin === weaponOriginFilter
    const matchesState = weaponStateFilter === 'Tous les états' || weapon.state === weaponStateFilter

    if (!query) {
      return matchesOrigin && matchesState
    }

    return matchesOrigin && matchesState && `${weapon.serial} ${weapon.model} ${weapon.date}`.toLowerCase().includes(query)
  })

  const filteredBraceletEntries = braceletRegistryState.filter((bracelet) => {
    const query = braceletSearch.trim().toLowerCase()

    if (!query) {
      return true
    }

    return `${bracelet.citizen} ${bracelet.officer} ${bracelet.npre}`.toLowerCase().includes(query)
  })

  const filteredBootEntries = bootRegistryState.filter((boot) => {
    const query = bootSearch.trim().toLowerCase()

    if (!query) {
      return true
    }

    return `${boot.date} ${boot.model} ${boot.plate}`.toLowerCase().includes(query)
  })

  const setListPage = (listKey, nextPage) => {
    setListPages((current) => ({
      ...current,
      [listKey]: typeof nextPage === 'function' ? nextPage(current[listKey] ?? 1) : nextPage,
    }))
  }

  const pagedAdminCharges = paginateItems(filteredAdminCharges, listPages.adminCharges ?? 1, ADMIN_CHARGES_PER_PAGE)
  const pagedEvidenceFolders = paginateItems(filteredEvidenceFolders, listPages.evidenceFolders ?? 1, EVIDENCE_FOLDERS_PER_PAGE)
  const pagedRookies = paginateItems(filteredRookies, listPages.rookies ?? 1, ROOKIES_PER_PAGE)
  const pagedAgentStatistics = paginateItems(filteredAgentStatistics, listPages.agentStatistics ?? 1, AGENT_STATISTICS_PER_PAGE)
  const pagedComplaints = paginateItems(filteredComplaints, listPages.complaints ?? 1, COMPLAINTS_PER_PAGE)
  const pagedOffenseCharges = paginateItems(filteredOffenseCharges, listPages.offenseCharges ?? 1, OFFENSE_CHARGES_PER_PAGE)
  const pagedBraceletEntries = paginateItems(filteredBraceletEntries, listPages.bracelets ?? 1, BRACELETS_PER_PAGE)
  const pagedBootEntries = paginateItems(filteredBootEntries, listPages.boots ?? 1, BOOTS_PER_PAGE)
  const pagedWeaponEntries = paginateItems(filteredWeaponEntries, listPages.weapons ?? 1, WEAPONS_PER_PAGE)
  const pagedOffenseVehicles = paginateItems(filteredOffenseVehicles, listPages.vehicleOffenses ?? 1, VEHICLE_OFFENSES_PER_PAGE)
  const filteredAutopsyReports = autopsyReportsState.filter((report) => {
    const query = autopsySearch.trim().toLowerCase()
    if (!query) return true
    return `${report.id} ${report.citizen} ${report.date}`.toLowerCase().includes(query)
  })
  const pagedAutopsyReports = paginateItems(filteredAutopsyReports, listPages.autopsyReports ?? 1, AUTOPSY_REPORTS_PER_PAGE)
  const selectedAutopsyReport = selectedAutopsyReportId != null ? autopsyReportsState.find((r) => r.id === selectedAutopsyReportId) : null

  const filteredVehicleTypeOptions = vehicleTypeOptionsData.filter((type) => {
    const query = vehicleOffenseForm.vehicleType.trim().toLowerCase()

    if (!query) {
      return true
    }

    return type.toLowerCase().includes(query)
  })

  const filteredVehicleOwnerOptions = vehicleOwnerOptionsData.filter((owner) => {
    const query = vehicleOffenseForm.selectedOwner ? '' : vehicleOffenseForm.ownerQuery.trim().toLowerCase()

    if (!query) {
      return true
    }

    return owner.toLowerCase().includes(query)
  })

  const filteredProofFolderOptions = proofFolderOptions.filter((proof) => {
    const query = vehicleOffenseForm.proofFolder.trim().toLowerCase()

    if (!query) {
      return true
    }

    return proof.toLowerCase().includes(query)
  })

  const filteredOperationReportOptions = operationReportChoices.filter((report) => {
    const query = vehicleOffenseForm.operationReport.trim().toLowerCase()

    if (!query) {
      return true
    }

    return report.toLowerCase().includes(query)
  })

  const filteredWeaponModelOptions = weaponModelOptions.filter((model) => {
    const query = weaponEncodeForm.model.trim().toLowerCase()

    if (!query) {
      return true
    }

    return model.toLowerCase().includes(query)
  })

  const filteredWeaponEditModelOptions = weaponModelOptions.filter((model) => {
    const query = weaponEditForm.model.trim().toLowerCase()

    if (!query) {
      return true
    }

    return model.toLowerCase().includes(query)
  })

  const filteredWeaponEditOfficerOptions = officerOptionsData.filter((officer) => {
    const query = weaponEditForm.assignedOfficer.trim().toLowerCase()

    if (!query) {
      return true
    }

    return formatOfficerOption(officer).toLowerCase().includes(query)
  })

  const filteredWeaponCitizenOptions = weaponCitizenOptionsData.filter((citizen) => {
    const query = weaponEncodeForm.selectedCitizen ? '' : weaponEncodeForm.citizenQuery.trim().toLowerCase()

    if (!query) {
      return true
    }

    return citizen.toLowerCase().includes(query)
  })

  const filteredChargeOptions = chargeOptionsData.filter((charge) => {
    if (arrestReportForm.charges.includes(charge)) return false
    const query = arrestReportForm.chargeQuery.trim().toLowerCase()
    if (!query) return true
    return charge.toLowerCase().includes(query)
  })

  const isInterrogationPage = activePage === 'interrogations' || activePage === 'supervisor-interrogations'
  const interrogationPageTitle = activePage === 'supervisor-interrogations' ? 'Liste des interrogatoires' : 'Mes interrogatoires'
  const isIncidentPage = activePage === 'incident-reports' || activePage === 'supervisor-incident-reports'
  const incidentPageTitle = activePage === 'supervisor-incident-reports' ? "Liste des rapports d'incident" : "Mes rapports d'incident"
  const filteredOperationReports = operationReportEntries.filter((report) => {
    const query = operationReportsSearch.trim().toLowerCase()

    if (!query) {
      return true
    }

    return `${report.reportNumber} ${report.author} ${report.incidentType} ${report.date}`.toLowerCase().includes(query)
  })
  const selectedEvidenceFolder = evidenceFoldersState.find((folder) => folder.id === selectedEvidenceFolderId) ?? null
  const selectedEvidenceImages = selectedEvidenceFolderId ? (evidenceFolderImages[selectedEvidenceFolderId] ?? []) : []
  const selectedAgentStatistic = agentStatisticsState.find((agent) => agent.id === selectedAgentStatisticId) ?? null
  const selectedIncidentReport = incidentReportsState.find((report) => report.id === selectedIncidentReportId) ?? incidentReportsState[0]
  const selectedOperationReport = filteredOperationReports.find((report) => report.id === selectedOperationReportId) ?? null
  const selectedComplaint = filteredComplaints.find((complaint) => complaint.id === selectedComplaintId) ?? filteredComplaints[0] ?? null
  const selectedRookie = filteredRookies.find((rookie) => rookie.id === selectedRookieId) ?? filteredRookies[0] ?? null
  const selectedRookieChecklist = selectedRookie ? (rookieChecklist[selectedRookie.id] ?? {}) : {}
  const selectedRookieCriteriaEntries = adminRookieCriteriaState
  const selectedRookieCompletedCriteria = selectedRookieCriteriaEntries.filter((criterion) => selectedRookieChecklist[selectedRookieId]?.[criterion.id]).length
  const selectedRookieProgressPercent = selectedRookieCriteriaEntries.length ? Math.round((selectedRookieCompletedCriteria / selectedRookieCriteriaEntries.length) * 100) : 0
  const arrestDossierComputedRows = buildArrestDossierChargeRows(arrestDossierForm.chargeItems, arrestDossierForm.fineScale, arrestChargeCatalogData)
  const arrestDossierTotalFine = arrestDossierComputedRows.reduce((sum, row) => sum + row.fine, 0)
  const arrestDossierTotalJail = secondsToDuration(arrestDossierComputedRows.reduce((sum, row) => sum + durationToSeconds(row.jail), 0))
  const selectedAcademyCandidate = academyCandidates.find((candidate) => candidate.id === selectedCandidateId) ?? academyCandidates[0]
  const adminHomeStats = [
    { id: 'users', label: 'Utilisateurs', value: String(staffAgentsState.length) },
    { id: 'charges', label: 'Charges', value: String(adminChargesState.length) },
    { id: 'grades', label: 'Grades', value: String(adminGradesState.length) },
    { id: 'templates', label: 'Templates', value: String(adminDocumentTemplatesState.length) },
  ]
  const adminHomeQuickLinks = [
    {
      id: 'admin-users',
      title: 'Utilisateurs',
      description: 'Gérer les accès, les comptes actifs et les profils staff.',
      cta: 'Ouvrir les utilisateurs',
    },
    {
      id: 'admin-charges',
      title: 'Charges / Délits',
      description: 'Mettre à jour les charges, les amendes et les catégories.',
      cta: 'Ouvrir les charges',
    },
    {
      id: 'admin-grades',
      title: 'Grades',
      description: 'Revoir les grades, permissions et niveaux de salaire.',
      cta: 'Ouvrir les grades',
    },
    {
      id: 'admin-specialties',
      title: 'Pôles / spécialités',
      description: 'Ajuster les pôles, accès métier et répartitions internes.',
      cta: 'Ouvrir les pôles',
    },
    {
      id: 'admin-document-templates',
      title: 'Templates documents',
      description: 'Modifier les modèles de documents utilisés dans le MDT.',
      cta: 'Ouvrir les templates',
    },
    {
      id: 'admin-pa-form-questions',
      title: 'Questions formulaire PA',
      description: 'Mettre à jour le formulaire Police Academy et ses entrées.',
      cta: 'Ouvrir les questions',
    },
    {
      id: 'admin-rookie-criteria',
      title: 'Critères rookie',
      description: 'Modifier les critères de suivi et les validations rookie.',
      cta: 'Ouvrir les critères',
    },
  ]
  const adminPanelPages = new Set([
    'admin-users',
    'admin-home',
    'admin-charges',
    'admin-grades',
    'admin-specialties',
    'admin-document-templates',
    'admin-pa-form-questions',
    'admin-rookie-criteria',
  ])
  const isAdminPanel = mdtMode === 'admin'
  const isMcdPanel = mdtMode === 'mcd'
  const currentNavSections = (isAdminPanel ? adminNavSections : isMcdPanel ? mcdNavSections : navSections).filter((section) => permissions.isSupervisor || section.title !== 'Superviseur')

  const toggleNavSection = (title) => {
    setCollapsedNavSections((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  const handleNavItemClick = (pageKey) => {
    if (!pageKey) {
      return
    }

    if (pageKey === 'photo-proofs') {
      setSelectedEvidenceFolderId(null)
    }

    if (pageKey === 'agent-statistics') {
      setSelectedAgentStatisticId(null)
    }

    if (pageKey === 'rookie-follow-up') {
      setIsRookieSessionDropdownOpen(false)
    }

    if (pageKey === 'admin-charges') {
      setIsChargeCategoryDropdownOpen(false)
    }

    if (pageKey === 'offense-registry') {
      setIsOffenseCategoryDropdownOpen(false)
    }

    if (pageKey === 'academy-candidates') {
      setIsCandidateStatusDropdownOpen(false)
    }

    if (pageKey === 'complaint-registry') {
      setIsComplaintStatusDropdownOpen(false)
      setSelectedComplaintId((current) => current ?? complaintRegistryEntries[0]?.id ?? null)
    }

    if (pageKey === 'operation-reports') {
      setOperationReportsSearch('')
      setSelectedOperationReportId(null)
      setIsOperationReportCreateModalOpen(false)
      setIsOperationOfficersDropdownOpen(false)
      setIsOperationHostagesDropdownOpen(false)
      setIsOperationNegotiationLeadDropdownOpen(false)
      setIsOperationFieldLeadDropdownOpen(false)
      setIsOperationProofDropdownOpen(false)
    }

    if (pageKey === 'final-test-questions') {
      setIsFinalQuestionStatusDropdownOpen(false)
      setIsFinalQuestionCategoryDropdownOpen(false)
    }

    if (pageKey === 'academy-sessions') {
      setIsSessionTypeDropdownOpen(false)
      setOpenSessionMenuId(null)
    }

    setActivePage(pageKey)
  }

  const openAdminPanel = () => {
    if (!permissions.isStaff) {
      return
    }

    setMdtMode('admin')
    setActivePage('admin-home')
  }

  const openMdtPanel = () => {
    setMdtMode('mcd')
    setActivePage('mcd-rapports-legiste')
  }

  const returnToSasp = () => {
    setMdtMode('sasp')
    setActivePage('home')
  }

  const openAcademyCandidatesPage = (sessionId) => {
    setSelectedSessionId(sessionId)
    setActivePage('academy-candidates')
  }

  const openAcademyCandidateDetail = (candidateId) => {
    setSelectedCandidateId(candidateId)
    setActivePage('academy-candidate-detail')
  }

  const toggleRookieCriterion = (rookieId, criterionId) => {
    setRookieChecklist((current) => ({
      ...current,
      [rookieId]: {
        ...(current[rookieId] ?? {}),
        [criterionId]: !(current[rookieId]?.[criterionId] ?? false),
      },
    }))
  }

  const selectedSession = academySessions.find((session) => session.id === selectedSessionId) ?? academySessions[0]

  const handleAddSessionFieldChange = (field, value) => {
    setAddSessionForm((current) => ({ ...current, [field]: value }))
  }

  const handleEditSessionFieldChange = (field, value) => {
    setEditSessionForm((current) => ({ ...current, [field]: value }))
  }

  const openEditSessionModal = (session) => {
    setSelectedSessionId(session.id)
    setEditSessionForm(buildAcademySessionFormValues(session))
    setIsEditSessionModalOpen(true)
    setOpenSessionMenuId(null)
  }

  const openDeleteSessionModal = (session) => {
    setSelectedSessionId(session.id)
    setIsDeleteSessionModalOpen(true)
    setOpenSessionMenuId(null)
  }

  const openArrestReportModal = () => {
    setIsArrestReportModalOpen(true)
    setIsArrestDossierModalOpen(false)
    setIsCitizenMenuOpen(false)
    setArrestReportStep(1)
    setArrestReportPastedImages([])
    setArrestReportForm(buildArrestReportFormValues())
  }

  const handleArrestReportFieldChange = (field, value) => {
    setArrestReportForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handlePasteIntoArrestReport = async (event) => {
    event.preventDefault()
    const images = await extractClipboardImages(event)

    if (images.length > 0) {
      setArrestReportPastedImages((current) => [...current, ...images].slice(0, 4))
    }
  }

  const removeArrestReportImage = (imageIndex) => {
    setArrestReportPastedImages((current) => current.filter((_, index) => index !== imageIndex))
  }

  const handlePasteIntoEvidenceFolder = async (event) => {
    event.preventDefault()

    if (!selectedEvidenceFolderId) {
      return
    }

    const images = await extractClipboardImages(event)

    if (images.length > 0) {
      setEvidenceFolderImages((current) => ({
        ...current,
        [selectedEvidenceFolderId]: [...(current[selectedEvidenceFolderId] ?? []), ...images].slice(0, 8),
      }))
    }
  }

  const removeEvidenceFolderImage = (imageIndex) => {
    if (!selectedEvidenceFolderId) {
      return
    }

    setEvidenceFolderImages((current) => ({
      ...current,
      [selectedEvidenceFolderId]: (current[selectedEvidenceFolderId] ?? []).filter((_, index) => index !== imageIndex),
    }))
  }

  const submitArrestReportForm = async () => {
    const chargeRows = buildArrestChargeRows(arrestReportForm.charges, arrestChargeCatalogData)
    const totalFine = chargeRows.reduce((sum, charge) => sum + charge.fine, 0)
    const agents = arrestReportForm.selectedAgents.length > 0
      ? arrestReportForm.selectedAgents
      : [arrestReportForm.agentsQuery].filter(Boolean)
    const firstAgent = agents[0] || uiState.profile.name
    const dateDigits = arrestReportForm.dateTime.replace(/[^0-9]/g, '')
    const reportNumber = `#${dateDigits.slice(0, 4) || '0000'}`
    const reportTitle = `Rapport d'arrestation : ${selectedCitizen.name}`

    try {
      const reportPdf = await buildArrestReportPdf({
        title: reportTitle,
        reportNumber,
        dateTime: arrestReportForm.dateTime || 'Le 00/00/0000 à 00:00',
        author: firstAgent,
        suspectLine: `${selectedCitizen.name} | ${selectedCitizen.phone} | ${selectedCitizen.email}`,
        agents,
        details: arrestReportForm.report || 'Aucun détail fourni.',
        chargeLabel: chargeRows[0].label,
        chargeRows,
        fineAmount: `${totalFine.toFixed(2)} $`,
        jailTime: chargeRows[0].jail,
        fineScale: arrestReportForm.fineScale || 'Nominal',
        identityImage: createIdentityCardPreview(selectedCitizen),
        evidenceImages: arrestReportPastedImages,
        evidenceImage: createArrestEvidencePreview(arrestReportForm.possession || arrestReportForm.charges[0] || 'Photo preuve'),
        sealImage: createAdminSeal('SA', '#d2d4d8', '#ffffff', '#85888f'),
        policePost: arrestReportForm.policePost || 'San Andreas State Police | Vespucci',
      })

      reportPdf.save(`rapport-arrestation-${sanitizeFileSegment(selectedCitizen.name)}.pdf`)
    } catch (error) {
      console.error('Unable to generate arrest report PDF', error)
      return
    }

    const recordEntry = {
      id: `ar-${Date.now()}`,
      author: firstAgent,
      date: arrestReportForm.dateTime ? `Le ${arrestReportForm.dateTime.replace(' ', ' à ')}` : 'Date non précisée',
      reason: chargeRows.map((charge) => charge.label).join(', ') || 'Rapport d\'arrestation',
      reportNumber,
      policePost: arrestReportForm.policePost || 'San Andreas State Police | Vespucci',
      details: arrestReportForm.report || 'Aucun détail fourni.',
      charges: chargeRows,
      fine: `${totalFine.toFixed(2)} $`,
      jail: chargeRows[0]?.jail || '00:00:00',
      selectedAgents: agents,
    }

    setCitizenProfiles((current) => current.map((citizen) => {
      if (citizen.id !== selectedCitizen.id) {
        return citizen
      }

      return {
        ...citizen,
        records: normalizeCitizenRecords({
          ...citizen.records,
          arrestReports: [recordEntry, ...(citizen.records?.arrestReports ?? [])],
        }),
      }
    }))

    setActiveRecordTab('arrestReports')
    setIsReportChargesDropdownOpen(false)
    setIsReportFineScaleDropdownOpen(false)
    setIsReportAgentsDropdownOpen(false)
    setArrestReportStep(1)
    setIsArrestReportModalOpen(false)
  }

  const selectReportOfficer = (officer) => {
    setArrestReportForm((current) => ({
      ...current,
      agentsQuery: officer.id,
      selectedAgents: [formatOfficerOption(officer)],
    }))
    setIsReportAgentsDropdownOpen(false)
  }

  const openOperationReportCreateModal = () => {
    setOperationReportForm(buildOperationReportFormValues())
    setOperationReportPastedImages([])
    setIsOperationOfficersDropdownOpen(false)
    setIsOperationHostagesDropdownOpen(false)
    setIsOperationNegotiationLeadDropdownOpen(false)
    setIsOperationFieldLeadDropdownOpen(false)
    setIsOperationProofDropdownOpen(false)
    setIsOperationReportCreateModalOpen(true)
  }

  const openEvidenceFolderModal = () => {
    setEvidenceFolderForm(buildEvidenceFolderFormValues())
    setIsEvidenceFolderModalOpen(true)
  }

  const handleEvidenceFolderFieldChange = (field, value) => {
    setEvidenceFolderForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const submitEvidenceFolderForm = () => {
    const title = evidenceFolderForm.title.trim()
    if (!title) {
      return
    }

    const createdBy = String(uiState.profile?.name || 'Joueur Inconnu').trim() || 'Joueur Inconnu'
    const now = new Date()
    const timestamp = now.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    const folderId = `ev-${Date.now()}`
    const nextFolder = {
      id: folderId,
      title,
      createdAt: `Le ${timestamp}`,
      createdBy,
      hasImage: false,
    }

    setEvidenceFoldersState((current) => [nextFolder, ...current])
    setSelectedEvidenceFolderId(folderId)
    setEvidenceSearch('')
    setIsEvidenceFolderModalOpen(false)
  }

  const handleOperationReportFieldChange = (field, value) => {
    setOperationReportForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const addOperationReportOfficer = (officer) => {
    const formattedOfficer = formatOfficerOption(officer)

    setOperationReportForm((current) => ({
      ...current,
      selectedOfficers: current.selectedOfficers.includes(formattedOfficer)
        ? current.selectedOfficers
        : [...current.selectedOfficers, formattedOfficer],
      officersQuery: '',
    }))
  }

  const removeOperationReportOfficer = (officerValue) => {
    setOperationReportForm((current) => ({
      ...current,
      selectedOfficers: current.selectedOfficers.filter((officer) => officer !== officerValue),
    }))
  }

  const addOperationReportHostage = (hostage) => {
    setOperationReportForm((current) => ({
      ...current,
      selectedHostages: current.selectedHostages.includes(hostage)
        ? current.selectedHostages
        : [...current.selectedHostages, hostage],
      hostagesQuery: '',
    }))
  }

  const removeOperationReportHostage = (hostageValue) => {
    setOperationReportForm((current) => ({
      ...current,
      selectedHostages: current.selectedHostages.filter((hostage) => hostage !== hostageValue),
    }))
  }

  const toggleOperationProofFolder = (folder) => {
    setOperationReportForm((current) => ({
      ...current,
      selectedProofFolders: current.selectedProofFolders.includes(folder)
        ? current.selectedProofFolders.filter((item) => item !== folder)
        : [...current.selectedProofFolders, folder],
    }))
  }

  const handlePasteIntoOperationReportProofs = async (event) => {
    event.preventDefault()

    const images = await extractClipboardImages(event)

    if (images.length > 0) {
      setOperationReportPastedImages((current) => [...current, ...images].slice(0, 6))
    }
  }

  const removeOperationReportImage = (imageIndex) => {
    setOperationReportPastedImages((current) => current.filter((_, index) => index !== imageIndex))
  }

  const submitOperationReportForm = () => {
    const nextNumber = operationReportEntries.reduce((max, report) => {
      const value = Number(report.reportNumber.replace(/[^0-9]/g, ''))
      return Number.isNaN(value) ? max : Math.max(max, value)
    }, 1700) + 1
    const author = operationReportForm.selectedOfficers[0] || operationReportForm.negotiationLead || `${uiState.profile.badge} | ${uiState.profile.name}`
    const date = operationReportForm.dateTime.slice(0, 10) || '00/00/0000'
    const createdReport = {
      id: `op-${nextNumber}`,
      reportNumber: `#${nextNumber}`,
      author,
      incidentType: operationReportForm.incidentType || 'Intervention',
      date,
      dateTime: operationReportForm.dateTime.replace(' ', ' à '),
      location: operationReportForm.location || 'Lieu non précisé',
      selectedOfficers: operationReportForm.selectedOfficers,
      selectedHostages: operationReportForm.selectedHostages,
      claims: operationReportForm.claims || 'Aucune revendication renseignée.',
      negotiationLead: operationReportForm.negotiationLead || 'Non désigné',
      fieldLead: operationReportForm.fieldLead || 'Non désigné',
      proofFolders: operationReportForm.selectedProofFolders,
      proofImages: operationReportPastedImages,
      report: operationReportForm.report || 'Aucun rapport complémentaire renseigné.',
    }

    setOperationReportEntries((current) => [createdReport, ...current])
    setOperationReportChoices((current) => {
      const nextLabel = `${createdReport.incidentType} ${createdReport.date}`
      return current.includes(nextLabel) ? current : [nextLabel, ...current]
    })
    setSelectedOperationReportId(createdReport.id)
    setIsOperationReportCreateModalOpen(false)
    setIsOperationOfficersDropdownOpen(false)
    setIsOperationHostagesDropdownOpen(false)
    setIsOperationNegotiationLeadDropdownOpen(false)
    setIsOperationFieldLeadDropdownOpen(false)
    setIsOperationProofDropdownOpen(false)
  }

  const handleArrestDossierFieldChange = (field, value) => {
    setArrestDossierForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const addDossierOfficer = (officer) => {
    const formattedOfficer = formatOfficerOption(officer)

    setArrestDossierForm((current) => ({
      ...current,
      selectedAgents: current.selectedAgents.includes(formattedOfficer)
        ? current.selectedAgents
        : [...current.selectedAgents, formattedOfficer],
    }))
  }

  const removeDossierOfficer = (officerValue) => {
    setArrestDossierForm((current) => ({
      ...current,
      selectedAgents: current.selectedAgents.filter((officer) => officer !== officerValue),
    }))
  }

  const openArrestDossierModal = (record = null) => {
    const baseValues = buildArrestDossierFormValues(selectedCitizen, record)

    setEditingArrestDossierRecordId(record?.id ?? null)
    setArrestDossierForm(baseValues)
    setArrestDossierPastedImages(baseValues.proofImages ?? [])
    setIsDossierAgentsDropdownOpen(false)
    setIsDossierPeopleDropdownOpen(false)
    setIsDossierOperationDropdownOpen(false)
    setIsDossierProofDropdownOpen(false)
    setIsDossierChargesDropdownOpen(false)
    setIsDossierFineScaleDropdownOpen(false)
    setOpenCitizenRecordMenuId(null)
    setShowArrestDossierSuccessToast(false)
    setIsArrestDossierModalOpen(true)
    setIsArrestReportModalOpen(false)
    setIsCitizenMenuOpen(false)
  }

  const handlePasteIntoArrestDossierProofs = async (event) => {
    event.preventDefault()
    const images = await extractClipboardImages(event)

    if (images.length > 0) {
      setArrestDossierPastedImages((current) => [...current, ...images].slice(0, 6))
    }
  }

  const removeArrestDossierImage = (imageIndex) => {
    setArrestDossierPastedImages((current) => current.filter((_, index) => index !== imageIndex))
  }

  const toggleArrestDossierCharge = (label) => {
    setArrestDossierForm((current) => {
      const isSelected = current.selectedCharges.includes(label)

      return {
        ...current,
        selectedCharges: isSelected
          ? current.selectedCharges.filter((item) => item !== label)
          : [...current.selectedCharges, label],
        chargeItems: isSelected
          ? current.chargeItems.filter((item) => item.label !== label)
          : [...current.chargeItems, { id: `dc-${sanitizeFileSegment(label)}-${current.chargeItems.length + 1}`, label, quantity: 1, tentative: false, complicity: false }],
        chargeQuery: '',
      }
    })
    setIsDossierChargesDropdownOpen(false)
  }

  const handleArrestDossierChargeItemChange = (chargeId, field, value) => {
    setArrestDossierForm((current) => ({
      ...current,
      chargeItems: current.chargeItems.map((item) => item.id === chargeId ? { ...item, [field]: value } : item),
    }))
  }

  const removeArrestDossierCharge = (chargeId) => {
    setArrestDossierForm((current) => {
      const nextChargeItems = current.chargeItems.filter((item) => item.id !== chargeId)
      return {
        ...current,
        chargeItems: nextChargeItems,
        selectedCharges: nextChargeItems.map((item) => item.label),
      }
    })
  }

  const handleArrestDossierVehicleChange = (vehicleId, field, value) => {
    setArrestDossierForm((current) => ({
      ...current,
      vehicles: current.vehicles.map((vehicle) => vehicle.id === vehicleId ? { ...vehicle, [field]: value } : vehicle),
    }))
  }

  const addArrestDossierVehicle = () => {
    setArrestDossierForm((current) => ({
      ...current,
      vehicles: [...current.vehicles, { id: `veh-${current.vehicles.length + 1}`, model: '', plate: '', stolen: false }],
    }))
  }

  const addArrestDossierWeapon = () => {
    setArrestDossierForm((current) => ({
      ...current,
      weapons: [...current.weapons, `Arme ${current.weapons.length + 1}`],
    }))
  }

  const openArrestDossierPreview = (record) => {
    setCurrentArrestDossierPreview(buildArrestDossierPreviewPayload(selectedCitizen, record, arrestChargeCatalogData))
    setShowArrestDossierPreview(true)
    setOpenCitizenRecordMenuId(null)
  }

  const submitArrestDossierForm = () => {
    const previewPayload = buildArrestDossierPreviewPayload(selectedCitizen, {
      ...arrestDossierForm,
      proofImages: arrestDossierPastedImages,
    }, arrestChargeCatalogData)
    const recordId = editingArrestDossierRecordId ?? `ad-${Date.now()}`
    const updatedRecord = {
      id: recordId,
      reportNumber: arrestDossierForm.reportNumber,
      author: previewPayload.author,
      authorId: (arrestDossierForm.selectedAgents[1] ?? arrestDossierForm.selectedAgents[0] ?? '').split('|')[0]?.trim() ?? '21',
      date: previewPayload.dateTime,
      status: arrestDossierForm.status,
      ...arrestDossierForm,
      proofImages: arrestDossierPastedImages,
    }

    setCitizenProfiles((current) => current.map((citizen) => {
      if (citizen.id !== selectedCitizen.id) {
        return citizen
      }

      const currentRecords = citizen.records?.arrestation ?? []
      const hasExisting = currentRecords.some((record) => record.id === recordId)
      const nextRecords = hasExisting
        ? currentRecords.map((record) => record.id === recordId ? updatedRecord : record)
        : [updatedRecord, ...currentRecords]

      return {
        ...citizen,
        records: normalizeCitizenRecords({
          ...citizen.records,
          arrestation: nextRecords,
        }),
      }
    }))

    setCurrentArrestDossierPreview(previewPayload)
    setActiveRecordTab('arrestation')
    setShowArrestDossierPreview(true)
    setShowArrestDossierSuccessToast(true)
    setIsArrestDossierModalOpen(false)
    setOpenCitizenRecordMenuId(null)
  }

  const openAddVehicleModal = () => {
    setVehicleOffenseForm({
      vehicleType: '',
      plate: '',
      title: '',
      ownerQuery: '',
      selectedOwner: '',
      proofFolder: '',
      operationReport: '',
    })
    setIsAddVehicleModalOpen(true)
  }

  const handleVehicleOffenseFieldChange = (field, value) => {
    setVehicleOffenseForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const submitVehicleOffenseForm = () => {
    const timestamp = new Date().toLocaleString('fr-FR')
    const nextEntry = {
      id: vehicleOffenseForm.plate.trim() || `vo-${Date.now()}`,
      type: vehicleOffenseForm.vehicleType || 'Vehicule inconnu',
      plate: vehicleOffenseForm.plate || 'N/A',
      registeredAt: `Le ${timestamp}`,
      facts: 1,
      owner: vehicleOffenseForm.selectedOwner || vehicleOffenseForm.ownerQuery || 'Proprietaire inconnu',
      ownerSince: `Le ${timestamp}`,
      linkedCase: vehicleOffenseForm.title || 'Infraction vehicule',
      linkedCaseBadge: vehicleOffenseForm.operationReport || 'Sans rapport',
      linkedCaseLabel: vehicleOffenseForm.proofFolder || '--',
    }

    setOffenseVehiclesState((current) => [nextEntry, ...current])
    setExpandedOffenseVehicleId(nextEntry.id)
    setIsAddVehicleModalOpen(false)
    setIsVehicleTypeDropdownOpen(false)
    setIsVehicleOwnerDropdownOpen(false)
    setIsVehicleProofDropdownOpen(false)
    setIsVehicleOperationDropdownOpen(false)
  }

  const openWeaponEncodeModal = () => {
    setWeaponEncodeForm(buildWeaponEncodeFormValues())
    setIsWeaponEncodeModalOpen(true)
    setShowWeaponSuccessToast(false)
  }

  const handleWeaponEncodeFieldChange = (field, value) => {
    setWeaponEncodeForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const submitWeaponEncodeForm = () => {
    const nextEntry = {
      id: `w-${Date.now()}`,
      date: `Le ${weaponEncodeForm.dateTime.split(' ')[0] || new Date().toLocaleDateString('fr-FR')}`,
      serial: weaponEncodeForm.serial || `SER-${Date.now()}`,
      model: weaponEncodeForm.model || 'Modele inconnu',
      status: '',
      origin: weaponEncodeForm.origin,
      reason: weaponEncodeForm.reason,
      assignedOfficer: `${uiState.profile.badge} | ${uiState.profile.name}`,
      stolen: weaponEncodeForm.usedForCrime,
      archived: false,
      checkedPs: weaponEncodeForm.origin === 'Arme saisie',
      encodedBy: `${uiState.profile.badge} | ${uiState.profile.name}`,
      state: weaponEncodeForm.origin === 'Arme saisie' ? 'Saisi' : 'Actif',
      linkedCitizen: weaponEncodeForm.selectedCitizen || weaponEncodeForm.citizenQuery,
    }

    setWeaponRegistryState((current) => [nextEntry, ...current])
    setExpandedWeaponId(nextEntry.id)
    setIsWeaponEncodeModalOpen(false)
    setIsWeaponModelDropdownOpen(false)
    setIsWeaponCitizenDropdownOpen(false)
    setShowWeaponSuccessToast(true)
  }

  const openWeaponEditModal = (weapon) => {
    setEditingWeaponId(weapon.id)
    setWeaponEditForm(buildWeaponEditFormValues(weapon))
    setIsWeaponEditModelDropdownOpen(false)
    setIsWeaponEditOfficerDropdownOpen(false)
    setIsWeaponEditOriginDropdownOpen(false)
    setOpenWeaponMenuId(null)
    setIsWeaponEditModalOpen(true)
  }

  const handleWeaponEditFieldChange = (field, value) => {
    setWeaponEditForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const submitWeaponEditForm = () => {
    const nextState = weaponEditForm.archived || weaponEditForm.checkedPs || weaponEditForm.origin === 'Arme saisie' ? 'Saisi' : 'Actif'

    setWeaponRegistryState((current) => current.map((weapon) => {
      if (weapon.id !== editingWeaponId) {
        return weapon
      }

      return {
        ...weapon,
        model: weaponEditForm.model,
        origin: weaponEditForm.origin,
        reason: weaponEditForm.reason,
        assignedOfficer: weaponEditForm.assignedOfficer,
        stolen: weaponEditForm.stolen,
        archived: weaponEditForm.archived,
        checkedPs: weaponEditForm.checkedPs,
        state: nextState,
      }
    }))

    setIsWeaponEditModalOpen(false)
    setIsWeaponEditModelDropdownOpen(false)
    setIsWeaponEditOfficerDropdownOpen(false)
    setIsWeaponEditOriginDropdownOpen(false)
    setOpenWeaponMenuId(null)
  }

  const openProfileSettingsModal = () => {
    setProfileSettingsForm(buildProfileFormValues(uiState.profile))
    setIsProfileSettingsModalOpen(true)
  }

  const handleProfileSettingsFieldChange = (field, value) => {
    setProfileSettingsForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const submitProfileSettingsForm = () => {
    setUiState((current) => ({
      ...current,
      profile: {
        ...current.profile,
        name: profileSettingsForm.name.trim() || current.profile.name,
        badge: profileSettingsForm.badge.trim() || current.profile.badge,
        phone: profileSettingsForm.phone.trim(),
        iban: profileSettingsForm.iban.trim(),
        email: profileSettingsForm.email.trim(),
      },
    }))

    setIsProfileSettingsModalOpen(false)
  }

  const handleLogoutClick = () => {
    setIsProfileSettingsModalOpen(false)
    setUiState((current) => ({ ...current, visible: false }))
    closeMdtNui()
  }

  const askTextValue = (label, initialValue = '') => {
    if (typeof window === 'undefined' || typeof window.prompt !== 'function') {
      return initialValue
    }

    return window.prompt(label, initialValue)
  }

  const askConfirmation = (label) => {
    if (typeof window === 'undefined' || typeof window.confirm !== 'function') {
      return true
    }

    return window.confirm(label)
  }

  const buildAdminRecordId = (prefix) => `${prefix}-${Date.now()}`

  const openAdminChargeEditor = (charge = null) => {
    const name = askTextValue('Nom de la charge', charge?.name ?? '')
    if (name === null || !name.trim()) return
    const category = askTextValue('Catégorie', charge?.category ?? '')
    if (category === null) return
    const type = askTextValue('Type', charge?.type ?? '')
    if (type === null) return
    const fine = askTextValue('Amende', String(charge?.fine ?? 0))
    if (fine === null) return
    const instruction = askTextValue('Instruction', charge?.instruction ?? '')
    if (instruction === null) return
    const jail = askTextValue('Temps prison (HH:MM:SS)', charge?.jail ?? '00:00:00')
    if (jail === null) return

    const nextEntry = normalizeAdminChargeEntry({
      id: charge?.id ?? buildAdminRecordId('admin-charge'),
      name,
      category,
      type,
      fine,
      instruction,
      jail,
    }, charge?.id ?? 'admin-charge')

    setAdminChargesState((current) => charge
      ? current.map((entry) => entry.id === charge.id ? nextEntry : entry)
      : [nextEntry, ...current])
  }

  const removeAdminCharge = (chargeId) => {
    if (!askConfirmation('Supprimer cette charge ?')) return
    setAdminChargesState((current) => current.filter((entry) => entry.id !== chargeId))
  }

  const openAdminGradeEditor = (grade = null) => {
    const name = askTextValue('Nom du grade', grade?.name ?? '')
    if (name === null || !name.trim()) return
    const faction = askTextValue('Faction', grade?.faction ?? '')
    if (faction === null) return
    const permissions = askTextValue('Permissions', grade?.permissions ?? '')
    if (permissions === null) return
    const count = askTextValue('Effectif', String(grade?.count ?? 0))
    if (count === null) return
    const salary = askTextValue('Salaire', String(grade?.salary ?? 0))
    if (salary === null) return
    const supervisor = askConfirmation('Ce grade est-il superviseur ?')

    const nextEntry = normalizeAdminGradeEntry({
      id: grade?.id ?? buildAdminRecordId('admin-grade'),
      name,
      faction,
      permissions,
      count,
      salary,
      supervisor,
    }, grade?.id ?? 'admin-grade')

    setAdminGradesState((current) => grade
      ? current.map((entry) => entry.id === grade.id ? nextEntry : entry)
      : [nextEntry, ...current])
  }

  const removeAdminGrade = (gradeId) => {
    if (!askConfirmation('Supprimer ce grade ?')) return
    setAdminGradesState((current) => current.filter((entry) => entry.id !== gradeId))
  }

  const openAdminSpecialtyEditor = (specialty = null) => {
    const name = askTextValue('Nom du pôle / spécialité', specialty?.name ?? '')
    if (name === null || !name.trim()) return
    const lead = askTextValue('Lead', specialty?.lead ?? '')
    if (lead === null) return
    const coLead = askTextValue('Co-Lead', specialty?.coLead ?? '')
    if (coLead === null) return
    const members = askTextValue('Nombre de membres', String(specialty?.members ?? 0))
    if (members === null) return

    const nextEntry = normalizeAdminSpecialtyEntry({
      id: specialty?.id ?? buildAdminRecordId('admin-specialty'),
      name,
      lead,
      coLead,
      members,
    }, specialty?.id ?? 'admin-specialty')

    setAdminSpecialtiesState((current) => specialty
      ? current.map((entry) => entry.id === specialty.id ? nextEntry : entry)
      : [nextEntry, ...current])
  }

  const removeAdminSpecialty = (specialtyId) => {
    if (!askConfirmation('Supprimer cette spécialité ?')) return
    setAdminSpecialtiesState((current) => current.filter((entry) => entry.id !== specialtyId))
  }

  const openAdminTemplateEditor = (template = null) => {
    const title = askTextValue('Titre du template', template?.title ?? '')
    if (title === null || !title.trim()) return
    const type = askTextValue('Type', template?.type ?? '')
    if (type === null) return
    const updatedAt = askTextValue('Dernière modification', template?.updatedAt ?? new Date().toLocaleString('fr-FR'))
    if (updatedAt === null) return
    const author = askTextValue('Auteur', template?.author ?? uiState.profile.name)
    if (author === null) return

    const nextEntry = normalizeAdminDocumentTemplateEntry({
      id: template?.id ?? buildAdminRecordId('admin-template'),
      title,
      type,
      updatedAt,
      author,
    }, template?.id ?? 'admin-template')

    setAdminDocumentTemplatesState((current) => template
      ? current.map((entry) => entry.id === template.id ? nextEntry : entry)
      : [nextEntry, ...current])
  }

  const removeAdminTemplate = (templateId) => {
    if (!askConfirmation('Supprimer ce template ?')) return
    setAdminDocumentTemplatesState((current) => current.filter((entry) => entry.id !== templateId))
  }

  const openAdminPaQuestionEditor = (question = null) => {
    const label = askTextValue('Question', question?.label ?? '')
    if (label === null || !label.trim()) return
    const category = askTextValue('Catégorie', question?.category ?? '')
    if (category === null) return
    const expectedAnswer = askTextValue('Réponse attendue', question?.expectedAnswer ?? '')
    if (expectedAnswer === null) return
    const required = askTextValue('Obligatoire (Oui/Non)', question?.required ?? 'Oui')
    if (required === null) return

    const nextEntry = normalizeAdminPaFormQuestionEntry({
      id: question?.id ?? buildAdminRecordId('admin-pa-question'),
      label,
      category,
      expectedAnswer,
      required,
    }, question?.id ?? 'admin-pa-question')

    setAdminPaFormQuestionsState((current) => question
      ? current.map((entry) => entry.id === question.id ? nextEntry : entry)
      : [nextEntry, ...current])
  }

  const removeAdminPaQuestion = (questionId) => {
    if (!askConfirmation('Supprimer cette question ?')) return
    setAdminPaFormQuestionsState((current) => current.filter((entry) => entry.id !== questionId))
  }

  const openAdminRookieCriterionEditor = (criterion = null) => {
    const label = askTextValue('Critère', criterion?.label ?? '')
    if (label === null || !label.trim()) return
    const min = askTextValue('Minimum', criterion?.min ?? '0')
    if (min === null) return
    const max = askTextValue('Maximum', criterion?.max ?? '100')
    if (max === null) return
    const category = askTextValue('Catégorie', criterion?.category ?? '')
    if (category === null) return

    const nextEntry = normalizeAdminRookieCriterionEntry({
      id: criterion?.id ?? buildAdminRecordId('admin-rookie-criterion'),
      label,
      min,
      max,
      category,
    }, criterion?.id ?? 'admin-rookie-criterion')

    setAdminRookieCriteriaState((current) => criterion
      ? current.map((entry) => entry.id === criterion.id ? nextEntry : entry)
      : [nextEntry, ...current])
  }

  const removeAdminRookieCriterion = (criterionId) => {
    if (!askConfirmation('Supprimer ce critère ?')) return
    setAdminRookieCriteriaState((current) => current.filter((entry) => entry.id !== criterionId))
  }

  return (
    <div className="mdt-stage">
      <div className="shell">
        <img className="mdt-contour" src={contourFrame} alt="" aria-hidden="true" />
        <div className="frame">
        <aside className="sidebar">
          <div className="brand">
            <img className="brand-seal" src={saspSeal} alt={isMcdPanel ? 'MCD' : 'SASP'} />
            <div>
              <p className="brand-kicker">{isMcdPanel ? 'San Andreas' : 'State of San Andreas'}</p>
              <h1 className="brand-title">{isMcdPanel ? 'Medical Department' : 'Police Department'}</h1>
            </div>
          </div>

          <nav className="nav">
            {currentNavSections.map((section) => (
              <div className="nav-section" key={section.title}>
                <button className="nav-section-title" type="button" onClick={() => toggleNavSection(section.title)}>
                  <span>{section.title}</span>
                  <ChevronIcon expanded={!collapsedNavSections.has(section.title)} />
                </button>

                {!collapsedNavSections.has(section.title) && section.items.length > 0 ? (
                  <div className="nav-items">
                    {section.items.map((item) => (
                      <button
                        className={`nav-item${item.key === activePage ? ' nav-item-active' : ''}`}
                        key={item.label}
                        type="button"
                        onClick={() => handleNavItemClick(item.key)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </nav>

          <div className="sidebar-bottom">
            <div className="sidebar-quick-actions">
              {isMcdPanel ? (
                <button className="sidebar-wide-button sidebar-wide-button-sasp" onClick={returnToSasp} type="button">
                  Retour SASP
                </button>
              ) : (
                <button className="sidebar-wide-button" onClick={openMdtPanel} type="button">
                  MDT MCD
                </button>
              )}
              {permissions.isStaff ? (
                <button className="sidebar-wide-button" onClick={openAdminPanel} type="button">
                  Panel admin / staff
                </button>
              ) : null}
            </div>

            <footer className="sidebar-footer">
              <div className="sidebar-profile-summary">
                <p className="profile-name">{uiState.profile.name}</p>
                <p className="profile-badge">{uiState.profile.badge}</p>
                {uiState.profile.phone ? <p className="profile-meta-line">Numéro : {uiState.profile.phone}</p> : null}
                {uiState.profile.iban ? <p className="profile-meta-line">IBAN : {uiState.profile.iban}</p> : null}
              </div>
              <div className="footer-actions">
                <button className="icon-button" type="button" aria-label="Paramètres" onClick={openProfileSettingsModal}>
                  <SettingsIcon />
                </button>
                <button className="icon-button" type="button" aria-label="Déconnexion" onClick={handleLogoutClick}>
                  <LogoutIcon />
                </button>
              </div>
            </footer>

            <div className="sidebar-meta">© Blankaa  ♦  LOOP PRIME</div>
          </div>
        </aside>

        <main className="content">
          {activePage === 'admin-users' ? (
            <section className="admin-config-page admin-users-page">
              <div className="admin-page-header admin-page-header-split">
                <div>
                  <h2>Gestion des utilisateurs</h2>
                </div>

                <input
                  className="admin-grade-search"
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={adminUserSearch}
                  onChange={(event) => setAdminUserSearch(event.target.value)}
                />
              </div>

              <div className="admin-user-tabs" role="tablist" aria-label="Filtre utilisateurs">
                {adminUserDepartmentsState.map((department) => (
                  <button
                    className={`admin-user-tab${adminUserDepartment === department ? ' admin-user-tab-active' : ''}`}
                    key={department}
                    type="button"
                    onClick={() => setAdminUserDepartment(department)}
                  >
                    {department}
                  </button>
                ))}
              </div>

              {filteredAdminUsers.length > 0 ? (
                <div className="admin-simple-table">
                  <div className="admin-simple-table-head admin-simple-table-head-grades">
                    <span>UTILISATEUR</span>
                    <span>DÉPARTEMENT</span>
                    <span>GRADE</span>
                    <span>CONTACT</span>
                  </div>

                  <div className="admin-simple-table-body">
                    {filteredAdminUsers.map((agent) => (
                      <div className="admin-simple-table-row admin-simple-table-row-grades" key={agent.id}>
                        <span>{`${agent.firstName} ${agent.lastName}`.trim() || agent.identifier}</span>
                        <span>{agent.department || agent.job || 'Inactifs'}</span>
                        <span>{agent.grade}</span>
                        <span>{agent.phone || agent.email || 'Aucun contact'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="admin-users-empty-state">Aucun utilisateur trouvé.</div>
              )}
            </section>
          ) : activePage === 'admin-home' ? (
            <section className="admin-home-page">
              <div className="admin-home-card">
                <div className="admin-home-hero">
                  <div className="admin-home-brand-block">
                    <img className="admin-home-brand-seal" src={saspSeal} alt="SASP" />
                    <div>
                      <p className="admin-home-kicker">Panel administration / staff</p>
                      <h2>Centre de gestion SASP</h2>
                      <p className="admin-home-subtitle">Accédez rapidement aux réglages staff, à la gestion des utilisateurs et aux configurations principales du MDT Police.</p>
                    </div>
                  </div>

                  <div className="admin-home-hero-actions">
                    <button className="admin-home-primary-button" type="button" onClick={() => handleNavItemClick('admin-users')}>
                      Gérer les utilisateurs
                    </button>
                    <button className="admin-home-secondary-button" type="button" onClick={() => handleNavItemClick('admin-charges')}>
                      Modifier les charges
                    </button>
                  </div>
                </div>

                <div className="admin-home-stats-grid">
                  {adminHomeStats.map((stat) => (
                    <article className="admin-home-stat-card" key={stat.id}>
                      <span className="admin-home-stat-label">{stat.label}</span>
                      <strong className="admin-home-stat-value">{stat.value}</strong>
                    </article>
                  ))}
                </div>

                <div className="admin-home-shortcuts-grid">
                  {adminHomeQuickLinks.map((entry) => (
                    <article className="admin-home-shortcut-card" key={entry.id}>
                      <div>
                        <h3>{entry.title}</h3>
                        <p>{entry.description}</p>
                      </div>

                      <button className="admin-home-shortcut-button" type="button" onClick={() => handleNavItemClick(entry.id)}>
                        {entry.cta}
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : activePage === 'admin-charges' ? (
            <section className="admin-config-page">
              <div className="admin-page-header admin-page-header-split">
                <div>
                  <h2>Liste des charges</h2>
                </div>
                <button className="question-create-button" type="button" onClick={() => openAdminChargeEditor()}>Ajouter une charge</button>
              </div>

              <div className="admin-charge-toolbar">
                <div className="case-select-block question-filter-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="case-select-shell question-filter-shell">
                    <input value={chargeCategory} readOnly onClick={() => setIsChargeCategoryDropdownOpen((current) => !current)} />
                    <button className="case-select-button" type="button" onClick={() => setIsChargeCategoryDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isChargeCategoryDropdownOpen ? (
                    <div className="case-dropdown-list question-dropdown-list">
                      {adminChargeCategoryOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          setChargeCategory(option)
                          setIsChargeCategoryDropdownOpen(false)
                        }}>{option}</button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <input
                  className="admin-grade-search"
                  type="text"
                  placeholder="Rechercher une charge..."
                  value={chargeSearch}
                  onChange={(event) => setChargeSearch(event.target.value)}
                />
              </div>

              <div className="admin-complex-table admin-charges-table">
                <div className="admin-complex-table-head admin-charges-grid">
                  <span>NOM</span>
                  <span>TYPE</span>
                  <span>AMENDE</span>
                  <span>INSTRUCTION</span>
                  <span>TEMPS PRISON (HH:MM:SS)</span>
                  <span>ACTIONS</span>
                </div>

                <div className="admin-complex-table-body">
                  {pagedAdminCharges.items.map((charge) => (
                    <div className="admin-complex-table-row admin-charges-grid" key={charge.id}>
                      <span>{charge.name}</span>
                      <span>{charge.type}</span>
                      <span>{charge.fine}</span>
                      <span>{charge.instruction}</span>
                      <span>{charge.jail}</span>
                      <div className="admin-row-actions">
                        <button className="question-table-menu" type="button" aria-label={`Modifier ${charge.name}`} onClick={() => openAdminChargeEditor(charge)}>
                          <DotsIcon />
                        </button>
                        <button className="question-table-menu" type="button" aria-label={`Supprimer ${charge.name}`} onClick={() => removeAdminCharge(charge.id)}>
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Pagination className="vehicle-pagination" ariaLabel="Pagination charges" currentPage={pagedAdminCharges.currentPage} totalPages={pagedAdminCharges.totalPages} onPageChange={(page) => setListPage('adminCharges', page)} />
            </section>
          ) : activePage === 'admin-grades' ? (
            <section className="admin-config-page">
              <div className="admin-page-header admin-page-header-split">
                <div>
                  <p className="admin-page-kicker">Configuration</p>
                  <h2>Grades</h2>
                </div>

                <div className="admin-grade-actions">
                  <input
                    className="admin-grade-search"
                    type="text"
                    placeholder="Rechercher un grade..."
                    value={gradeSearch}
                    onChange={(event) => setGradeSearch(event.target.value)}
                  />
                  <button className="question-create-button" type="button" onClick={() => openAdminGradeEditor()}>Ajouter un grade</button>
                </div>
              </div>

              <div className="admin-simple-table">
                <div className="admin-simple-table-head admin-simple-table-head-grades">
                  <span>GRADE</span>
                  <span>FACTION</span>
                  <span>PERMISSIONS</span>
                  <span>ACTIONS</span>
                </div>

                <div className="admin-simple-table-body">
                  {filteredAdminGrades.map((grade) => (
                    <div className="admin-simple-table-row admin-simple-table-row-grades" key={grade.id}>
                      <span>{grade.name}</span>
                      <span>{grade.faction}</span>
                      <span>{grade.permissions}</span>
                      <div className="admin-row-actions">
                        <button className="question-table-menu" type="button" aria-label={`Modifier ${grade.name}`} onClick={() => openAdminGradeEditor(grade)}>
                          <DotsIcon />
                        </button>
                        <button className="question-table-menu" type="button" aria-label={`Supprimer ${grade.name}`} onClick={() => removeAdminGrade(grade.id)}>
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : activePage === 'admin-specialties' ? (
            <section className="admin-config-page">
              <div className="admin-page-header">
                <div>
                  <p className="admin-page-kicker">Configuration</p>
                  <h2>Pôles / spécialités</h2>
                </div>
                <button className="question-create-button" type="button" onClick={() => openAdminSpecialtyEditor()}>Ajouter une spécialité</button>
              </div>

              <div className="admin-complex-table">
                <div className="admin-complex-table-head admin-specialties-grid">
                  <span>NOM</span>
                  <span>LEAD</span>
                  <span>CO-LEAD</span>
                  <span>MEMBRES</span>
                  <span>ACTIONS</span>
                </div>

                <div className="admin-complex-table-body">
                  {adminSpecialtiesState.map((specialty) => (
                    <div className="admin-complex-table-row admin-specialties-grid" key={specialty.id}>
                      <span>{specialty.name}</span>
                      <span>{specialty.lead}</span>
                      <span>{specialty.coLead}</span>
                      <span>{specialty.members}</span>
                      <div className="admin-row-actions">
                        <button className="question-table-menu" type="button" aria-label={`Modifier ${specialty.name}`} onClick={() => openAdminSpecialtyEditor(specialty)}>
                          <DotsIcon />
                        </button>
                        <button className="question-table-menu" type="button" aria-label={`Supprimer ${specialty.name}`} onClick={() => removeAdminSpecialty(specialty.id)}>
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : activePage === 'admin-document-templates' ? (
            <section className="admin-config-page">
              <div className="admin-page-header">
                <div>
                  <p className="admin-page-kicker">Configuration</p>
                  <h2>Templates documents</h2>
                </div>
                <button className="question-create-button" type="button" onClick={() => openAdminTemplateEditor()}>Créer un template</button>
              </div>

              <div className="admin-complex-table">
                <div className="admin-complex-table-head admin-templates-grid">
                  <span>TITRE</span>
                  <span>TYPE</span>
                  <span>DERNIÈRE MODIFICATION</span>
                  <span>AUTEUR</span>
                  <span>ACTIONS</span>
                </div>

                <div className="admin-complex-table-body">
                  {adminDocumentTemplatesState.map((template) => (
                    <div className="admin-complex-table-row admin-templates-grid" key={template.id}>
                      <span>{template.title}</span>
                      <span>{template.type}</span>
                      <span>{template.updatedAt}</span>
                      <span>{template.author}</span>
                      <div className="admin-row-actions">
                        <button className="question-table-menu" type="button" aria-label={`Modifier ${template.title}`} onClick={() => openAdminTemplateEditor(template)}>
                          <DotsIcon />
                        </button>
                        <button className="question-table-menu" type="button" aria-label={`Supprimer ${template.title}`} onClick={() => removeAdminTemplate(template.id)}>
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : activePage === 'admin-pa-form-questions' ? (
            <section className="admin-config-page">
              <div className="admin-page-header">
                <div>
                  <p className="admin-page-kicker">Configuration</p>
                  <h2>Questions formulaire PA</h2>
                </div>
                <button className="question-create-button" type="button" onClick={() => openAdminPaQuestionEditor()}>Ajouter une question</button>
              </div>

              <div className="admin-complex-table">
                <div className="admin-complex-table-head admin-pa-grid">
                  <span>QUESTION</span>
                  <span>CATÉGORIE</span>
                  <span>RÉPONSE ATTENDUE</span>
                  <span>OBLIGATOIRE</span>
                  <span>ACTIONS</span>
                </div>

                <div className="admin-complex-table-body">
                  {adminPaFormQuestionsState.map((question) => (
                    <div className="admin-complex-table-row admin-pa-grid" key={question.id}>
                      <span>{question.label}</span>
                      <span>{question.category}</span>
                      <span>{question.expectedAnswer}</span>
                      <span>{question.required}</span>
                      <div className="admin-row-actions">
                        <button className="question-table-menu" type="button" aria-label={`Modifier ${question.id}`} onClick={() => openAdminPaQuestionEditor(question)}>
                          <DotsIcon />
                        </button>
                        <button className="question-table-menu" type="button" aria-label={`Supprimer ${question.id}`} onClick={() => removeAdminPaQuestion(question.id)}>
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : activePage === 'admin-rookie-criteria' ? (
            <section className="admin-config-page">
              <div className="admin-page-header">
                <div>
                  <p className="admin-page-kicker">Configuration</p>
                  <h2>Critères rookie</h2>
                </div>
                <button className="question-create-button" type="button" onClick={() => openAdminRookieCriterionEditor()}>Ajouter un critère</button>
              </div>

              <div className="admin-complex-table">
                <div className="admin-complex-table-head admin-rookie-grid">
                  <span>CRITÈRE</span>
                  <span>MINIMUM</span>
                  <span>MAXIMUM</span>
                  <span>CATÉGORIE</span>
                  <span>ACTIONS</span>
                </div>

                <div className="admin-complex-table-body">
                  {adminRookieCriteriaState.map((criterion) => (
                    <div className="admin-complex-table-row admin-rookie-grid" key={criterion.id}>
                      <span>{criterion.label}</span>
                      <span>{criterion.min}</span>
                      <span>{criterion.max}</span>
                      <span>{criterion.category}</span>
                      <div className="admin-row-actions">
                        <button className="question-table-menu" type="button" aria-label={`Modifier ${criterion.label}`} onClick={() => openAdminRookieCriterionEditor(criterion)}>
                          <DotsIcon />
                        </button>
                        <button className="question-table-menu" type="button" aria-label={`Supprimer ${criterion.label}`} onClick={() => removeAdminRookieCriterion(criterion.id)}>
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : activePage === 'home' ? (
            <section className="dashboard-grid">
              <div className="wanted-panel">
                <header className="panel-header">
                  <h2>Personne most wanted</h2>
                  <p>{wantedPeopleData.length} personnes recherchées</p>
                </header>

                <div className="wanted-list">
                  {wantedPeopleData.map((person) => (
                    <article className="wanted-card" key={person.id}>
                      <img
                        className="wanted-avatar"
                        src={createAvatar(person.avatarLabel, person.tones)}
                        alt={person.name}
                      />

                      <div className="wanted-details">
                        <h3>
                          {person.name} <span>({person.gender})</span>
                        </h3>

                        <div className="wanted-meta-row">
                          <span className="wanted-meta-item">
                            <PhoneIcon />
                            {person.phone}
                          </span>
                          <span className="wanted-meta-item">
                            <CalendarIcon />
                            {person.birthDate}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="notes-panel">
                <header className="panel-header panel-header-notes">
                  <h2>Bloc-note personnel</h2>
                </header>

                <textarea
                  className="notes-area"
                  value={personalNote}
                  onChange={(event) => setPersonalNote(event.target.value)}
                  aria-label="Bloc-note personnel"
                />
              </div>
            </section>
          ) : activePage === 'effectifs' ? (
            <section className="staff-page">
              <div className="records-page-header staff-page-header">
                <h2>Liste des agents du SASP</h2>
                <input
                  className="admin-grade-search staff-search"
                  type="text"
                  placeholder="Rechercher un agent..."
                  value={effectifsSearch}
                  onChange={(event) => setEffectifsSearch(event.target.value)}
                />
              </div>

              <div className="staff-table-shell">
                <div className="staff-table-head">
                  <span></span>
                  <span>MATRICULE</span>
                  <span>PRÉNOM</span>
                  <span>NOM</span>
                  <span>TÉLÉPHONE</span>
                  <span>EMAIL</span>
                </div>

                <div className="staff-table-body">
                  {filteredStaffAgents.map((agent) => {
                    const isExpanded = expandedStaffAgentId === agent.id

                    return (
                      <div className={`staff-table-group${isExpanded ? ' staff-table-group-open' : ''}`} key={agent.id}>
                        <button
                          className="staff-table-row"
                          type="button"
                          onClick={() => setExpandedStaffAgentId((current) => current === agent.id ? null : agent.id)}
                        >
                          <span className={`staff-row-chevron${isExpanded ? ' staff-row-chevron-open' : ''}`}>›</span>
                          <span>{agent.id}</span>
                          <span>{agent.firstName}</span>
                          <span>{agent.lastName}</span>
                          <span>{agent.phone}</span>
                          <span>{agent.email}</span>
                        </button>

                        {isExpanded ? (
                          <div className="staff-inline-details">
                            <article className="staff-detail-card">
                              <span className="staff-detail-label">Grade :</span>
                              <strong>{agent.grade}</strong>
                            </article>
                            <article className="staff-detail-card">
                              <span className="staff-detail-label">IBAN :</span>
                              <strong>{agent.iban}</strong>
                            </article>
                            <article className="staff-detail-card staff-detail-card-wide">
                              <span className="staff-detail-label">Date d'anniversaire :</span>
                              <strong>{agent.birthDate}</strong>
                            </article>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          ) : activePage === 'citizens' ? (
            <section className="citizens-layout">
              <div className="citizens-left-column">
                <input
                  className="citizens-search"
                  type="text"
                  placeholder="Rechercher un citoyen"
                  value={citizenSearch}
                  onChange={(event) => { setCitizenSearch(event.target.value); setCitizenPage(1) }}
                />

                <button className="encode-button" type="button" onClick={openEncodeCitizenModal}>
                  Encoder un citoyen
                </button>

                <div className="citizens-list">
                  {pagedCitizens.map((citizen) => (
                    <button
                      className={`citizen-row${citizen.id === selectedCitizenId ? ' citizen-row-active' : ''}`}
                      key={citizen.id}
                      type="button"
                      onClick={() => {
                        setSelectedCitizenId(citizen.id)
                        setActiveRecordTab('arrestation')
                        setIsCitizenMenuOpen(false)
                        setIsEditCitizenModalOpen(false)
                        setOpenCitizenRecordMenuId(null)
                      }}
                    >
                      <span className="citizen-name">{citizen.name}</span>
                      <span className="citizen-date">{citizen.birthDate}</span>
                    </button>
                  ))}
                </div>

                <Pagination className="citizens-pagination" ariaLabel="Pagination citoyens" currentPage={safecitizenPage} totalPages={totalCitizenPages} onPageChange={setCitizenPage} />
              </div>

              <div className="citizen-details-panel">
                {selectedCitizen ? (
                  <div className="citizen-details-content">
                <div className="citizen-details-topbar">
                  <div>
                    <div className="citizen-identity-line">
                      <h2>{selectedCitizen.name}</h2>
                      <span>&lt;{selectedCitizen.email}&gt;</span>
                    </div>
                    <p className="citizen-summary-line">{selectedCitizen.birthDate}</p>
                    <p className="citizen-summary-line">{selectedCitizen.phone}</p>
                    <p className="citizen-summary-line">Recensé(e) le {selectedCitizen.censusAt}</p>
                  </div>

                  <div className="citizen-menu-anchor" onPointerDown={(event) => event.stopPropagation()}>
                    <button
                      className="detail-menu-button"
                      type="button"
                      aria-label="Plus d'options"
                      onClick={() => setIsCitizenMenuOpen((current) => !current)}
                    >
                      <DotsIcon />
                    </button>

                    {isCitizenMenuOpen ? (
                      <div className="citizen-dropdown-menu">
                        {citizenMenuItems.map((item) => {
                          const Icon = item.icon

                          return (
                            <button className="citizen-dropdown-item" key={item.label} type="button" onClick={() => handleCitizenMenuAction(item.key)}>
                              <Icon />
                              <span>{item.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="citizen-divider" />

                <div className="citizen-profile-grid">
                  <div className="citizen-portrait-column">
                    <img
                      className="citizen-portrait"
                      src={createPortraitAvatar(selectedCitizen.portraitLabel, selectedCitizen.portraitTones)}
                      alt={selectedCitizen.name}
                    />

                    <div className="citizen-actions">
                      <button className="citizen-action-button" type="button" onClick={openCasierModal}>Extrait de casier judiciaire</button>
                      <button className="citizen-action-button" type="button" onClick={openMandatModal}>Demande de mandat d'arrêt</button>
                      <button className="citizen-action-button" type="button" onClick={openTicketRoutierModal}>Ecrire un ticket routier</button>
                      <button className="citizen-action-button" type="button" onClick={openArrestReportModal}>Ecrire un rapport d'arrestation</button>
                      <button className="citizen-action-button" type="button" onClick={() => openArrestDossierModal()}>Ecrire un dossier d'arrestation</button>
                      <button className="citizen-action-button" type="button" onClick={openCitizenComplaintModal}>Encoder une plainte</button>
                      <button className="citizen-action-button" type="button" onClick={openDepositionModal}>Encoder une déposition</button>
                      <button className="citizen-action-button citizen-action-button-tall" type="button" onClick={openBraceletEncodeModal}>Encoder un bracelet électronique</button>
                    </div>
                  </div>

                  <div className="citizen-info-column">
                    <div className="citizen-stats-grid">
                      {selectedCitizen.stats.map((item) => (
                        <div className="citizen-stat-item" key={item.label}>
                          <span className="citizen-stat-label">{item.label}</span>
                          {item.dot ? (
                            <span className="status-dot" aria-label={item.value ? 'Actif' : 'Inactif'} />
                          ) : (
                            <span className="citizen-stat-value">{item.value}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="citizen-records-tabs">
                      <button
                        className="records-tab records-tab-arrow"
                        type="button"
                        aria-label="Onglets précédents"
                        disabled={recordTabsOffset === 0}
                        onClick={() => setRecordTabsOffset((current) => Math.max(0, current - 1))}
                      >
                        <ChevronIcon />
                      </button>
                      {visibleRecordTabs.map((tab) => (
                        <button
                          className={`records-tab${activeRecordTab === tab.key ? ' records-tab-active' : ''}`}
                          key={tab.key}
                          type="button"
                          onClick={() => setActiveRecordTab(tab.key)}
                        >
                          {tab.label}
                        </button>
                      ))}
                      <button
                        className="records-tab records-tab-arrow records-tab-arrow-next"
                        type="button"
                        aria-label="Onglets suivants"
                        disabled={recordTabsOffset >= maxRecordTabsOffset}
                        onClick={() => setRecordTabsOffset((current) => Math.min(maxRecordTabsOffset, current + 1))}
                      >
                        <ChevronIcon />
                      </button>
                    </div>

                    {selectedRecords.length > 0 ? (
                      <div className="citizen-records-list">
                        {selectedRecords.map((record) => (
                          activeRecordTab === 'arrestation' ? (
                            <article className="citizen-record-card citizen-arrest-record-card" key={record.id}>
                              <div className="citizen-record-text citizen-arrest-record-text">
                                <p>Rapport {record.reportNumber}</p>
                                <p>Rédigé par : {record.authorId} | {record.author}</p>
                                <p>Le {record.date}</p>
                                <p>Statuts : {record.status}</p>
                              </div>

                              <div className="citizen-record-menu-anchor" onPointerDown={(event) => event.stopPropagation()}>
                                <button className="citizen-record-menu" type="button" aria-label="Options du dossier" onClick={() => setOpenCitizenRecordMenuId((current) => current === record.id ? null : record.id)}>
                                  <DotsIcon />
                                </button>

                                {openCitizenRecordMenuId === record.id ? (
                                  <div className="citizen-record-dropdown-menu">
                                    <button className="citizen-record-dropdown-item" type="button" onClick={() => openArrestDossierPreview(record)}>
                                      Lire le rapport
                                    </button>
                                    <button className="citizen-record-dropdown-item" type="button" onClick={() => openArrestDossierModal(record)}>
                                      Modifier
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                            </article>
                          ) : activeRecordTab === 'arrestReports' ? (
                            <article className="citizen-record-card" key={record.id}>
                              <div className="citizen-record-text">
                                <p>Rapport {record.reportNumber}</p>
                                <p>Ecrit par {record.author}</p>
                                <p>{record.date}</p>
                                <p>Charge(s) : {record.reason}</p>
                              </div>

                              <button className="citizen-record-menu" type="button" aria-label="Options du dossier">
                                <DotsIcon />
                              </button>
                            </article>
                          ) : activeRecordTab === 'tickets' ? (
                            <article className="citizen-record-card" key={record.id}>
                              <div className="citizen-record-text">
                                <p>Ecrit par {record.author}</p>
                                <p>{record.date}</p>
                                <p>Infraction : {record.reason}</p>
                                <p>Amende : {record.fine} $ | Points : {record.points}</p>
                              </div>

                              <button className="citizen-record-menu" type="button" aria-label="Options du dossier">
                                <DotsIcon />
                              </button>
                            </article>
                          ) : activeRecordTab === 'mandates' ? (
                            <article className="citizen-record-card" key={record.id}>
                              <div className="citizen-record-text">
                                <p>Ecrit par {record.author}</p>
                                <p>{record.date}</p>
                                <p>Motif : {record.reason}</p>
                              </div>

                              <button className="citizen-record-menu" type="button" aria-label="Options du dossier">
                                <DotsIcon />
                              </button>
                            </article>
                          ) : (
                            <article className="citizen-record-card" key={record.id}>
                              <div className="citizen-record-text">
                                <p>Ecrit par {record.author}</p>
                                <p>Le {record.date}</p>
                                <p>Raison(s) : {record.reason}</p>
                              </div>

                              <button className="citizen-record-menu" type="button" aria-label="Options du dossier">
                                <DotsIcon />
                              </button>
                            </article>
                          )
                        ))}
                      </div>
                    ) : (
                      <div className="citizen-records-empty">{recordEmptyMessages[activeRecordTab] ?? 'Aucun dossier'}</div>
                    )}
                  </div>
                </div>
                  </div>
                ) : (
                  <div className="citizen-records-empty">Selectionnez un citoyen pour afficher sa fiche.</div>
                )}
              </div>
            </section>
          ) : activePage === 'poles-specialties' ? (
            <section className="poles-page">
              <div className="poles-grid">
                {specialtyUnitsState.map((unit) => (
                  <article className="pole-card" key={unit.id}>
                    <div className="pole-card-header">
                      <h2>{unit.title}</h2>
                      <button className="pole-card-menu" type="button" aria-label={`Options ${unit.title}`}>
                        <DotsIcon />
                      </button>
                    </div>

                    <div className="pole-card-divider" />

                    <div className="pole-card-body">
                      <p><strong>Lead :</strong> {unit.lead}</p>
                      <p><strong>Co-Lead :</strong> {unit.coLead}</p>
                      {unit.supervisor ? <p><strong>Superviseur :</strong> {unit.supervisor}</p> : null}
                      <p><strong>Membres :</strong></p>

                      <ul className="pole-members-list">
                        {unit.members.map((member) => (
                          <li key={member}>{member}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : activePage === 'photo-proofs' ? (
            selectedEvidenceFolder ? (
              <section className="evidence-detail-page">
                <div className="evidence-detail-header">
                  <div>
                    <h2>{selectedEvidenceFolder.title}</h2>
                    <p>{selectedEvidenceFolder.createdAt} - Créé par {selectedEvidenceFolder.createdBy}</p>
                  </div>

                  <button className="evidence-return-button" type="button" onClick={() => setSelectedEvidenceFolderId(null)}>Retour</button>
                </div>

                <div className="evidence-upload-zone" tabIndex={0} onPaste={handlePasteIntoEvidenceFolder}>Coller une image (CTRL + V)</div>

                {selectedEvidenceImages.length > 0 ? (
                  <div className="pasted-image-grid">
                    {selectedEvidenceImages.map((image, index) => (
                      <div className="pasted-image-card" key={`${selectedEvidenceFolder.id}-${index}`}>
                        <img className="pasted-image-preview" src={image} alt={`Preuve ${index + 1}`} />
                        <button className="pasted-image-remove" type="button" onClick={() => removeEvidenceFolderImage(index)}>×</button>
                      </div>
                    ))}
                  </div>
                ) : selectedEvidenceFolder.hasImage ? (
                  <div className="evidence-photos-grid">
                    <img
                      className="evidence-photo-preview"
                      src={createEvidencePreview(selectedEvidenceFolder.imageTones)}
                      alt={selectedEvidenceFolder.title}
                    />
                  </div>
                ) : (
                  <div className="evidence-empty-state">Aucune photo pour le moment.</div>
                )}
              </section>
            ) : (
              <section className="evidence-page">
                <div className="evidence-page-header">
                  <h2>Liste des dossiers photos preuves</h2>
                  <button className="evidence-create-button" type="button" onClick={openEvidenceFolderModal}>Créer un dossier</button>
                </div>

                <div className="records-toolbar">
                  <input
                    className="records-search evidence-search"
                    type="text"
                    placeholder="Rechercher un dossier ..."
                    value={evidenceSearch}
                    onChange={(event) => setEvidenceSearch(event.target.value)}
                  />
                </div>

                <div className="evidence-grid">
                  {pagedEvidenceFolders.items.length > 0 ? pagedEvidenceFolders.items.map((folder) => (
                    <article className="evidence-card" key={folder.id}>
                      <div className="evidence-card-header">
                        <div>
                          <h3>{folder.title}</h3>
                          <p>{folder.createdAt}</p>
                          <p>Créé par {folder.createdBy}</p>
                        </div>

                        <button className="evidence-card-menu" type="button" aria-label={`Options ${folder.title}`}>
                          <DotsIcon />
                        </button>
                      </div>

                      <button className="evidence-open-button" type="button" onClick={() => setSelectedEvidenceFolderId(folder.id)}>Voir le dossier</button>
                    </article>
                  )) : (
                    <div className="evidence-empty-state evidence-empty-state-grid">Aucun dossier photo preuve pour le moment.</div>
                  )}
                </div>

                <Pagination className="vehicle-pagination" ariaLabel="Pagination preuves" currentPage={pagedEvidenceFolders.currentPage} totalPages={pagedEvidenceFolders.totalPages} onPageChange={(page) => setListPage('evidenceFolders', page)} />
              </section>
            )
          ) : activePage === 'academy-criteria-templates' ? (
            <section className="criteria-template-page">
              <div className="question-page-header">
                <h2>Template critère de notation</h2>
                <button className="question-create-button" type="button">Ajouter un template</button>
              </div>

              <div className="criteria-template-table">
                <div className="criteria-template-head">
                  <span />
                  <span>NOM</span>
                  <span>DESCRIPTION</span>
                  <span>NOMBRE DE CRITÈRES</span>
                  <span>ACTIONS</span>
                </div>

                <div className="criteria-template-body">
                  {academyCriteriaTemplates.map((template) => (
                    <div className="criteria-template-row" key={template.id}>
                      <button className="criteria-template-expand" type="button" aria-label={`Ouvrir ${template.name}`}>
                        <ChevronIcon />
                      </button>
                      <span>{template.name}</span>
                      <span>{template.description}</span>
                      <span>{template.criteriaCount}</span>
                      <button className="question-table-menu" type="button" aria-label={`Options ${template.name}`}>
                        <DotsIcon />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : activePage === 'academy-candidates' ? (
            <section className="academy-candidates-page">
              <div className="academy-candidates-header">
                <h2>Candidatures</h2>
                <button className="question-create-button" type="button" onClick={() => setActivePage('academy-sessions')}>Retour</button>
              </div>

              <div className="academy-candidates-toolbar">
                <div className="case-select-block question-filter-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="case-select-shell question-filter-shell">
                    <input value={candidateStatus} readOnly onClick={() => setIsCandidateStatusDropdownOpen((current) => !current)} />
                    <button className="case-select-button" type="button" onClick={() => setIsCandidateStatusDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isCandidateStatusDropdownOpen ? (
                    <div className="case-dropdown-list question-dropdown-list">
                      {academyCandidateStatusOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          setCandidateStatus(option)
                          setIsCandidateStatusDropdownOpen(false)
                        }}>{option}</button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <input
                  className="question-search"
                  type="text"
                  placeholder="Rechercher un candidat..."
                  value={candidateSearch}
                  onChange={(event) => setCandidateSearch(event.target.value)}
                />
              </div>

              <div className="academy-candidates-table">
                <div className="academy-candidates-head">
                  <span>PRÉNOM</span>
                  <span>NOM</span>
                  <span>STATUT</span>
                  <span>NOTE</span>
                  <span>CONTACTÉ</span>
                  <span>ACTIONS</span>
                </div>

                <div className="academy-candidates-body">
                  {filteredAcademyCandidates.map((candidate) => (
                    <div className="academy-candidates-row" key={candidate.id}>
                      <button className="academy-candidate-link" type="button" onClick={() => openAcademyCandidateDetail(candidate.id)}>{candidate.firstName}</button>
                      <span>{candidate.lastName}</span>
                      <span>{candidate.status}</span>
                      <span>{candidate.note}</span>
                      <span className="candidate-contact-cell"><span className="candidate-contact-dot" />{candidate.contacted ? 'Oui' : 'Non'}</span>
                      <button className="question-table-menu" type="button" aria-label={`Options ${candidate.firstName} ${candidate.lastName}`}>
                        <DotsIcon />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : activePage === 'academy-candidate-detail' ? (
            <section className="academy-candidate-detail-page">
              <div className="academy-candidates-header">
                <div />
                <button className="question-create-button" type="button" onClick={() => setActivePage('academy-candidates')}>Retour</button>
              </div>

              <div className="candidate-profile-card">
                <img
                  className="candidate-profile-avatar"
                  src={createPortraitAvatar(selectedAcademyCandidate.avatarLabel, selectedAcademyCandidate.portraitTones)}
                  alt={`${selectedAcademyCandidate.firstName} ${selectedAcademyCandidate.lastName}`}
                />

                <div className="candidate-profile-main">
                  <h2>{selectedAcademyCandidate.firstName} {selectedAcademyCandidate.lastName}</h2>

                  <div className="candidate-profile-stats">
                    <div className="candidate-profile-stat">
                      <span>Téléphone:</span>
                      <strong>{selectedAcademyCandidate.phone}</strong>
                    </div>
                    <div className="candidate-profile-stat">
                      <span>Email:</span>
                      <strong>{selectedAcademyCandidate.email}</strong>
                    </div>
                    <div className="candidate-profile-stat">
                      <span>Statut:</span>
                      <strong>{selectedAcademyCandidate.status}</strong>
                    </div>
                    <div className="candidate-profile-stat">
                      <span>Contacté:</span>
                      <strong className="candidate-contact-inline"><span className="candidate-contact-dot" />{selectedAcademyCandidate.contacted ? 'Oui' : 'Non'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {selectedAcademyCandidate.formSections.map((section) => (
                <article className="candidate-section-card" key={section.id}>
                  <header className="candidate-section-header">
                    <h3>{section.title}</h3>
                    <ChevronIcon expanded />
                  </header>

                  <div className="candidate-section-body">
                    {section.blocks.map((block) => (
                      <div className="candidate-answer-block" key={block.id}>
                        <h4>{block.title}</h4>
                        <div className="candidate-answer-content">
                          {block.content.map((line, index) => (
                            <p key={`${block.id}-${index}`}>{line || <br />}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}

              <article className="candidate-section-card">
                <header className="candidate-section-header">
                  <h3>Commentaire global</h3>
                  <ChevronIcon expanded />
                </header>
              </article>

              <div className="candidate-decision-row">
                <button className="candidate-decision-button candidate-decision-button-accept" type="button">Valider la candidature pour la PA</button>
                <button className="candidate-decision-button candidate-decision-button-reject" type="button">Refuser la candidature pour la PA</button>
              </div>
            </section>
          ) : activePage === 'academy-sessions' ? (
            <section className="session-page">
              <div className="question-page-header">
                <h2>Sessions P.A</h2>
                <button className="question-create-button" type="button" onClick={() => {
                  setAddSessionForm(buildAcademySessionFormValues())
                  setIsAddSessionModalOpen(true)
                }}>Ajouter une session</button>
              </div>

              <div className="session-toolbar">
                <div className="case-select-block question-filter-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="case-select-shell question-filter-shell">
                    <input value={sessionTypeFilter} readOnly onClick={() => setIsSessionTypeDropdownOpen((current) => !current)} />
                    <button className="case-select-button" type="button" onClick={() => setIsSessionTypeDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isSessionTypeDropdownOpen ? (
                    <div className="case-dropdown-list question-dropdown-list">
                      {academySessionTypeOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          setSessionTypeFilter(option)
                          setIsSessionTypeDropdownOpen(false)
                        }}>{option}</button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <input
                  className="question-search session-search"
                  type="text"
                  placeholder="Rechercher une session..."
                  value={sessionSearch}
                  onChange={(event) => setSessionSearch(event.target.value)}
                />
              </div>

              <div className="session-table">
                <div className="session-table-head">
                  <span>NOM</span>
                  <span>TYPE</span>
                  <span>STATUT</span>
                  <span>NOMBRE CANDIDATS</span>
                  <span>TEMPLATE DE CRITÈRE</span>
                  <span>ACTIONS</span>
                </div>

                <div className="session-table-body">
                  {filteredAcademySessions.map((session) => (
                    <div className="session-table-row" key={session.id}>
                      <button className="academy-candidate-link academy-candidate-link-inline" type="button" onClick={() => openAcademyCandidatesPage(session.id)}>{session.name}</button>
                      <span>{session.type}</span>
                      <span>{session.status}</span>
                      <button className="academy-candidate-link academy-candidate-count" type="button" onClick={() => openAcademyCandidatesPage(session.id)}>{session.candidates}</button>
                      <span>{session.template}</span>
                      <div className="session-action-anchor" onPointerDown={(event) => event.stopPropagation()}>
                        <button className="question-table-menu" type="button" aria-label={`Options ${session.name}`} onClick={() => setOpenSessionMenuId((current) => current === session.id ? null : session.id)}>
                          <DotsIcon />
                        </button>

                        {openSessionMenuId === session.id ? (
                          <div className="session-action-menu">
                            <button className="session-action-item" type="button" onClick={() => openEditSessionModal(session)}>Modifier</button>
                            <button className="session-action-item" type="button" onClick={() => setOpenSessionMenuId(null)}>Choisir questions du test final</button>
                            <button className="session-action-item session-action-item-danger" type="button" onClick={() => openDeleteSessionModal(session)}>Supprimer</button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : activePage === 'final-test-questions' ? (
            <section className="question-page">
              <div className="question-page-header">
                <h2>Questions test final</h2>
                <button className="question-create-button" type="button">Ajouter une question</button>
              </div>

              <div className="question-toolbar">
                <div className="case-select-block question-filter-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="case-select-shell question-filter-shell">
                    <input value={finalQuestionStatus} readOnly onClick={() => setIsFinalQuestionStatusDropdownOpen((current) => !current)} />
                    <button className="case-select-button" type="button" onClick={() => setIsFinalQuestionStatusDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isFinalQuestionStatusDropdownOpen ? (
                    <div className="case-dropdown-list question-dropdown-list">
                      {finalQuestionStatusOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          setFinalQuestionStatus(option)
                          setIsFinalQuestionStatusDropdownOpen(false)
                        }}>{option}</button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="case-select-block question-filter-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="case-select-shell question-filter-shell">
                    <input value={finalQuestionCategory} readOnly onClick={() => setIsFinalQuestionCategoryDropdownOpen((current) => !current)} />
                    <button className="case-select-button" type="button" onClick={() => setIsFinalQuestionCategoryDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isFinalQuestionCategoryDropdownOpen ? (
                    <div className="case-dropdown-list question-dropdown-list">
                      {finalQuestionCategoryOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          setFinalQuestionCategory(option)
                          setIsFinalQuestionCategoryDropdownOpen(false)
                        }}>{option}</button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <input
                  className="question-search"
                  type="text"
                  placeholder="Rechercher une question..."
                  value={finalQuestionSearch}
                  onChange={(event) => setFinalQuestionSearch(event.target.value)}
                />
              </div>

              <div className="question-table">
                <div className="question-table-head">
                  <span>QUESTION</span>
                  <span>ATTENDUE</span>
                  <span>POINT</span>
                  <span>CATÉGORIE</span>
                  <span>ACTIONS</span>
                </div>

                <div className="question-table-body">
                  {filteredFinalTestQuestions.map((item) => (
                    <div className="question-table-row" key={item.id}>
                      <span>{item.question}</span>
                      <span>{item.expectedAnswer}</span>
                      <span>{item.points}</span>
                      <span>{item.category}</span>
                      <button className="question-table-menu" type="button" aria-label={`Options ${item.id}`}>
                        <DotsIcon />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : activePage === 'rookie-follow-up' ? (
            <section className="rookie-page">
              <div className="rookie-sidebar">
                <div className="rookie-header-row">
                  <h2>Suivi rookies</h2>
                  <button className="rookie-create-button" type="button" aria-label="Ajouter un rookie">+</button>
                </div>

                <div className="case-select-block rookie-select-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="case-select-shell rookie-select-shell">
                    <input
                      placeholder="Choisir une session"
                      value={rookieSession}
                      readOnly
                      onClick={() => setIsRookieSessionDropdownOpen((current) => !current)}
                    />
                    <button className="case-select-button" type="button" onClick={() => setIsRookieSessionDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>

                  {isRookieSessionDropdownOpen ? (
                    <div className="case-dropdown-list rookie-dropdown-list">
                      {rookieSessionOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          setRookieSession(option)
                          setIsRookieSessionDropdownOpen(false)
                        }}>{option}</button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <input
                  className="rookie-search"
                  type="text"
                  placeholder="Rechercher un rookie ..."
                  value={rookieSearch}
                  onChange={(event) => setRookieSearch(event.target.value)}
                />

                <div className="rookie-list">
                  {pagedRookies.items.map((rookie) => (
                    <button
                      className={`rookie-list-card${selectedRookie?.id === rookie.id ? ' rookie-list-card-active' : ''}`}
                      key={rookie.id}
                      type="button"
                      onClick={() => setSelectedRookieId(rookie.id)}
                    >
                      <strong>Rookie : {rookie.name}</strong>
                      <span>Arrivé le : {rookie.arrivedAt}</span>
                      <span>Pas de FL validé</span>
                    </button>
                  ))}
                </div>

                <Pagination className="rookie-sidebar-pagination" ariaLabel="Pagination rookies" currentPage={pagedRookies.currentPage} totalPages={pagedRookies.totalPages} onPageChange={(page) => setListPage('rookies', page)} />
              </div>

              {selectedRookie ? (
                <section className="rookie-detail-panel">
                  <div className="rookie-detail-header">
                    <h3>{selectedRookie.name}</h3>
                  </div>

                  <div className="rookie-summary-grid">
                    <article className="rookie-summary-card">
                      <span className="rookie-summary-label">Référent:</span>
                      <strong>{selectedRookie.referent}</strong>
                    </article>
                    <article className="rookie-summary-card">
                      <span className="rookie-summary-label">Session:</span>
                      <strong>{selectedRookie.session}</strong>
                    </article>
                    <article className="rookie-summary-card">
                      <span className="rookie-summary-label">Statut:</span>
                      <strong className="rookie-summary-status">{selectedRookie.status}</strong>
                    </article>
                    <article className="rookie-summary-card">
                      <span className="rookie-summary-label">Progression:</span>
                      <strong>{selectedRookieProgressPercent}%</strong>
                    </article>
                  </div>

                  <div className="rookie-detail-tabs">
                    <button className="rookie-detail-tab rookie-detail-tab-active" type="button">
                      Critères ({selectedRookieCompletedCriteria}/{selectedRookieCriteriaEntries.length})
                    </button>
                    <button className="rookie-detail-tab" type="button">{selectedRookie.reportsLabel}</button>
                  </div>

                  <div className="rookie-progress-panel">
                    <div className="rookie-progress-header">
                      <span>PROGRESSION GLOBALE</span>
                      <strong>{selectedRookieCompletedCriteria}/{selectedRookieCriteriaEntries.length} ({selectedRookieProgressPercent}%)</strong>
                    </div>
                    <div className="rookie-progress-track" aria-hidden="true">
                      <span className="rookie-progress-fill" style={{ width: `${selectedRookieProgressPercent}%` }} />
                    </div>
                  </div>

                  <div className="rookie-criteria-table">
                    <div className="rookie-criteria-head">
                      <span>STATUT</span>
                      <span>N°</span>
                      <span>CRITÈRE</span>
                      <span>ACTION</span>
                    </div>

                    <div className="rookie-criteria-body">
                      {selectedRookieCriteriaEntries.map((criterion, index) => {
                        const isValidated = selectedRookieChecklist[criterion.id] ?? false

                        return (
                          <div className={`rookie-criteria-row${isValidated ? ' rookie-criteria-row-validated' : ''}`} key={criterion.id}>
                            <span>
                              <span className={`rookie-criterion-badge${isValidated ? ' rookie-criterion-badge-valid' : ''}`}>
                                {isValidated ? 'Validé' : 'Non validé'}
                              </span>
                            </span>
                            <span>{index + 1}</span>
                            <span>{criterion.name}</span>
                            <label className="rookie-criterion-checkbox" aria-label={`Valider ${criterion.name}`}>
                              <input
                                type="checkbox"
                                checked={isValidated}
                                onChange={() => toggleRookieCriterion(selectedRookie.id, criterion.id)}
                              />
                              <span className="rookie-criterion-checkmark" />
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>
              ) : (
                <div className="rookie-empty-panel">Sélectionnez un rookie pour afficher ses informations.</div>
              )}
            </section>
          ) : activePage === 'agent-statistics' ? (
            <section className="agent-stats-page">
              <div className="agent-stats-sidebar">
                <input
                  className="agent-stats-search"
                  type="text"
                  placeholder="Rechercher un officier..."
                  value={agentSearch}
                  onChange={(event) => setAgentSearch(event.target.value)}
                />

                <div className="agent-stats-list">
                  {pagedAgentStatistics.items.map((agent) => (
                    <button
                      className={`agent-stats-row${agent.id === selectedAgentStatisticId ? ' agent-stats-row-active' : ''}`}
                      key={agent.id}
                      type="button"
                      onClick={() => setSelectedAgentStatisticId(agent.id)}
                    >
                      {agent.id} | {agent.name}
                    </button>
                  ))}
                </div>

                <Pagination className="agent-stats-pagination" ariaLabel="Pagination agents" currentPage={pagedAgentStatistics.currentPage} totalPages={pagedAgentStatistics.totalPages} onPageChange={(page) => setListPage('agentStatistics', page)} />
              </div>

              {selectedAgentStatistic ? (
                <div className="agent-stats-detail">
                  <div className="agent-stats-detail-header">
                    <h2>{selectedAgentStatistic.name} <span>{`<${selectedAgentStatistic.email}>`}</span></h2>
                    <p>{selectedAgentStatistic.phone}</p>
                    <p>Arrivé le : le {selectedAgentStatistic.arrivalDate}</p>
                  </div>

                  <div className="agent-stats-divider" />

                  <div className="agent-stats-grid">
                    {selectedAgentStatistic.metrics.map((metric) => (
                      <div className="agent-stat-item" key={metric.label}>
                        <span className="agent-stat-label">{metric.label}</span>
                        <span className="agent-stat-value">{metric.value}</span>
                      </div>
                    ))}
                  </div>

                  <p className="agent-stats-footer">En cours de développement</p>
                </div>
              ) : (
                <div className="agent-stats-empty">Sélectionnez un officier pour afficher ses informations.</div>
              )}
            </section>
          ) : isInterrogationPage ? (
            <section className="records-page">
              <div className="records-page-header">
                <h2>{interrogationPageTitle}</h2>

                {activePage === 'interrogations' ? (
                  <button className="records-create-button" type="button" onClick={openInterrogationModal}>
                    Créer un interrogatoire
                  </button>
                ) : null}
              </div>

              <div className="records-toolbar">
                <input
                  className="records-search"
                  type="text"
                  placeholder="Rechercher un interrogatoire"
                  value={interrogationSearch}
                  onChange={(event) => setInterrogationSearch(event.target.value)}
                />
              </div>

              <div className="records-table">
                <div className="records-table-head interrogation-table-head">
                  <span>NUMÉRO</span>
                  <span>DATE</span>
                  <span>NOM / PRÉNOM</span>
                  <span />
                </div>

                {filteredInterrogationEntries.length > 0 ? (
                  <div className="interrogation-table-body">
                    {filteredInterrogationEntries.map((entry) => (
                      <div className="interrogation-table-row" key={entry.id}>
                        <span>{entry.id}</span>
                        <span>{entry.dateTime}</span>
                        <span>{entry.citizen}</span>
                        <button className="question-table-menu interrogation-row-menu" type="button" aria-label={`Options interrogatoire ${entry.id}`}>
                          <DotsIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="records-table-empty">Aucun interrogatoire trouvé</div>
                )}
              </div>
            </section>
          ) : activePage === 'complaint-registry' ? (
            <section className="complaint-page">
              <div className="vehicle-page-header complaint-page-header">
                <h2>Liste des plaintes</h2>
                <button className="records-create-button" type="button">
                  Créer une plainte
                </button>
              </div>

              <div className="complaint-toolbar">
                <div className="case-select-shell complaint-filter-shell">
                  <button
                    className="case-select-button complaint-filter-button"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setIsComplaintStatusDropdownOpen((current) => !current)
                    }}
                  >
                    <span>{complaintStatus}</span>
                    <SelectCaretIcon />
                  </button>

                  {isComplaintStatusDropdownOpen ? (
                    <div className="question-dropdown-list complaint-dropdown-list" onClick={(event) => event.stopPropagation()}>
                      {complaintStatusOptions.map((option) => (
                        <button
                          key={option}
                          className={`question-dropdown-item${option === complaintStatus ? ' question-dropdown-item-active' : ''}`}
                          type="button"
                          onClick={() => {
                            setComplaintStatus(option)
                            setIsComplaintStatusDropdownOpen(false)
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <input
                  className="records-search complaint-search"
                  type="text"
                  placeholder="Rechercher une plainte"
                  value={complaintSearch}
                  onChange={(event) => setComplaintSearch(event.target.value)}
                />
              </div>

              <div className="complaint-table-shell">
                <div className="complaint-table-head">
                  <span></span>
                  <span>DATE DE CRÉATION</span>
                  <span>NOM PRÉNOM DU PLAIGNANT</span>
                  <span>STATUT</span>
                  <span>ACTIONS</span>
                </div>

                <div className="complaint-table-body">
                  {pagedComplaints.items.map((complaint) => {
                    const isSelected = selectedComplaint?.id === complaint.id
                    const statusClassName = complaintStatusClassMap[complaint.status] ?? 'complaint-status-default'

                    return (
                      <div className={`complaint-table-group${isSelected ? ' complaint-table-group-active' : ''}`} key={complaint.id}>
                        <div className="complaint-table-row">
                          <button
                            className={`vehicle-row-chevron complaint-row-chevron${isSelected ? ' complaint-row-chevron-open' : ''}`}
                            type="button"
                            aria-label={`Ouvrir ${complaint.citizen}`}
                            onClick={() => setSelectedComplaintId((current) => (current === complaint.id ? null : complaint.id))}
                          >
                            ›
                          </button>
                          <span>{complaint.date}</span>
                          <span>{complaint.citizen}</span>
                          <span>
                            <span className={`complaint-status-pill ${statusClassName}`}>
                              <span className="complaint-status-dot" />
                              {complaint.status}
                            </span>
                          </span>
                          <button className="vehicle-row-menu" type="button" aria-label={`Actions ${complaint.citizen}`}>
                            <DotsIcon />
                          </button>
                        </div>

                        {isSelected ? (
                          <div className="complaint-expanded-row">
                            <div className="complaint-expanded-card">
                              <span className="complaint-expanded-label">Plaignant</span>
                              <strong>{complaint.citizen}</strong>
                            </div>
                            <div className="complaint-expanded-card">
                              <span className="complaint-expanded-label">Agent en charge</span>
                              <strong>{complaint.officer}</strong>
                            </div>
                            <div className="complaint-expanded-card">
                              <span className="complaint-expanded-label">Déposée contre</span>
                              <strong>{complaint.against}</strong>
                            </div>
                            <div className="complaint-expanded-card">
                              <span className="complaint-expanded-label">Motif</span>
                              <strong>{complaint.reasons}</strong>
                            </div>
                            <div className="complaint-expanded-card complaint-expanded-card-wide">
                              <span className="complaint-expanded-label">Raison du statut</span>
                              <strong>{complaint.statusReason}</strong>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>

              <Pagination className="vehicle-pagination complaint-pagination" ariaLabel="Pagination plaintes" currentPage={pagedComplaints.currentPage} totalPages={pagedComplaints.totalPages} onPageChange={(page) => setListPage('complaints', page)} />
            </section>
          ) : activePage === 'offense-registry' ? (
            <section className="offense-registry-page">
              <div className="records-page-header offense-registry-header">
                <h2>Liste des charges</h2>
              </div>

              <div className="offense-registry-toolbar">
                <div className="case-select-block question-filter-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="case-select-shell question-filter-shell offense-registry-filter-shell">
                    <input value={offenseCategory} readOnly onClick={() => setIsOffenseCategoryDropdownOpen((current) => !current)} />
                    <button className="case-select-button" type="button" onClick={() => setIsOffenseCategoryDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isOffenseCategoryDropdownOpen ? (
                    <div className="case-dropdown-list question-dropdown-list">
                      {adminChargeCategoryOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          setOffenseCategory(option)
                          setIsOffenseCategoryDropdownOpen(false)
                        }}>{option}</button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <input
                  className="admin-grade-search offense-registry-search"
                  type="text"
                  placeholder="Rechercher une charge..."
                  value={offenseSearch}
                  onChange={(event) => setOffenseSearch(event.target.value)}
                />
              </div>

              <div className="admin-complex-table offense-registry-table">
                <div className="admin-complex-table-head offense-registry-grid">
                  <span>NOM</span>
                  <span>TYPE</span>
                  <span>AMENDE</span>
                  <span>INSTRUCTION</span>
                  <span>TEMPS PRISON (HH:MM:SS)</span>
                </div>

                <div className="admin-complex-table-body">
                  {pagedOffenseCharges.items.map((charge) => (
                    <div className="admin-complex-table-row offense-registry-grid" key={charge.id}>
                      <span>{charge.name}</span>
                      <span>{charge.type}</span>
                      <span>{charge.fine}</span>
                      <span>{charge.instruction}</span>
                      <span>{charge.jail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Pagination className="vehicle-pagination offense-registry-pagination" ariaLabel="Pagination charges MDT" currentPage={pagedOffenseCharges.currentPage} totalPages={pagedOffenseCharges.totalPages} onPageChange={(page) => setListPage('offenseCharges', page)} />
            </section>
          ) : activePage === 'operation-reports' ? (
            <section className="operation-page">
              <div className="incident-left-column">
                <div className="incident-header-row">
                  <h2>Rapports d'opération</h2>

                  <button className="incident-create-button" type="button" aria-label="Créer un rapport d'opération" onClick={openOperationReportCreateModal}>
                    +
                  </button>
                </div>

                <input
                  className="records-search operation-search"
                  type="text"
                  placeholder="Rechercher un numéro de rapport ..."
                  value={operationReportsSearch}
                  onChange={(event) => setOperationReportsSearch(event.target.value)}
                />

                <div className="incident-list operation-list">
                  {filteredOperationReports.map((report) => (
                    <button
                      className={`incident-card operation-card${report.id === selectedOperationReportId ? ' incident-card-active' : ''}`}
                      key={report.id}
                      type="button"
                      onClick={() => setSelectedOperationReportId(report.id)}
                    >
                      <div className="incident-card-topbar">
                        <span>{report.reportNumber}</span>
                        <span className="incident-card-menu" aria-hidden="true">
                          <DotsIcon />
                        </span>
                      </div>
                      <span>Par {report.author}</span>
                      <span>{report.incidentType}</span>
                      <span>Le {report.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedOperationReport ? (
                <section className="operation-detail-panel">
                  <div className="operation-detail-header">
                    <div>
                      <h2>{selectedOperationReport.incidentType}</h2>
                      <p>{selectedOperationReport.reportNumber} • {selectedOperationReport.location}</p>
                    </div>
                    <span className="operation-detail-date">{selectedOperationReport.dateTime}</span>
                  </div>

                  <div className="operation-summary-grid">
                    <article className="operation-summary-card">
                      <span>Rédacteur</span>
                      <strong>{selectedOperationReport.author}</strong>
                    </article>
                    <article className="operation-summary-card">
                      <span>Lead négociateur</span>
                      <strong>{selectedOperationReport.negotiationLead}</strong>
                    </article>
                    <article className="operation-summary-card">
                      <span>Lead terrain</span>
                      <strong>{selectedOperationReport.fieldLead}</strong>
                    </article>
                    <article className="operation-summary-card">
                      <span>Otages</span>
                      <strong>{selectedOperationReport.selectedHostages.length ? selectedOperationReport.selectedHostages.join(', ') : 'Aucun'}</strong>
                    </article>
                  </div>

                  <div className="operation-detail-sections">
                    <article className="operation-detail-card">
                      <span className="operation-detail-label">Officiers impliqués</span>
                      <div className="case-tags-wrap operation-tags-wrap">
                        {selectedOperationReport.selectedOfficers.map((officer) => (
                          <span className="case-tag" key={officer}>{officer}</span>
                        ))}
                      </div>
                    </article>

                    <article className="operation-detail-card">
                      <span className="operation-detail-label">Revendications</span>
                      <p>{selectedOperationReport.claims}</p>
                    </article>

                    <article className="operation-detail-card operation-detail-card-wide">
                      <span className="operation-detail-label">Rapport complet</span>
                      <p>{selectedOperationReport.report}</p>
                    </article>

                    <article className="operation-detail-card">
                      <span className="operation-detail-label">Dossiers preuves</span>
                      <div className="case-tags-wrap operation-tags-wrap">
                        {selectedOperationReport.proofFolders.length ? selectedOperationReport.proofFolders.map((folder) => (
                          <span className="case-tag" key={folder}>{folder}</span>
                        )) : <span className="operation-inline-empty">Aucun dossier lié</span>}
                      </div>
                    </article>

                    <article className="operation-detail-card">
                      <span className="operation-detail-label">Photos preuves</span>
                      {selectedOperationReport.proofImages.length ? (
                        <div className="pasted-image-grid pasted-image-grid-compact operation-images-grid">
                          {selectedOperationReport.proofImages.map((image, index) => (
                            <article className="pasted-image-card" key={`${selectedOperationReport.id}-${index}`}>
                              <img className="pasted-image-preview" src={image} alt={`Preuve ${index + 1}`} />
                            </article>
                          ))}
                        </div>
                      ) : (
                        <span className="operation-inline-empty">Aucune photo ajoutée</span>
                      )}
                    </article>
                  </div>
                </section>
              ) : (
                <section className="operation-empty-panel">
                  <span>Sélectionnez un rapport pour afficher ses informations.</span>
                </section>
              )}
            </section>
          ) : activePage === 'bracelet-registry' ? (
            <section className="bracelet-page">
              <div className="weapon-page-header bracelet-page-header">
                <h2>Liste des bracelets électroniques</h2>
              </div>

              <div className="records-toolbar bracelet-toolbar">
                <input
                  className="records-search bracelet-search"
                  type="text"
                  placeholder="Rechercher un bracelet élec'"
                  value={braceletSearch}
                  onChange={(event) => setBraceletSearch(event.target.value)}
                />
              </div>

              <div className="bracelet-table-shell">
                <div className="bracelet-table-head">
                  <span></span>
                  <span>CITOYEN</span>
                  <span>OFFICIER</span>
                  <span>NPRE</span>
                  <span>ACTIONS</span>
                </div>

                <div className="bracelet-table-body">
                  {pagedBraceletEntries.items.map((bracelet) => {
                    const isExpanded = expandedBraceletId === bracelet.id

                    return (
                      <div className={`bracelet-table-group${isExpanded ? ' bracelet-table-group-open' : ''}`} key={bracelet.id}>
                        <div className="bracelet-table-row">
                          <button className={`vehicle-row-chevron bracelet-row-chevron${isExpanded ? ' complaint-row-chevron-open' : ''}`} type="button" aria-label={`Ouvrir ${bracelet.citizen}`} onClick={() => setExpandedBraceletId((current) => current === bracelet.id ? null : bracelet.id)}>
                            ›
                          </button>
                          <span>{bracelet.citizen}</span>
                          <span>{bracelet.officer}</span>
                          <span>{bracelet.npre}</span>
                          <button className="vehicle-row-menu" type="button" aria-label={`Actions ${bracelet.citizen}`}>
                            <DotsIcon />
                          </button>
                        </div>

                        {isExpanded ? (
                          <div className="bracelet-expanded-row">
                            <article className="bracelet-expanded-card">
                              <span className="bracelet-expanded-label">Mis :</span>
                              <strong>{bracelet.placedAt}</strong>
                            </article>
                            <article className="bracelet-expanded-card">
                              <span className="bracelet-expanded-label">Expire le :</span>
                              <strong>{bracelet.expiresAt}</strong>
                            </article>
                            <article className="bracelet-expanded-card">
                              <span className="bracelet-expanded-label">Dernier pointage :</span>
                              <strong>{bracelet.lastCheckIn}</strong>
                            </article>
                            <article className="bracelet-expanded-card">
                              <span className="bracelet-expanded-label">Raison(s) :</span>
                              <strong>{bracelet.reasons}</strong>
                            </article>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>

              <Pagination className="vehicle-pagination bracelet-pagination" ariaLabel="Pagination bracelets" currentPage={pagedBraceletEntries.currentPage} totalPages={pagedBraceletEntries.totalPages} onPageChange={(page) => setListPage('bracelets', page)} />
            </section>
          ) : activePage === 'boot-registry' ? (
            <section className="boot-page">
              <div className="weapon-page-header boot-page-header">
                <h2>Liste des sabots</h2>
                <button className="records-create-button" type="button">Ajouter un sabot</button>
              </div>

              <div className="records-toolbar boot-toolbar">
                <input
                  className="records-search boot-search"
                  type="text"
                  placeholder="Rechercher un sabot..."
                  value={bootSearch}
                  onChange={(event) => setBootSearch(event.target.value)}
                />
              </div>

              <div className="boot-table-shell">
                <div className="boot-table-head">
                  <span></span>
                  <span>DATE</span>
                  <span>MODÈLE</span>
                  <span>PLAQUE</span>
                </div>

                <div className="boot-table-body">
                  {pagedBootEntries.items.map((boot) => (
                    <div className="boot-table-row" key={boot.id}>
                      <button className="vehicle-row-chevron boot-row-chevron" type="button" aria-label={`Ouvrir ${boot.plate}`}>
                        ›
                      </button>
                      <span>{boot.date}</span>
                      <span>{boot.model}</span>
                      <span>{boot.plate}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Pagination className="vehicle-pagination boot-pagination" ariaLabel="Pagination sabots" currentPage={pagedBootEntries.currentPage} totalPages={pagedBootEntries.totalPages} onPageChange={(page) => setListPage('boots', page)} />
            </section>
          ) : activePage === 'weapon-registry' ? (
            <section className="weapon-page">
              <div className="weapon-page-header">
                <h2>Registre des armes</h2>
                <button className="records-create-button" type="button" onClick={openWeaponEncodeModal}>Encoder une arme</button>
              </div>

              <div className="weapon-toolbar-row">
                <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="weapon-filter-shell">
                    <input value={weaponOriginFilter} readOnly onClick={() => setIsWeaponOriginFilterDropdownOpen((current) => !current)} />
                    <button className="case-select-button" type="button" onClick={() => setIsWeaponOriginFilterDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isWeaponOriginFilterDropdownOpen ? (
                    <div className="case-dropdown-list weapon-filter-dropdown">
                      {weaponOriginOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          setWeaponOriginFilter(option)
                          setIsWeaponOriginFilterDropdownOpen(false)
                        }}>
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="weapon-filter-shell">
                    <input value={weaponStateFilter} readOnly onClick={() => setIsWeaponStateFilterDropdownOpen((current) => !current)} />
                    <button className="case-select-button" type="button" onClick={() => setIsWeaponStateFilterDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isWeaponStateFilterDropdownOpen ? (
                    <div className="case-dropdown-list weapon-filter-dropdown">
                      {weaponStateOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          setWeaponStateFilter(option)
                          setIsWeaponStateFilterDropdownOpen(false)
                        }}>
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <input
                  className="records-search weapon-search-input"
                  type="text"
                  placeholder="Rechercher une arme..."
                  value={weaponSearch}
                  onChange={(event) => setWeaponSearch(event.target.value)}
                />
              </div>

              <div className="weapon-table">
                <div className="weapon-table-head">
                  <span></span>
                  <span>DATE D'ENREGISTREMENT</span>
                  <span>N° DE SÉRIE</span>
                  <span>MODÈLE</span>
                  <span>STATUT</span>
                  <span>ACTIONS</span>
                </div>

                <div className="weapon-table-body">
                  {pagedWeaponEntries.items.map((weapon) => {
                    const isExpanded = expandedWeaponId === weapon.id

                    return (
                      <div className={`weapon-table-group${isExpanded ? ' weapon-table-group-open' : ''}`} key={weapon.id}>
                        <div className="weapon-table-row">
                          <button className={`vehicle-row-chevron weapon-row-chevron${isExpanded ? ' complaint-row-chevron-open' : ''}`} type="button" aria-label={`Ouvrir ${weapon.serial}`} onClick={() => setExpandedWeaponId((current) => current === weapon.id ? null : weapon.id)}>
                            ›
                          </button>
                          <span>{weapon.date}</span>
                          <span>{weapon.serial}</span>
                          <span>{weapon.model}</span>
                          <span>{weapon.status}</span>
                          <div className="weapon-row-menu-anchor" onPointerDown={(event) => event.stopPropagation()}>
                            <button className="vehicle-row-menu" type="button" aria-label={`Actions ${weapon.serial}`} onClick={() => setOpenWeaponMenuId((current) => current === weapon.id ? null : weapon.id)}>
                              <DotsIcon />
                            </button>

                            {openWeaponMenuId === weapon.id ? (
                              <div className="weapon-row-menu-dropdown">
                                <button className="weapon-row-menu-item" type="button" onClick={() => openWeaponEditModal(weapon)}>
                                  Modifier
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {isExpanded ? (
                          <div className="weapon-expanded-panel">
                            <article className="weapon-detail-card">
                              <span className="weapon-detail-label">Origine :</span>
                              <strong>{weapon.origin}</strong>
                            </article>
                            <article className="weapon-detail-card">
                              <span className="weapon-detail-label">Raison encodage :</span>
                              <strong>{weapon.reason || '--'}</strong>
                            </article>
                            <article className="weapon-detail-card">
                              <span className="weapon-detail-label">Policier assigné :</span>
                              <strong>{weapon.assignedOfficer || '--'}</strong>
                            </article>
                            <article className="weapon-detail-card">
                              <span className="weapon-detail-label">Volée :</span>
                              <strong>{weapon.stolen ? 'Oui' : 'Non'}</strong>
                            </article>
                            <article className="weapon-detail-card">
                              <span className="weapon-detail-label">Archivée :</span>
                              <strong>{weapon.archived ? 'Oui' : 'Non'}</strong>
                            </article>
                            <article className="weapon-detail-card">
                              <span className="weapon-detail-label">Checké P.S :</span>
                              <strong>{weapon.checkedPs ? 'Oui' : 'Non'}</strong>
                            </article>
                            <article className="weapon-detail-card weapon-detail-card-wide">
                              <span className="weapon-detail-label">Encodé par :</span>
                              <strong>{weapon.encodedBy}</strong>
                            </article>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>

              <Pagination className="vehicle-pagination" ariaLabel="Pagination armes" currentPage={pagedWeaponEntries.currentPage} totalPages={pagedWeaponEntries.totalPages} onPageChange={(page) => setListPage('weapons', page)} />
            </section>
          ) : activePage === 'vehicle-offenses' ? (
            <section className="vehicle-page">
              <div className="vehicle-page-header">
                <h2>Registre des véhicules en infraction</h2>
                <button className="records-create-button" type="button" onClick={openAddVehicleModal}>Ajouter un véhicule</button>
              </div>

              <div className="records-toolbar">
                <input
                  className="records-search vehicle-search"
                  type="text"
                  placeholder="Rechercher une plaque..."
                  value={vehicleSearch}
                  onChange={(event) => setVehicleSearch(event.target.value)}
                />
              </div>

              <div className="vehicle-table">
                <div className="vehicle-table-head">
                  <span></span>
                  <span>TYPE</span>
                  <span>PLAQUE</span>
                  <span>ENREGISTRÉ LE</span>
                  <span>FAITS</span>
                  <span>ACTIONS</span>
                </div>

                <div className="vehicle-table-body">
                  {pagedOffenseVehicles.items.map((vehicle) => {
                    const isExpanded = expandedOffenseVehicleId === vehicle.id

                    return (
                      <div className={`vehicle-table-group${isExpanded ? ' vehicle-table-group-open' : ''}`} key={vehicle.id}>
                        <div className="vehicle-table-row">
                          <button className={`vehicle-row-chevron${isExpanded ? ' complaint-row-chevron-open' : ''}`} type="button" aria-label={`Ouvrir ${vehicle.plate}`} onClick={() => setExpandedOffenseVehicleId((current) => current === vehicle.id ? null : vehicle.id)}>
                            ›
                          </button>
                          <span>{vehicle.type}</span>
                          <span>{vehicle.plate}</span>
                          <span>{vehicle.registeredAt}</span>
                          <span>{vehicle.facts}</span>
                          <button className="vehicle-row-menu" type="button" aria-label={`Actions ${vehicle.plate}`}>
                            <DotsIcon />
                          </button>
                        </div>

                        {isExpanded ? (
                          <div className="vehicle-expanded-row">
                            <div className="vehicle-expanded-header">
                              <span className="vehicle-expanded-dot" />
                              <strong>PROPRIÉTAIRE ACTUEL</strong>
                            </div>

                            <div className="vehicle-owner-panel">
                              <div className="vehicle-owner-summary-grid">
                                <article className="vehicle-owner-summary-card">
                                  <span className="vehicle-owner-label">Nom complet</span>
                                  <strong>{vehicle.owner}</strong>
                                </article>
                                <article className="vehicle-owner-summary-card">
                                  <span className="vehicle-owner-label">Propriétaire depuis</span>
                                  <strong>{vehicle.ownerSince}</strong>
                                </article>
                              </div>

                              <div className="vehicle-linked-case-block">
                                <span className="vehicle-owner-label">Faits liés ({vehicle.facts})</span>
                                <div className="vehicle-linked-case-card">
                                  <div className="vehicle-linked-case-content">
                                    <strong>{vehicle.linkedCase}</strong>
                                    <div className="vehicle-linked-tags">
                                      <span className="vehicle-linked-tag vehicle-linked-tag-primary">{vehicle.linkedCaseBadge}</span>
                                      <span className="vehicle-linked-tag vehicle-linked-tag-secondary">{vehicle.linkedCaseLabel}</span>
                                    </div>
                                  </div>
                                  <span className="vehicle-linked-date">{vehicle.registeredAt}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>

              <Pagination className="vehicle-pagination" ariaLabel="Pagination véhicules" currentPage={pagedOffenseVehicles.currentPage} totalPages={pagedOffenseVehicles.totalPages} onPageChange={(page) => setListPage('vehicleOffenses', page)} />
            </section>
          ) : activePage === 'mcd-rapports-legiste' ? (
            <section className="autopsy-page">
              <h2 className="autopsy-page-title">Liste des rapports d'autopsie</h2>

              <input
                className="records-search autopsy-search"
                type="text"
                placeholder="Rechercher un rapport..."
                value={autopsySearch}
                onChange={(event) => {
                  setAutopsySearch(event.target.value)
                  setListPage('autopsyReports', 1)
                }}
              />

              <div className="autopsy-table-shell">
                <div className="autopsy-table-head">
                  <span>NUMÉRO</span>
                  <span>DATE</span>
                  <span>PRÉNOM / NOM DU CITOYEN</span>
                  <span>ACTIONS</span>
                </div>

                <div className="autopsy-table-body">
                  {pagedAutopsyReports.items.map((report) => (
                    <div className="autopsy-table-row" key={report.id}>
                      <span>{report.id}</span>
                      <span>{report.date}</span>
                      <span>{report.citizen}</span>
                      <button className="autopsy-view-button" type="button" onClick={() => setSelectedAutopsyReportId(report.id)}>
                        Voir le rapport
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <Pagination className="vehicle-pagination autopsy-pagination" ariaLabel="Pagination rapports autopsie" currentPage={pagedAutopsyReports.currentPage} totalPages={pagedAutopsyReports.totalPages} onPageChange={(page) => setListPage('autopsyReports', page)} />

              {selectedAutopsyReport ? (
                <div className="modal-overlay" onPointerDown={() => setSelectedAutopsyReportId(null)}>
                  <div className="autopsy-report-modal" onPointerDown={(event) => event.stopPropagation()}>
                    <button className="autopsy-report-close" type="button" aria-label="Fermer" onClick={() => setSelectedAutopsyReportId(null)}>×</button>

                    <div className="autopsy-report-content">
                      <div className="autopsy-report-header">
                        <img className="autopsy-report-seal" src={saspSeal} alt="MCD" />
                        <div className="autopsy-report-header-info">
                          <strong>RAPPORT D'AUTOPSIE</strong>
                          <span>San Andreas Medical Department | Ocean Medical Center</span>
                          <span>Los Santos, San Andreas</span>
                          <span>Dossier n°{selectedAutopsyReport.id}</span>
                        </div>
                      </div>

                      <h3 className="autopsy-section-title">INFORMATIONS DU DÉFUNT</h3>
                      <table className="autopsy-info-table">
                        <tbody>
                          <tr>
                            <td><strong>Prénom Nom</strong><br />{selectedAutopsyReport.citizen}</td>
                            <td><strong>Sexe</strong><br />{selectedAutopsyReport.sex}</td>
                            <td><strong>Date de naissance</strong><br />{selectedAutopsyReport.birthDate}</td>
                          </tr>
                          <tr>
                            <td><strong>Poids</strong><br />{selectedAutopsyReport.weight}</td>
                            <td><strong>Taille</strong><br />{selectedAutopsyReport.height}</td>
                            <td><strong>Ethnie</strong><br />{selectedAutopsyReport.ethnicity}</td>
                          </tr>
                        </tbody>
                      </table>

                      <h3 className="autopsy-section-title">PHOTO DE LA PIÈCE D'IDENTITÉ</h3>
                      <div className="autopsy-placeholder-zone" />

                      <h3 className="autopsy-section-title">LIEUX DU DÉCÈS</h3>
                      <div className="autopsy-two-columns">
                        <div>
                          <h4 className="autopsy-sub-title">DESCRIPTION DES LIEUX</h4>
                          <p>{selectedAutopsyReport.deathLocation}</p>
                        </div>
                        <div>
                          <h4 className="autopsy-sub-title">PHOTO DE LOCALISATION</h4>
                          {selectedAutopsyReport.deathLocationPhoto ? (
                            <img className="autopsy-photo" src={selectedAutopsyReport.deathLocationPhoto} alt="Localisation" />
                          ) : (
                            <div className="autopsy-placeholder-zone" />
                          )}
                        </div>
                      </div>

                      <h3 className="autopsy-section-title">MESSAGE D'APPEL</h3>
                      <p>{selectedAutopsyReport.callMessage}</p>

                      <h3 className="autopsy-section-title">PHOTOS DU CORPS</h3>
                      {selectedAutopsyReport.bodyPhotos.length > 0 ? (
                        <div className="autopsy-photos-grid">
                          {selectedAutopsyReport.bodyPhotos.map((photo, index) => (
                            <img className="autopsy-photo" src={photo} alt={`Corps ${index + 1}`} key={index} />
                          ))}
                        </div>
                      ) : (
                        <div className="autopsy-placeholder-zone" />
                      )}

                      <h3 className="autopsy-section-title">BLESSURES</h3>
                      <div className="autopsy-two-columns">
                        <div>
                          <h4 className="autopsy-sub-title">BLESSURES INTERNES</h4>
                          <ul className="autopsy-injury-list">
                            {selectedAutopsyReport.internalInjuries.map((injury) => (
                              <li key={injury}>{injury}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="autopsy-sub-title">BLESSURES EXTERNES</h4>
                          <ul className="autopsy-injury-list">
                            {selectedAutopsyReport.externalInjuries.map((injury) => (
                              <li key={injury}>{injury}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <h3 className="autopsy-section-title">ANALYSES LABORATOIRES</h3>
                      <div className="autopsy-two-columns">
                        <div>
                          <h4 className="autopsy-sub-title">PRISE DE SANG</h4>
                          <p>{selectedAutopsyReport.bloodTest}</p>
                        </div>
                        <div>
                          <h4 className="autopsy-sub-title">PHOTO DE LA PRISE DE SANG</h4>
                          <div className="autopsy-placeholder-zone" />
                        </div>
                      </div>

                      <h3 className="autopsy-section-title">EFFETS PERSONNELS (INVENTAIRE)</h3>
                      {selectedAutopsyReport.inventoryPhotos.length > 0 ? (
                        <div className="autopsy-photos-grid">
                          {selectedAutopsyReport.inventoryPhotos.map((photo, index) => (
                            <img className="autopsy-photo" src={photo} alt={`Inventaire ${index + 1}`} key={index} />
                          ))}
                        </div>
                      ) : (
                        <div className="autopsy-placeholder-zone" />
                      )}

                      <h3 className="autopsy-section-title">CONCLUSION</h3>
                      <table className="autopsy-info-table autopsy-conclusion-table">
                        <tbody>
                          <tr><td><strong>Date et heure de la mort :</strong></td><td>{selectedAutopsyReport.deathDate}</td></tr>
                          <tr><td><strong>Cause du décès :</strong></td><td>{selectedAutopsyReport.deathCause}</td></tr>
                          <tr><td><strong>Nature du décès :</strong></td><td>{selectedAutopsyReport.deathNature}</td></tr>
                          <tr><td><strong>Temps estimé depuis la mort :</strong></td><td>{selectedAutopsyReport.estimatedTime}</td></tr>
                        </tbody>
                      </table>

                      <h3 className="autopsy-section-title">INFORMATIONS SUPPLÉMENTAIRES</h3>
                      <table className="autopsy-info-table">
                        <tbody>
                          <tr><td><strong>PS sur place :</strong></td><td>{selectedAutopsyReport.psOnScene}</td></tr>
                          <tr><td><strong>Agents sur place :</strong></td><td>{selectedAutopsyReport.agentsOnScene}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </section>
          ) : activePage.startsWith('mcd-') ? (
            <section className="mcd-placeholder-page">
              <h2>Page MCD en construction</h2>
              <p>Cette section sera disponible prochainement.</p>
            </section>
          ) : isIncidentPage ? (
            <section className="incident-page">
              <div className="incident-left-column">
                <div className="incident-header-row">
                  <h2>{incidentPageTitle}</h2>

                  <button className="incident-create-button" type="button" aria-label="Créer un rapport">
                    +
                  </button>
                </div>

                <div className="incident-list">
                  {incidentReportsState.map((report) => (
                    <button
                      className={`incident-card${report.id === selectedIncidentReportId ? ' incident-card-active' : ''}`}
                      key={report.id}
                      type="button"
                      onClick={() => setSelectedIncidentReportId(report.id)}
                    >
                      <div className="incident-card-topbar">
                        <span>#{report.id}</span>
                        <span className="incident-card-menu" aria-hidden="true">
                          <DotsIcon />
                        </span>
                      </div>
                      <span>Par {report.officerId} | {report.author}</span>
                      <span>{report.title}</span>
                      <span>Le {report.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedIncidentReport ? (
                <div className="incident-pdf-preview-shell">
                  <div className="incident-document-page">
                    <div className="incident-document-header">
                      <img
                        className="incident-document-seal"
                        src={createAdminSeal('SA', '#d2d4d8', '#ffffff', '#85888f')}
                        alt="SASP"
                      />

                      <div className="incident-document-agency">
                        <strong>San Andreas Police Department</strong>
                        <span>San Andreas State Police | Vespucci</span>
                        <span>Los Santos, San Andreas</span>
                        <span>United States of America</span>
                      </div>
                    </div>

                    <div className="incident-document-rule" />
                    <h3 className="incident-document-title">Rapport d'incident : {selectedIncidentReport.title}</h3>
                    <div className="incident-document-rule incident-document-rule-tight" />

                    <section className="incident-document-section">
                      <h4>Informations générales</h4>
                      <div className="incident-document-section-rule" />
                      <p><strong>Numéro de rapport :</strong> #{selectedIncidentReport.id}</p>
                      <p><strong>Date :</strong> {selectedIncidentReport.dateTime}</p>
                      <p><strong>Rédacteur :</strong> {selectedIncidentReport.officerId} | {selectedIncidentReport.author}</p>
                      <p><strong>Suspect :</strong> {selectedIncidentReport.suspect}</p>
                    </section>

                    <section className="incident-document-section">
                      <h4>Agents impliqués</h4>
                      <div className="incident-document-section-rule" />
                      <ul className="incident-document-list">
                        {selectedIncidentReport.participants.map((participant) => (
                          <li key={participant}>{participant}</li>
                        ))}
                      </ul>
                    </section>

                    <section className="incident-document-section">
                      <h4>Rapport détaillé</h4>
                      <div className="incident-document-section-rule" />
                      <div className="incident-document-textbox">
                        <p>{selectedIncidentReport.summary}</p>
                        <p>{selectedIncidentReport.details}</p>
                      </div>
                    </section>

                    <section className="incident-document-section">
                      <h4>Pièces jointes</h4>
                      <div className="incident-document-section-rule" />
                      <div className="incident-document-evidence-row">
                        <img src={createIdentityCardPreview({ name: selectedIncidentReport.title, birthDate: selectedIncidentReport.date, phone: selectedIncidentReport.officerId })} alt="Carte identité" />
                        <img src={createArrestEvidencePreview(selectedIncidentReport.title)} alt="Preuve" />
                      </div>
                    </section>

                    <p className="incident-document-footer">{selectedIncidentReport.location}</p>
                  </div>
                </div>
              ) : (
                <div className="incident-empty-panel">
                  Sélectionnez un rapport pour afficher ses informations.
                </div>
              )}
            </section>
          ) : null}
        </main>
      </div>

      {isEncodeCitizenModalOpen ? (
        <div className="modal-overlay" onPointerDown={() => setIsEncodeCitizenModalOpen(false)}>
          <div className="encode-citizen-modal" onPointerDown={(event) => event.stopPropagation()}>
            <div className="edit-citizen-header">
              <h2>Encoder un citoyen</h2>
              <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsEncodeCitizenModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="edit-citizen-divider" />

            <div className="encode-citizen-photo-field">
              <span>Photo du citoyen (sans lunettes) <span className="case-required">*</span></span>
              <div className="encode-citizen-upload-zone" tabIndex={0} onPaste={handlePasteIntoEncodeCitizen}>
                {encodeCitizenPhoto ? <img className="pasted-image-preview pasted-image-preview-single" src={encodeCitizenPhoto} alt="Photo citoyen" /> : 'Coller une image (CTRL + V)'}
              </div>
            </div>

            <p className="encode-citizen-warning">⚠ Merci de faire attention à l'orthographe et aux informations que vous rentrez.</p>

            <div className="edit-citizen-grid encode-citizen-grid">
              <label className="edit-field">
                <span>Prénom <span className="case-required">*</span></span>
                <input className={encodeCitizenErrors.firstName ? 'edit-field-error' : ''} value={encodeCitizenForm.firstName} onChange={(event) => handleEncodeCitizenFieldChange('firstName', event.target.value)} />
                {encodeCitizenErrors.firstName ? <small className="encode-citizen-error-text">{encodeCitizenErrors.firstName}</small> : null}
              </label>

              <label className="edit-field">
                <span>Nom <span className="case-required">*</span></span>
                <input className={encodeCitizenErrors.lastName ? 'edit-field-error' : ''} value={encodeCitizenForm.lastName} onChange={(event) => handleEncodeCitizenFieldChange('lastName', event.target.value)} />
                {encodeCitizenErrors.lastName ? <small className="encode-citizen-error-text">{encodeCitizenErrors.lastName}</small> : null}
              </label>

              <label className="edit-field">
                <span>Téléphone <span className="case-required">*</span></span>
                <input className={encodeCitizenErrors.phone ? 'edit-field-error' : ''} value={encodeCitizenForm.phone} onChange={(event) => handleEncodeCitizenFieldChange('phone', event.target.value)} />
                {encodeCitizenErrors.phone ? <small className="encode-citizen-error-text">{encodeCitizenErrors.phone}</small> : null}
              </label>

              <div className="edit-field encode-citizen-picker-field" onPointerDown={(event) => event.stopPropagation()}>
                <span>Date de naissance <span className="case-required">*</span></span>
                <div className={`case-select-shell encode-citizen-select-shell${encodeCitizenErrors.birthDate ? ' edit-field-error-shell' : ''}`}>
                  <input
                    placeholder="Sélectionnez la date de naissance"
                    value={encodeCitizenForm.birthDate}
                    readOnly
                    onClick={toggleEncodeCitizenDatePicker}
                  />
                  <button className="case-select-button" type="button" onClick={toggleEncodeCitizenDatePicker}><SelectCaretIcon /></button>
                </div>
                {encodeCitizenErrors.birthDate ? <small className="encode-citizen-error-text">{encodeCitizenErrors.birthDate}</small> : null}

                {isEncodeCitizenBirthDatePickerOpen ? (
                  <div className="encode-date-picker">
                    <div className="encode-date-picker-header">
                      <button type="button" onClick={() => {
                        const nextMonth = encodeBirthMonth === 0 ? 11 : encodeBirthMonth - 1
                        const nextYear = encodeBirthMonth === 0 ? encodeBirthYear - 1 : encodeBirthYear
                        updateEncodeCitizenBirthView(nextMonth, nextYear)
                      }}>‹</button>

                      <div className="encode-date-picker-selectors">
                        <div className="encode-date-select" onPointerDown={(event) => event.stopPropagation()}>
                          <button type="button" className="encode-date-select-button" onClick={() => setIsEncodeCitizenMonthDropdownOpen((current) => !current)}>{citizenBirthMonths[encodeBirthMonth]}</button>
                          {isEncodeCitizenMonthDropdownOpen ? (
                            <div className="encode-date-select-menu encode-date-select-menu-months">
                              {citizenBirthMonths.map((monthLabel, index) => (
                                <button key={monthLabel} type="button" onClick={() => {
                                  updateEncodeCitizenBirthView(index, encodeBirthYear)
                                  setIsEncodeCitizenMonthDropdownOpen(false)
                                }}>{monthLabel}</button>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="encode-date-select" onPointerDown={(event) => event.stopPropagation()}>
                          <button type="button" className="encode-date-select-button encode-date-select-button-year" onClick={() => setIsEncodeCitizenYearDropdownOpen((current) => !current)}>{encodeBirthYear}</button>
                          {isEncodeCitizenYearDropdownOpen ? (
                            <div className="encode-date-select-menu encode-date-select-menu-years">
                              {citizenBirthYears.map((year) => (
                                <button key={year} type="button" onClick={() => {
                                  updateEncodeCitizenBirthView(encodeBirthMonth, year)
                                  setIsEncodeCitizenYearDropdownOpen(false)
                                }}>{year}</button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <button type="button" onClick={() => {
                        const nextMonth = encodeBirthMonth === 11 ? 0 : encodeBirthMonth + 1
                        const nextYear = encodeBirthMonth === 11 ? encodeBirthYear + 1 : encodeBirthYear
                        updateEncodeCitizenBirthView(nextMonth, nextYear)
                      }}>›</button>
                    </div>

                    <div className="encode-date-picker-weekdays">
                      {['lu', 'ma', 'me', 'je', 've', 'sa', 'di'].map((day) => <span key={day}>{day}</span>)}
                    </div>

                    <div className="encode-date-picker-grid">
                      {encodeBirthCalendarDays.map((dayValue, index) => (
                        <button
                          className={`encode-date-day${dayValue === encodeBirthSelectedDay ? ' encode-date-day-active' : ''}${dayValue ? '' : ' encode-date-day-empty'}`}
                          key={`${dayValue ?? 'empty'}-${index}`}
                          type="button"
                          disabled={!dayValue}
                          onClick={() => dayValue && selectEncodeCitizenBirthDate(dayValue)}
                        >
                          {dayValue ?? ''}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="edit-field" onPointerDown={(event) => event.stopPropagation()}>
                <span>Genre</span>
                <div className="case-select-block">
                  <div className="case-select-shell encode-citizen-select-shell">
                    <input placeholder="Sélectionnez..." value={encodeCitizenForm.gender} readOnly onClick={() => setIsEncodeCitizenGenderOpen((current) => !current)} />
                    <button className="case-select-button" type="button" onClick={() => setIsEncodeCitizenGenderOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isEncodeCitizenGenderOpen ? (
                    <div className="case-dropdown-list encode-citizen-dropdown-list">
                      {citizenGenderOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          handleEncodeCitizenFieldChange('gender', option)
                          setIsEncodeCitizenGenderOpen(false)
                        }}>{option}</button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <label className="edit-field">
                <span>Email (app téléphone) <span className="case-required">*</span></span>
                <input className={encodeCitizenErrors.email ? 'edit-field-error' : ''} value={encodeCitizenForm.email} onChange={(event) => handleEncodeCitizenFieldChange('email', event.target.value)} />
                {encodeCitizenErrors.email ? <small className="encode-citizen-error-text">{encodeCitizenErrors.email}</small> : null}
              </label>

              <label className="edit-field">
                <span>Poids</span>
                <input value={encodeCitizenForm.weight} onChange={(event) => handleEncodeCitizenFieldChange('weight', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Taille</span>
                <input value={encodeCitizenForm.height} onChange={(event) => handleEncodeCitizenFieldChange('height', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Adresse</span>
                <input value={encodeCitizenForm.address} onChange={(event) => handleEncodeCitizenFieldChange('address', event.target.value)} />
              </label>

              <div className="edit-field" onPointerDown={(event) => event.stopPropagation()}>
                <span>Ethnie</span>
                <div className="case-select-block">
                  <div className="case-select-shell encode-citizen-select-shell">
                    <input placeholder="Sélectionnez..." value={encodeCitizenForm.ethnicity} readOnly onClick={() => setIsEncodeCitizenEthnicityOpen((current) => !current)} />
                    <button className="case-select-button" type="button" onClick={() => setIsEncodeCitizenEthnicityOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isEncodeCitizenEthnicityOpen ? (
                    <div className="case-dropdown-list encode-citizen-dropdown-list">
                      {citizenEthnicityOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          handleEncodeCitizenFieldChange('ethnicity', option)
                          setIsEncodeCitizenEthnicityOpen(false)
                        }}>{option}</button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <label className="edit-field">
                <span>Couleur de cheveux</span>
                <input value={encodeCitizenForm.hairColor} onChange={(event) => handleEncodeCitizenFieldChange('hairColor', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Couleur des yeux</span>
                <input value={encodeCitizenForm.eyeColor} onChange={(event) => handleEncodeCitizenFieldChange('eyeColor', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Appartenance</span>
                <input value={encodeCitizenForm.affiliation} onChange={(event) => handleEncodeCitizenFieldChange('affiliation', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Emploi</span>
                <input value={encodeCitizenForm.job} onChange={(event) => handleEncodeCitizenFieldChange('job', event.target.value)} />
              </label>

              <div className="edit-field edit-field-wide-left" onPointerDown={(event) => event.stopPropagation()}>
                <span>Permis de conduire</span>
                <div className="case-select-block">
                  <div className="case-select-shell encode-citizen-select-shell">
                    <input value={encodeCitizenForm.driverLicense} readOnly onClick={() => setIsEncodeCitizenLicenseOpen((current) => !current)} />
                    <button className="case-select-button" type="button" onClick={() => setIsEncodeCitizenLicenseOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isEncodeCitizenLicenseOpen ? (
                    <div className="case-dropdown-list encode-citizen-dropdown-list">
                      {citizenLicenseOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          handleEncodeCitizenFieldChange('driverLicense', option)
                          setIsEncodeCitizenLicenseOpen(false)
                        }}>{option}</button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="edit-citizen-divider encode-citizen-footer-divider" />

            <div className="encode-citizen-footer">
              <button className="encode-citizen-submit" type="button" onClick={submitEncodeCitizenForm}>Encoder le citoyen</button>
            </div>
          </div>
        </div>
      ) : null}

      {isEditCitizenModalOpen ? (
        <div className="modal-overlay" onPointerDown={() => setIsEditCitizenModalOpen(false)}>
          <div className="edit-citizen-modal" onPointerDown={(event) => event.stopPropagation()}>
            <div className="edit-citizen-header">
              <h2>Modifier un citoyen</h2>
              <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsEditCitizenModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="edit-citizen-divider" />

            <div className="edit-citizen-grid">
              <label className="edit-field">
                <span>Prénom</span>
                <input value={editCitizenForm.firstName} onChange={(event) => handleEditCitizenFieldChange('firstName', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Nom</span>
                <input value={editCitizenForm.lastName} onChange={(event) => handleEditCitizenFieldChange('lastName', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Téléphone</span>
                <input value={editCitizenForm.phone} onChange={(event) => handleEditCitizenFieldChange('phone', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Date de naissance</span>
                <input value={editCitizenForm.birthDate} onChange={(event) => handleEditCitizenFieldChange('birthDate', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Genre</span>
                <select value={editCitizenForm.gender} onChange={(event) => handleEditCitizenFieldChange('gender', event.target.value)}>
                  <option>Homme</option>
                  <option>Femme</option>
                </select>
              </label>

              <label className="edit-field">
                <span>Email</span>
                <input value={editCitizenForm.email} onChange={(event) => handleEditCitizenFieldChange('email', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Poids</span>
                <input value={editCitizenForm.weight} onChange={(event) => handleEditCitizenFieldChange('weight', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Taille</span>
                <input value={editCitizenForm.height} onChange={(event) => handleEditCitizenFieldChange('height', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Adresse</span>
                <input value={editCitizenForm.address} onChange={(event) => handleEditCitizenFieldChange('address', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Couleur de cheveux</span>
                <input value={editCitizenForm.hairColor} onChange={(event) => handleEditCitizenFieldChange('hairColor', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Couleur des yeux</span>
                <input value={editCitizenForm.eyeColor} onChange={(event) => handleEditCitizenFieldChange('eyeColor', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Appartenance</span>
                <input value={editCitizenForm.affiliation} onChange={(event) => handleEditCitizenFieldChange('affiliation', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Emploi</span>
                <input value={editCitizenForm.job} onChange={(event) => handleEditCitizenFieldChange('job', event.target.value)} />
              </label>

              <label className="edit-field">
                <span>Ethnie</span>
                <select value={editCitizenForm.ethnicity} onChange={(event) => handleEditCitizenFieldChange('ethnicity', event.target.value)}>
                  <option value="">Sélectionnez...</option>
                  <option>Asiatique</option>
                  <option>Caucasienne</option>
                  <option>Noire</option>
                  <option>Métisse</option>
                </select>
              </label>

              <label className="edit-field edit-field-wide-left">
                <span>Permis de conduire</span>
                <select value={editCitizenForm.driverLicense} onChange={(event) => handleEditCitizenFieldChange('driverLicense', event.target.value)}>
                  <option>Valide</option>
                  <option>Non-valide</option>
                </select>
              </label>
            </div>

                <button className="edit-citizen-submit" type="button" onClick={submitEditCitizenForm}>Mettre à jour</button>
          </div>
        </div>
      ) : null}

        {isArrestReportModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsArrestReportModalOpen(false)}>
            <div className="case-modal" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Créer un rapport d'arrestation</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsArrestReportModalOpen(false)}>×</button>
              </div>
              <div className="edit-citizen-divider" />

              <div className="case-step-row">ÉTAPE {arrestReportStep}/2</div>
              <div className="case-progress"><span className={arrestReportStep === 2 ? 'case-progress-complete' : ''} /></div>

              {arrestReportStep === 1 ? (
                <>
                  <div className="case-form-grid">
                    <label className="edit-field">
                      <span>Date et heure</span>
                      <input value={arrestReportForm.dateTime} onChange={(event) => handleArrestReportFieldChange('dateTime', event.target.value)} />
                    </label>
                    <label className="edit-field">
                      <span>Possession</span>
                      <input value={arrestReportForm.possession} onChange={(event) => handleArrestReportFieldChange('possession', event.target.value)} />
                    </label>
                    <label className="edit-field">
                      <span>Poste de police</span>
                      <div className="case-select-shell">
                        <input value={arrestReportForm.policePost} onChange={(event) => handleArrestReportFieldChange('policePost', event.target.value)} />
                        <button className="case-select-button" type="button"><SelectCaretIcon /></button>
                      </div>
                    </label>
                    <label className="edit-field">
                      <span>Avocat si il y en a un</span>
                      <div className="case-select-shell">
                        <input placeholder="Ajoutez l'avocat..." value={arrestReportForm.lawyer} onChange={(event) => handleArrestReportFieldChange('lawyer', event.target.value)} />
                        <button className="case-select-button" type="button"><SelectCaretIcon /></button>
                      </div>
                    </label>
                  </div>

                  <div className="case-field-block">
                    <span className="case-field-label">Agents impliqués *</span>
                    <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                      <div className="case-select-shell case-select-shell-full">
                        <input
                          placeholder="Ajoutez des officiers impliqués..."
                          value={arrestReportForm.selectedAgents[0] ? arrestReportForm.selectedAgents[0] : arrestReportForm.agentsQuery}
                          onFocus={() => setIsReportAgentsDropdownOpen(true)}
                          onChange={(event) => {
                            handleArrestReportFieldChange('agentsQuery', event.target.value)
                            handleArrestReportFieldChange('selectedAgents', [])
                            setIsReportAgentsDropdownOpen(true)
                          }}
                        />
                        <button className="case-select-button" type="button" onClick={() => setIsReportAgentsDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                      </div>

                      {isReportAgentsDropdownOpen ? (
                        <div className="case-dropdown-list">
                          {filteredOfficerOptions.map((officer) => (
                            <button className="case-dropdown-item" key={officer.id} type="button" onClick={() => selectReportOfficer(officer)}>
                              {formatOfficerOption(officer)}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="case-field-block">
                    <span className="case-field-label">Rapport <span className="case-required">*</span></span>
                    <EditorShell value={arrestReportForm.report} onChange={(v) => handleArrestReportFieldChange('report', v)} />
                  </div>

                  <div className="case-proof-block">
                    <span className="case-field-label">Photos preuves :</span>
                    <div className="case-proof-dropzone" tabIndex={0} onPaste={handlePasteIntoArrestReport}>Coller une ou plusieurs images (CTRL + V)</div>
                    {arrestReportPastedImages.length > 0 ? (
                      <div className="pasted-image-grid pasted-image-grid-compact">
                        {arrestReportPastedImages.map((image, index) => (
                          <div className="pasted-image-card pasted-image-card-compact" key={`arrest-proof-${index}`}>
                            <img className="pasted-image-preview" src={image} alt={`Preuve rapport ${index + 1}`} />
                            <button className="pasted-image-remove" type="button" onClick={() => removeArrestReportImage(index)}>×</button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="case-modal-footer">
                    <button className="case-primary-button" type="button" onClick={() => setArrestReportStep(2)}>Suivant</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="case-form-grid case-form-grid-step-two">
                    <div className="edit-field">
                      <span>Charges :</span>
                      <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                        <div className="case-select-shell case-select-shell-tags case-select-shell-full">
                          <div className="case-tags-wrap">
                            {arrestReportForm.charges.map((charge) => (
                              <span className="case-tag" key={charge}>
                                {charge}
                                <button type="button" onClick={() => handleArrestReportFieldChange('charges', arrestReportForm.charges.filter((c) => c !== charge))}>x</button>
                              </span>
                            ))}
                            <input
                              className="case-tags-input"
                              placeholder={arrestReportForm.charges.length === 0 ? 'Sélectionnez les charges...' : ''}
                              value={arrestReportForm.chargeQuery}
                              onFocus={() => setIsReportChargesDropdownOpen(true)}
                              onChange={(event) => {
                                handleArrestReportFieldChange('chargeQuery', event.target.value)
                                setIsReportChargesDropdownOpen(true)
                              }}
                            />
                          </div>
                          <button className="case-select-button" type="button" onClick={() => setIsReportChargesDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                        </div>

                        {isReportChargesDropdownOpen ? (
                          <div className="case-dropdown-list case-dropdown-list-tall">
                            {filteredChargeOptions.map((charge) => (
                              <button className="case-dropdown-item" key={charge} type="button" onClick={() => {
                                handleArrestReportFieldChange('charges', [...arrestReportForm.charges, charge])
                                handleArrestReportFieldChange('chargeQuery', '')
                                setIsReportChargesDropdownOpen(false)
                              }}>
                                {charge}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="edit-field">
                      <span>Barême de l'amende</span>
                      <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                        <div className="case-select-shell case-select-shell-full">
                          <input value={arrestReportForm.fineScale} readOnly onClick={() => setIsReportFineScaleDropdownOpen((current) => !current)} placeholder="Sélectionnez..." />
                          <button className="case-select-button" type="button" onClick={() => setIsReportFineScaleDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                        </div>
                        {isReportFineScaleDropdownOpen ? (
                          <div className="case-dropdown-list">
                            {arrestDossierFineScaleOptions.map((option) => (
                              <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                                handleArrestReportFieldChange('fineScale', option)
                                setIsReportFineScaleDropdownOpen(false)
                              }}>{option}</button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="case-step-two-spacer" />

                  <div className="case-modal-footer case-modal-footer-split">
                    <button className="case-secondary-button" type="button" onClick={() => setArrestReportStep(1)}>Retour</button>
                    <button className="case-primary-button case-primary-button-wide" type="button" onClick={submitArrestReportForm}>Ajouter le rapport d'arrestation</button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}

        {isArrestDossierModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsArrestDossierModalOpen(false)}>
            <div className="case-modal case-modal-large arrest-dossier-modal" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Mise à jour du dossier d'arrestation de {selectedCitizen.name}</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsArrestDossierModalOpen(false)}>×</button>
              </div>
              <div className="edit-citizen-divider" />

              <div className="case-form-grid">
                <label className="edit-field">
                  <span>Date et heure de l'arrestation <span className="case-required">*</span></span>
                  <input value={arrestDossierForm.arrestDateTime} onChange={(event) => handleArrestDossierFieldChange('arrestDateTime', event.target.value)} />
                </label>
                <label className="edit-field">
                  <span>Date et heure lecture des droits <span className="case-required">*</span></span>
                  <input value={arrestDossierForm.rightsDateTime} onChange={(event) => handleArrestDossierFieldChange('rightsDateTime', event.target.value)} />
                </label>
                <label className="edit-field">
                  <span>Poste de police</span>
                  <div className="case-select-shell">
                    <input value={arrestDossierForm.policePost} onChange={(event) => handleArrestDossierFieldChange('policePost', event.target.value)} list="arrest-dossier-police-posts" />
                    <button className="case-select-button" type="button"><SelectCaretIcon /></button>
                  </div>
                  <datalist id="arrest-dossier-police-posts">
                    {arrestDossierPolicePostOptions.map((option) => <option key={option} value={option} />)}
                  </datalist>
                </label>
                <div className="edit-field">
                  <span>Agents impliqués <span className="case-required">*</span></span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-tags">
                      <div className="case-tags-wrap">
                        {arrestDossierForm.selectedAgents.map((officer) => (
                          <span className="case-tag" key={officer}>
                            {officer}
                            <button type="button" onClick={() => removeDossierOfficer(officer)}>x</button>
                          </span>
                        ))}
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsDossierAgentsDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isDossierAgentsDropdownOpen ? (
                      <div className="case-dropdown-list case-dropdown-list-right">
                        {officerOptionsData.map((officer) => (
                          <button className="case-dropdown-item" key={officer.id} type="button" onClick={() => addDossierOfficer(officer)}>
                            {formatOfficerOption(officer)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <label className="case-checkbox-row">
                <input type="checkbox" checked={arrestDossierForm.forceUsed} onChange={(event) => handleArrestDossierFieldChange('forceUsed', event.target.checked)} />
                <span>Force utilisé pour neutraliser l'individu</span>
              </label>

              <div className="case-field-block">
                <span className="case-field-label">Avocats, procureurs, juges en charge de l'affaire</span>
                <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="case-select-shell case-select-shell-full">
                    <input
                      placeholder="Rechercher et ajouter une personne..."
                      value={arrestDossierForm.peopleQuery}
                      onFocus={() => setIsDossierPeopleDropdownOpen(true)}
                      onChange={(event) => {
                        handleArrestDossierFieldChange('peopleQuery', event.target.value)
                        setIsDossierPeopleDropdownOpen(true)
                      }}
                    />
                    <button className="case-select-button" type="button" onClick={() => setIsDossierPeopleDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>

                  {isDossierPeopleDropdownOpen ? (
                    <div className="case-dropdown-list case-dropdown-list-tall">
                      {filteredPeopleOptions.map((person) => (
                        <button className="case-dropdown-item" key={person} type="button" onClick={() => {
                          handleArrestDossierFieldChange('peopleQuery', person)
                          setArrestDossierForm((current) => ({
                            ...current,
                            selectedLead: {
                              name: `${person} (Avocat)`,
                              role: 'Avocat',
                              email: 'isamutanaka@mail.loop',
                              phone: '555-5726',
                            },
                          }))
                          setIsDossierPeopleDropdownOpen(false)
                        }}>
                          {person}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="case-participant-card">
                  <div>
                    <strong>{arrestDossierForm.selectedLead.name}</strong>
                    <span>{arrestDossierForm.selectedLead.role}</span>
                  </div>
                  <div>
                    <span>{arrestDossierForm.selectedLead.email}</span>
                    <span>{arrestDossierForm.selectedLead.phone}</span>
                  </div>
                </div>

                <div className="case-empty-participants">Aucun juge ni procureur ajouté pour le moment</div>
              </div>

              <div className="case-field-block">
                <span className="case-field-label">Rapport <span className="case-required">*</span></span>
                <EditorShell value={arrestDossierForm.report} onChange={(v) => handleArrestDossierFieldChange('report', v)} textareaClassName="case-editor-area-large" />
              </div>

              <div className="case-field-block arrest-dossier-block-spaced">
                <span className="case-field-label">Lié un rapport d'opération</span>
                <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="case-select-shell case-select-shell-full">
                    <input
                      placeholder="Rechercher un rapport d'opération"
                      value={arrestDossierForm.operationReport}
                      onFocus={() => setIsDossierOperationDropdownOpen(true)}
                      onChange={(event) => {
                        handleArrestDossierFieldChange('operationReport', event.target.value)
                        setIsDossierOperationDropdownOpen(true)
                      }}
                    />
                    <button className="case-select-button" type="button" onClick={() => setIsDossierOperationDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isDossierOperationDropdownOpen ? (
                    <div className="case-dropdown-list case-dropdown-list-tall">
                      {filteredDossierOperationOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          handleArrestDossierFieldChange('operationReport', option)
                          setIsDossierOperationDropdownOpen(false)
                        }}>{option}</button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="case-field-block">
                <span className="case-field-label">Dossiers photos (preuves)</span>
                <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="case-select-shell case-select-shell-tags case-select-shell-full">
                    <div className="case-tags-wrap">
                      {arrestDossierForm.proofFolder ? (
                        <span className="case-tag">
                          {arrestDossierForm.proofFolder}
                          <button type="button" onClick={() => handleArrestDossierFieldChange('proofFolder', '')}>x</button>
                        </span>
                      ) : null}
                    </div>
                    <button className="case-select-button" type="button" onClick={() => setIsDossierProofDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isDossierProofDropdownOpen ? (
                    <div className="case-dropdown-list case-dropdown-list-tall">
                      {filteredDossierProofOptions.map((option) => (
                        <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                          handleArrestDossierFieldChange('proofFolder', option)
                          setIsDossierProofDropdownOpen(false)
                        }}>{option}</button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="case-proof-block arrest-dossier-proof-block">
                <span className="case-field-label">Photos preuves :</span>
                <div className="case-proof-dropzone" onPaste={handlePasteIntoArrestDossierProofs} tabIndex={0}>
                  Coller une ou plusieurs images (CTRL + V)
                </div>
                {arrestDossierPastedImages.length > 0 ? (
                  <div className="pasted-image-grid pasted-image-grid-compact arrest-dossier-images">
                    {arrestDossierPastedImages.map((image, index) => (
                      <article className="pasted-image-card" key={`${image.slice(0, 32)}-${index}`}>
                        <img className="pasted-image-preview" src={image} alt={`Preuve ${index + 1}`} />
                        <button className="pasted-image-remove" type="button" onClick={() => removeArrestDossierImage(index)}>×</button>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="case-form-grid arrest-dossier-charge-grid">
                <div className="edit-field">
                  <span>Charges :</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-tags case-select-shell-full">
                      <div className="case-tags-wrap">
                        {arrestDossierForm.selectedCharges.map((charge) => (
                          <span className="case-tag" key={charge}>
                            {charge}
                            <button type="button" onClick={() => toggleArrestDossierCharge(charge)}>x</button>
                          </span>
                        ))}
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsDossierChargesDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>
                    {isDossierChargesDropdownOpen ? (
                      <div className="case-dropdown-list case-dropdown-list-tall">
                        {filteredDossierChargeOptions.map((option) => (
                          <button className="case-dropdown-item" key={option} type="button" onClick={() => toggleArrestDossierCharge(option)}>{option}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <p className="arrest-dossier-warning">Rentrer les quantités, la tentative et la complicité, si besoin</p>
                </div>

                <div className="edit-field">
                  <span>Barême de l'amende</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-full">
                      <input value={arrestDossierForm.fineScale} readOnly onClick={() => setIsDossierFineScaleDropdownOpen((current) => !current)} />
                      <button className="case-select-button" type="button" onClick={() => setIsDossierFineScaleDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>
                    {isDossierFineScaleDropdownOpen ? (
                      <div className="case-dropdown-list arrest-dossier-finescale-menu">
                        {arrestDossierFineScaleOptions.map((option) => (
                          <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                            handleArrestDossierFieldChange('fineScale', option)
                            setIsDossierFineScaleDropdownOpen(false)
                          }}>{option}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="arrest-dossier-charge-table">
                <div className="arrest-dossier-charge-head">
                  <span>Charge</span>
                  <span>Quantité</span>
                  <span>Tentative</span>
                  <span>Complicité</span>
                  <span>Supprimer</span>
                </div>
                <div className="arrest-dossier-charge-body">
                  {arrestDossierForm.chargeItems.map((item) => (
                    <div className="arrest-dossier-charge-row" key={item.id}>
                      <span>{item.label}</span>
                      <input className="arrest-dossier-quantity-input" type="number" min="1" value={item.quantity} onChange={(event) => handleArrestDossierChargeItemChange(item.id, 'quantity', Number(event.target.value || 1))} />
                      <input type="checkbox" checked={item.tentative} onChange={(event) => handleArrestDossierChargeItemChange(item.id, 'tentative', event.target.checked)} />
                      <input type="checkbox" checked={item.complicity} onChange={(event) => handleArrestDossierChargeItemChange(item.id, 'complicity', event.target.checked)} />
                      <button className="arrest-dossier-remove-button" type="button" onClick={() => removeArrestDossierCharge(item.id)}>×</button>
                    </div>
                  ))}
                </div>
                <div className="arrest-dossier-charge-totals">
                  <strong>Total Amende : ${arrestDossierTotalFine.toFixed(2)}</strong>
                  <strong>Total UP : {arrestDossierTotalJail}</strong>
                </div>
              </div>

              <div className="arrest-dossier-assets-block">
                <span className="case-field-label">Voiture(s) utilisée(s) :</span>
                {arrestDossierForm.vehicles.map((vehicle) => (
                  <div className="arrest-dossier-vehicle-row" key={vehicle.id}>
                    <label className="edit-field">
                      <span>Modèle du véhicule <span className="case-required">*</span></span>
                      <input value={vehicle.model} onChange={(event) => handleArrestDossierVehicleChange(vehicle.id, 'model', event.target.value)} />
                    </label>
                    <label className="edit-field">
                      <span>Plaque <span className="case-required">*</span></span>
                      <input value={vehicle.plate} onChange={(event) => handleArrestDossierVehicleChange(vehicle.id, 'plate', event.target.value)} />
                    </label>
                    <label className="arrest-dossier-inline-checkbox">
                      <input type="checkbox" checked={vehicle.stolen} onChange={(event) => handleArrestDossierVehicleChange(vehicle.id, 'stolen', event.target.checked)} />
                      <span>Volé</span>
                    </label>
                  </div>
                ))}
                <button className="arrest-dossier-add-button" type="button" onClick={addArrestDossierVehicle}>+ Ajouter un véhicule</button>
              </div>

              <div className="arrest-dossier-assets-block arrest-dossier-assets-block-small">
                <span className="case-field-label">Arme(s) utilisée(s) :</span>
                <button className="arrest-dossier-add-button" type="button" onClick={addArrestDossierWeapon}>+ Ajouter une arme</button>
              </div>

              <div className="case-modal-footer">
                <button className="case-primary-button" type="button" onClick={submitArrestDossierForm}>Mettre à jour</button>
              </div>
            </div>
          </div>
        ) : null}

        {showArrestDossierPreview && currentArrestDossierPreview ? (
          <div className="modal-overlay" onPointerDown={() => setShowArrestDossierPreview(false)}>
            <div className="arrest-dossier-preview-sheet" onPointerDown={(event) => event.stopPropagation()}>
              <div className="incident-document-header arrest-dossier-preview-header">
                <img
                  className="incident-document-seal"
                  src={createAdminSeal('SA', '#d2d4d8', '#ffffff', '#85888f')}
                  alt="Sceau SAPD"
                />
                <div className="incident-document-agency">
                  <strong>San Andreas Police Department</strong>
                  <span>San Andreas State Police | Vespucci</span>
                  <span>Los Santos, San Andreas</span>
                  <span>United States of America</span>
                </div>
              </div>
              <div className="incident-document-rule" />
              <h3 className="incident-document-title">Dossier d'arrestation : {currentArrestDossierPreview.citizenName}</h3>
              <p className="arrest-dossier-preview-status">Status : {currentArrestDossierPreview.status}</p>
              <div className="incident-document-rule incident-document-rule-tight" />

              <section className="incident-document-section">
                <h4>Informations générales</h4>
                <div className="incident-document-section-rule" />
                <p><strong>Numéro de rapport :</strong> {currentArrestDossierPreview.reportNumber}</p>
                <p><strong>Rédacteur :</strong> {currentArrestDossierPreview.author}</p>
                <p><strong>Date :</strong> {currentArrestDossierPreview.dateTime}</p>
                <p><strong>Lecture des droits :</strong> {currentArrestDossierPreview.rightsDateTime}</p>
                <p><strong>Suspect :</strong> {currentArrestDossierPreview.suspectLine}</p>
                <p><strong>Avocat(s) en charge :</strong> {currentArrestDossierPreview.lawyers}</p>
                <p><strong>Juge(s) / Procureur(s) en charge :</strong> {currentArrestDossierPreview.judges}</p>
              </section>

              <section className="incident-document-section">
                <h4>Agents impliqués</h4>
                <div className="incident-document-section-rule" />
                <ul className="incident-document-list">
                  {currentArrestDossierPreview.agents.map((agent) => (
                    <li key={agent}>{agent}</li>
                  ))}
                </ul>
              </section>

              <section className="incident-document-section">
                <h4>Rapport détaillé</h4>
                <div className="incident-document-section-rule" />
                <div className="incident-document-textbox">
                  <p>{currentArrestDossierPreview.report}</p>
                </div>
              </section>

              <section className="incident-document-section">
                <h4>Charges appliquées</h4>
                <div className="incident-document-section-rule" />
                <table className="arrest-dossier-preview-table">
                  <thead>
                    <tr>
                      <th>Charge</th>
                      <th>Quantité</th>
                      <th>Tentative</th>
                      <th>Complicité</th>
                      <th>Amende</th>
                      <th>Peine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentArrestDossierPreview.chargeRows.map((row) => (
                      <tr key={`${row.label}-${row.quantity}`}>
                        <td>{row.label}</td>
                        <td>{row.quantity}</td>
                        <td>{row.tentative}</td>
                        <td>{row.complicity}</td>
                        <td>{row.fine.toFixed(2)} $</td>
                        <td>{row.jail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="arrest-dossier-preview-scale">{currentArrestDossierPreview.fineScale}</p>
                <p className="arrest-dossier-preview-total">Total Amende : {currentArrestDossierPreview.totalFine}</p>
                <p className="arrest-dossier-preview-total">Total UP : {currentArrestDossierPreview.totalJail}</p>
              </section>

              <section className="incident-document-section">
                <h4>Véhicules utilisés</h4>
                <div className="incident-document-section-rule" />
                <table className="arrest-dossier-preview-table arrest-dossier-preview-table-vehicles">
                  <thead>
                    <tr>
                      <th>Modèle</th>
                      <th>Plaque</th>
                      <th>Volé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentArrestDossierPreview.vehicles.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td>{vehicle.model}</td>
                        <td>{vehicle.plate}</td>
                        <td>{vehicle.stolen ? 'Oui' : 'Non'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {currentArrestDossierPreview.proofImages.length > 0 ? (
                <section className="incident-document-section">
                  <h4>Dossier photos / preuves</h4>
                  <div className="incident-document-section-rule" />
                  <div className="incident-document-evidence-row">
                    {currentArrestDossierPreview.proofImages.map((image, index) => (
                      <img key={`proof-${index}`} src={image} alt={`Preuve ${index + 1}`} />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        ) : null}

        {isOperationReportCreateModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsOperationReportCreateModalOpen(false)}>
            <div className="case-modal case-modal-large operation-modal" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Créer un rapport d'opération</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsOperationReportCreateModalOpen(false)}>×</button>
              </div>

              <div className="edit-citizen-divider" />

              <div className="case-form-grid operation-modal-grid">
                <label className="edit-field">
                  <span>Date et heure <span className="case-required">*</span></span>
                  <input value={operationReportForm.dateTime} onChange={(event) => handleOperationReportFieldChange('dateTime', event.target.value)} />
                </label>

                <label className="edit-field">
                  <span>Type d'incident <span className="case-required">*</span></span>
                  <input value={operationReportForm.incidentType} onChange={(event) => handleOperationReportFieldChange('incidentType', event.target.value)} />
                </label>

                <div className="edit-field operation-modal-full">
                  <span>Officiers impliqués <span className="case-required">*</span></span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-tags case-select-shell-full operation-modal-tagshell">
                      <div className="case-tags-wrap">
                        {operationReportForm.selectedOfficers.map((officer) => (
                          <span className="case-tag" key={officer}>
                            {officer}
                            <button type="button" onClick={() => removeOperationReportOfficer(officer)}>x</button>
                          </span>
                        ))}
                        <input
                          className="operation-tag-input"
                          placeholder="Rechercher un officier..."
                          value={operationReportForm.officersQuery}
                          onFocus={() => setIsOperationOfficersDropdownOpen(true)}
                          onChange={(event) => {
                            handleOperationReportFieldChange('officersQuery', event.target.value)
                            setIsOperationOfficersDropdownOpen(true)
                          }}
                        />
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsOperationOfficersDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isOperationOfficersDropdownOpen ? (
                      <div className="case-dropdown-list case-dropdown-list-tall">
                        {filteredOperationOfficerOptions.map((officer) => (
                          <button className="case-dropdown-item" key={officer.id} type="button" onClick={() => addOperationReportOfficer(officer)}>
                            {formatOfficerOption(officer)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="edit-field operation-modal-full">
                  <span>Otages</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-tags case-select-shell-full operation-modal-tagshell">
                      <div className="case-tags-wrap">
                        {operationReportForm.selectedHostages.map((hostage) => (
                          <span className="case-tag" key={hostage}>
                            {hostage}
                            <button type="button" onClick={() => removeOperationReportHostage(hostage)}>x</button>
                          </span>
                        ))}
                        <input
                          className="operation-tag-input"
                          placeholder="Rechercher un otage..."
                          value={operationReportForm.hostagesQuery}
                          onFocus={() => setIsOperationHostagesDropdownOpen(true)}
                          onChange={(event) => {
                            handleOperationReportFieldChange('hostagesQuery', event.target.value)
                            setIsOperationHostagesDropdownOpen(true)
                          }}
                        />
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsOperationHostagesDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isOperationHostagesDropdownOpen ? (
                      <div className="case-dropdown-list case-dropdown-list-tall">
                        {filteredOperationHostageOptions.map((hostage) => (
                          <button className="case-dropdown-item" key={hostage} type="button" onClick={() => addOperationReportHostage(hostage)}>
                            {hostage}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <label className="edit-field operation-modal-full">
                  <span>Lieu <span className="case-required">*</span></span>
                  <input value={operationReportForm.location} onChange={(event) => handleOperationReportFieldChange('location', event.target.value)} />
                </label>

                <label className="edit-field operation-modal-full">
                  <span>Revendications</span>
                  <input value={operationReportForm.claims} onChange={(event) => handleOperationReportFieldChange('claims', event.target.value)} />
                </label>

                <div className="edit-field">
                  <span>Lead négociateur</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-full">
                      <input
                        placeholder="Sélectionner un officier"
                        value={operationReportForm.negotiationLead}
                        onFocus={() => setIsOperationNegotiationLeadDropdownOpen(true)}
                        onChange={(event) => {
                          handleOperationReportFieldChange('negotiationLead', event.target.value)
                          setIsOperationNegotiationLeadDropdownOpen(true)
                        }}
                      />
                      <button className="case-select-button" type="button" onClick={() => setIsOperationNegotiationLeadDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>
                    {isOperationNegotiationLeadDropdownOpen ? (
                      <div className="case-dropdown-list case-dropdown-list-tall">
                        {officerOptionsData.map((officer) => (
                          <button className="case-dropdown-item" key={officer.id} type="button" onClick={() => {
                            handleOperationReportFieldChange('negotiationLead', formatOfficerOption(officer))
                            setIsOperationNegotiationLeadDropdownOpen(false)
                          }}>
                            {formatOfficerOption(officer)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="edit-field">
                  <span>Lead terrain</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-full">
                      <input
                        placeholder="Sélectionner un officier"
                        value={operationReportForm.fieldLead}
                        onFocus={() => setIsOperationFieldLeadDropdownOpen(true)}
                        onChange={(event) => {
                          handleOperationReportFieldChange('fieldLead', event.target.value)
                          setIsOperationFieldLeadDropdownOpen(true)
                        }}
                      />
                      <button className="case-select-button" type="button" onClick={() => setIsOperationFieldLeadDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>
                    {isOperationFieldLeadDropdownOpen ? (
                      <div className="case-dropdown-list case-dropdown-list-tall">
                        {officerOptionsData.map((officer) => (
                          <button className="case-dropdown-item" key={officer.id} type="button" onClick={() => {
                            handleOperationReportFieldChange('fieldLead', formatOfficerOption(officer))
                            setIsOperationFieldLeadDropdownOpen(false)
                          }}>
                            {formatOfficerOption(officer)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="case-field-block">
                <span className="case-field-label">Rapport complet <span className="case-required">*</span></span>
                <EditorShell value={operationReportForm.report} onChange={(v) => handleOperationReportFieldChange('report', v)} textareaClassName="case-editor-area-large" />
              </div>

              <div className="case-field-block">
                <span className="case-field-label">Dossiers photos (preuves)</span>
                <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                  <div className="case-select-shell case-select-shell-tags case-select-shell-full">
                    <div className="case-tags-wrap">
                      {operationReportForm.selectedProofFolders.map((folder) => (
                        <span className="case-tag" key={folder}>
                          {folder}
                          <button type="button" onClick={() => toggleOperationProofFolder(folder)}>x</button>
                        </span>
                      ))}
                    </div>
                    <button className="case-select-button" type="button" onClick={() => setIsOperationProofDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                  </div>
                  {isOperationProofDropdownOpen ? (
                    <div className="case-dropdown-list case-dropdown-list-tall">
                      {proofFolderOptions.map((folder) => (
                        <button className="case-dropdown-item" key={folder} type="button" onClick={() => toggleOperationProofFolder(folder)}>
                          {folder}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="case-proof-block operation-proof-block">
                <span className="case-field-label">Photos preuves</span>
                <div className="case-proof-dropzone" onPaste={handlePasteIntoOperationReportProofs} tabIndex={0}>
                  Coller une ou plusieurs images (CTRL + V)
                </div>
                {operationReportPastedImages.length > 0 ? (
                  <div className="pasted-image-grid pasted-image-grid-compact operation-images-grid">
                    {operationReportPastedImages.map((image, index) => (
                      <article className="pasted-image-card" key={`${image.slice(0, 32)}-${index}`}>
                        <img className="pasted-image-preview" src={image} alt={`Preuve ${index + 1}`} />
                        <button className="pasted-image-remove" type="button" onClick={() => removeOperationReportImage(index)}>×</button>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="case-modal-footer">
                <button className="case-primary-button" type="button" onClick={submitOperationReportForm}>Créer le rapport</button>
              </div>
            </div>
          </div>
        ) : null}

        {isCitizenComplaintModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsCitizenComplaintModalOpen(false)}>
            <div className="case-modal case-modal-large citizen-complaint-modal" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Encoder une plainte</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsCitizenComplaintModalOpen(false)}>×</button>
              </div>

              <div className="edit-citizen-divider" />

              <div className="case-form-grid citizen-complaint-grid">
                <label className="edit-field citizen-complaint-full">
                  <span>Date et heure</span>
                  <input value={citizenComplaintForm.dateTime} onChange={(event) => handleCitizenComplaintFieldChange('dateTime', event.target.value)} />
                </label>

                <div className="edit-field citizen-complaint-full">
                  <span>Officiers en charge</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-tags case-select-shell-full citizen-complaint-tagshell">
                      <div className="case-tags-wrap">
                        {citizenComplaintForm.selectedOfficers.map((officer) => (
                          <span className="case-tag" key={officer}>
                            {officer}
                            <button type="button" onClick={() => removeCitizenComplaintOfficer(officer)}>x</button>
                          </span>
                        ))}
                        <input
                          className="citizen-complaint-tag-input"
                          placeholder="Ajoutez tous les officiers en charge (dont vous)"
                          value={citizenComplaintForm.officersQuery}
                          onFocus={() => setIsCitizenComplaintOfficersDropdownOpen(true)}
                          onChange={(event) => {
                            handleCitizenComplaintFieldChange('officersQuery', event.target.value)
                            setIsCitizenComplaintOfficersDropdownOpen(true)
                          }}
                        />
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsCitizenComplaintOfficersDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isCitizenComplaintOfficersDropdownOpen ? (
                      <div className="case-dropdown-list citizen-complaint-dropdown-list">
                        {filteredCitizenComplaintOfficerOptions.map((officer) => (
                          <button className="case-dropdown-item" key={officer.id} type="button" onClick={() => addCitizenComplaintOfficer(officer)}>
                            {formatOfficerOption(officer)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="edit-field citizen-complaint-full">
                  <span>Avocat(s)</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-tags case-select-shell-full citizen-complaint-tagshell">
                      <div className="case-tags-wrap">
                        {citizenComplaintForm.selectedLawyers.map((lawyer) => (
                          <span className="case-tag" key={lawyer}>
                            {lawyer}
                            <button type="button" onClick={() => removeCitizenComplaintLawyer(lawyer)}>x</button>
                          </span>
                        ))}
                        <input
                          className="citizen-complaint-tag-input"
                          placeholder="Ajoutez les avocats concernés par la plainte"
                          value={citizenComplaintForm.lawyersQuery}
                          onFocus={() => setIsCitizenComplaintLawyersDropdownOpen(true)}
                          onChange={(event) => {
                            handleCitizenComplaintFieldChange('lawyersQuery', event.target.value)
                            setIsCitizenComplaintLawyersDropdownOpen(true)
                          }}
                        />
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsCitizenComplaintLawyersDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isCitizenComplaintLawyersDropdownOpen ? (
                      <div className="case-dropdown-list citizen-complaint-dropdown-list">
                        {filteredCitizenComplaintLawyerOptions.map((lawyer) => (
                          <button className="case-dropdown-item" key={lawyer} type="button" onClick={() => addCitizenComplaintLawyer(lawyer)}>
                            {lawyer}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <label className="edit-field">
                  <span>Raison <span className="case-required">*</span></span>
                  <input value={citizenComplaintForm.reason} onChange={(event) => handleCitizenComplaintFieldChange('reason', event.target.value)} />
                </label>

                <label className="edit-field">
                  <span>Contre <span className="case-required">*</span></span>
                  <input value={citizenComplaintForm.against} onChange={(event) => handleCitizenComplaintFieldChange('against', event.target.value)} />
                </label>

                <div className="edit-field citizen-complaint-full">
                  <span>Statut</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <button className="complaint-filter-button citizen-complaint-status-button" type="button" onClick={() => setIsCitizenComplaintStatusDropdownOpen((current) => !current)}>
                      <span className={`complaint-status-pill ${complaintStatusClassMap[citizenComplaintForm.status] ?? 'complaint-status-default'}`}>
                        <span className="complaint-status-dot" />
                        {citizenComplaintForm.status}
                      </span>
                      <SelectCaretIcon />
                    </button>

                    {isCitizenComplaintStatusDropdownOpen ? (
                      <div className="question-dropdown-list complaint-dropdown-list citizen-complaint-status-list" onClick={(event) => event.stopPropagation()}>
                        {complaintFormStatusOptions.map((option) => (
                          <button
                            className={`citizen-complaint-status-item${option === citizenComplaintForm.status ? ' citizen-complaint-status-item-active' : ''}`}
                            key={option}
                            type="button"
                            onClick={() => {
                              handleCitizenComplaintFieldChange('status', option)
                              setIsCitizenComplaintStatusDropdownOpen(false)
                            }}
                          >
                            <span className={`citizen-complaint-status-marker ${complaintStatusClassMap[option] ?? 'complaint-status-default'}`} />
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="case-field-block citizen-complaint-editor-block">
                <span className="case-field-label">Corps de la plainte <span className="case-required">*</span></span>
                <EditorShell value={citizenComplaintForm.body} onChange={(v) => handleCitizenComplaintFieldChange('body', v)} textareaClassName="citizen-complaint-editor" />
              </div>

              <div className="case-proof-block citizen-complaint-proof-block">
                <span className="case-field-label">Photos preuves :</span>
                <div className="case-proof-dropzone citizen-complaint-dropzone" onPaste={handlePasteIntoCitizenComplaint} tabIndex={0} />
                {citizenComplaintPastedImages.length > 0 ? (
                  <div className="pasted-image-grid pasted-image-grid-compact citizen-complaint-images-grid">
                    {citizenComplaintPastedImages.map((image, index) => (
                      <article className="pasted-image-card" key={`${image.slice(0, 32)}-${index}`}>
                        <img className="pasted-image-preview" src={image} alt={`Preuve ${index + 1}`} />
                        <button className="pasted-image-remove" type="button" onClick={() => removeCitizenComplaintImage(index)}>×</button>
                      </article>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="case-modal-footer citizen-complaint-footer">
                <button className="case-primary-button" type="button" onClick={submitCitizenComplaintForm}>Ajouter la plainte</button>
              </div>
            </div>
          </div>
        ) : null}

        {isInterrogationModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsInterrogationModalOpen(false)}>
            <div className="case-modal case-modal-large interrogation-modal" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Ajouter un interrogatoire</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsInterrogationModalOpen(false)}>×</button>
              </div>

              <div className="edit-citizen-divider" />

              <div className="case-form-grid interrogation-modal-grid">
                <div className="edit-field interrogation-modal-full">
                  <span>Citoyen interrogé</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-full">
                      <input
                        placeholder="Rechercher un citoyen..."
                        value={interrogationForm.citizenQuery}
                        onFocus={() => setIsInterrogationCitizenDropdownOpen(true)}
                        onChange={(event) => {
                          handleInterrogationFieldChange('citizenQuery', event.target.value)
                          handleInterrogationFieldChange('citizenName', event.target.value)
                          setIsInterrogationCitizenDropdownOpen(true)
                        }}
                      />
                      <button className="case-select-button" type="button" onClick={() => setIsInterrogationCitizenDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isInterrogationCitizenDropdownOpen ? (
                      <div className="case-dropdown-list interrogation-dropdown-list">
                        {filteredInterrogationCitizenOptions.map((citizen) => (
                          <button
                            className="case-dropdown-item"
                            key={citizen}
                            type="button"
                            onClick={() => {
                              handleInterrogationFieldChange('citizenQuery', citizen)
                              handleInterrogationFieldChange('citizenName', citizen)
                              setIsInterrogationCitizenDropdownOpen(false)
                            }}
                          >
                            {citizen}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <label className="edit-field">
                  <span>Date et heure du début</span>
                  <input value={interrogationForm.startedAt} onChange={(event) => handleInterrogationFieldChange('startedAt', event.target.value)} />
                </label>

                <label className="edit-field">
                  <span>Date et heure de fin</span>
                  <input value={interrogationForm.endedAt} onChange={(event) => handleInterrogationFieldChange('endedAt', event.target.value)} />
                </label>

                <div className="edit-field interrogation-modal-full">
                  <span>Personnes présente (DOJ & SASP) + VOUS :</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-tags case-select-shell-full interrogation-modal-tagshell">
                      <div className="case-tags-wrap">
                        {interrogationForm.selectedParticipants.map((participant) => (
                          <span className="case-tag" key={participant}>
                            {participant}
                            <button type="button" onClick={() => removeInterrogationParticipant(participant)}>x</button>
                          </span>
                        ))}
                        <input
                          className="interrogation-tag-input"
                          placeholder="Sélectionnez les participants..."
                          value={interrogationForm.participantsQuery}
                          onFocus={() => setIsInterrogationParticipantsDropdownOpen(true)}
                          onChange={(event) => {
                            handleInterrogationFieldChange('participantsQuery', event.target.value)
                            setIsInterrogationParticipantsDropdownOpen(true)
                          }}
                        />
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsInterrogationParticipantsDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isInterrogationParticipantsDropdownOpen ? (
                      <div className="case-dropdown-list interrogation-dropdown-list">
                        {filteredInterrogationParticipantOptions.map((officer) => (
                          <button className="case-dropdown-item" key={officer.id} type="button" onClick={() => addInterrogationParticipant(officer)}>
                            {formatOfficerOption(officer)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="edit-field interrogation-modal-full">
                  <span>Poste de police</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-full">
                      <input
                        value={interrogationForm.policePost}
                        onFocus={() => setIsInterrogationPolicePostDropdownOpen(true)}
                        onChange={(event) => {
                          handleInterrogationFieldChange('policePost', event.target.value)
                          setIsInterrogationPolicePostDropdownOpen(true)
                        }}
                      />
                      <button className="case-select-button" type="button" onClick={() => setIsInterrogationPolicePostDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isInterrogationPolicePostDropdownOpen ? (
                      <div className="case-dropdown-list interrogation-dropdown-list">
                        {arrestDossierPolicePostOptions.map((option) => (
                          <button
                            className="case-dropdown-item"
                            key={option}
                            type="button"
                            onClick={() => {
                              handleInterrogationFieldChange('policePost', option)
                              setIsInterrogationPolicePostDropdownOpen(false)
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="case-field-block">
                <span className="case-field-label">Interrogatoire</span>
                <EditorShell value={interrogationForm.report} onChange={(v) => handleInterrogationFieldChange('report', v)} shellClassName="interrogation-editor-shell" textareaClassName="case-editor-area-large interrogation-editor" />
              </div>

              <div className="case-modal-footer interrogation-modal-footer">
                <button className="case-primary-button interrogation-submit-button" type="button" onClick={submitInterrogationForm}>Ajouter</button>
              </div>
            </div>
          </div>
        ) : null}

        {isEvidenceFolderModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsEvidenceFolderModalOpen(false)}>
            <div className="case-modal evidence-folder-modal" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Créer un dossier photo preuve</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsEvidenceFolderModalOpen(false)}>×</button>
              </div>

              <div className="edit-citizen-divider" />

              <label className="edit-field evidence-folder-field">
                <span>Nom du dossier</span>
                <input
                  value={evidenceFolderForm.title}
                  onChange={(event) => handleEvidenceFolderFieldChange('title', event.target.value)}
                  placeholder="Exemple : Fleeca GOH"
                />
              </label>

              <div className="case-modal-footer evidence-folder-footer">
                <button className="case-primary-button" type="button" onClick={submitEvidenceFolderForm}>Créer le dossier</button>
              </div>
            </div>
          </div>
        ) : null}

        {isProfileSettingsModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsProfileSettingsModalOpen(false)}>
            <div className="case-modal profile-settings-modal" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Modifier mon profil</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsProfileSettingsModalOpen(false)}>×</button>
              </div>

              <div className="edit-citizen-divider" />

              <div className="case-form-grid profile-settings-grid">
                <label className="edit-field">
                  <span>Nom affiché</span>
                  <input value={profileSettingsForm.name} onChange={(event) => handleProfileSettingsFieldChange('name', event.target.value)} />
                </label>

                <label className="edit-field">
                  <span>Badge</span>
                  <input value={profileSettingsForm.badge} onChange={(event) => handleProfileSettingsFieldChange('badge', event.target.value)} />
                </label>

                <label className="edit-field">
                  <span>Numéro</span>
                  <input value={profileSettingsForm.phone} onChange={(event) => handleProfileSettingsFieldChange('phone', event.target.value)} />
                </label>

                <label className="edit-field">
                  <span>IBAN</span>
                  <input value={profileSettingsForm.iban} onChange={(event) => handleProfileSettingsFieldChange('iban', event.target.value)} />
                </label>

                <label className="edit-field profile-settings-full">
                  <span>Email</span>
                  <input value={profileSettingsForm.email} onChange={(event) => handleProfileSettingsFieldChange('email', event.target.value)} />
                </label>
              </div>

              <div className="case-modal-footer profile-settings-footer">
                <button className="case-primary-button" type="button" onClick={submitProfileSettingsForm}>Enregistrer</button>
              </div>
            </div>
          </div>
        ) : null}

        {isWeaponEditModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsWeaponEditModalOpen(false)}>
            <div className="weapon-modal weapon-edit-modal" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Editer l'arme n°{weaponEditForm.serial}</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsWeaponEditModalOpen(false)}>×</button>
              </div>

              <div className="edit-citizen-divider" />

              <div className="weapon-modal-grid weapon-edit-modal-grid">
                <label className="weapon-checkbox-row">
                  <input type="checkbox" checked={weaponEditForm.stolen} onChange={(event) => handleWeaponEditFieldChange('stolen', event.target.checked)} />
                  <span>Arme volée</span>
                </label>

                <label className="weapon-checkbox-row">
                  <input type="checkbox" checked={weaponEditForm.archived} onChange={(event) => handleWeaponEditFieldChange('archived', event.target.checked)} />
                  <span>Arme archivée</span>
                </label>

                <label className="weapon-checkbox-row weapon-edit-checkbox-right">
                  <input type="checkbox" checked={weaponEditForm.checkedPs} onChange={(event) => handleWeaponEditFieldChange('checkedPs', event.target.checked)} />
                  <span>Arme checkée par la PS</span>
                </label>

                <label className="edit-field">
                  <span>Motif(s)</span>
                  <input value={weaponEditForm.reason} onChange={(event) => handleWeaponEditFieldChange('reason', event.target.value)} />
                </label>

                <div className="edit-field">
                  <span>Modèle de l'arme</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell weapon-owner-shell">
                      <input
                        value={weaponEditForm.model}
                        onFocus={() => setIsWeaponEditModelDropdownOpen(true)}
                        onChange={(event) => {
                          handleWeaponEditFieldChange('model', event.target.value)
                          setIsWeaponEditModelDropdownOpen(true)
                        }}
                      />
                      {weaponEditForm.model ? (
                        <button className="vehicle-owner-clear" type="button" onClick={() => handleWeaponEditFieldChange('model', '')}>×</button>
                      ) : null}
                      <button className="case-select-button" type="button" onClick={() => setIsWeaponEditModelDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isWeaponEditModelDropdownOpen ? (
                      <div className="case-dropdown-list weapon-modal-dropdown-right">
                        {filteredWeaponEditModelOptions.map((model) => (
                          <button className="case-dropdown-item" key={model} type="button" onClick={() => {
                            handleWeaponEditFieldChange('model', model)
                            setIsWeaponEditModelDropdownOpen(false)
                          }}>
                            {model}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="edit-field">
                  <span>Origine <span className="case-required">*</span></span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-full">
                      <input value={weaponEditForm.origin} readOnly onClick={() => setIsWeaponEditOriginDropdownOpen((current) => !current)} />
                      <button className="case-select-button" type="button" onClick={() => setIsWeaponEditOriginDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isWeaponEditOriginDropdownOpen ? (
                      <div className="case-dropdown-list weapon-modal-dropdown-left">
                        {weaponOriginOptions.filter((option) => option !== 'Toutes les origines').map((option) => (
                          <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                            handleWeaponEditFieldChange('origin', option)
                            setIsWeaponEditOriginDropdownOpen(false)
                          }}>
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="edit-field">
                  <span>Policier assigné</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-full">
                      <input
                        placeholder="Sélectionner un policier"
                        value={weaponEditForm.assignedOfficer}
                        onFocus={() => setIsWeaponEditOfficerDropdownOpen(true)}
                        onChange={(event) => {
                          handleWeaponEditFieldChange('assignedOfficer', event.target.value)
                          setIsWeaponEditOfficerDropdownOpen(true)
                        }}
                      />
                      <button className="case-select-button" type="button" onClick={() => setIsWeaponEditOfficerDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isWeaponEditOfficerDropdownOpen ? (
                      <div className="case-dropdown-list weapon-modal-dropdown-right">
                        {filteredWeaponEditOfficerOptions.map((officer) => (
                          <button className="case-dropdown-item" key={officer.id} type="button" onClick={() => {
                            handleWeaponEditFieldChange('assignedOfficer', formatOfficerOption(officer))
                            setIsWeaponEditOfficerDropdownOpen(false)
                          }}>
                            {formatOfficerOption(officer)}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="case-modal-footer weapon-edit-footer">
                <button className="case-primary-button" type="button" onClick={submitWeaponEditForm}>Mettre à jour</button>
              </div>
            </div>
          </div>
        ) : null}

        {isAddVehicleModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsAddVehicleModalOpen(false)}>
            <div className="vehicle-modal" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Ajouter un véhicule en infraction</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsAddVehicleModalOpen(false)}>×</button>
              </div>

              <div className="edit-citizen-divider" />

              <div className="vehicle-modal-grid">
                <div className="edit-field vehicle-field-block">
                  <span>Type de véhicule (Merci de ne pas mettre de couleur et verifier que le type n'existe pas avant de le créer)</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell">
                      <input
                        placeholder="Sélectionnez ou créez un type de véhicule"
                        value={vehicleOffenseForm.vehicleType}
                        onFocus={() => setIsVehicleTypeDropdownOpen(true)}
                        onChange={(event) => {
                          handleVehicleOffenseFieldChange('vehicleType', event.target.value)
                          setIsVehicleTypeDropdownOpen(true)
                        }}
                      />
                      <button className="case-select-button" type="button" onClick={() => setIsVehicleTypeDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isVehicleTypeDropdownOpen ? (
                      <div className="case-dropdown-list vehicle-modal-dropdown-left">
                        {filteredVehicleTypeOptions.map((type) => (
                          <button className="case-dropdown-item" key={type} type="button" onClick={() => {
                            handleVehicleOffenseFieldChange('vehicleType', type)
                            setIsVehicleTypeDropdownOpen(false)
                          }}>
                            {type}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <label className="edit-field vehicle-field-block">
                  <span>Plaque du véhicule <span className="case-required">*</span></span>
                  <input value={vehicleOffenseForm.plate} onChange={(event) => handleVehicleOffenseFieldChange('plate', event.target.value)} />
                </label>

                <label className="edit-field vehicle-field-block">
                  <span>Titre infraction <span className="case-required">*</span></span>
                  <input value={vehicleOffenseForm.title} onChange={(event) => handleVehicleOffenseFieldChange('title', event.target.value)} />
                </label>

                <div className="edit-field vehicle-field-block">
                  <span>Propriétaire</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell vehicle-owner-shell">
                      <input
                        placeholder="Rechercher un citoyen..."
                        value={vehicleOffenseForm.selectedOwner || vehicleOffenseForm.ownerQuery}
                        onFocus={() => setIsVehicleOwnerDropdownOpen(true)}
                        onChange={(event) => {
                          handleVehicleOffenseFieldChange('ownerQuery', event.target.value)
                          handleVehicleOffenseFieldChange('selectedOwner', '')
                          setIsVehicleOwnerDropdownOpen(true)
                        }}
                      />
                      {vehicleOffenseForm.selectedOwner ? (
                        <button className="vehicle-owner-clear" type="button" onClick={() => {
                          handleVehicleOffenseFieldChange('selectedOwner', '')
                          handleVehicleOffenseFieldChange('ownerQuery', '')
                        }}>×</button>
                      ) : null}
                      <button className="case-select-button" type="button" onClick={() => setIsVehicleOwnerDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isVehicleOwnerDropdownOpen ? (
                      <div className="case-dropdown-list vehicle-modal-dropdown-right">
                        {filteredVehicleOwnerOptions.map((owner) => (
                          <button className="case-dropdown-item" key={owner} type="button" onClick={() => {
                            handleVehicleOffenseFieldChange('selectedOwner', owner)
                            handleVehicleOffenseFieldChange('ownerQuery', '')
                            setIsVehicleOwnerDropdownOpen(false)
                          }}>
                            {owner}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="edit-field vehicle-field-block">
                  <span>Photo preuve lié</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell">
                      <input
                        placeholder="Rechercher un dossier de preuves..."
                        value={vehicleOffenseForm.proofFolder}
                        onFocus={() => setIsVehicleProofDropdownOpen(true)}
                        onChange={(event) => {
                          handleVehicleOffenseFieldChange('proofFolder', event.target.value)
                          setIsVehicleProofDropdownOpen(true)
                        }}
                      />
                      <button className="case-select-button" type="button" onClick={() => setIsVehicleProofDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isVehicleProofDropdownOpen ? (
                      <div className="case-dropdown-list vehicle-modal-dropdown-left">
                        {filteredProofFolderOptions.map((proof) => (
                          <button className="case-dropdown-item" key={proof} type="button" onClick={() => {
                            handleVehicleOffenseFieldChange('proofFolder', proof)
                            setIsVehicleProofDropdownOpen(false)
                          }}>
                            {proof}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="edit-field vehicle-field-block">
                  <span>Rapport d'opération lié</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell">
                      <input
                        placeholder="Rechercher un rapport d'opération"
                        value={vehicleOffenseForm.operationReport}
                        onFocus={() => setIsVehicleOperationDropdownOpen(true)}
                        onChange={(event) => {
                          handleVehicleOffenseFieldChange('operationReport', event.target.value)
                          setIsVehicleOperationDropdownOpen(true)
                        }}
                      />
                      <button className="case-select-button" type="button" onClick={() => setIsVehicleOperationDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isVehicleOperationDropdownOpen ? (
                      <div className="case-dropdown-list vehicle-modal-dropdown-right vehicle-modal-dropdown-short">
                        {filteredOperationReportOptions.map((report) => (
                          <button className="case-dropdown-item" key={report} type="button" onClick={() => {
                            handleVehicleOffenseFieldChange('operationReport', report)
                            setIsVehicleOperationDropdownOpen(false)
                          }}>
                            {report}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="case-modal-footer vehicle-modal-footer">
                <button className="case-primary-button" type="button" onClick={submitVehicleOffenseForm}>Créer</button>
              </div>
            </div>
          </div>
        ) : null}

        {isWeaponEncodeModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsWeaponEncodeModalOpen(false)}>
            <div className="weapon-modal" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Encodage d'une arme</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsWeaponEncodeModalOpen(false)}>×</button>
              </div>

              <div className="edit-citizen-divider" />

              <div className="weapon-modal-grid">
                <label className="edit-field weapon-modal-wide">
                  <span>Date et heure</span>
                  <input value={weaponEncodeForm.dateTime} onChange={(event) => handleWeaponEncodeFieldChange('dateTime', event.target.value)} />
                </label>

                <label className="edit-field">
                  <span>Origine <span className="case-required">*</span></span>
                  <div className="case-select-shell">
                    <input value={weaponEncodeForm.origin} onChange={(event) => handleWeaponEncodeFieldChange('origin', event.target.value)} />
                    <button className="case-select-button" type="button"><SelectCaretIcon /></button>
                  </div>
                </label>

                <div className="edit-field">
                  <span>Modèle de l'arme</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell weapon-owner-shell">
                      <input
                        placeholder="Sélectionnez ou entrez un modèle"
                        value={weaponEncodeForm.model}
                        onFocus={() => setIsWeaponModelDropdownOpen(true)}
                        onChange={(event) => {
                          handleWeaponEncodeFieldChange('model', event.target.value)
                          setIsWeaponModelDropdownOpen(true)
                        }}
                      />
                      {weaponEncodeForm.model ? (
                        <button className="vehicle-owner-clear" type="button" onClick={() => handleWeaponEncodeFieldChange('model', '')}>×</button>
                      ) : null}
                      <button className="case-select-button" type="button" onClick={() => setIsWeaponModelDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isWeaponModelDropdownOpen ? (
                      <div className="case-dropdown-list weapon-modal-dropdown-right">
                        {filteredWeaponModelOptions.map((model) => (
                          <button className="case-dropdown-item" key={model} type="button" onClick={() => {
                            handleWeaponEncodeFieldChange('model', model)
                            setIsWeaponModelDropdownOpen(false)
                          }}>
                            {model}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <label className="edit-field">
                  <span>Numéro de série <span className="case-required">*</span></span>
                  <input value={weaponEncodeForm.serial} onChange={(event) => handleWeaponEncodeFieldChange('serial', event.target.value)} />
                </label>

                <label className="edit-field">
                  <span>Motif(s)</span>
                  <input value={weaponEncodeForm.reason} onChange={(event) => handleWeaponEncodeFieldChange('reason', event.target.value)} />
                </label>

                <div className="edit-field">
                  <span>Citoyen lié (arme saisie)</span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell weapon-owner-shell">
                      <input
                        placeholder="Rechercher un citoyen..."
                        value={weaponEncodeForm.selectedCitizen || weaponEncodeForm.citizenQuery}
                        onFocus={() => setIsWeaponCitizenDropdownOpen(true)}
                        onChange={(event) => {
                          handleWeaponEncodeFieldChange('citizenQuery', event.target.value)
                          handleWeaponEncodeFieldChange('selectedCitizen', '')
                          setIsWeaponCitizenDropdownOpen(true)
                        }}
                      />
                      {weaponEncodeForm.selectedCitizen ? (
                        <button className="vehicle-owner-clear" type="button" onClick={() => {
                          handleWeaponEncodeFieldChange('selectedCitizen', '')
                          handleWeaponEncodeFieldChange('citizenQuery', '')
                        }}>×</button>
                      ) : null}
                      <button className="case-select-button" type="button" onClick={() => setIsWeaponCitizenDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>

                    {isWeaponCitizenDropdownOpen ? (
                      <div className="case-dropdown-list weapon-modal-dropdown-left">
                        {filteredWeaponCitizenOptions.length > 0 ? (
                          filteredWeaponCitizenOptions.map((citizen) => (
                            <button className="case-dropdown-item" key={citizen} type="button" onClick={() => {
                              handleWeaponEncodeFieldChange('selectedCitizen', citizen)
                              handleWeaponEncodeFieldChange('citizenQuery', '')
                              setIsWeaponCitizenDropdownOpen(false)
                            }}>
                              {citizen}
                            </button>
                          ))
                        ) : (
                          <button className="case-dropdown-item" type="button">Recherchez un citoyen...</button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                <label className="weapon-checkbox-row">
                  <input type="checkbox" checked={weaponEncodeForm.usedForCrime} onChange={(event) => handleWeaponEncodeFieldChange('usedForCrime', event.target.checked)} />
                  <span>Utilisé pour un délit</span>
                </label>
              </div>

              <div className="case-modal-footer vehicle-modal-footer">
                <button className="case-primary-button" type="button" onClick={submitWeaponEncodeForm}>Enregistrer</button>
              </div>
            </div>
          </div>
        ) : null}

        {showArrestDossierSuccessToast ? (
          <div className="success-toast" onPointerDown={() => setShowArrestDossierSuccessToast(false)}>
            <span className="success-toast-dot">●</span>
            <span>Dossier d'arrestation mis à jour avec succès</span>
            <button type="button" onClick={() => setShowArrestDossierSuccessToast(false)}>×</button>
          </div>
        ) : null}

        {showWeaponSuccessToast ? (
          <div className="success-toast" onPointerDown={() => setShowWeaponSuccessToast(false)}>
            <span className="success-toast-dot">●</span>
            <span>Arme creee avec succes</span>
            <button type="button">×</button>
          </div>
        ) : null}

        {isAddSessionModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsAddSessionModalOpen(false)}>
            <div className="case-modal case-modal-large" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Ajout d'une session PA</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsAddSessionModalOpen(false)}>×</button>
              </div>

              <div className="edit-citizen-divider" />

              <div className="session-modal-grid">
                <label className="edit-field session-modal-wide">
                  <span>Nom de la promotion <span className="case-required">*</span></span>
                  <input value={addSessionForm.name} onChange={(event) => handleAddSessionFieldChange('name', event.target.value)} />
                </label>

                <div className="edit-field session-modal-wide" onPointerDown={(event) => event.stopPropagation()}>
                  <span>Template de critères d'évaluation (attention, non modiable après) <span className="case-required">*</span></span>
                  <div className="case-select-block">
                    <div className="case-select-shell">
                      <input placeholder="Sélectionner un template..." value={addSessionForm.template} readOnly onClick={() => setIsAddSessionTemplateDropdownOpen((current) => !current)} />
                      <button className="case-select-button" type="button" onClick={() => setIsAddSessionTemplateDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>
                    {isAddSessionTemplateDropdownOpen ? (
                      <div className="case-dropdown-list session-template-dropdown">
                        {academyTemplateOptions.map((option) => (
                          <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                            handleAddSessionFieldChange('template', option)
                            setIsAddSessionTemplateDropdownOpen(false)
                          }}>{option}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <label className="edit-field">
                  <span>Date et l'heure d'ouverture de session</span>
                  <input placeholder="Sélectionnez la date et l'heure d'ouverture de session" value={addSessionForm.openedAt} onChange={(event) => handleAddSessionFieldChange('openedAt', event.target.value)} />
                </label>

                <label className="edit-field">
                  <span>Date et l'heure de fermeture de session</span>
                  <input placeholder="Sélectionnez la date et l'heure de fermeture de session" value={addSessionForm.closedAt} onChange={(event) => handleAddSessionFieldChange('closedAt', event.target.value)} />
                </label>
              </div>

              <div className="case-modal-footer">
                <button className="case-primary-button" type="button" onClick={() => setIsAddSessionModalOpen(false)}>Ajouter</button>
              </div>
            </div>
          </div>
        ) : null}

        {isEditSessionModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsEditSessionModalOpen(false)}>
            <div className="case-modal case-modal-large" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Modifier la session</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsEditSessionModalOpen(false)}>×</button>
              </div>

              <div className="edit-citizen-divider" />

              <div className="session-modal-grid">
                <label className="edit-field session-modal-wide">
                  <span>Nom de la promotion <span className="case-required">*</span></span>
                  <input value={editSessionForm.name} onChange={(event) => handleEditSessionFieldChange('name', event.target.value)} />
                </label>

                <div className="edit-field" onPointerDown={(event) => event.stopPropagation()}>
                  <span>Statut de la PA <span className="case-required">*</span></span>
                  <div className="case-select-block">
                    <div className="case-select-shell">
                      <input value={editSessionForm.status} readOnly onClick={() => setIsEditSessionStatusDropdownOpen((current) => !current)} />
                      <button className="case-select-button" type="button" onClick={() => setIsEditSessionStatusDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>
                    {isEditSessionStatusDropdownOpen ? (
                      <div className="case-dropdown-list session-template-dropdown">
                        {['Ouvert', 'Fermée'].map((option) => (
                          <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                            handleEditSessionFieldChange('status', option)
                            setIsEditSessionStatusDropdownOpen(false)
                          }}>{option}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="edit-field" onPointerDown={(event) => event.stopPropagation()}>
                  <span>Type de PA <span className="case-required">*</span></span>
                  <div className="case-select-block">
                    <div className="case-select-shell">
                      <input value={editSessionForm.type} readOnly onClick={() => setIsEditSessionTypeDropdownOpen((current) => !current)} />
                      <button className="case-select-button" type="button" onClick={() => setIsEditSessionTypeDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>
                    {isEditSessionTypeDropdownOpen ? (
                      <div className="case-dropdown-list session-template-dropdown">
                        {academySessionTypeOptions.filter((option) => option !== 'Tous les types').map((option) => (
                          <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                            handleEditSessionFieldChange('type', option)
                            setIsEditSessionTypeDropdownOpen(false)
                          }}>{option}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                <label className="edit-field">
                  <span>Date et heure d'ouverture de session <span className="case-required">*</span></span>
                  <input value={editSessionForm.openedAt} onChange={(event) => handleEditSessionFieldChange('openedAt', event.target.value)} />
                </label>

                <label className="edit-field">
                  <span>Date et heure de fermeture de session <span className="case-required">*</span></span>
                  <input value={editSessionForm.closedAt} onChange={(event) => handleEditSessionFieldChange('closedAt', event.target.value)} />
                </label>
              </div>

              <div className="case-modal-footer">
                <button className="case-primary-button" type="button" onClick={() => setIsEditSessionModalOpen(false)}>Mettre à jour</button>
              </div>
            </div>
          </div>
        ) : null}

        {isCasierModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsCasierModalOpen(false)}>
            <div className="case-modal case-modal-large" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Extrait de casier judiciaire — {selectedCitizen?.name}</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsCasierModalOpen(false)}>×</button>
              </div>
              <div className="edit-citizen-divider" />
              {selectedCitizen?.records?.arrestation?.length > 0 ? (
                <div className="case-field-block">
                  {selectedCitizen.records.arrestation.map((record) => (
                    <div key={record.id} className="casier-entry">
                      <div className="casier-entry-header">
                        <span className="casier-entry-number">{record.reportNumber}</span>
                        <span className="casier-entry-date">{record.date}</span>
                        <span className="casier-entry-status">{record.status}</span>
                      </div>
                      {record.chargeItems?.length > 0 ? (
                        <ul className="casier-entry-charges">
                          {record.chargeItems.map((charge, i) => (
                            <li key={i}>{charge.label}{charge.quantity > 1 ? ` ×${charge.quantity}` : ''}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="case-empty-text">Aucune entrée au casier judiciaire.</p>
              )}
              <div className="case-modal-footer">
                <button className="case-primary-button" type="button" onClick={() => setIsCasierModalOpen(false)}>Fermer</button>
              </div>
            </div>
          </div>
        ) : null}

        {isMandatModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsMandatModalOpen(false)}>
            <div className="case-modal case-modal-large" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Demande de mandat d'arrêt — {selectedCitizen?.name}</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsMandatModalOpen(false)}>×</button>
              </div>
              <div className="edit-citizen-divider" />
              <div className="case-form-grid">
                <label className="edit-field">
                  <span>Date et heure <span className="case-required">*</span></span>
                  <input value={mandatForm.dateTime} onChange={(event) => handleMandatFieldChange('dateTime', event.target.value)} placeholder="JJ/MM/AAAA HH:MM" />
                </label>
                <div className="edit-field" onPointerDown={(event) => event.stopPropagation()}>
                  <span>Officiers en charge</span>
                  <div className="case-select-block">
                    <div className="case-select-shell case-select-shell-tags case-select-shell-full citizen-complaint-tagshell">
                      <div className="case-tags-wrap">
                        {mandatForm.selectedOfficers.map((o) => (
                          <span className="case-tag" key={o}>{o}<button type="button" onClick={() => removeMandatOfficer(o)}>x</button></span>
                        ))}
                        <input className="citizen-complaint-tag-input" placeholder="Ajoutez des officiers..." value={mandatForm.officersQuery}
                          onFocus={() => setIsMandatOfficersDropdownOpen(true)}
                          onChange={(event) => { handleMandatFieldChange('officersQuery', event.target.value); setIsMandatOfficersDropdownOpen(true) }} />
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsMandatOfficersDropdownOpen((c) => !c)}><SelectCaretIcon /></button>
                    </div>
                    {isMandatOfficersDropdownOpen ? (
                      <div className="case-dropdown-list citizen-complaint-dropdown-list">
                        {filteredMandatOfficerOptions.map((o) => (
                          <button className="case-dropdown-item" key={o.id} type="button" onClick={() => addMandatOfficer(o)}>{formatOfficerOption(o)}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <label className="edit-field case-field-full">
                  <span>Motif du mandat <span className="case-required">*</span></span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-tags case-select-shell-full citizen-complaint-tagshell">
                      <div className="case-tags-wrap">
                        {mandatForm.selectedReasons.map((reason) => (
                          <span className="case-tag" key={reason}>{reason}<button type="button" onClick={() => removeMandatReason(reason)}>x</button></span>
                        ))}
                        <input
                          className="citizen-complaint-tag-input"
                          value={mandatForm.reasonQuery}
                          onFocus={() => setIsMandatReasonDropdownOpen(true)}
                          onChange={(event) => {
                            handleMandatFieldChange('reasonQuery', event.target.value)
                            setIsMandatReasonDropdownOpen(true)
                          }}
                          placeholder="Rechercher une ou plusieurs infractions..."
                        />
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsMandatReasonDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>
                    {isMandatReasonDropdownOpen ? (
                      <div className="case-dropdown-list citizen-complaint-dropdown-list">
                        {filteredMandatReasonOptions.map((option) => (
                          <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                            addMandatReason(option)
                          }}>{option}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </label>
              </div>
              <div className="case-field-block">
                <span className="case-field-label">Description / éléments à charge</span>
                <EditorShell value={mandatForm.description} onChange={(v) => handleMandatFieldChange('description', v)} placeholder="Détaillez les éléments justifiant la demande de mandat..." />
              </div>
              <div className="case-modal-footer">
                <button className="case-primary-button" type="button" onClick={submitMandatForm}>Soumettre la demande</button>
              </div>
            </div>
          </div>
        ) : null}

        {isTicketRoutierModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsTicketRoutierModalOpen(false)}>
            <div className="case-modal case-modal-large" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Ticket routier — {selectedCitizen?.name}</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsTicketRoutierModalOpen(false)}>×</button>
              </div>
              <div className="edit-citizen-divider" />
              <div className="case-form-grid">
                <label className="edit-field">
                  <span>Date et heure <span className="case-required">*</span></span>
                  <input value={ticketRoutierForm.dateTime} onChange={(event) => handleTicketRoutierFieldChange('dateTime', event.target.value)} placeholder="JJ/MM/AAAA HH:MM" />
                </label>
                <div className="edit-field" onPointerDown={(event) => event.stopPropagation()}>
                  <span>Officiers en charge</span>
                  <div className="case-select-block">
                    <div className="case-select-shell case-select-shell-tags case-select-shell-full citizen-complaint-tagshell">
                      <div className="case-tags-wrap">
                        {ticketRoutierForm.selectedOfficers.map((o) => (
                          <span className="case-tag" key={o}>{o}<button type="button" onClick={() => removeTicketOfficer(o)}>x</button></span>
                        ))}
                        <input className="citizen-complaint-tag-input" placeholder="Ajoutez des officiers..." value={ticketRoutierForm.officersQuery}
                          onFocus={() => setIsTicketOfficersDropdownOpen(true)}
                          onChange={(event) => { handleTicketRoutierFieldChange('officersQuery', event.target.value); setIsTicketOfficersDropdownOpen(true) }} />
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsTicketOfficersDropdownOpen((c) => !c)}><SelectCaretIcon /></button>
                    </div>
                    {isTicketOfficersDropdownOpen ? (
                      <div className="case-dropdown-list citizen-complaint-dropdown-list">
                        {filteredTicketOfficerOptions.map((o) => (
                          <button className="case-dropdown-item" key={o.id} type="button" onClick={() => addTicketOfficer(o)}>{formatOfficerOption(o)}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <label className="edit-field">
                  <span>Lieu de l'infraction</span>
                  <input value={ticketRoutierForm.location} onChange={(event) => handleTicketRoutierFieldChange('location', event.target.value)} placeholder="Ex : Autoroute 1, Los Santos" />
                </label>
                <label className="edit-field">
                  <span>Infraction constatée <span className="case-required">*</span></span>
                  <div className="case-select-block" onPointerDown={(event) => event.stopPropagation()}>
                    <div className="case-select-shell case-select-shell-tags case-select-shell-full citizen-complaint-tagshell">
                      <div className="case-tags-wrap">
                        {ticketRoutierForm.selectedInfractions.map((infraction) => (
                          <span className="case-tag" key={infraction}>{infraction}<button type="button" onClick={() => removeTicketInfraction(infraction)}>x</button></span>
                        ))}
                        <input
                          className="citizen-complaint-tag-input"
                          value={ticketRoutierForm.infractionQuery}
                          onFocus={() => setIsTicketInfractionDropdownOpen(true)}
                          onChange={(event) => {
                            handleTicketRoutierFieldChange('infractionQuery', event.target.value)
                            setIsTicketInfractionDropdownOpen(true)
                          }}
                          placeholder="Rechercher une ou plusieurs infractions routières..."
                        />
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsTicketInfractionDropdownOpen((current) => !current)}><SelectCaretIcon /></button>
                    </div>
                    {isTicketInfractionDropdownOpen ? (
                      <div className="case-dropdown-list citizen-complaint-dropdown-list">
                        {filteredTicketInfractionOptions.map((option) => (
                          <button className="case-dropdown-item" key={option} type="button" onClick={() => {
                            addTicketInfraction(option)
                          }}>{option}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </label>
                <label className="edit-field">
                  <span>Amende ($)</span>
                  <input type="number" value={ticketRoutierForm.fine} onChange={(event) => handleTicketRoutierFieldChange('fine', event.target.value)} placeholder="0" />
                </label>
                <label className="edit-field">
                  <span>Points retirés</span>
                  <input type="number" value={ticketRoutierForm.points} onChange={(event) => handleTicketRoutierFieldChange('points', event.target.value)} placeholder="0" />
                </label>
              </div>
              <div className="case-modal-footer">
                <button className="case-primary-button" type="button" onClick={submitTicketRoutierForm}>Émettre le ticket</button>
              </div>
            </div>
          </div>
        ) : null}

        {isDepositionModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsDepositionModalOpen(false)}>
            <div className="case-modal case-modal-large" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Encoder une déposition — {selectedCitizen?.name}</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsDepositionModalOpen(false)}>×</button>
              </div>
              <div className="edit-citizen-divider" />
              <div className="case-form-grid">
                <label className="edit-field">
                  <span>Date et heure <span className="case-required">*</span></span>
                  <input value={depositionForm.dateTime} onChange={(event) => handleDepositionFieldChange('dateTime', event.target.value)} placeholder="JJ/MM/AAAA HH:MM" />
                </label>
                <div className="edit-field" onPointerDown={(event) => event.stopPropagation()}>
                  <span>Officiers en charge</span>
                  <div className="case-select-block">
                    <div className="case-select-shell case-select-shell-tags case-select-shell-full citizen-complaint-tagshell">
                      <div className="case-tags-wrap">
                        {depositionForm.selectedOfficers.map((o) => (
                          <span className="case-tag" key={o}>{o}<button type="button" onClick={() => removeDepositionOfficer(o)}>x</button></span>
                        ))}
                        <input className="citizen-complaint-tag-input" placeholder="Ajoutez des officiers..." value={depositionForm.officersQuery}
                          onFocus={() => setIsDepositionOfficersDropdownOpen(true)}
                          onChange={(event) => { handleDepositionFieldChange('officersQuery', event.target.value); setIsDepositionOfficersDropdownOpen(true) }} />
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsDepositionOfficersDropdownOpen((c) => !c)}><SelectCaretIcon /></button>
                    </div>
                    {isDepositionOfficersDropdownOpen ? (
                      <div className="case-dropdown-list citizen-complaint-dropdown-list">
                        {filteredDepositionOfficerOptions.map((o) => (
                          <button className="case-dropdown-item" key={o.id} type="button" onClick={() => addDepositionOfficer(o)}>{formatOfficerOption(o)}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <label className="edit-field case-field-full">
                  <span>Objet de la déposition <span className="case-required">*</span></span>
                  <input value={depositionForm.reason} onChange={(event) => handleDepositionFieldChange('reason', event.target.value)} placeholder="Ex : Témoignage, déclaration spontanée..." />
                </label>
              </div>
              <div className="case-field-block">
                <span className="case-field-label">Contenu de la déposition</span>
                <EditorShell value={depositionForm.body} onChange={(v) => handleDepositionFieldChange('body', v)} textareaClassName="case-editor-area-large" placeholder="Retranscrivez ici la déposition du citoyen..." />
              </div>
              <div className="case-modal-footer">
                <button className="case-primary-button" type="button" onClick={submitDepositionForm}>Ajouter la déposition</button>
              </div>
            </div>
          </div>
        ) : null}

        {isBraceletEncodeModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsBraceletEncodeModalOpen(false)}>
            <div className="case-modal case-modal-large" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Encoder un bracelet électronique</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsBraceletEncodeModalOpen(false)}>×</button>
              </div>
              <div className="edit-citizen-divider" />
              <div className="case-form-grid">
                <label className="edit-field case-field-full">
                  <span>Citoyen</span>
                  <input value={braceletEncodeForm.citizen} onChange={(event) => handleBraceletEncodeFieldChange('citizen', event.target.value)} placeholder="Nom du citoyen" />
                </label>
                <div className="edit-field" onPointerDown={(event) => event.stopPropagation()}>
                  <span>Officier poseur</span>
                  <div className="case-select-block">
                    <div className="case-select-shell case-select-shell-tags case-select-shell-full citizen-complaint-tagshell">
                      <div className="case-tags-wrap">
                        {braceletEncodeForm.selectedOfficers.map((o) => (
                          <span className="case-tag" key={o}>{o}<button type="button" onClick={() => removeBraceletOfficer(o)}>x</button></span>
                        ))}
                        <input className="citizen-complaint-tag-input" placeholder="Rechercher un officier..." value={braceletEncodeForm.officersQuery}
                          onFocus={() => setIsBraceletOfficersDropdownOpen(true)}
                          onChange={(event) => { handleBraceletEncodeFieldChange('officersQuery', event.target.value); setIsBraceletOfficersDropdownOpen(true) }} />
                      </div>
                      <button className="case-select-button" type="button" onClick={() => setIsBraceletOfficersDropdownOpen((c) => !c)}><SelectCaretIcon /></button>
                    </div>
                    {isBraceletOfficersDropdownOpen ? (
                      <div className="case-dropdown-list citizen-complaint-dropdown-list">
                        {filteredBraceletOfficerOptions.map((o) => (
                          <button className="case-dropdown-item" key={o.id} type="button" onClick={() => addBraceletOfficer(o)}>{formatOfficerOption(o)}</button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
                <label className="edit-field">
                  <span>Code NPRE</span>
                  <input value={braceletEncodeForm.npre} onChange={(event) => handleBraceletEncodeFieldChange('npre', event.target.value)} placeholder="Ex : SLIC" />
                </label>
                <label className="edit-field">
                  <span>Posé le <span className="case-required">*</span></span>
                  <input value={braceletEncodeForm.placedAt} onChange={(event) => handleBraceletEncodeFieldChange('placedAt', event.target.value)} placeholder="Le JJ mois AAAA à HH:MM" />
                </label>
                <label className="edit-field">
                  <span>Expire le <span className="case-required">*</span></span>
                  <input value={braceletEncodeForm.expiresAt} onChange={(event) => handleBraceletEncodeFieldChange('expiresAt', event.target.value)} placeholder="Le JJ mois AAAA à HH:MM" />
                </label>
                <label className="edit-field case-field-full">
                  <span>Motif(s) <span className="case-required">*</span></span>
                  <input value={braceletEncodeForm.reasons} onChange={(event) => handleBraceletEncodeFieldChange('reasons', event.target.value)} placeholder="Ex : Fusillade, port d'arme de guerre..." />
                </label>
              </div>
              <div className="case-modal-footer">
                <button className="case-primary-button" type="button" onClick={submitBraceletEncodeForm}>Encoder le bracelet</button>
              </div>
            </div>
          </div>
        ) : null}

        {isDeleteSessionModalOpen ? (
          <div className="modal-overlay" onPointerDown={() => setIsDeleteSessionModalOpen(false)}>
            <div className="case-modal case-modal-large session-confirm-modal" onPointerDown={(event) => event.stopPropagation()}>
              <div className="case-modal-header">
                <h2>Confirmation</h2>
                <button className="edit-citizen-close" type="button" aria-label="Fermer" onClick={() => setIsDeleteSessionModalOpen(false)}>×</button>
              </div>

              <div className="edit-citizen-divider" />

              <p className="session-confirm-text">Êtes-vous sûr de vouloir supprimer la session PA ?</p>

              <div className="case-modal-footer case-modal-footer-split">
                <button className="case-primary-button" type="button" onClick={() => setIsDeleteSessionModalOpen(false)}>Annuler</button>
                <button className="case-primary-button" type="button" onClick={() => setIsDeleteSessionModalOpen(false)}>Supprimer</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default App