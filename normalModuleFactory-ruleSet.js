normalModuleFactory.ruleSet
{
  references: Map {
    'ruleSet[1].rules[0].use' => {
      presets: [['@babel/preset-env',
          {
            useBuiltIns: 'entry',
            corejs: 3,
            targets: {
              node: 'current',
              browsers: '> 0.25%, not dead'
            }
          }],
          '@babel/preset-react',
          '@babel/preset-typescript'],
      plugins: ['@babel/plugin-transform-runtime',
          '@babel/plugin-transform-regenerator',
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-syntax-dynamic-import']
    },
    'ruleSet[1].rules[1].use[0]' => {
      presets: [['@babel/preset-env',
          {
            useBuiltIns: 'entry',
            corejs: 3,
            targets: {
              node: 'current',
              browsers: '> 0.25%, not dead'
            }
          }],
          '@babel/preset-react',
          '@babel/preset-typescript'],
      plugins: ['@babel/plugin-transform-runtime',
          '@babel/plugin-transform-regenerator',
          '@babel/plugin-proposal-class-properties',
          '@babel/plugin-syntax-dynamic-import']
    },
    'ruleSet[1].rules[1].use[1]' => {
      configFile: 'config/tsconfig.json'
    },
    'ruleSet[1].rules[2].use[1]' => {
      url: false
    },
    'ruleSet[1].rules[2].use[2]' => {
      postcssOptions: {
        plugins: ['postcss-preset-env']
      }
    },
    'ruleSet[1].rules[3].use[0]' => {
      name: [Function: name],
      outputPath: [Function: outputPath]
    }
  },
  exec: [Function: exec]
}
