const fs = require('fs');
const path = require('path');
const { WebpackPluginInstance, Compiler } = require('webpack');

/**
 * @extends WebpackPluginInstance
 */
class MockRequestsWebpackPlugin {
    /**
     * Activates mock-requests based on the provided parameters
     *
     * @param {string} mocksDir - Directory of all mock files/logic, including the `mockEntryFile`.
     * @param {string} mockEntryFile - Entry file that calls `MockRequests.configure()`.
     * @param {boolean} activateMocks - If mocks determined by `mockEntryFile` should be activated or not.
     */
    constructor(mocksDir, mockEntryFile, activateMocks) {
        this.mocksDir = mocksDir;
        this.mockEntryFile = mockEntryFile;
        this.activateMocks = activateMocks;
    }

    get pluginName() {
        return this.constructor.name;
    }

    getAbsPath(context, includeEntryFile = false) {
        const absPath = path.resolve(context, this.mocksDir, includeEntryFile ? this.mockEntryFile : '');

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
                throw new Error(`Could not find mock directory "${this.mocksDir}"`);
            }

            if (!mockEntryAbsPath) {
                throw new Error(`Could not find mock entry file "${this.mockEntryFile}"`);
            }

            this.addMockEntryFileToConfigEntry(firstEntryList, mockEntryAbsPath);
            this.addMockDirToModuleRule(moduleRules, mockDirAbsPath);
        } catch (e) {
            console.error('Error:', e.message);
            console.error('Note:', this.pluginName, 'has only been verified for webpack@>=5. Webpack runtime issues may be fixed by upgrading.');
        }
    }

    addMockEntryFileToConfigEntry(configEntryList, mockEntryAbsPath) {
        if (configEntryList.includes(mockEntryAbsPath)) {
            // Mock entry file has already been added to webpack config
            // Don't add it again if a rebuild is triggered
            return;
        }

        configEntryList.push(mockEntryAbsPath);
    }

    addMockDirToModuleRule(moduleRules, mockDirAbsPath) {
        const matchingRuleForMockEntryFile = moduleRules.find(rule => {
            const ruleTest = rule.test;

            if (ruleTest instanceof RegExp) {
                return ruleTest.test(this.mockEntryFile);
            } else if (Array.isArray(ruleTest)) {
                return ruleTest.some(testRegex => testRegex.test(this.mockEntryFile));
            }
        });

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

        console.log('Network mocks activated by mock-requests.\n');

        const rules = compiler.options.module.rules;

        compiler.hooks.entryOption.tap(this.constructor.name, (context, entry) => {
            if (typeof entry === typeof this.constructor) {
                entry().then(resolvedEntry => this.injectMocksIntoWebpackConfig(context, rules, resolvedEntry));
            } else {
                this.injectMocksIntoWebpackConfig(context, rules, entry);
            }
        });
    }
}

module.exports = MockRequestsWebpackPlugin;
