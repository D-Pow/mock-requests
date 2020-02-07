#!/usr/bin/env node

"use strict";

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve('./');

function getResolvedPathAsArray(mockPath) {
    if (typeof mockPath !== typeof '') {
        return [];
    }

    const resolvedDir = path.resolve(rootDir, mockPath);
    return fs.existsSync(resolvedDir) ? [ resolvedDir ] : [];
}

/**
 * @module
 */

/**
 * Returns an object containing arrays of paths to pass into the webpack `module.rules[jsLoader].include`
 * and `entry` configuration fields. The returned arrays should be spread inside the arrays already
 * present in those configuration fields. Will return empty arrays if `activateMocks` is false to allow
 * for selective activation of mocks.
 *
 * @param {string} mocksDir - Directory containing all mock-related code. Only needed if transpiling JS code containing mocks.
 * @param {string} mockConfigFile - Entry JS file that configures all mocks.
 * @param {boolean} activateMocks - If mocks should be activated.
 */
module.exports = function resolveMocks(mocksDir, mockConfigFile, activateMocks) {
    if (activateMocks) {
        console.log('Network mocks activated by MockRequests\n');
    }

    return {
        include: activateMocks ? getResolvedPathAsArray(mocksDir) : [],
        entry: activateMocks ? getResolvedPathAsArray(mockConfigFile) : []
    };
}
