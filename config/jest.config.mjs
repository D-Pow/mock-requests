import path from 'path';

/** @type {import('@jest/types').Config.InitialOptions} */
const jestConfig = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: [
        '<rootDir>/config/jest.setup.js',
    ],
    transform: {
        '\.[tj]sx?$': [
            'babel-jest',
            {
                configFile: path.resolve('babel.config.js'),
            },
        ]
    },
    modulePathIgnorePatterns: [
        '<rootDir>/dist',
        '<rootDir>/demo',
        '<rootDir>/coverage',
    ],
};

export default jestConfig;
