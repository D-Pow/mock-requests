import MockRequests from '../src';

const homepageUrl = 'https://example.com/home';
const friendsUrl = 'https://example.com/friends';

const bobHomepageMock = 'Home page for Bob';
const bobFriendsMock = { friends: [ 'Alice' ]};
const aliceHomepageMock = 'Home page for Alice';
const aliceFriendsMock = { friends: [ 'Bob' ]};

const bobMocks = {
    [homepageUrl]: bobHomepageMock,
    [friendsUrl]: bobFriendsMock
};
const aliceMocks = {
    [homepageUrl]: aliceHomepageMock,
    [friendsUrl]: aliceFriendsMock
};

const loginMocks = {
    bob: bobMocks,
    alice: aliceMocks
};

const searchApi = 'https://example.com/search';

const dynamicMocks = {
    [searchApi]: {
        dynamicResponseModFn: (request, response, queryParamMap) => {
            const searchQuery = queryParamMap.q;
            return `You searched for ${searchQuery}`;
        },
        usePathnameForAllQueries: true
    }
};

function testDynamicUserConfigResponseMatchesStaticResponse(originalStaticUserConfig, dynamicUserConfig) {
    Object.keys(originalStaticUserConfig).forEach(url => {
        expect(dynamicUserConfig.hasOwnProperty(url)).toBe(true);

        const dynamicConfigResponse = JSON.stringify(dynamicUserConfig[url].response);
        const originalStaticResponse = JSON.stringify(originalStaticUserConfig[url]);

        expect(dynamicConfigResponse).toEqual(originalStaticResponse);
    });
}

function testDynamicLoginConfigMatchesOriginalStaticLoginConfig(originalStaticLoginMocks, dynamicLoginMocks) {
    Object.keys(dynamicLoginMocks).forEach(user => {
        expect(originalStaticLoginMocks.hasOwnProperty(user)).toBe(true);

        const dynamicUserConfig = dynamicLoginMocks[user];
        const originalStaticUserConfig = originalStaticLoginMocks[user];

        testDynamicUserConfigResponseMatchesStaticResponse(originalStaticUserConfig, dynamicUserConfig);
    });
}

describe('Utility functions', () => {
    describe('mapStaticConfigToDynamic', () => {
        it('should map a static URL-response to a dynamic config object', () => {
            const dynamicBobMocks = MockRequests.mapStaticConfigToDynamic(bobMocks);
            dynamicBobMocks[homepageUrl].delay = 1500;

            testDynamicUserConfigResponseMatchesStaticResponse(bobMocks, dynamicBobMocks);

            expect(dynamicBobMocks[homepageUrl].delay).not.toBe(null);
        });

        it('should be possible to convert a nested mocks object to a dynamic config object', () => {
            const dynamicLoginMocks = Object.keys(loginMocks).reduce((dynamicConfigs, user) => {
                dynamicConfigs[user] = MockRequests.mapStaticConfigToDynamic(loginMocks[user]);
                return dynamicConfigs;
            }, {});

            testDynamicLoginConfigMatchesOriginalStaticLoginConfig(loginMocks, dynamicLoginMocks);
        });

        it('should be possible to merge user-agnostic dynamic mocks with static mocks', () => {
            const staticMergedWithDynamic = Object.keys(loginMocks).reduce((dynamicConfigs, user) => {
                dynamicConfigs[user] = { ...MockRequests.mapStaticConfigToDynamic(loginMocks[user]), ...dynamicMocks};
                return dynamicConfigs;
            }, {});

            Object.keys(staticMergedWithDynamic).forEach(user => {
                expect(loginMocks.hasOwnProperty(user)).toBe(true);

                const dynamicUserConfig = staticMergedWithDynamic[user];
                const originalStaticUserConfig = loginMocks[user];

                Object.keys(dynamicUserConfig).forEach(url => {
                    if (originalStaticUserConfig.hasOwnProperty(url)) {
                        testDynamicUserConfigResponseMatchesStaticResponse(originalStaticUserConfig, dynamicUserConfig);
                    } else {
                        expect(dynamicUserConfig.hasOwnProperty(searchApi)).toBe(true);
                        expect(dynamicUserConfig[searchApi].usePathnameForAllQueries).toEqual(dynamicMocks[searchApi].usePathnameForAllQueries);
                    }
                });
            });
        });
    });
});
