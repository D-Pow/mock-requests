#!/usr/bin/env node

"use strict";

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('./');

function getResolvedPathAsArray(mockPath) {
    if (typeof mockPath !== typeof '') {
        return [];
    }

    const resolvedPath = path.resolve(rootDir, mockPath);
    const pathExists = fs.existsSync(resolvedPath);

    if (!pathExists) {
        console.warn(resolvedPath + ' was not found and will not be configured by MockRequests.');
    }

    return pathExists ? [ resolvedPath ] : [];
}

/**
 * @module /bin/resolve-mocks
 */

/**
 * @typedef {Object} ResolvedMocks
 * @property {string[]} include - Array containing mocks/ directory; spread it in `module.rules[jsLoader].include` webpack config field
 * @property {string[]} entry - Array containing mock entry file; spread it in `entry` webpack config field
 */

/**
 * Returns an object containing arrays of paths to pass into the webpack `module.rules[jsLoader].include`
 * and `entry` configuration fields. The returned arrays should be spread inside the arrays already
 * present in those configuration fields.
 *
 * This will return empty arrays if `activateMocks` is false so that the user doesn't have to modify the respective
 * webpack config fields when activating/deactivating mocks.
 *
 * @param {string} mocksDir - Directory containing all mock-related code. Only needed if transpiling JS code containing mocks.
 * @param {string} mockConfigFile - Entry JS file that configures all mocks.
 * @param {boolean} activateMocks - If mocks should be activated/injected into build or not.
 * @returns {ResolvedMocks} - Object containing arrays of files to spread in `entry` and `include` webpack config fields
 */
module.exports = function resolveMocks(mocksDir, mockConfigFile, activateMocks) {
    if (activateMocks) {
        console.log('Network mocks activated by mock-requests.\n');
    }

    return {
        include: activateMocks ? getResolvedPathAsArray(mocksDir) : [],
        entry: activateMocks ? getResolvedPathAsArray(mockConfigFile) : []
    };
};
