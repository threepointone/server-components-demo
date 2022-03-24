'use strict';

const esbuild = require('esbuild');
const rimraf = require('rimraf');
const child_process = require('child_process');
const {writeFile} = require('fs/promises');
const mkdirp = require('mkdirp');
const fse = require('fs-extra');

rimraf.sync('dist');
// rimraf.sync('out');

const entryPoints = child_process
  .execSync('find src | grep .client.js')
  .toString()
  .split('\n')
  .filter(Boolean);

const environment = process.env.NODE_ENV || 'development';

async function run() {
  // this is bullshit, but works for now
  // TODO: actually parse out exports and stuff
  const manifest = {};
  for (const entryPoint of entryPoints) {
    manifest[entryPoint] = {
      '': {
        id: `./${entryPoint}`,
        chunks: [`./${entryPoint}`],
        name: '',
      },
      '*': {
        id: `./${entryPoint}`,
        chunks: [`./${entryPoint}`],
        name: '*',
      },
      default: {
        id: `./${entryPoint}`,
        chunks: [`./${entryPoint}`],
        name: 'default',
      },
    };
  }
  await mkdirp('./dist');
  await mkdirp('./out');
  await writeFile(
    './dist/react-client-manifest.json',
    JSON.stringify(manifest, null, '  ')
  );

  const client = await esbuild.build({
    entryPoints,
    platform: 'browser',
    sourcemap: true,
    sourcesContent: true,
    bundle: true,
    splitting: true,
    format: 'esm',
    metafile: true,
    outdir: 'dist',
    loader: {
      '.js': 'jsx',
      '.html': 'text',
    },
    inject: ['./src/react-shim.js'],
    minify: environment === 'production',
    define: {
      'process.env.NODE_ENV': `"${environment}"`,
    },
    plugins: [
      {
        name: 'react-flight-client',
        setup(build) {
          build.onResolve({filter: /\.server$/}, (args) => {
            // just throw an error, it shouldn't ever get here
            throw new Error(
              "You imported a *.server.js from inside a client bundle, that's kinda weird"
            );
          });
        },
      },
    ],
  });

  fse.copySync('./public', './dist');

  const {outputs} = client.metafile;

  const server = await esbuild.build({
    entryPoints: ['./src/api.worker.js'],
    sourcemap: true,
    bundle: true,
    metafile: true,
    format: 'esm',
    outfile: './out/worker.js',
    loader: {
      '.js': 'jsx',
      '.html': 'text',
    },
    conditions: ['react-server'],
    inject: ['./src/react-shim.js'],
    minify: environment === 'production',
    define: {
      'process.env.NODE_ENV': `"${environment}"`,
    },
    plugins: [
      {
        name: 'react-flight-server',
        setup(build) {
          build.onLoad({filter: /\.client\.js$/}, async (args) => {
            const outputKey = Object.keys(outputs).find((chunkPath) => {
              if (outputs[chunkPath].entryPoint) {
                return (
                  args.path ===
                  require.resolve('../' + outputs[chunkPath].entryPoint)
                );
              }
              return false;
            });

            return {
              contents: `
                const MODULE_REFERENCE = Symbol.for('react.module.reference');
                export default {
                  $$typeof: MODULE_REFERENCE, 
                  filepath: '${outputKey.replace('dist', 'src')}',
                  name: 'default'
                }

                `,
              loader: 'js',
            };
          });
        },
      },
    ],
  });
}

run().then(
  () => {
    console.log('done!');
  },
  (error) => {
    console.error('oops!');
    console.error(error);
  }
);
