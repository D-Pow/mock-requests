#!/usr/bin/env -S bash

(
    CACHES_API_URL="https://api.github.com/repos/$(
        gh repo view --json owner --jq '.owner.login'
    )/$(
        gh repo view --json name --jq '.name'
    )/actions/caches";

    gh api "${CACHES_API_URL}" --jq ".actions_caches[]" \
        | jq --indent 4;
)
