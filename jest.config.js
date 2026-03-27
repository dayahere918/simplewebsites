const path = require('path');

module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['jest-canvas-mock'],
    coverageThreshold: {
        global: {
            statements: 90,
            branches: 70,
            functions: 90,
            lines: 90
        }
    },
    collectCoverageFrom: [
        'shared/**/*.js',
        'sites/**/*.js',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/__tests__/**',
        '!**/jest.config.js'
    ],
    moduleNameMapper: {
        '^shared/(.*)$': path.resolve(__dirname, 'shared/$1')
    }
};
