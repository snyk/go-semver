import { isValid, parse } from './go/semver';

export function valid(v: string): boolean {
  return isValid(v);
}

export function major(v: string): string | null {
  try {
    return parse(v).major;
  } catch (e) {
    return null;
  }
}

export function minor(v: string): string | null {
  try {
    return parse(v).minor;
  } catch (e) {
    return null;
  }
}

export function patch(v: string): string | null {
  try {
    return parse(v).patch;
  } catch (e) {
    return null;
  }
}

export function prerelease(v: string): string | null {
  try {
    // remove leading '-' from prerelease
    return parse(v).prerelease.substring(1);
  } catch (e) {
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function inc(v: string): string {
  throw new Error('Not implemented');
}
