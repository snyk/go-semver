import {
  valid,
  major,
  minor,
  patch,
  prerelease,
  inc,
} from '../../lib/functions';

describe('test all functions on valid versions', () => {
  for (const [ version, vMajor, vMinor, vPatch, vPrerelease ] of [
    ['v0.0.0', '0', '0', '0', ''],
    ['v1.0.0', '1', '0', '0', ''],
    ['v1.0.1', '1', '0', '1', ''],
    ['v1.0.2', '1', '0', '2', ''],
    ['v1.0.10', '1', '0', '10', ''],
    ['v1.1.10', '1', '1', '10', ''],
    ['v1.10.1', '1', '10', '1', ''],
    ['v10.1.1', '10', '1', '1', ''],
    ['v10.10.10', '10', '10', '10', ''],
    ['v1', '1', '0', '0', ''],
    ['v2', '2', '0', '0', ''],
    ['v10', '10', '0', '0', ''],
    ['v1.10', '1', '10', '0', ''],
    ['v2.10', '2', '10', '0', ''],
    ['v10.0', '10', '0', '0', ''],
    ['v10.1', '10', '1', '0', ''],
    ['v10.2', '10', '2', '0', ''],
    ['v1.1.0-alpha', '1', '1', '0', 'alpha'],
    ['v1.1.0-alpha.2', '1', '1', '0', 'alpha.2'],
    ['v1.1.0-alpha.3', '1', '1', '0', 'alpha.3'],
    ['v1.1.0-beta', '1', '1', '0', 'beta'],
    ['v1.1.0-dev', '1', '1', '0', 'dev'],
    ['v1.1.0-pre', '1', '1', '0', 'pre'],
    ['v1.1.0+build', '1', '1', '0', ''],
    ['v1.1.0+incompatible', '1', '1', '0', ''],
    ['v1.1.0-alpha+build', '1', '1', '0', 'alpha'],
    ['v0.0.0-20200221101010-abcdabcd', '0', '0', '0', '20200221101010-abcdabcd'],
    ['v0.0.0-20200221101010-abcdabcd+incompatible', '0', '0', '0', '20200221101010-abcdabcd'],
    ['v1.0.0-20200221101010-abcdabcd', '1', '0', '0', '20200221101010-abcdabcd'],
    ['v1.0.0-20200221101010-abcdabcd+incompatible', '1', '0', '0', '20200221101010-abcdabcd'],
    ['v1.0.0-20200229202020-abcd1234', '1', '0', '0', '20200229202020-abcd1234'],
    ['v1.0.1-20200221101010-abcdabcd', '1', '0', '1', '20200221101010-abcdabcd'],
    ['v2.0.0-20200221101010-abcdabcd', '2', '0', '0', '20200221101010-abcdabcd'],
  ]) {
    test(`test all functions on version "${version}"`, () => {
      expect(valid(version)).toBe(true);
      expect(major(version)).toBe(vMajor);
      expect(minor(version)).toBe(vMinor);
      expect(patch(version)).toBe(vPatch);
      expect(prerelease(version)).toBe(vPrerelease);
      expect(() => inc(version)).toThrow(/not implemented/i);
    });
  }
});

describe('test all functions on invalid versions', () => {
  for (const version of [
    '1',
    '1.0',
    '1.0.0',
    'v1.0.0.0',
    'v1.0.0.0.0',
    'v1-20200221101010-abcdabcd',
    'v1.0-20200221101010-abcdabcd',
    'nonsense',
    '',
  ]) {
    test(`test all functions on version "${version}"`, () => {
      expect(valid(version)).toBe(false);
      expect(major(version)).toBe(null);
      expect(minor(version)).toBe(null);
      expect(patch(version)).toBe(null);
      expect(prerelease(version)).toBe(null);
      expect(() => inc(version)).toThrow(/not implemented/i);
    });
  }
});
