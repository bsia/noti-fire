#!/usr/bin/env node

var program = require('commander');

var notifire = require('./notifire');

program.usage('<cmd>');

program.version('0.0.1');

// global options, to be accessed using "program" object
program.option('-m, --message <message>', 'Message to send');
program.option('-c, --count <count>', 'Number of notifications to send');

program.command('topic')
  .option('-t, --topic [topic]', 'Notification topic ("news" by default)')
  .description('Send notification by topic')
  .action(function(opts) {
    console.log('notifire.sendTopicNotification = %s', typeof notifire.sendTopicNotification);
    console.log('topic command. message=%s', program.message);
    params = {};
    // merges program arguments and command-specific opts
    Object.assign(params, program, opts);
    notifire.sendTopicNotification(params);
  });

program.command('device')
  .option('-t, --token <token>', 'Destination FCM token ')
  .description('Send notification to a single device')
  .action(function(opts) {
      console.log('single command. token=%s', opts.token);
      console.log('single command. message=%s', program.message);
      console.log('single command. count=%d', program.count);
      params = {};
      // merges program arguments and command-specific opts
      Object.assign(params, program, opts);
      notifire.sendDeviceNotification(params);
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
