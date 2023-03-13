
/* IMPORT */

import {readFile} from 'atomically';
import {execSync, execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import process from 'node:process';
import {color} from 'specialist';

/* MAIN */

const ensureDir = async ( path: string ): Promise<void> => {

  if ( await isDir ( path ) ) return;

  await fs.mkdir ( path );

};

const ensureFile = async ( path: string ): Promise<void> => {

  if ( await isFile ( path ) ) return;

  await fs.writeFile ( path, '' );

};

const execBuffer = ( command: string, silent: boolean = false ): Buffer | false => {

  try {

    return execSync ( command );

  } catch ( error: unknown ) {

    if ( !silent ) {

      const message = isError ( error ) ? error.message : ( isString ( error ) ? error: `Command failed: "${command}"` );

      console.log ( color.red ( message ) );

    }

    return false;

  }

};

const execFile = ( command: string, args: string[] = [], silent: boolean = false ): string | false => {

  try {

    return execFileSync ( command, args, { stdio: 'pipe' } ).toString ();

  } catch ( error: unknown ) {

    if ( !silent ) {

      const message = isError ( error ) ? error.message : ( isString ( error ) ? error: `Command failed: "${command}"` );

      console.log ( color.red ( message ) );

    }

    return false;

  }

};


const execInherit = ( command: string, silent: boolean = false ): void => {

  try {

    execSync ( command, { stdio: 'inherit' } );

  } catch ( error: unknown ) {

    if ( !silent ) {

      const message = isError ( error ) ? error.message : ( isString ( error ) ? error: `Command failed: "${command}"` );

      console.log ( color.red ( message ) );

    }

  }

};

const exit = ( message: string ): never => {

  console.log ( color.red ( message ) );

  process.exit ( 1 );

};

const isDir = ( path: string ): Promise<boolean> => {

  return isFile ( path );

};

const isError = ( value: unknown ): value is Error => {

  return value instanceof Error;

};

const isFile = ( path: string ): Promise<boolean> => {

  return fs.access ( path ).then ( () => true, () => false );

};

const isPlainObject = ( value: unknown ): value is Record<string, unknown> => {

  if ( typeof value !== 'object' || value === null ) return false;

  const prototype = Object.getPrototypeOf ( value );

  if ( prototype === null ) return true;

  return Object.getPrototypeOf ( prototype ) === null;

};

const isString = ( value: unknown ): value is string => {

  return typeof value === 'string';

};

const readFiles = ( filePaths: string[] ): Promise<string[]> => {

  return Promise.all ( filePaths.map ( filePath => readFile ( filePath, 'utf8' ) ) );

};

const warn = ( message: string ): void => {

  console.log ( color.yellow ( message ) );

};

/* EXPORT */

export {ensureDir, ensureFile, execBuffer, execFile, execInherit, exit, isDir, isError, isFile, isPlainObject, isString, readFiles, warn};
