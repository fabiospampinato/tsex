
/* IMPORT */

import {readFile, writeFile} from 'atomically';
import path from 'node:path';
import {exit} from 'specialist';
import readdir from 'tiny-readdir';
import {NODE_MODULES, PATH_DIST, PATH_PACKAGE} from './constants';
import {isFile, isPlainObject, isString, readFiles, warn} from './utils';
import type {Package, TransformerContext} from './types';

/* HELPERS */

const Context = {

  /* API */

  get: async (): Promise<TransformerContext | false> => {

    const root = await Context.getRoot ();
    const dependencies = await Context.getDependencies ();
    const dependenciesSet = new Set ( dependencies );
    const dependenciesDev = await Context.getDependenciesDev ();
    const dependenciesDevSet = new Set ( dependenciesDev );
    const dependenciesPeer = await Context.getDependenciesPeer ();
    const dependenciesPeerSet = new Set ( dependenciesPeer );
    const modules = await Context.getModules ();
    const modulesSet = new Set ( modules );
    const files = await Context.getFiles ();
    const filesSet = new Set ( files );
    const declarations = await Context.getDeclarations ( files );
    const declarationsSet = new Set ( declarations );
    const declarationsContents = await Context.getContents ( declarations );
    const sources = await Context.getSources ( files );
    const sourcesSet = new Set ( sources );
    const sourcesContents = await Context.getContents ( sources );

    if ( !declarationsContents || !sourcesContents ) return false;

    return {root, dependencies, dependenciesSet, dependenciesDev, dependenciesDevSet, dependenciesPeer, dependenciesPeerSet, modules, modulesSet, files, filesSet, declarations, declarationsSet, sources, sourcesSet, declarationsContents, sourcesContents};

  },

  getContents: async ( files: string[] ): Promise<string[] | false> => {

    try {

      return readFiles ( files );

    } catch {

      warn ( 'Failed to read some files' );

      return false;

    }

  },

  getDeclarations: async ( files: string[] ): Promise<string[]> => {

    const re = /\.d\.ts$/;
    const isDeclaration = ( filePath: string ) => re.test ( filePath );
    const declarations = files.filter ( isDeclaration );

    return declarations;

  },

  getDependencies: async (): Promise<string[]> => {

    const pkg = await Context.getPackage ();
    const dependencies = Object.keys ( pkg.dependencies || {} );

    return dependencies;

  },

  getDependenciesDev: async (): Promise<string[]> => {

    const pkg = await Context.getPackage ();
    const dependencies = Object.keys ( pkg.devDependencies || {} );

    return dependencies;

  },

  getDependenciesPeer: async (): Promise<string[]> => {

    const pkg = await Context.getPackage ();
    const dependencies = Object.keys ( pkg.peerDependencies || {} );

    return dependencies;

  },

  getEntry: async (): Promise<string> => {

    const pkg = await Context.getPackage ();

    if ( isString ( pkg.exports ) ) return pkg.exports;

    if ( isPlainObject ( pkg.exports ) && isString ( pkg.exports['.'] ) ) return pkg.exports['.'];

    if ( isPlainObject ( pkg.exports ) && isPlainObject ( pkg.exports['.'] ) && isString ( pkg.exports['.']['import'] ) ) return pkg.exports['.']['import'];

    if ( isString ( pkg.main ) ) return pkg.main;

    if ( isString ( pkg.bin ) ) return pkg.bin;

    exit ( 'Entry point not found in "package.json", did you forget about it?' );

  },

  getFiles: async (): Promise<string[]> => {

    const ignoreRe = /^\./;
    const ignore = ( filePath: string ) => ignoreRe.test ( filePath );
    const {files} = await readdir ( PATH_DIST, { ignore } );

    return files;

  },

  getModules: async (): Promise<string[]> => {

    return NODE_MODULES;

  },

  getPackage: async (): Promise<Package> => {

    if ( !await isFile ( PATH_PACKAGE ) ) exit ( 'Package.json not found, are you at the root?' );

    const content = await readFile ( PATH_PACKAGE, 'utf-8' );
    const pkg = JSON.parse ( content );

    return pkg;

  },

  getRoot: async (): Promise<string> => {

    const entry = await Context.getEntry ();
    const root = path.dirname ( path.resolve ( entry ) );

    return root;

  },

  getSources: async ( files: string[] ): Promise<string[]> => {

    const re = /\.js$/;
    const isSource = ( filePath: string ) => re.test ( filePath );
    const sources = files.filter ( isSource );

    return sources;

  }

};

/* MAIN */

const Transformer = {

  /* API */

  rewrite: ( ctx: TransformerContext, filePath: string, before: string ): string | undefined => {

    const isRelative = before.startsWith ( '.' );
    const isAbsolute = before.startsWith ( '~' );
    const isNotRewritable = isRelative && before.endsWith ( '.js' );
    const isModule = ctx.modulesSet.has ( before );
    const isNodeModule = before.startsWith ( 'node:' );

    if ( isNotRewritable ) return before;

    if ( isRelative || isAbsolute ) {

      const from = path.dirname ( filePath );
      const root = isRelative ? from : ctx.root;
      const to = isRelative ? path.resolve ( root, before ) : path.join ( root, `.${before.slice ( 1 )}` );
      const relative = path.relative ( from, to ).replace ( /^([^\.]|$)/, './$1' );
      const basename = path.basename ( to );
      const attemptsDifferentPath = [relative, `${relative}.js`, `${relative}/index.js`];
      const attemptsSamePath = [`../${basename}`, `../${basename}.js`, `../${basename}/index.js`];
      const attempts = ( relative === './' ) ? attemptsSamePath : attemptsDifferentPath;
      const attempt = attempts.find ( attempt => ctx.sourcesSet.has ( path.resolve ( from, attempt ) ) );

      return attempt;

    } else if ( isModule ) {

      warn ( `Node module "${before}" must be written as "node:${before}"` );

    } else if ( isNodeModule ) {

      if ( !ctx.modulesSet.has ( before.slice ( 5 ) ) ) {

        warn ( `Unknown Node module "${before}"` );

      }

    } else {

      const dependencyRe = /^((@[a-z0-9-~][a-z0-9-._~]*\/)?([a-z0-9-~][a-z0-9-._~]*))([\/]|$)/;
      const match = dependencyRe.exec ( before );

      if ( !match ) {

        warn ( `Invalid module "${before}"` );

      } else if ( !ctx.dependenciesSet.has ( match[1] ) && !ctx.dependenciesDevSet.has ( match[1] ) && !ctx.dependenciesPeerSet.has ( match[1] ) ) {

        warn ( `Unknown dependency "${match[1]}", did you install it?` );

      }

    }

    return before;

  },

  trasform: async (): Promise<void> => {

    const ctx = await Context.get ();

    if ( !ctx ) return;

    await Transformer.transformAll ( ctx );

  },

  transformAll: async ( ctx: TransformerContext ): Promise<void> => {

    await Promise.all ([
      Promise.all ( ctx.sources.map ( ( source, i ) => {
        return Transformer.transformOne ( ctx, source, ctx.sourcesContents[i] );
      })),
      Promise.all ( ctx.declarations.map ( ( declaration, i ) => {
        return Transformer.transformOne ( ctx, declaration, ctx.declarationsContents[i] );
      }))
    ]);

  },

  transformOne: async ( ctx: TransformerContext, filePath: string, fileContent: string ): Promise<void> => {

    const importsExportsRequiresRe = /((?:^|[\s;,<>(){}[\]])(?:(?:im[p]ort|ex[p]ort)\s*(?:\(?|.+?from\s*)\s*|re[q]uire\s*\(\s*))(['"])([^'"\r\n\s]+)(\2)/g;

    const fileContentNext = fileContent.replace ( importsExportsRequiresRe, ( ...match ) => {

      const prev = match[3];
      const next = Transformer.rewrite ( ctx, filePath, prev )?.replace ( /\\/g, '/' );

      if ( !next ) {

        warn ( `Failed to rewrite "${prev}" import in "${filePath}"` );

        return match[0];

      } else {

        return `${match[1]}${match[2]}${next}${match[4]}`;

      }

    });

    if ( fileContent !== fileContentNext ) {

      await writeFile ( filePath, fileContentNext );

    }

  }

};

/* EXPORT */

export default Transformer;
