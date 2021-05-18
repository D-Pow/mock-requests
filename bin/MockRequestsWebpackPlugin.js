const fs = require('fs');
const path = require('path');
const { WebpackPluginInstance, Compiler, RuleSetCondition } = require('webpack/lib');

/**
 * Webpack plugin for automatically resolving the mock directory,
 * including transpiling all files it contains as well as adding
 * the entry file within it to the build/run output for the user.
 *
 * @extends WebpackPluginInstance
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

    setAbsPaths(projectRootPath) {
        this.mockDirAbsPath = this.getAbsPath(projectRootPath);
        this.mockEntryAbsPath = this.getAbsPath(projectRootPath, true);
    }

    /**
     * @param {RuleSetCondition} condition - User-defined condition for matching directories/files.
     * @returns {boolean} - If the condition matches the mock directory/entry file.
     * @private
     */
    webpackConditionMatchesMockDir(condition) {
        const { mockDirAbsPath, mockEntryAbsPath } = this;

        if (condition instanceof RegExp) {
            return condition.test(mockEntryAbsPath);
        } else if (typeof condition === typeof '') {
            return condition.includes(mockDirAbsPath);
        } else if (typeof condition === typeof this.constructor) {
            return condition(this.mocksDir) || condition(this.mockEntryFile) || condition(mockDirAbsPath) || condition(mockEntryAbsPath);
        } else if (Array.isArray(condition)) {
            return condition.some(this.webpackConditionMatchesMockDir);
        } else { // is Object with and/or/not keys
            const allAndConditionsMet = condition.and
                ? condition.and.reduce((matches, cond) => matches && this.webpackConditionMatchesMockDir(cond), true)
                : true;
            const anyOrConditionsMet = condition.or
                ? condition.or.some(this.webpackConditionMatchesMockDir)
                : true;
            const allNotConditionsMet = condition.not
                ? condition.not.reduce((matches, cond) => matches && !this.webpackConditionMatchesMockDir(cond), true)
                : true;

            return allAndConditionsMet && anyOrConditionsMet && allNotConditionsMet;
        }
    }

    injectMocksIntoWebpackConfig(projectRootPath, moduleRules, entry) {
        try {
            const firstEntryName = Object.keys(entry)[0];
            const firstEntryList = entry[firstEntryName].import;
            const { mockDirAbsPath, mockEntryAbsPath } = this;

            if (!mockDirAbsPath) {
                throw new Error(`Could not find mock directory "${this.mocksDir}" from webpack context directory "${projectRootPath}"`);
            }

            if (!mockEntryAbsPath) {
                throw new Error(`Could not find mock entry file "${this.mockEntryFile}" from webpack context directory "${projectRootPath}"`);
            }

            const addedNewEntry = this.addMockEntryFileToConfigEntry(firstEntryList);

            if (addedNewEntry) {
                this.addMockDirToModuleRule(moduleRules);

                console.log('Network mocks activated by mock-requests.\n');
            }
        } catch (e) {
            console.error('Error:', e.message);
            console.error('Note:', this.pluginName, 'has only been verified for webpack@>=5. Webpack runtime issues may be fixed by upgrading.\n');
        }
    }

    addMockEntryFileToConfigEntry(configEntryList) {
        const { mockEntryAbsPath } = this;

        if (configEntryList.includes(mockEntryAbsPath)) {
            // Mock entry file has already been added to webpack config
            // Don't add it again if a rebuild is triggered
            return false;
        }

        configEntryList.push(mockEntryAbsPath);

        return true;
    }

    addMockDirToModuleRule(moduleRules) {
        if (!this.transpileMocksDir) {
            return;
        }

        const { mockDirAbsPath } = this;
        const matchingRuleForMockEntryFile = moduleRules.find(rule => this.webpackConditionMatchesMockDir(rule.test));

        if (matchingRuleForMockEntryFile) {
            const userWebpackRuleInclude = matchingRuleForMockEntryFile.include;

            // Note: If `include` doesn't exist, then the matching rule applies to everything in the `compiler.context`
            // so there's no need to add the mock directory since it will be handled automatically, even if the user
            // applied a `rule.resource(Query)` (see: https://webpack.js.org/configuration/module/#ruleresource)
            if (userWebpackRuleInclude instanceof RegExp) {
                matchingRuleForMockEntryFile.include = [ userWebpackRuleInclude, mockDirAbsPath ];
            } else if (Array.isArray(userWebpackRuleInclude)) {
                userWebpackRuleInclude.push(mockDirAbsPath);
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
     * @private
     */
    apply(compiler) {
        if (!this.activateMocks) {
            return;
        }

        this.setAbsPaths(compiler.context);

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
module.exports.default = MockRequestsWebpackPlugin;
