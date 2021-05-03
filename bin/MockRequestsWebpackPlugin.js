const fs = require('fs');
const path = require('path');
const { WebpackPluginInstance, Compiler } = require('webpack');

/**
 * @module mock-requests/bin
 */
/**
 * @namespace MockRequestsWebpackPlugin
 */

/**
 * Webpack plugin for automatically resolving the mock directory,
 * including transpiling all files it contains as well as adding
 * the entry file within it to the build/run output for the user.
 *
 * @extends WebpackPluginInstance
 * @memberOf module:mock-requests/bin~MockRequestsWebpackPlugin
 */
class MockRequestsWebpackPlugin {
    /**
     * Activates mock-requests based on the provided parameters.
     *
     * @param {string} mocksDir - Directory of all mock files/logic, including the `mockEntryFile`.
     * @param {string} mockEntryFile - Entry file that calls `MockRequests.configure()`.
     * @param {boolean} activateMocks - If mocks determined by `mockEntryFile` should be activated or not.
     * @param {Object} [options]
     * @param {boolean} [options.pathsAreAbsolute=false] - If `mocksDir` and `mockEntryFile` are absolute paths instead of relative.
     * @param {boolean} [options.transpileMocksDir=true] - If the files within `mocksDir` should be transpiled.
     * @memberOf module:mock-requests/bin~MockRequestsWebpackPlugin
     */
    constructor(
        mocksDir,
        mockEntryFile,
        activateMocks,
        {
            pathsAreAbsolute = false,
            transpileMocksDir = true
        } = {}
    ) {
        this.mocksDir = mocksDir;
        this.mockEntryFile = mockEntryFile;
        this.activateMocks = activateMocks;
        this.pathsAreAbsolute = pathsAreAbsolute;
        this.transpileMocksDir = transpileMocksDir;
    }

    get pluginName() {
        return this.constructor.name;
    }

    getAbsPath(projectRootPath, includeEntryFile = false) {
        let absPath = path.resolve(projectRootPath, this.mocksDir, includeEntryFile ? this.mockEntryFile : '');

        if (this.pathsAreAbsolute) {
            absPath = includeEntryFile ? this.mockEntryFile : this.mocksDir;
        }

        if (!fs.existsSync(absPath)) {
            return null;
        }

        return absPath;
    }

    injectMocksIntoWebpackConfig(projectRootPath, moduleRules, entry) {
        try {
            const firstEntryName = Object.keys(entry)[0];
            const firstEntryList = entry[firstEntryName].import;
            const mockDirAbsPath = this.getAbsPath(projectRootPath);
            const mockEntryAbsPath = this.getAbsPath(projectRootPath, true);

            if (!mockDirAbsPath) {
                throw new Error(`Could not find mock directory "${this.mocksDir}" from webpack context directory "${projectRootPath}"`);
            }

            if (!mockEntryAbsPath) {
                throw new Error(`Could not find mock entry file "${this.mockEntryFile}" from webpack context directory "${projectRootPath}"`);
            }

            const addedNewEntry = this.addMockEntryFileToConfigEntry(firstEntryList, mockEntryAbsPath);

            if (addedNewEntry) {
                this.addMockDirToModuleRule(moduleRules, mockDirAbsPath, mockEntryAbsPath);

                console.log('Network mocks activated by mock-requests.\n');
            }
        } catch (e) {
            console.error('Error:', e.message);
            console.error('Note:', this.pluginName, 'has only been verified for webpack@>=5. Webpack runtime issues may be fixed by upgrading.\n');
        }
    }

    addMockEntryFileToConfigEntry(configEntryList, mockEntryAbsPath) {
        if (configEntryList.includes(mockEntryAbsPath)) {
            // Mock entry file has already been added to webpack config
            // Don't add it again if a rebuild is triggered
            return false;
        }

        configEntryList.push(mockEntryAbsPath);

        return true;
    }

    addMockDirToModuleRule(moduleRules, mockDirAbsPath, mockEntryAbsPath) {
        if (!this.transpileMocksDir) {
            return;
        }

        const ruleTestMatchesMockDir = ruleTest => {
            if (ruleTest instanceof RegExp) {
                return ruleTest.test(mockEntryAbsPath);
            } else if (typeof ruleTest === typeof '') {
                return ruleTest.includes(mockDirAbsPath);
            } else if (typeof ruleTest === typeof this.constructor) {
                return ruleTest(this.mocksDir) || ruleTest(this.mockEntryFile) || ruleTest(mockDirAbsPath) || ruleTest(mockEntryAbsPath);
            } else if (Array.isArray(ruleTest)) {
                return ruleTest.some(ruleTestMatchesMockDir);
            } else { // is Object with and/or/not keys
                const allAndConditionsMet = ruleTest.and
                    ? ruleTest.and.reduce((matches, test) => matches && ruleTestMatchesMockDir(test), true)
                    : true;
                const anyOrConditionsMet = ruleTest.or
                    ? ruleTest.or.some(ruleTestMatchesMockDir)
                    : true;
                const allNotConditionsMet = ruleTest.not
                    ? ruleTest.not.reduce((matches, test) => matches && !ruleTestMatchesMockDir(test), true)
                    : true;

                return allAndConditionsMet && anyOrConditionsMet && allNotConditionsMet;
            }
        };

        const matchingRuleForMockEntryFile = moduleRules.find(rule => ruleTestMatchesMockDir(rule.test));

        if (matchingRuleForMockEntryFile) {
            const mockDirInclude = matchingRuleForMockEntryFile.include;

            if (mockDirInclude instanceof RegExp) {
                matchingRuleForMockEntryFile.include = [ mockDirInclude, mockDirAbsPath ];
            } else if (Array.isArray(mockDirInclude)) {
                mockDirInclude.push(mockDirAbsPath);
            }
        } else {
            throw new Error(
                `${this.pluginName}: Could not find a suitable \`module.rule.test\` for ${this.mockEntryFile}.`,
                `Try using either a RegExp or RegExp[] as a value for \`test\` to ensure proper transpilation of ${this.mocksDir}.`
            );
        }
    }

    /**
     * @param {Compiler} compiler
     */
    apply(compiler) {
        if (!this.activateMocks) {
            return;
        }

        const rules = compiler.options.module.rules;

        compiler.hooks.entryOption.tap(this.pluginName, (context, entry) => {
            if (typeof entry === typeof this.constructor) {
                entry().then(resolvedEntry => this.injectMocksIntoWebpackConfig(context, rules, resolvedEntry));
            } else {
                this.injectMocksIntoWebpackConfig(context, rules, entry);
            }
        });
    }
}

module.exports = MockRequestsWebpackPlugin;
