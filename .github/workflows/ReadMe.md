# GitHub Pipeline Configurations

## Overview

GitHub has a built-in pipeline system that allows you to run arbitrary scripts upon certain events. These are broken down into [Workflows](#workflows) and [Actions](#actions). Configure them using `.yaml` files.

### Definitions

* **Event** - An activity from the outside world that can be tracked and act as a trigger for a workflow. This includes things like `git push`, `merge`, opening a pull-request, etc.
* **Workflow** (aka **Pipeline**) - A series of pre-defined scripts/actions/steps that run after certain events occur.
* **Action** - A "portable pipeline" that isn't triggered by an event, rather imported/called by a workflow.

### Types

#### Workflows

Workflows are triggered by an event and (optionally) if certain constraints are met. For example, the [ci.yaml](./ci.yaml) is configured to run on `git push` and `pull-request` events under the constraint that they are only executed on the `master` branch.

* Store in `.github/workflows/`.
* Use the `jobs` YAML key to run the scripts/actions.

#### Actions

Like workflows, actions are simply a series of predefined steps and their constraints. Unlike workflows, they are called from workflows rather than events.

* Store in `.github/workflows/actions/`.
* Use the `runs` YAML key to run the scripts/actions.
* Call in workflow via:
    - `uses: actions/my-action-name@v1` if [publishing your action](https://docs.github.com/en/actions/creating-actions/creating-a-composite-action).
    - `uses: ./.github/some-dir/my-action` if running an action from a local file.
        + `my-action` is a directory holding an `action.yaml` file (it has to be this way according to [GitHub actions spec](https://docs.github.com/en/actions/creating-actions/about-custom-actions#types-of-actions)).
        + Using an action this way requires using the relative path from the project root directory.
* Note the `@v1` tag above. To be able to use an action, you must reference it via a git tag or branch.
    - Tags are for releases/publishing new versions of actions.
        + See: [Using tags for action releases](https://docs.github.com/en/actions/creating-actions/about-actions#using-release-management-for-actions).
    - Branches are for using action versions before an official version is released.
        + See: [Using branches for action releases](https://docs.github.com/en/actions/creating-actions/about-actions#using-branches-for-release-management).



## Deploying to Cloud Service

This varies depending on specific cloud service provider and project setup. Some good examples/docs include:

* [GitHub example with Docker/GCP](https://cloud.google.com/community/tutorials/cicd-cloud-run-github-actions#github).
* [GitHub docs on publishing packages via Actions](https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions#publishing-a-package-using-an-action).
* [Hosting private packages in GitHub's registry for free](https://andreybleme.com/2020-05-31/hosting-private-npm-packages-for-free/). See the instructions [here](./HostingPrivatePackagesReadMe.md).



## References

* [Contexts (`github` object, env vars, etc.)](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context)
* [Workflow syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)
* [Events that trigger workflows](https://docs.github.com/en/actions/reference/events-that-trigger-workflows)
    - [`pull_request`](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#pull_request)
    - [`workflow_run` (running workflow from other workflows)](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#workflow_run)
* [Workflow logic (variables, if-statements, etc.) syntax](https://docs.github.com/en/actions/reference/context-and-expression-syntax-for-github-actions)
* [Actions](https://docs.github.com/en/actions/creating-actions/about-actions)
    - [Running single action script](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#runs-for-composite-actions)
    - [`Composite` actions - Executing multiple steps](https://docs.github.com/en/actions/creating-actions/metadata-syntax-for-github-actions#runs-for-composite-run-steps-actions)
* [Cache output from other steps (e.g. build output)](https://docs.github.com/en/actions/advanced-guides/caching-dependencies-to-speed-up-workflows)
* [Publishing packages using workflows](https://docs.github.com/en/packages/managing-github-packages-using-github-actions-workflows/publishing-and-installing-a-package-with-github-actions#publishing-a-package-using-an-action)
* [Webhook API Reference](https://docs.github.com/en/rest/reference)
* [What `ubuntu-latest` supports](https://github.com/actions/virtual-environments/blob/main/images/linux/Ubuntu2004-Readme.md)
* [YAML syntax (recc from GitHub)](https://www.codeproject.com/Articles/1214409/Learn-YAML-in-five-minutes)
* [Sample StackOverflow answer on Workflows vs Actions](https://stackoverflow.com/questions/63710029/github-action-error-top-level-runs-section-is-required/63710170#63710170)
* [GitHub docs about markdown](https://guides.github.com/features/mastering-markdown/)
    - [GitHub markdown supported languages](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml)
