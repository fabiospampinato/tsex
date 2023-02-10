#!/usr/bin/env node

/* IMPORT */

import {bin} from 'specialist';
import TSEX from '.';

/* MAIN */

bin ( 'tsex', 'A little CLI for making TypeScript packages, cleanly and effortlessly' )
  /* BENCHMARK */
  .command ( 'benchmark', 'Run the benchmark task' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( TSEX.benchmark )
  /* BUNDLE */
  .command ( 'bundle', 'Bundle the project with esbuild' )
  .option ( '--format <format>', 'The bundle format: iife, cjs, esm', { default: 'esm' } )
  .option ( '--minify', 'Minify the bundle' )
  .option ( '--platform <platform>', 'The bundle platform: browser, node, neutral', { default: 'browser' } )
  .option ( '--target <target>', 'The bundle target: es2016, es2017, es2018, es2019, es2020, esnext', { default: 'es2020' } )
  .option ( '--watch', 'Watch files for changes' )
  .action ( TSEX.bundle )
  /* CLEAN */
  .command ( 'clean', 'Delete build artifacts' )
  .action ( TSEX.clean )
  /* COMPILE */
  .command ( 'compile', 'Compile the project with tsc' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( TSEX.compile )
  /* DECLARE */
  .command ( 'declare', 'Generate the declaration file for the project with tsc' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( TSEX.declare )
  /* DEV */
  .command ( 'dev', 'Compile the project and run tests with fava, while watching files' )
  .action ( TSEX.dev )
  /* PREPARE */
  .command ( 'prepare', 'Prepare the project for publishing by cleaning up, compiling, and testing' )
  .option ( '--bundle', 'Bundle the project with esbuild' )
  .option ( '--format <format>', 'The bundle format: iife, cjs, esm', { default: 'esm' } )
  .option ( '--minify', 'Minify the bundle' )
  .option ( '--platform <platform>', 'The bundle platform: browser, node, neutral', { default: 'browser' } )
  .option ( '--target <target>', 'The bundle target: es2016, es2017, es2018, es2019, es2020, esnext', { default: 'es2020' } )
  .action ( TSEX.prepare )
  /* TASK */
  .command ( 'task', 'Run a task' )
  .option ( '--name <name>', 'The name of the task' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( TSEX.task )
  /* TEST */
  .command ( 'test', 'Run the test suite with fava' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( TSEX.test )
  /* TRANSFORM */
  .command ( 'transform', 'Transform build artifacts' )
  .option ( '--watch', 'Watch files for changes' )
  .action ( TSEX.transform )
  /* RUN */
  .run ();
