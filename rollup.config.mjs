import typescript from 'rollup-plugin-typescript2'

export default {
    input: 'src/index.ts', 
    output: [
        {
          file: 'dist/bundle.cjs.js',
          format: 'cjs',
        },
        {
          file: 'dist/bundle.esm.js',
          format: 'esm',
        },
      ],
    plugins: [typescript({ useTsconfigDeclarationDir: true })],
    external: ['@mdhnpm/color-contrast-ratio-calculator', 'colorsys']
}