
/* MAIN */

type BenchmarkOptions = {
  watch?: boolean
};

type BundleOptions = {
  format?: 'iife' | 'cjs' | 'esm',
  minify?: boolean,
  platform?: 'browser' | 'node' | 'neutral',
  target?: 'es2016' | 'es2017' | 'es2018' | 'es2019' | 'es2020' | 'esnext',
  watch?: boolean
};

type CompileOptions = {
  watch?: boolean
};

type DeclareOptions = {
  watch?: boolean
};

type TaskOptions = {
  name?: string,
  watch?: boolean
};

type TestOptions = {
  watch?: boolean
};

type TransformOptions = {
  watch?: boolean
};

type WatcherOptions = {
  paths: string[],
  wait?: number,
  watch?: boolean,
  fn: () => void | Promise<void>
};

type Package = {
  bin?: string,
  main?: string,
  exports?: string | { '.'?: string },
  dependencies?: Record<string, string>,
  devDependencies?: Record<string, string>,
  peerDependencies?: Record<string, string>
};

type TransformerContext = {
  root: string,
  dependencies: string[],
  dependenciesSet: Set<string>,
  dependenciesDev: string[],
  dependenciesDevSet: Set<string>,
  dependenciesPeer: string[],
  dependenciesPeerSet: Set<string>,
  modules: string[],
  modulesSet: Set<string>,
  files: string[],
  filesSet: Set<string>,
  sources: string[],
  sourcesSet: Set<string>,
  contents: string[]
};

/* EXPORT */

export type {BenchmarkOptions, BundleOptions, CompileOptions, DeclareOptions, TaskOptions, TestOptions, TransformOptions, WatcherOptions, Package, TransformerContext};
