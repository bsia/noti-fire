#!/usr/bin/env node

var program = require('commander');

program.arguments
//  .arguments('<file>')
  .option('-t, --fcm_token <fcm_token>', 'Destination device\'s token')
  .action(function(file) {
    console.log('fcm_token: %s',
        program.fcm_token, file);
  })
  .parse(process.argv);
