
/* IMPORT */

import {execSync} from 'node:child_process';
import fs from 'node:fs/promises';
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

const execBuffer = ( command: string ): Buffer => {

  return execSync ( command );

};

const execInherit = ( command: string ): void => {

  execSync ( command, { stdio: 'inherit' } );

};

const exit = ( message: string ): never => {

  console.log ( color.red ( message ) );

  process.exit ( 1 );

};

const isDir = ( path: string ): Promise<boolean> => {

  return isFile ( path );

};

const isFile = ( path: string ): Promise<boolean> => {

  return fs.access ( path ).then ( () => true, () => false );

};

const isPlainObject = ( value: unknown ): value is string => {

  if ( typeof value !== 'object' || value === null ) return false;

  const prototype = Object.getPrototypeOf ( value );

  if ( prototype === null ) return true;

  return Object.getPrototypeOf ( prototype ) === null;

};

const isString = ( value: unknown ): value is string => {

  return typeof value === 'string';

};

const warn = ( message: string ): void => {

  console.log ( color.yellow ( message ) );

};

/* EXPORT */

export {ensureDir, ensureFile, execBuffer, execInherit, exit, isDir, isFile, isPlainObject, isString, warn};
