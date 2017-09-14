#!/usr/bin/env node

var program = require('commander');

program
  .option('-t, --topic <topic>', 'Notification topic')
  .option('-c, --count <count>', 'Message count')
  .parse(process.argv);


if (!program.topic) {
  console.log('No topic specified');
  process.exit(1);
}

console.log('Topic = %s, Count = %d', program.topic, program.count);
