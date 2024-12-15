import resolve from "@rollup/plugin-node-resolve"
import typescript from "@rollup/plugin-typescript"
import commonjs from "@rollup/plugin-commonjs"
import cleaner from 'rollup-plugin-cleaner';
// import {uglify} from 'rollup-plugin-uglify'
// 引入这个插件是为了去除生成文件头部的 Microsoft Copyright 声明，但这个插件同时会压缩文件。尝试配置 compress: false，但没有生效。所以目前这个插件其实只是代替了 uglify。
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].cjs.js',
      exports: 'named'
    },
    plugins: [resolve(), commonjs(), typescript(), cleaner({
      targets: [
        './dist/'
      ]
    })]
  },
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'esm',
      entryFileNames: '[name].esm.js',
      exports: 'named'
    },
    plugins: [resolve(), commonjs(), typescript()]
  },
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'umd',
      name: 'CanvasTextLayout',
      entryFileNames: '[name].umd.js',
      exports: 'named'
    },
    plugins: [resolve(), commonjs(), typescript()]
  },
  {
    input: './src/index.ts',
    output: {
      dir: 'dist',
      format: 'umd',
      name: 'CanvasTextLayout',
      entryFileNames: '[name].umd.min.js',
      exports: 'named'
    },
    plugins: [resolve(), terser({ format: { comments: false } }), commonjs(), typescript()]
  }
]
