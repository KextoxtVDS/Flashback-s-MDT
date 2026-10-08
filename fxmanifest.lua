fx_version 'cerulean'
game 'gta5'

lua54 'yes'

author 'Kextoxt'
description 'Flashback\'s MDT recreated by Kextoxt'

ui_page 'web/build/index.html'

dependency 'oxmysql'

escrow_ignore {
  '**/*'
}

files {
  'web/build/index.html',
  'web/build/assets/*',
  '**/*.png',
  '*.png'
}

shared_scripts {
  'shared/bootstrap.lua',
  'shared/config.lua'
}

client_scripts {
  'client/framework.lua',
  'client/main.lua'
}

server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'server/framework.lua',
  'server/utils.lua',
  'server/database.lua',
  'server/loaders.lua',
  'server/people.lua',
  'server/events.lua'
}
dependency '/assetpacks'