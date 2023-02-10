
/* IMPORT */

import {builtinModules} from 'node:module';
import path from 'node:path';
import process from 'node:process';
import {execFile} from './utils';

/* MAIN */

const DIR_DIST = 'dist';

const DIR_SOURCE = 'src';

const DIR_TASK = 'tasks';

const DIR_TEST = 'test';

const NODE_MODULES = builtinModules;

const PATH_CWD = process.cwd ();

const PATH_DIST = path.join ( PATH_CWD, DIR_DIST );

const PATH_SOURCE = path.join ( PATH_CWD, DIR_SOURCE );

const PATH_TASK = path.join ( PATH_CWD, DIR_TASK );

const PATH_TEST = path.join ( PATH_CWD, DIR_TEST );

const PATH_MODULES = path.join ( PATH_CWD, 'node_modules' );

const PATH_ESBUILD1 = path.join ( PATH_MODULES, 'esbuild', 'bin', 'esbuild' );

const PATH_ESBUILD2 = ( execFile ( 'which', ['esbuild'], true ) || PATH_ESBUILD1 ).trim ();

const PATH_FAVA1 = path.join ( PATH_MODULES, 'fava', 'dist', 'src', 'bin.js' );

const PATH_FAVA2 = path.join ( PATH_MODULES, 'fava', 'dist', 'bin.js' );

const PATH_PACKAGE = path.join ( PATH_CWD, 'package.json' );

const PATH_TSC = path.join ( PATH_MODULES, 'typescript', 'bin', 'tsc' );

const PATH_TSCONFIG = path.join ( PATH_CWD, 'tsconfig.json' );

const PATH_TSCONFIG_SELF = path.join ( PATH_MODULES, 'tsex', 'tsconfig.json' );

/* EXPORT */

export {DIR_DIST, DIR_SOURCE, DIR_TASK, DIR_TEST, NODE_MODULES, PATH_DIST, PATH_SOURCE, PATH_TASK, PATH_TEST, PATH_MODULES, PATH_ESBUILD1, PATH_ESBUILD2, PATH_FAVA1, PATH_FAVA2, PATH_PACKAGE, PATH_TSC, PATH_TSCONFIG, PATH_TSCONFIG_SELF};
