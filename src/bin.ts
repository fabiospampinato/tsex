#!/usr/bin/env node

/* IMPORT */

import {program, updater} from 'specialist';
import {name, version, description} from '../package.json';
import TSEX from '.';

/* MAIN */

updater ({ name, version });

program
  .name ( name )
  .version ( version )
  .description ( description );

program
  .command ( 'benchmark' )
  .description ( 'Run the benchmark task' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( async options => {
    await TSEX.benchmark ( options );
    process.exit ( 0 );
  });

program
  .command ( 'bundle' )
  .description ( 'Bundle the project with esbuild' )
  .option ( '--format <format>', 'The bundle format: iife, cjs, esm', 'esm' )
  .option ( '--minify', 'Minify the bundle' )
  .option ( '--platform <platform>', 'The bundle platform: browser, node, neutral', 'browser' )
  .option ( '--target <target>', 'The bundle target: es2016, es2017, es2018, es2019, es2020, esnext', 'es2020' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( async options => {
    await TSEX.bundle ( options );
    process.exit ( 0 );
  });

program
  .command ( 'clean' )
  .description ( 'Delete build artifacts' )
  .action ( async () => {
    await TSEX.clean ();
    process.exit ( 0 );
  });

program
  .command ( 'compile' )
  .description ( 'Compile the project with tsc' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( async options => {
    await TSEX.compile ( options );
    process.exit ( 0 );
  });

program
  .command ( 'declare' )
  .description ( 'Generate the declaration file for the project with tsc' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( async options => {
    await TSEX.declare ( options );
    process.exit ( 0 );
  });

program
  .command ( 'task' )
  .description ( 'Run a task' )
  .option ( '--name <name>', 'The name of the task' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( async options => {
    await TSEX.task ( options );
    process.exit ( 0 );
  });

program
  .command ( 'test' )
  .description ( 'Run the test suite with fava' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( async options => {
    await TSEX.test ( options );
    process.exit ( 0 );
  });

program
  .command ( 'transform' )
  .description ( 'Transform build artifacts' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( async options => {
    await TSEX.transform ( options );
    process.exit ( 0 );
  });

program.parse ();
