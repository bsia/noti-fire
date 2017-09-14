#!/usr/bin/env node

var program = require('commander');


program.usage('<cmd>');

program.version('0.0.1');

program.command('topic')
  .option('-t, --topic', 'Notification topic')
  .description('Send notification by topic')
  .action(function(opts) {
    console.log('topic command. topic=%s', opts);
  });

program.command('device')
  .option('-t, --token <token>', 'Destination FCM token ')
  .description('Send notification to a single device')
  .action(function(opts) {
      console.log('single command. token=%s', opts.token);
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
