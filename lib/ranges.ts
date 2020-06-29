import * as _ from 'lodash';
import { isValid, parse } from './go/semver';
import { compare } from './comparison';

class InvalidRequirementPart extends Error {}
class InvalidVersionRange extends Error {}

interface VersionRange {
  startVersion?: string;
  endVersion?: string;
  isStartInclusive: boolean;
  isEndInclusive: boolean;
}

const DEFAULT_REQUIREMENT: VersionRange[] = [
  { startVersion: 'v0.0.0', isStartInclusive: true, isEndInclusive: false },
]

type Op = '>=' | '<=' | '>' | '<' | '=';
const OPS = ['>=', '<=', '>', '<', '='];

function parsePart(part: string): ({ op: Op, version: string }) {
  const OPS_RE = OPS.map((op) => _.escapeRegExp(op)).join('|');
  const match = part.trim().match(`^(${OPS_RE})?(.*)$`);
  if (!match) {
    throw new InvalidRequirementPart();
  }

  const op: Op = (match[1] || '=') as Op;
  const version = match[2].trim();
  if (!isValid(version)) {
    throw new InvalidRequirementPart();
  }

  return { op, version };
}

function parseRange(rangeStr: string): VersionRange {
  let parts: Array<{ op: Op, version: string }>;
  try {
    parts = rangeStr.split(',').map(parsePart);
  } catch (error) {
    if (error instanceof InvalidRequirementPart) {
      throw new InvalidVersionRange();
    }
    throw error;
  }

  const range = {} as VersionRange;
  function setInclusive(attr: 'isStartInclusive' | 'isEndInclusive', value: boolean) {
    if (range.hasOwnProperty(attr)) {
      throw new InvalidRequirementPart();
    }
    range[attr] = value;
  }
  function setVersion(attr: 'startVersion' | 'endVersion', value: string) {
    if (range.hasOwnProperty(attr)) {
      throw new InvalidRequirementPart();
    }
    range[attr] = value;
  }
  for (const { op, version } of parts) {
    if (op === '=') {
      setVersion('startVersion', version);
      setInclusive('isStartInclusive', true);
      setVersion('endVersion', version);
      setInclusive('isEndInclusive', true);
    } else {
      setVersion(op[0] === '>' ? 'startVersion' : 'endVersion', version);
      setInclusive(op[0] === '>' ? 'isStartInclusive' : 'isEndInclusive', op.endsWith('='));
    }
  }

  if (range.startVersion && range.endVersion) {
    const comp = compare(range.startVersion, range.endVersion);
    if (
      comp === 1 ||
      comp === 0 && !(range.isStartInclusive && range.isEndInclusive)
    ) {
      throw new InvalidRequirementPart();
    }
  }

  return range;
}

function parseRequirement(requirementStr: string): VersionRange[] {
  const rangeStrs = requirementStr.split('||').map((part) => part.trim());
  if (rangeStrs.length === 0) {
    return DEFAULT_REQUIREMENT;
  }
  return rangeStrs.map(parseRange);
}

export function validRange(range: string): string | null {
  if (!range.trim()) {
    return null;
  }

  try {
    return parseRequirement(range)
      .map((range) => {
        const parts = [];
        if (range.startVersion && range.startVersion == range.endVersion) {
          return '=' + range.startVersion;
        }
        if (range.startVersion) {
          parts.push((range.isStartInclusive ? '>=' : '>') + range.startVersion);
        }
        if (range.endVersion) {
          parts.push((range.isEndInclusive ? '<=' : '<') + range.endVersion);
        }
        return parts.length > 0 ? parts.join(',') : '>=v0.0.0';
      })
      .join(' || ');
  } catch (err) {
    return null;
  }
}

export function satisfies(version: string, range: string): boolean {
  // Throw an exception if the version is invalid.
  parse(version);

  for (const part of parseRequirement(range)) {
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
  const leftRanges = parseRequirement(r1);
  const rightRanges = parseRequirement(r2);

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
