#!/usr/bin/env node


//  throw new Error('crash');
var program = require('commander');

program
  .command('topic')
  .option('-t, --topic <topic>', 'Notification topic')
  .option('-c, --count <count>', 'Message count')
  .action(function() {
    console.log('Topic = %s, Count = %d', program.topic, program.count);
    validateArgs();




  })
  .parse(process.argv);


function validateArgs() {
  if (!program.topic) {
    console.log('No topic specified');
    process.exit(1);
  }
}
