
/* IMPORT */

import debounce from 'debounce';
import fs from 'node:fs/promises';
import path from 'node:path';
import {color} from 'specialist';
import Watcher from 'watcher';
import {DIR_DIST, DIR_SOURCE, PATH_DIST, PATH_SOURCE, PATH_TASK, PATH_TEST, PATH_ESBUILD, PATH_FAVA, PATH_TSC, PATH_TSCONFIG} from './constants';
import Transformer from './transformer';
import {ensureDir, execBuffer, execInherit, exit, isDir, isFile} from './utils';
import type {BenchmarkOptions, BundleOptions, CompileOptions, DeclareOptions, TaskOptions, TestOptions, TransformOptions, WatcherOptions} from './types';

/* MAIN */

const TSEX = {

  /* API */

  benchmark: async ( options: BenchmarkOptions ): Promise<void> => {

    return TSEX.task ( { name: 'benchmark', ...options } );

  },

  bundle: async ( options: BundleOptions ): Promise<void> => {

    if ( !await isFile ( PATH_ESBUILD ) ) exit ( 'Esbuild not found, did you install it?' );

    return TSEX.withWatcher ({
      paths: [PATH_SOURCE, PATH_TSCONFIG],
      wait: 100,
      watch: options.watch,
      fn: async () => {
        const command = `"${PATH_ESBUILD}" --bundle ${options.format ? `--format=${options.format}` : ''} ${options.platform ? `--platform=${options.platform}` : ''} ${options.target ? `--target=${options.target}` : ''} ${options.minify ? '--minify' : ''} "${DIR_SOURCE}/index.ts"`;
        const buffer = await execBuffer ( command );
        const distPath = path.join ( PATH_DIST, 'index.js' );
        await TSEX.clean ();
        await ensureDir ( PATH_DIST );
        await fs.writeFile ( distPath, buffer );
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

    return TSEX.withWatcher ({
      paths: [PATH_DIST, PATH_TSCONFIG],
      wait: 100,
      watch: options.watch,
      fn: async () => {
        const command = `node "${PATH_TSC}"`;
        execInherit ( command );
        await TSEX.transform ( {} );
      }
    });

  },

  declare: async ( options: DeclareOptions ): Promise<void> => {

    if ( !await isFile ( PATH_TSC ) ) exit ( 'TypeScript not found, did you install it?' );

    const command = `node "${PATH_TSC}" --declaration --emitDeclarationOnly --outFile "${DIR_DIST}/index.d.ts" ${options.watch ? '--watch' : ''}`;

    execInherit ( command );

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

    if ( !await isFile ( PATH_FAVA ) ) exit ( 'Fava not found, did you install it?' );

    return TSEX.withWatcher ({
      paths: [PATH_DIST, PATH_TEST],
      wait: 100,
      watch: options.watch,
      fn: () => {
        const command = `node "${PATH_FAVA}"`;
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
