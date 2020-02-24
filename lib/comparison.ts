import { strict as assert } from 'assert';
import * as goSemver from './go/semver';

const pseudoVersionRegExp = /(?:\.?0\.)?\d{14}-[0-9a-f]{8,32}$/i;
export function compare(v: string, w: string): number {
  // short-circuit for identical versions
  if (v === w) {
    return 0;
  }

  let pv, pw: goSemver.Parsed | undefined;
  try {
    pv = goSemver.parse(v);
    pw = goSemver.parse(w);
  } catch (e) {
    // semver.compare properly deals with either or both of the versions
    // being invalid
    return goSemver.compare(v, w);
  }

  // see: https://golang.org/cmd/go/#hdr-Pseudo_versions
  const vm = pv.prerelease.match(pseudoVersionRegExp);
  const wm = pw.prerelease.match(pseudoVersionRegExp);
  if (!vm && !wm) {
    // neither is a pseudo-version
    return goSemver.compareParsed(pv, pw);
  }

  if (vm) {
    pv.prerelease = pv.prerelease.substring(0, vm.index);
    if (pv.prerelease === '-') {
      pv.prerelease = '';
    }
  }
  if (wm) {
    pw.prerelease = pw.prerelease.substring(0, wm.index);
    if (pw.prerelease === '-') {
      pw.prerelease = '';
    }
  }
  const c = goSemver.compareParsed(pv, pw);
  if (c !== 0) {
    return c;
  }

  // equal base versions, and at least one pseudo-version
  if (vm && wm) {
    // both pseudo-versions
    return vm[0] === wm[0] ? 0 : vm[0] < wm[0] ? -1 : +1;
  } else if (vm) {
    return isPseduoBefore(pv) ? -1 : +1;
  } else {
    assert(wm);
    return isPseduoBefore(pw) ? +1 : -1;
  }
}

function isPseduoBefore(pv: goSemver.Parsed): boolean {
  if (pv.minor === '0' && pv.patch === '0') {
    // vX.0.0-yyyymmddhhmmss-abcdefabcdef
    return false;
  } else if (pv.prerelease.substring(1)) {
    // vX.Y.Z-pre.0.yyyymmddhhmmss-abcdefabcdef
    return false;
  } else {
    // vX.Y.(Z+1)-0.yyyymmddhhmmss-abcdefabcdef
    return true;
  }
}

export function rcompare(v1: string, v2: string): number {
  return compare(v2, v1);
}

export function gt(v1: string, v2: string): boolean {
  return compare(v1, v2) > 0;
}

export function gte(v1: string, v2: string): boolean {
  return compare(v1, v2) >= 0;
}

export function lt(v1: string, v2: string): boolean {
  return compare(v1, v2) < 0;
}

export function lte(v1: string, v2: string): boolean {
  return compare(v1, v2) <= 0;
}

export function eq(v1: string, v2: string): boolean {
  return compare(v1, v2) === 0;
}

export function neq(v1: string, v2: string): boolean {
  return compare(v1, v2) !== 0;
}

function _strictEq(v1: string, v2: string): boolean {
  try {
    const pv1 = goSemver.parse(v1);
    const pv2 = goSemver.parse(v2);
    return goSemver.compareParsed(pv1, pv2) === 0 && pv1.short === pv2.short;
  } catch (e) {
    return v1 === v2;
  }
}

function _strictNeq(v1: string, v2: string): boolean {
  return !_strictEq(v1, v2);
}

export function cmp(v1: string, comparator: string, v2: string): boolean {
  switch (comparator) {
    case '>':
      return gt(v1, v2);
    case '>=':
      return gte(v1, v2);
    case '<':
      return lt(v1, v2);
    case '<=':
      return lte(v1, v2);
    case '==':
      return eq(v1, v2);
    case '!=':
      return neq(v1, v2);
    case '===':
      return _strictEq(v1, v2);
    case '!==':
      return _strictNeq(v1, v2);
    default:
      throw new Error(`Invalid comparator: ${comparator}`);
  }
}

export function diff() {
  throw new Error('Not implemented');
}
