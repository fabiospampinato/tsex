# TSEX

A little CLI for making TypeScript packages, cleanly and effortlessly.

## Install

```sh
npm install -g tsex
```

## Usage

```
tsex 3.0.0

USAGE

  tsex [command]

OPTIONS

  --help          Display help for the command
  --version, -v   Display the version number

COMMANDS

  help [command]  Display help for the command
  benchmark       Run the benchmark task
  bundle          Bundle the project with esbuild
  clean           Delete build artifacts
  compile         Compile the project with tsc
  declare         Generate the declaration file for the project with tsc
  dev             Compile the project and run tests with fava, while watching files
  prepare         Prepare the project for publishing by cleaning up, compiling, and testing
  task            Run a task
  test            Run the test suite with fava
  transform       Transform build artifacts
```

## License

MIT © Fabio Spampinato
