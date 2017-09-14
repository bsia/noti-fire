#!/usr/bin/env node

var program = require('commander');

// program.arguments('<file>')


program
  .usage('<cmd> [options]')
  .command('topic [options]', 'Send a topic notification')
  .command('token [options]', 'Send to an fcm token')
  // .action(function(cmd) {
  //   console.log('fcm_token: %s, cmd: %s',
  //       program.fcm_token, cmd);
  // })
  .parse(process.argv);
