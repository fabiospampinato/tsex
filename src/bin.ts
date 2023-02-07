#!/usr/bin/env node

/* IMPORT */

import process from 'node:process';
import {program, updater, version} from 'specialist';
import TSEX from '.';

/* MAIN */

updater ({ name: 'tsex', version });

program
  .name ( 'tsex' )
  .version ( version )
  .description ( 'A little CLI for making TypeScript packages, cleanly and effortlessly.' );

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
  .command ( 'dev' )
  .description ( 'Compile the project with tsc and run tests with fava, while watching files' )
  .action ( async () => {
    await TSEX.dev ();
    process.exit ( 0 );
  });

program
  .command ( 'prepare' )
  .description ( 'Prepare the project for publishing by cleaning up, compiling, and testing' )
  .option ( '--bundle', 'Bundle the project with esbuild' )
  .option ( '--format <format>', 'The bundle format: iife, cjs, esm', 'esm' )
  .option ( '--minify', 'Minify the bundle' )
  .option ( '--platform <platform>', 'The bundle platform: browser, node, neutral', 'browser' )
  .option ( '--target <target>', 'The bundle target: es2016, es2017, es2018, es2019, es2020, esnext', 'es2020' )
  .action ( async options => {
    await TSEX.prepare ( options );
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
