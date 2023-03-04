# Deploying/Publishing Packages

## Possible Options

If you want to publish your npm package in a private registry, you have these options:

1. Host a server yourself (See docs/tutorial links in [this StackOverflow answer](https://stackoverflow.com/a/7577265/5771107)). This will likely cost money and a good amount of time to set up.

2. [Pay npm to do it for you](https://www.npmjs.com/products/teams#features-plans-and-enterprise-pane). Costs money ($7/month/user) but virtually no time to set up.

3. Do what [gh-pages](https://www.npmjs.com/package/gh-pages) does and essentially run the package.json build script/copy the output to a new branch (`npm install git+ssh://url.git#branch-or-tag-version`). Cheap (free) but uses GitHub branches for deployment which is less than ideal.

4. Generate a package in GitHub via CI and install it from there. Basically, GitHub allows you to save CI artifacts for different periods of time, and allows you to have permanent packages in the "Packages" section. Those in "Packages" can be used to download/install/run programs as if the user compiled code themselves.

    In relation to npm, these work in the same way as hosting your own private registry (see [this tutorial](https://andreybleme.com/2020-05-31/hosting-private-npm-packages-for-free/)). Probably free and less hassle than (1), (2), or (3), so it could be the best of all worlds.


## Best Option

The winner: **GitHub "Packages"**

It's a great way to publish packages for free. They can be public (`npm install git@github.com:<owner>/<repo>.git#optional-branch-or-tag`) or private (`npm install @myorg/repo-name`).

# Deploying Packages to GitHub's Registry

The [tutorial linked above](https://andreybleme.com/2020-05-31/hosting-private-npm-packages-for-free/) can be summarized as:

1. Get a GitHub auth token with these permissions:

    ```
    read:packages, write:packages, delete:packages
    ```

2. Add this to your .npmrc:

    ```npmrc
    //npm.pkg.github.com/:_authToken={GITHUB_AUTH_TOKEN}   // intentionally commented
    @myorg:registry=https://npm.pkg.github.com/  // mark GitHub's npm registry for your package (REQUIRES SCOPE!!)
    registry=https://registry.npmjs.org/  // keep the default npm registry
    # if you want to make it private, you'll need to ensure no one outside your org can access the package using the below.
    # Though, they will have to `npm/yarn login` to install it.
    # NOTE: Both `always-auth` and `_auth` work the same: https://docs.npmjs.com/cli/v7/using-npm/config#_auth
    always-auth=true
    ```

    and this to your .yarnrc (if using Yarn):

    ```npmrc
    # .yarnrc picks up the private/scoped registry from .npmrc, but then it sets all packages to use it.
    # This ensures Yarn installs all public packages from the normal registry rather than the private/scoped one.
    registry "https://registry.yarnpkg.com"
    ```

    See: [Specify the registry via CLI](https://stackoverflow.com/questions/57633029/npm-how-to-specify-registry-to-publish-in-the-command-line/57633139#57633139).

3. Set your package.json to use the specified registry via [publishConfig](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#publishconfig). This is necessary because `.npmrc` [doesn't affect when you run `npm publish`](https://stackoverflow.com/questions/54074906/do-i-need-the-registry-defined-in-npmrc-file-when-i-have-the-publishconfig-defi) (see: [GitHub npm issue](https://github.com/npm/npm/issues/5717#issuecomment-49549998)):

    ```jsonc
    "publishConfig": {
        "registry":"https://npm.pkg.github.com/"
    }
    ```

4. Set up a `.github/workflows/publish-npm-package.yml` (name can be anything you want):

    ```yaml
    name: publish-npm-package
    on:
      # Multiple ways to do this, including:
      # 1. Publish your release manually in GitHub (you run `npm version`, commit, and click "Release") and have your pipeline react to deploy the package (what's shown here).
      # 2. Run the pipeline on merge to `master` and do the release/deploy then.
      release:
        types: [published]

    jobs:
      build:
        runs-on: ubuntu-latest
        env:
          NODE_AUTH_TOKEN: ${{secrets.GITHUB_AUTH_TOKEN}}
          GH_USER: ${{secrets.GH_USER}}
          GH_USER_EMAIL: ${{secrets.GH_USER_EMAIL}}
        steps:
          - name: Checkout Repository
            uses: actions/checkout@v3
          - name: Setup Environment
            uses: actions/setup-node@v3
            with:
              node-version: 16
              # Only needed if you're not setting the `publishConfig` package.json field yourself
              registry-url: https://npm.pkg.github.com  # might be better to put this in ${{ env.registry_url }}
              scope: "@myorg" # might be better to put this in ${{ env.registry_scope }}
          - name: Setup Git User
            # This part is only needed for option (2), e.g. running `npm version` in the pipeline.
            run: |
              git config (--global)? user.name ${GH_USER}
              git config (--global)? user.email ${GH_USER_EMAIL}
          - name: Install
            run: npm install
          - name: Build
            run: npm run build
          # - name: Add registry to .yarnrc
            # Only if using Yarn and don't already have a .yarnrc, add the registry in the CI.
            # run: echo '"@myorg:registry" "https://npm.pkg.github.com/"' > .yarnrc
          - name: Set Package Version
            # Only required for option (2) so that you create a new semver version
            # Note: The `tag_name` will require `major`, `minor`, or `patch`
            run: npm version --new-version ${{github.event.release.tag_name}}
          - name: Publish
            run: npm publish
    ```

5. Make sure you specify which files/directories you want published in the [files](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#files) package.json field so that `npm publish` only includes the files you want.

6. For private packages, set the [private](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#private) package.json field.

7. For browser packages (e.g. published micro-frontend apps), you should use the [browser](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#browser) package.json field instead of [main](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main).

8. Install via `npm install @myorg/appName`.
