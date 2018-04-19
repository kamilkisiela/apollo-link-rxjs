const globals = {
  // Apollo
  'apollo-link': 'apolloLink.core',
  // RxJS
  rxjs: 'rxjs',
  'rxjs/operators': 'rxjs.operators',
};

export default {
  input: 'dist/index.js',
  output: {
    file: 'dist/bundle.umd.js',
    format: 'umd',
    sourcemap: true,
    name: 'apollo.rxjs',
    exports: 'named',
    globals,
  },
  external: Object.keys(globals),
};
