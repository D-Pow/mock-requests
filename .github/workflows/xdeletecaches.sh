#!/usr/bin/env -S bash

(
    CACHES_API_URL="https://api.github.com/repos/$(
        gh repo view --json owner --jq '.owner.login'
    )/$(
        gh repo view --json name --jq '.name'
    )/actions/caches";

    cacheIds=($(
        gh api "${CACHES_API_URL}" --jq ".actions_caches[] | .id"
    ));

    for cacheId in ${cacheIds[@]}; do
        gh api --method DELETE "${CACHES_API_URL}/$cacheId";
    done;
)
