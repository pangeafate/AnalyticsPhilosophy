module.exports = {
    testEnvironment: 'jsdom',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
      'src/**/*.{js,jsx}',
      '!src/**/*.test.{js,jsx}'
    ],
    testMatch: [
      '**/tests/**/*.test.{js,jsx}',
      '**/src/**/*.test.{js,jsx}'
    ],
    coverageThreshold: {
      global: {
        branches: 50,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    transform: {
      '^.+\\.(js|jsx)$': ['babel-jest', {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }]
        ]
      }]
    },
    testPathIgnorePatterns: ['/node_modules/'],
    verbose: true
  };