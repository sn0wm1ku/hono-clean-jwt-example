import { build } from 'esbuild'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

const baseConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/index.js',
  external: Object.keys(pkg.dependencies || {}),
  format: 'esm',
  packages: 'external',
  sourcemap: true,
  logLevel: 'info',
  treeShaking: true,
  splitting: false, // Not supported for node platform
}

// Production build with aggressive minification
export const buildProduction = () =>
  build({
    ...baseConfig,
    minify: true,
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    keepNames: false,
    drop: ['console', 'debugger'],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  })

// Development build without minification
export const buildDevelopment = () =>
  build({
    ...baseConfig,
    minify: false,
    keepNames: true,
    define: {
      'process.env.NODE_ENV': '"development"',
    },
  })

// Watch mode for development
export const buildWatch = () =>
  build({
    ...baseConfig,
    watch: {
      onRebuild(error, result) {
        if (error) console.error('watch build failed:', error)
        else console.log('watch build succeeded:', result)
      },
    },
    minify: false,
    keepNames: true,
    define: {
      'process.env.NODE_ENV': '"development"',
    },
  })

// Analyze bundle size
export const buildAnalyze = () =>
  build({
    ...baseConfig,
    minify: true,
    metafile: true,
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  }).then(result => {
    if (result.metafile) {
      console.log('\n📊 Bundle Analysis:')
      console.log(`📦 Output size: ${(result.metafile.outputs['dist/index.js'].bytes / 1024).toFixed(2)} KB`)
      console.log('📋 Inputs:')
      Object.entries(result.metafile.inputs).forEach(([file, info]) => {
        console.log(`  ${file}: ${(info.bytes / 1024).toFixed(2)} KB`)
      })
    }
  })

// Run the appropriate build based on command line argument
const mode = process.argv[2] || 'production'

switch (mode) {
  case 'dev':
  case 'development':
    buildDevelopment()
    break
  case 'watch':
    buildWatch()
    break
  case 'analyze':
    buildAnalyze()
    break
  case 'prod':
  case 'production':
  default:
    buildProduction()
    break
}
