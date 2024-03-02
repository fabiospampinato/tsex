
/* IMPORT */

import {readFile, writeFile} from 'atomically';
import {debounce} from 'dettle';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {color, exit} from 'specialist';
import Watcher from 'watcher';
import {DIR_DIST, DIR_SOURCE, PATH_DIST, PATH_SOURCE, PATH_TASK, PATH_TEST, PATH_ESBUILD1, PATH_ESBUILD2, PATH_FAVA1, PATH_FAVA2, PATH_TSC, PATH_TSCONFIG, PATH_TSCONFIG_SELF} from './constants';
import Transformer from './transformer';
import {castArray, ensureDir, execBuffer, execInherit, isDir, isFile} from './utils';
import type {BenchmarkOptions, BundleOptions, CompileOptions, DeclareOptions, DevOptions, PrepareOptions, TaskOptions, TestOptions, TransformOptions, WatcherOptions} from './types';

/* MAIN */

const TSEX = {

  /* API */

  benchmark: async ( options: BenchmarkOptions ): Promise<void> => {

    return TSEX.task ( { name: 'benchmark', ...options } );

  },

  bundle: async ( options: BundleOptions ): Promise<void> => {

    const pathEsbuild = await isFile ( PATH_ESBUILD1 ) ? PATH_ESBUILD1 : ( await isFile ( PATH_ESBUILD2 ) ? PATH_ESBUILD2 : undefined );

    if ( !pathEsbuild ) exit ( 'Esbuild not found, did you install it?' );

    await TSEX.init ();

    return TSEX.withWatcher ({
      paths: [PATH_SOURCE, PATH_TSCONFIG],
      wait: 100,
      watch: options.watch,
      fn: async () => {
        const command = `"${pathEsbuild}" --bundle ${options.external ? castArray ( options.external ).map ( external => `--external:${external}` ).join ( ' ' ) : ''} ${options.format ? `--format=${options.format}` : ''} ${options.platform ? `--platform=${options.platform}` : ''} ${options.target ? `--target=${options.target}` : ''} ${options.minify ? '--minify' : ''} "${DIR_SOURCE}/index.ts"`;
        const buffer = await execBuffer ( command );
        if ( !buffer ) return;
        const distPath = path.join ( PATH_DIST, 'index.js' );
        await TSEX.clean ();
        await ensureDir ( PATH_DIST );
        await writeFile ( distPath, buffer );
        await TSEX.declare ( {} );
      }
    });

  },

  clean: async (): Promise<void> => {

    if ( !await isDir ( PATH_DIST ) ) return;

    await fs.rm ( PATH_DIST, { recursive: true } );

  },

  compile: async ( options: CompileOptions ): Promise<void> => {

    if ( !await isFile ( PATH_TSC ) ) exit ( 'TypeScript not found, did you install it?' );

    await TSEX.init ();

    return TSEX.withWatcher ({
      paths: [PATH_SOURCE, PATH_TSCONFIG],
      wait: 100,
      watch: options.watch,
      fn: async () => {
        const command = `node "${PATH_TSC}" --outDir "${DIR_DIST}"`;
        execInherit ( command );
        await TSEX.transform ( {} );
      }
    });

  },

  declare: async ( options: DeclareOptions ): Promise<void> => {

    if ( !await isFile ( PATH_TSC ) ) exit ( 'TypeScript not found, did you install it?' );

    await TSEX.init ();

    const command = `node "${PATH_TSC}" --declaration --emitDeclarationOnly --isolatedModules false --verbatimModuleSyntax false --outFile "${DIR_DIST}/index.d.ts" ${options.watch ? '--watch' : ''}`;

    execInherit ( command );

  },

  dev: async ( options: DevOptions ): Promise<void> => {

    if ( options.bundle ) {

      await Promise.all ([
        TSEX.bundle ( { ...options, watch: true } ),
        TSEX.test ( { watch: true } )
      ]);

    } else {

      await Promise.all ([
        TSEX.compile ( { watch: true } ),
        TSEX.test ( { watch: true } )
      ]);

    }

  },

  init: async (): Promise<void> => {

    if ( !await isFile ( PATH_TSCONFIG_SELF ) ) return;

    const content = await readFile ( PATH_TSCONFIG_SELF, 'utf-8' );
    const tsconfig = JSON.parse ( content );

    tsconfig.include = [PATH_SOURCE];
    tsconfig.compilerOptions.outDir = DIR_DIST;
    tsconfig.compilerOptions.paths['~'] = [PATH_SOURCE];
    tsconfig.compilerOptions.paths['~/*'] = [path.join ( PATH_SOURCE, '*' )];

    const contentNext = JSON.stringify ( tsconfig, undefined, 2 );

    await writeFile ( PATH_TSCONFIG_SELF, contentNext );

  },

  prepare: async ( options: PrepareOptions ): Promise<void> => {

    await TSEX.clean ();

    if ( options.bundle ) {

      await TSEX.bundle ( options );

    } else {

      await TSEX.compile ( {} );

    }

    if ( await isFile ( PATH_FAVA1 ) || await isFile ( PATH_FAVA2 ) ) {

      await TSEX.test ( {} );

    }

  },

  task: async ( options: TaskOptions ): Promise<void> => {

    if ( !options.name ) exit ( 'Task name not provided' );

    const taskPath = path.join ( PATH_TASK, `${options.name}.js` );

    if ( !await isFile ( taskPath ) ) exit ( `Task not found: "${PATH_TASK}/${options.name}.js"` );

    return TSEX.withWatcher ({
      paths: [PATH_DIST, taskPath],
      wait: 100,
      watch: options.watch,
      fn: () => {
        const command = `node "${taskPath}"`;
        execInherit ( command );
      }
    });

  },

  test: async ( options: TestOptions ): Promise<void> => {

    const pathFava = await isFile ( PATH_FAVA1 ) ? PATH_FAVA1 : ( await isFile ( PATH_FAVA2 ) ? PATH_FAVA2 : undefined );

    if ( !pathFava ) exit ( 'Fava not found, did you install it?' );

    return TSEX.withWatcher ({
      paths: [PATH_DIST, PATH_TEST],
      wait: 100,
      watch: options.watch,
      fn: () => {
        const command = `node "${pathFava}" --fail-fast`;
        execInherit ( command );
      }
    });

  },

  transform: async ( options: TransformOptions ): Promise<void> => {

    return TSEX.withWatcher ({
      paths: [PATH_DIST],
      wait: 100,
      watch: options.watch,
      fn: async () => {
        if ( !await isDir ( PATH_DIST ) ) return;
        await Transformer.trasform ();
      }
    });

  },

  withWatcher: async ( options: WatcherOptions ): Promise<void> => {

    await options.fn ();

    if ( !options.watch ) return;

    const update = async (): Promise<void> => {

      const width = process.stdout.getWindowSize ()[0] || 10;
      const divider = '-'.repeat ( width );

      console.log ( color.dim ( divider ) );

      await options.fn ();

    };

    const callback = options.wait ? debounce ( update, options.wait ) : update;

    const watchers = options.paths.map ( path => {

      const watcher = new Watcher ( path, {
        ignoreInitial: true
      });

      watcher.on ( 'add', callback );
      watcher.on ( 'change', callback );
      watcher.on ( 'unlink', callback );

      return watcher;

    });

    const promises = Promise.all ( watchers.map ( watcher => {

      return new Promise ( resolve => {

        watcher.on ( 'end', resolve );

      });

    }));

    await promises;

  }

};

/* EXPORT */

export default TSEX;
