import {
  compare,
  rcompare,
  gt,
  gte,
  lt,
  lte,
  eq,
  neq,
  cmp,
} from '../../lib/comparison';

// compare(v1, v2): Return 0 if v1 == v2, or 1 if v1 is greater, or -1 if v2 is
// greater. Sorts in ascending order if passed to Array.sort().

describe('v1 == v2', () => {
  for (const [_v1, _v2] of [
    ['v1', 'v1'],
    ['v1.1', 'v1.1'],
    ['v1.1.0', 'v1.1.0'],
    ['v1.10.0', 'v1.10.0'],
    ['v1.1.0-alpha', 'v1.1.0-alpha'],
    ['v1.1.0-alpha.2', 'v1.1.0-alpha.2'],
    ['v1.1.0-alpha+build', 'v1.1.0-alpha+build'],
    ['v1.1.0+build', 'v1.1.0+build'],
  ]) {
    for (const [v1, v2] of [
      [_v1, _v2],
      [_v2, _v1],
    ]) {
      test(`${v1} == ${v2}`, () => {
        expect(compare(v1, v2)).toBe(0);
        expect(rcompare(v1, v2)).toBe(0);

        expect(gt(v1, v2)).toBe(false);
        expect(gte(v1, v2)).toBe(true);
        expect(lt(v1, v2)).toBe(false);
        expect(lte(v1, v2)).toBe(true);
        expect(eq(v1, v2)).toBe(true);
        expect(neq(v1, v2)).toBe(false);

        expect(cmp(v1, '==', v2)).toBe(true);
        expect(cmp(v1, '===', v2)).toBe(v1 === v2);
        expect(cmp(v1, '!=', v2)).toBe(false);
        expect(cmp(v1, '!==', v2)).toBe(v1 !== v2);
        expect(cmp(v1, '<', v2)).toBe(false);
        expect(cmp(v1, '<=', v2)).toBe(true);
        expect(cmp(v1, '>', v2)).toBe(false);
        expect(cmp(v1, '>=', v2)).toBe(true);
      });
    }
  }
});

describe('v1 < v2', () => {
  for (const [v1, v2] of [
    ['v1', 'v2'],
    ['v2', 'v10'],
    ['v1.1', 'v1.2'],
    ['v0.0.0', 'v1.1.1'],
    ['v1.1.0', 'v1.1.1'],
    ['v2.0.0', 'v10.0.0'],
    ['v1.2.0', 'v1.10.1'],
    ['v1.0.2', 'v1.0.10'],
    ['v1.1.10', 'v1.2.1'],
    ['v1.1.0-alpha', 'v1.1.0-beta'],
    ['v1.1.0-alpha.2', 'v1.1.0-alpha.3'],
    ['v1.0.0-20200221101010-abcdabcd', 'v2.0.0-20200221101010-abcdabcd'],
    ['v1.0.0-20200221101010-abcdabcd', 'v1.0.0-20200229202020-abcd1234'],
    ['v0.0.0', 'v0.0.0-20200221101010-abcdabcd'],
    ['v1.0.1-20200221101010-abcdabcd', 'v1.0.1'],
    ['v1.0.0', 'v1.0.1-20200221101010-abcdabcd'],
  ]) {
    test(`${v1} < ${v2}`, () => {
      expect(compare(v1, v2)).toBe(-1);
      expect(compare(v2, v1)).toBe(1);
      expect(rcompare(v1, v2)).toBe(1);
      expect(rcompare(v2, v1)).toBe(-1);

      expect(gt(v1, v2)).toBe(false);
      expect(gt(v2, v1)).toBe(true);
      expect(gte(v1, v2)).toBe(false);
      expect(gte(v2, v1)).toBe(true);
      expect(lt(v1, v2)).toBe(true);
      expect(lt(v2, v1)).toBe(false);
      expect(lte(v1, v2)).toBe(true);
      expect(lte(v2, v1)).toBe(false);
      expect(eq(v1, v2)).toBe(false);
      expect(eq(v2, v1)).toBe(false);
      expect(neq(v1, v2)).toBe(true);
      expect(neq(v2, v1)).toBe(true);

      expect(cmp(v1, '==', v2)).toBe(false);
      expect(cmp(v2, '==', v1)).toBe(false);
      expect(cmp(v1, '===', v2)).toBe(false);
      expect(cmp(v2, '===', v1)).toBe(false);
      expect(cmp(v1, '!=', v2)).toBe(true);
      expect(cmp(v2, '!=', v1)).toBe(true);
      expect(cmp(v1, '!==', v2)).toBe(true);
      expect(cmp(v2, '!==', v1)).toBe(true);
      expect(cmp(v1, '<', v2)).toBe(true);
      expect(cmp(v2, '<', v1)).toBe(false);
      expect(cmp(v1, '<=', v2)).toBe(true);
      expect(cmp(v2, '<=', v1)).toBe(false);
      expect(cmp(v1, '>', v2)).toBe(false);
      expect(cmp(v2, '>', v1)).toBe(true);
      expect(cmp(v1, '>=', v2)).toBe(false);
      expect(cmp(v2, '>=', v1)).toBe(true);
    });
  }
});
