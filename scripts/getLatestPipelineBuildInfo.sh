#!/usr/bin/env -S bash

gh api https://api.github.com/repos/D-Pow/mock-requests/actions/caches?key=$(
    gh api https://api.github.com/repos/D-Pow/mock-requests/actions/caches \
    | jq -r '.actions_caches[0] | .key'
) | jq '.actions_caches'
