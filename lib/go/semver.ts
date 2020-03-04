// Copyright 2020 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
//
// This is a direct translation of the semver/semver.go file in
// github.com/golang/mod, with a few changes to match Typescript
// conventions. Some string analysis logic was converted to use
// regular expressions to improve performance.
//
// This translation was done by Tal Einat under contract for Snyk Ltd.
// during February 2020. All copyright for the translated code not covered
// by the copyright for the original Go code belongs to Snyk Ltd.
//
// Package semver implements comparison of semantic version strings.
// In this package, semantic version strings must begin with a leading "v",
// as in "v1.0.0".
//
// The general form of a semantic version string accepted by this package is
//
//	vMAJOR[.MINOR[.PATCH[-PRERELEASE][+BUILD]]]
//
// where square brackets indicate optional parts of the syntax;
// MAJOR, MINOR, and PATCH are decimal integers without extra leading zeros;
// PRERELEASE and BUILD are each a series of non-empty dot-separated identifiers
// using only alphanumeric characters and hyphens; and
// all-numeric PRERELEASE identifiers must not have leading zeros.
//
// This package follows Semantic Versioning 2.0.0 (see semver.org)
// with two exceptions. First, it requires the "v" prefix. Second, it recognizes
// vMAJOR and vMAJOR.MINOR (with no prerelease or build suffixes)
// as shorthands for vMAJOR.0.0 and vMAJOR.MINOR.0.

// parsed returns the parsed form of a semantic version string.
export interface Parsed {
  major: string;
  minor: string;
  patch: string;
  short: string;
  prerelease: string;
  build: string;
}

// isValid reports whether v is a valid semantic version string.
export function isValid(v: string): boolean {
  try {
    parse(v);
  } catch (e) {
    return false;
  }
  return true;
}

// Canonical returns the canonical formatting of the semantic version v.
// It fills in any missing .MINOR or .PATCH and discards build metadata.
// Two semantic versions compare equal only if their canonical formattings
// are identical strings.
// The canonical invalid semantic version is the empty string.
export function canonical(v: string): string {
  let p;
  try {
    p = parse(v);
  } catch (e) {
    return '';
  }
  if (p.build !== '') {
    return v.slice(0, -p.build.length);
  }
  if (p.short !== '') {
    return v + p.short;
  }
  return v;
}

// Major returns the major version prefix of the semantic version v.
// For example, Major("v2.1.0") == "v2".
// If v is an invalid semantic version string, Major returns the empty string.
export function major(v: string): string {
  let pv;
  try {
    pv = parse(v);
  } catch (e) {
    return '';
  }
  return v.slice(0, 1 + pv.major.length);
}

// MajorMinor returns the major.minor version prefix of the semantic version v.
// For example, MajorMinor("v2.1.0") == "v2.1".
// If v is an invalid semantic version string, MajorMinor returns the empty string.
export function majorMinor(v: string): string {
  let pv;
  try {
    pv = parse(v);
  } catch (e) {
    return '';
  }
  const i = 1 + pv.major.length;
  const j = i + 1 + pv.minor.length;
  if (j <= v.length && v[i] === '.' && v.substring(i + 1, j) === pv.minor) {
    return v.substring(0, j);
  }
  return v.substring(0, i) + '.' + pv.minor;
}

// Prerelease returns the prerelease suffix of the semantic version v.
// For example, Prerelease("v2.1.0-pre+meta") == "-pre".
// If v is an invalid semantic version string, Prerelease returns the empty string.
export function prerelease(v: string): string {
  let pv;
  try {
    pv = parse(v);
  } catch (e) {
    return '';
  }
  return pv.prerelease;
}

// Build returns the build suffix of the semantic version v.
// For example, Build("v2.1.0+meta") == "+meta".
// If v is an invalid semantic version string, Build returns the empty string.
export function build(v: string): string {
  let pv;
  try {
    pv = parse(v);
  } catch (e) {
    return '';
  }
  return pv.build;
}

// Compare returns an integer comparing two versions according to
// semantic version precedence.
// The result will be 0 if v == w, -1 if v < w, or +1 if v > w.
//
// An invalid semantic version string is considered less than a valid one.
// All invalid semantic version strings compare equal to each other.
export function compare(v: string, w: string): number {
  let pv, pw: Parsed | undefined;
  try {
    pv = parse(v);
  } catch (e) {}
  try {
    pw = parse(w);
    if (!pv) {
      return +1;
    }
  } catch (e) {
    if (!pv) {
      return 0;
    } else {
      return -1;
    }
  }

  return compareParsed(pv, pw);
}

export function compareParsed(pv: Parsed, pw: Parsed): number {
  const majorCompare = compareInt(pv.major, pw.major);
  if (majorCompare !== 0) {
    return majorCompare;
  }
  const minorCompare = compareInt(pv.minor, pw.minor);
  if (minorCompare !== 0) {
    return minorCompare;
  }
  const patchCompare = compareInt(pv.patch, pw.patch);
  if (patchCompare !== 0) {
    return patchCompare;
  }
  return comparePrerelease(pv.prerelease, pw.prerelease);
}

// Max canonicalizes its arguments and then returns the version string
// that compares greater.
export function max(v: string, w: string): string {
  v = canonical(v);
  w = canonical(w);
  if (compare(v, w) > 0) {
    return v;
  }
  return w;
}

export class InvalidVersion extends Error {
  input: string;
  constructor(message: string, input: string) {
    super(message);
    this.input = input;
  }
}

export class JunkOnEnd extends InvalidVersion {
  junk: string;
  constructor(message: string, input: string, junk: string) {
    super(message, input);
    this.junk = junk;
  }
}

export function parse(v: string): Parsed {
  if (v === '' || v[0] !== 'v') {
    throw new InvalidVersion('missing v prefix', v);
  }

  const p: Parsed = {
    major: '',
    minor: '',
    patch: '',
    short: '',
    prerelease: '',
    build: '',
  };

  const input = v;
  try {
    [p.major, v] = parseInt(v.substring(1));
  } catch (e) {
    throw new InvalidVersion('bad major version', input);
  }
  if (v === '') {
    p.minor = '0';
    p.patch = '0';
    p.short = '.0.0';
    return p;
  }

  if (v[0] !== '.') {
    throw new InvalidVersion('bad minor prefix', input);
  }
  try {
    [p.minor, v] = parseInt(v.substring(1));
  } catch (e) {
    throw new InvalidVersion('bad minor version', input);
  }
  if (v === '') {
    p.patch = '0';
    p.short = '.0.0';
    return p;
  }

  if (v[0] !== '.') {
    throw new InvalidVersion('bad patch prefix', input);
  }
  try {
    [p.patch, v] = parseInt(v.substring(1));
  } catch (e) {
    throw new InvalidVersion('bad patch version', input);
  }

  if (v.length > 0 && v[0] === '-') {
    try {
      [p.prerelease, v] = parsePrerelease(v);
    } catch (e) {
      throw new InvalidVersion('bad prerelease', input);
    }
  }

  if (v.length > 0 && v[0] === '+') {
    try {
      [p.build, v] = parseBuild(v);
    } catch (e) {
      throw new InvalidVersion('bad build', input);
    }
  }

  if (v !== '') {
    throw new JunkOnEnd('junk on end', input, v);
  }

  return p;
}

const intRegExp = /^0|[1-9][0-9]*/;
function parseInt(v: string): [string, string] {
  const m = v.match(intRegExp);
  if (!m) {
    throw new Error();
  }
  return [m[0], v.substring(m[0].length)];
}

// "A pre-release version MAY be denoted by appending a hyphen and
// a series of dot separated identifiers immediately following the patch version.
// Identifiers MUST comprise only ASCII alphanumerics and hyphen [0-9A-Za-z-].
// Identifiers MUST NOT be empty. Numeric identifiers MUST NOT include leading zeroes."
const prereleaseRegExp = /^(-[0-9A-Za-z0-9-]+(?:\.[0-9A-Za-z-]+)*)(?:\+|$)/;
function parsePrerelease(v: string): [string, string] {
  const m = v.match(prereleaseRegExp);
  if (!m) {
    throw new Error();
  }
  const parts = m[1].substring(1).split('.');
  if (parts.filter(isBadNum).length > 0) {
    throw new Error();
  }

  return [m[1], v.substring(m[1].length)];
}

const buildRegExp = /^\+[0-9A-Za-z0-9-]+(?:\.[0-9A-Za-z-]+)*$/;
function parseBuild(v: string): [string, string] {
  const m = v.match(buildRegExp);
  if (!m) {
    throw new Error();
  }
  return [m[0], v.substring(m[0].length)];
}

const isBadNumRegexp = /^0[0-9]+$/;
function isBadNum(v: string): boolean {
  return isBadNumRegexp.test(v);
}

const isNumRegexp = /^[0-9]*$/;
function isNum(v: string): boolean {
  return isNumRegexp.test(v);
}

function compareInt(x: string, y: string): number {
  if (x === y) {
    return 0;
  }
  if (x.length < y.length) {
    return -1;
  }
  if (x.length > y.length) {
    return +1;
  }
  if (x < y) {
    return -1;
  } else {
    return +1;
  }
}

function comparePrerelease(x: string, y: string): number {
  // "When major, minor, and patch are equal, a pre-release version has
  // lower precedence than a normal version.
  // Example: 1.0.0-alpha < 1.0.0.
  // Precedence for two pre-release versions with the same major, minor,
  // and patch version MUST be determined by comparing each dot separated
  // identifier from left to right until a difference is found as follows:
  // identifiers consisting of only digits are compared numerically and
  // identifiers with letters or hyphens are compared lexically in ASCII
  // sort order. Numeric identifiers always have lower precedence than
  // non-numeric identifiers. A larger set of pre-release fields has a
  // higher precedence than a smaller set, if all of the preceding
  // identifiers are equal.
  // Example: 1.0.0-alpha < 1.0.0-alpha.1 < 1.0.0-alpha.beta <
  // 1.0.0-beta < 1.0.0-beta.2 < 1.0.0-beta.11 < 1.0.0-rc.1 < 1.0.0."
  if (x === y) {
    return 0;
  }
  if (x === '') {
    return +1;
  }
  if (y === '') {
    return -1;
  }
  x = x.substring(1); // skip initial -
  y = y.substring(1); // skip initial -
  while (x && y) {
    let dx, dy: string;
    [dx, x] = x.split('.', 2);
    [dy, y] = y.split('.', 2);
    if (dx !== dy) {
      const ix = isNum(dx);
      const iy = isNum(dy);
      if (ix !== iy) {
        if (ix) {
          return -1;
        } else {
          return +1;
        }
      }
      if (ix) {
        if (dx.length < dy.length) {
          return -1;
        }
        if (dx.length > dy.length) {
          return +1;
        }
      }
      if (dx < dy) {
        return -1;
      } else {
        return +1;
      }
    }
  }
  if (!x) {
    return -1;
  } else {
    return +1;
  }
}
