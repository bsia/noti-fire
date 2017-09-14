#!/usr/bin/env node

var program = require('commander');


program.usage('<cmd>');

program.version('0.0.1');

program.command('topic')
  .option('-t, --topic', 'Notification topic')
  .description('Send notification by topic')
  .action(function() {
    console.log('topic command');
  });
  // .command('token [options]', 'Send to an fcm token')
  // .action(function(cmd) {
  //   console.log('fcm_token: %s, cmd: %s',
  //       program.fcm_token, cmd);
  // })

program.command('single')
  .option('-f, --fcm_token', 'Destination FCM token ')
  .description('Send notification to a single device')
  .action(function() {
      console.log('single command');
  });

program.command('*')
  .description('no command')
  .action(function() {
    console.log('command must be specified.');
  });

program.parse(process.argv);

// Set default command to help
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
