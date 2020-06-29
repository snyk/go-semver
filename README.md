[![Snyk logo](https://snyk.io/style/asset/logo/snyk-print.svg)](https://snyk.io)

[![Build Status](https://travis-ci.org/Snyk/go-semver.svg?branch=master)](https://travis-ci.org/Snyk/go-semver)
[![Known Vulnerabilities](https://snyk.io/test/github/snyk/go-semver/badge.svg)](https://snyk.io/test/github/snyk/go-semver)

***

# go-semver

A semver parser that uses Go modules dependency semantics with node-semver's api.

Go generally uses semver, with support for pre-releases, special builds, and using untagged revisions from source control repos. For some details, see [the Pseudo-Versions section of the go command's documentation](https://golang.org/cmd/go/#hdr-Pseudo_versions).

## Ranges

This also supports additional syntax for defining version ranges, as well as logic for checking whether a version satisfies a range and whether two ranges intersect. The syntax used is based on the style used by Ruby Gems. Example ranges:

    >=v0.0.0
    >=v0.0.0, <v1.0.0
    <=v1.0.0 || >= 3.0.0
