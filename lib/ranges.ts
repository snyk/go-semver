import { parse } from './go/semver';
import { valid } from './functions';
import { compare, eq } from './comparison';

interface VersionRange {
  startVersion?: string;
  endVersion?: string;
  isStartInclusive: boolean;
  isEndInclusive: boolean;
}

function _parseSingleVersionRange(part: string): VersionRange {
  if (!valid(part)) {
    throw new Error('Invalid version specifier in range');
  }
  return {
    startVersion: part,
    endVersion: part,
    isStartInclusive: true,
    isEndInclusive: true,
  } as VersionRange;
}

function _parseBetweenParenthesis(between: string): VersionRange[] {
  const parts = between.split(/\s+|\s*,\s*/);
  if (parts[0] || parts[parts.length - 1]) {
    throw new Error('Invalid version range');
  }

  // If there is more than a single comma, anything between two commas
  // should be a valid version specifier, indicating a single version.
  return parts.slice(1, -1).map(_parseSingleVersionRange);
}

function _parseParenthesisMatch(
  openParen: string,
  ver1: string,
  comma: string | undefined,
  ver2: string | undefined,
  closeParen: string,
): VersionRange {
  if ((ver1 && !valid(ver1)) || (ver2 && !valid(ver2))) {
    throw new Error('Invalid version specifier in range');
  }
  if (!ver1 && !ver2) {
    throw new Error('Invalid version specifier in range');
  }
  if (!comma) {
    ver2 = ver1;
  }
  if (
    ver1 &&
    ver2 &&
    !(openParen === '[' && closeParen === ']') &&
    eq(ver1, ver2)
  ) {
    throw new Error('Invalid version range');
  }
  return {
    startVersion: ver1 || undefined,
    endVersion: ver2 || undefined,
    isStartInclusive: !!ver1 && openParen === '[',
    isEndInclusive: !!ver2 && closeParen === ']',
  } as VersionRange;
}

function parseRange(range: string): VersionRange[] {
  const versionRanges: VersionRange[] = [];

  // add commas at the ends to simplify parsing logic
  const searchedRange = ',' + range + ',';

  const rangePartRegExp = /([([])\s*([^()\[\],\s]*)\s*(?:(,)\s*([^()\[\],\s]*)\s*)?([)\]])/g;
  let m = rangePartRegExp.exec(searchedRange);
  let idx = 0;
  while (m) {
    versionRanges.push(
      ..._parseBetweenParenthesis(searchedRange.substring(idx, m.index)),
    );
    const [openParen, ver1, comma, ver2, closeParen] = [...m.slice(1, 6)];
    versionRanges.push(
      _parseParenthesisMatch(openParen, ver1, comma, ver2, closeParen),
    );
    idx = m.index + m[0].length;
    m = rangePartRegExp.exec(searchedRange);
  }
  versionRanges.push(..._parseBetweenParenthesis(searchedRange.substring(idx)));

  return versionRanges;
}

export function validRange(range: string): string | null {
  if (!range) {
    return null;
  }

  try {
    return parseRange(range)
      .map((part) =>
        [
          part.startVersion
            ? (part.isStartInclusive ? '[' : '(') + part.startVersion
            : '[0.0.0',
          ',',
          part.endVersion
            ? part.endVersion + (part.isEndInclusive ? ']' : ')')
            : ',)',
        ].join(''),
      )
      .join(' ');
  } catch (err) {
    return null;
  }
}

export function satisfies(version: string, range: string): boolean {
  // Throw an exception if the version is invalid.
  parse(version);

  for (const part of parseRange(range)) {
    if (part.startVersion) {
      const comp = compare(version, part.startVersion);
      if (comp === -1 || (comp === 0 && !part.isStartInclusive)) {
        continue;
      }
    }
    if (part.endVersion) {
      const comp = compare(version, part.endVersion);
      if (comp === 1 || (comp === 0 && !part.isEndInclusive)) {
        continue;
      }
    }
    return true;
  }

  return false;
}

export function maxSatisfying() {
  throw new Error('Not implemented');
}

export function minSatisfying() {
  throw new Error('Not implemented');
}

export function intersects(r1: string, r2: string): boolean {
  const leftRanges = parseRange(r1);
  const rightRanges = parseRange(r2);

  for (const leftRange of leftRanges) {
    for (const rightRange of rightRanges) {
      if (
        !(isBefore(leftRange, rightRange) || isBefore(rightRange, leftRange))
      ) {
        return true;
      }
    }
  }
  return false;
}

function isBefore(leftRange: VersionRange, rightRange: VersionRange): boolean {
  if (leftRange.endVersion && rightRange.startVersion) {
    const comp = compare(leftRange.endVersion, rightRange.startVersion);
    if (
      comp === -1 ||
      (comp === 0 && !(leftRange.isEndInclusive && rightRange.isStartInclusive))
    ) {
      return true;
    }
  }
  return false;
}

export function gtr() {
  throw new Error('Not implemented');
}

export function ltr() {
  throw new Error('Not implemented');
}

export function outside() {
  throw new Error('Not implemented');
}
