import { intersects, satisfies, validRange } from '../../lib';

describe('test valid ranges', () => {
  for (const { range, included, excluded } of [
    {
      range: 'v1.0.0',
      included: ['v1.0.0'],
      excluded: ['v0.0.0', 'v1.0.1', 'v2.0.0'],
    },
    {
      range: '=v1.0.0',
      included: ['v1.0.0'],
      excluded: ['v0.0.0', 'v1.0.1', 'v2.0.0'],
    },
    {
      range: '>=v1.0.0,<=v1.0.0',
      included: ['v1.0.0'],
      excluded: ['v0.0.0', 'v1.0.1', 'v2.0.0'],
    },
    {
      range: '>=v1.0.0, <=v1.0.0',
      included: ['v1.0.0'],
      excluded: ['v0.0.0', 'v1.0.1', 'v2.0.0'],
    },
    {
      range: '>=v1.0.0',
      included: ['v1', 'v1.0.0', 'v1.0.1', 'v2'],
      excluded: ['v0.0.0', 'v0.0.1', 'v0.1.0'],
    },
    {
      range: '>v1.0.0',
      included: ['v1.0.1', 'v2'],
      excluded: ['v0.0.0', 'v0.1.1', 'v1', 'v1.0.0'],
    },
    {
      range: '>=v1.0.1, <=v2.1.1',
      included: ['v1.0.1', 'v1.1.1', 'v2.0.0', 'v2.0.1', 'v2.1.0', 'v2.1.1'],
      excluded: ['v0.0.0', 'v1.0.0', 'v3', 'v10.0.0'],
    },
    {
      range: '>v1.0.1, <v2.1.1',
      included: ['v1.0.2', 'v2.1.0'],
      excluded: ['v1.0.0', 'v1.0.1', 'v2.1.1'],
    },
    {
      range: '<=v2.0.0-pre',
      included: ['v1', 'v2.0.0-alpha', 'v2.0.0-pre'],
      excluded: ['v2.0.0-rc', 'v2.0.0'],
    },
    {
      range: '>=v1.0.0-20201219133700-deadbeef, <=v1.0.0-20201219133702-deadbeef',
      included: [
        'v1.0.0-20201219133700-deadbeef',
        'v1.0.0-20201219133701-deadbeef',
        'v1.0.0-20201219133702-deadbeef',
      ],
      excluded: [
        'v1.0.0',
        'v1.0.1',
        'v1.0.0-alpha',
        'v1.0.0-20201219133600-deadbeef',
        'v1.0.0-20201219133703-deadbeef',
      ],
    },
    {
      range: '>=v0, <=v1',
      included: [],
      excluded: ['v1.0.0-20200202222222-deadbeef'],
    },
    {
      range: '>=v0, <=v1.1.1-pre',
      included: ['v1.1.0-pre.0.20200202222222-deadbeef'],
      excluded: ['v1.1.1-pre.0.20200202222222-deadbeef'],
    },
    {
      range: '>=v0, <=v1.1.1',
      included: ['v1.1.1-20200202222222-deadbeef'],
      excluded: ['v1.1.2-20200202222222-deadbeef'],
    },
  ]) {
    test(`test valid range "${range}"`, () => {
      expect(validRange(range)).toBeTruthy();

      for (const version of included) {
        expect(satisfies(version, range)).toBe(true);
      }
      for (const version of excluded) {
        expect(satisfies(version, range)).toBe(false);
      }
      expect(() => satisfies('nonsense', range)).toThrow();

      expect(intersects(range, range)).toBe(true);
      for (const version of included) {
        expect(intersects(version, range)).toBe(true);
        expect(intersects(range, version)).toBe(true);
      }
      for (const version of excluded) {
        expect(intersects(version, range)).toBe(false);
        expect(intersects(range, version)).toBe(false);
      }
    });
  }
});

describe('test invalid ranges', () => {
  for (const range of [
    '1',
    '1.0.0',
    '[0,)',
    '[0.0.0,)',
    '[v0.0.0,)',
    '[v1.0.0]',
    '[v1.0.0,)',
    '[v1.0.0,2.0.0)',
    '(,v1.0.0]',
    '^v1.0.0',
    '~v1.0.0',
    '~>v1.0.0',
    '>v1.0.0, <v1.0.0',
    '>=v1.0.0, <v1.0.0',
    '>v1.0.0, <=v1.0.0',
    '>=v2.0.0, <=v1.0.0',
    '>=v10.0.0, <=v3.0.0',
    '>=v1.0.0, <=v1.0.0, <v2.0.0',
    '>=v1.0.0, =v1.0.0',
    '>=v1.0.0,,<v2.0.0',
    '>=v1.0.0,nonsense,<v2.0.0',
    '>=v1.0.0,nonsense',
    '>=v1.0.0, <nonsense',
    'nonsense, =v1.0.0',
    'nonsense, <v1.0.0',
    'nonsense',
    '>=nonsense',
    '>nonsense',
    '<nonsense',
    '<=nonsense',
    '=nonsense',
    '',
  ]) {
    test(`test invalid range "${range}"`, () => {
      expect(validRange(range)).toBe(null);
      expect(() => satisfies('v1.0.0', range)).toThrow();
      expect(() => satisfies('nonsense', range)).toThrow();
      expect(() => intersects('=v1.0.0', range)).toThrow();
      expect(() => intersects(range, '=v1.0.0')).toThrow();
      expect(() => intersects(range, range)).toThrow();
    });
  }
});

describe('test range intersections', () => {
  for (const [range1, range2] of [
    ['v1.0.0', 'v1.0.0'],
    ['>=v1.0.0, <=v3.0.0', 'v1.0.0'],
    ['>=v1.0.0, <=v3.0.0', 'v2.0.0'],
    ['>=v1.0.0, <=v3.0.0', 'v3.0.0'],
    ['>=v1.0.0, <=v3.0.0', '>=v2.0.0, <=v4.0.0'],
    ['>=v1.0.0, <v3.0.0', '>=v2.0.0, <=v4.0.0'],
    ['>=v1.0.0, <=v3.0.0', '>v2.0.0, <=v4.0.0'],
    ['>=v1.0.0, <v3.0.0', '>v2.0.0, <=v4.0.0'],
    ['>=v1.0.0, <=v2.0.0', '>=v0.0.0, <=v1.0.0'],
    ['>=v1', '>=v2'],
    ['<=v1', '<=v2'],
    ['>=v1', '<=v2'],
    ['>=v2', '<=v2'],
    ['>=v3, <=v4', '>=v1, <=v2 || >=v3.5, <=v4'],
    ['>=v3, <=v4', '>=v1, <=v2 || >=v3.5, <=v5'],
    ['>=v3, <=v4', '>=v1, <=v2 || >v3.5, <=v4'],
    ['>v3, <=v4', '>=v1, <=v2 || >=v3.5, <=v4'],
    ['>v3, <=v4', '>=v1, <=v2 || >v3.5, <=v4'],
    [
      '>=v1.0.0-20200202222222-deadbeef, <=v1.0.0-20200202222224-deadbeef',
      '>=v1.0.0-20200202222223-deadbeef, <=v1.0.0-20200202222225-deadbeef',
    ],
    [
      '>=v1.0.0-20200202222222-deadbeef, <=v1.0.0-20200202222224-deadbeef',
      '>=v1.0.0-20200202222221-deadbeef, <=v1.0.0-20200202222223-deadbeef',
    ],
    [
      '>=v1.0.0-20200202222222-deadbeef, <=v1.0.0-20200202222224-deadbeef',
      '=v1.0.0-20200202222223-deadbeef',
    ],
  ]) {
    test(`test intersecting ranges "${range1}" "${range2}"`, () => {
      expect(intersects(range1, range2)).toBe(true);
      expect(intersects(range2, range1)).toBe(true);
    });
  }

  for (const [range1, range2] of [
    ['v1.0.0', 'v2.0.0'],
    ['>=v1.0.0, <v2.0.0', 'v2.0.0'],
    ['>v2.0.0, <=v3.0.0', 'v2.0.0'],
    ['>=v2.5.0, <=v3.0.0', 'v2.0.0'],
    ['>v1.0.0, <=v2.0.0', '>=v0.0.0, <=v1.0.0'],
    ['>=v1.0.0, <=v2.0.0', '>=v0.0.0, <v1.0.0'],
    ['>v1.0.0, <=v2.0.0', '>=v0.0.0, <v1.0.0'],
    ['>v2', '<=v2'],
    ['>=v2', '<v2'],
    ['>v2', '<v2'],
    ['>=v3', '<=v2'],
    ['>v3', '<=v2'],
    ['>=v3', '<v2'],
    ['>v3', '<v2'],
    ['>=v1, <v2 || >v2, <=v3', 'v2'],
    ['>=v1, <v2 || >v2', 'v2'],
    ['>=v1, <=v2 || >=v4', 'v3'],
    [
      '>=v1.0.0-20200202222222-deadbeef, <=v1.0.0-20200202222223-deadbeef',
      '>=v1.0.0-20200202222224-deadbeef, <=v1.0.0-20200202222225-deadbeef',
    ],
    [
      '>=v1.0.0-20200202222222-deadbeef, <=v1.0.0-20200202222224-deadbeef',
      '=v1.0.0-20200202222225-deadbeef',
    ],
    [
      '>=v1.0.0-20200202222222-deadbeef, <=v1.0.0-20200202222224-deadbeef',
      '=v1.0.0-20200202222221-deadbeef',
    ],
  ]) {
    test(`test non-intersecting ranges "${range1}" "${range2}"`, () => {
      expect(intersects(range1, range2)).toBe(false);
      expect(intersects(range2, range1)).toBe(false);
    });
  }
});
