import {List} from 'immutable';
import {expect} from 'chai';

import * as util from '@/util/misc';

describe('util/misc', function() {
  describe('binarySearch', function() {
    it('empty', function() {
      const items = List([]);
      const item = 0;
      expect(util.binarySearch(items, item)).to.equal(0);
    });
    it('plain sequence', function() {
      const items = List([1, 2, 3, 4, 5]);
      expect(util.binarySearch(items, 1)).equal(0);
      expect(util.binarySearch(items, 2)).equal(1);
      expect(util.binarySearch(items, 3)).equal(2);
      expect(util.binarySearch(items, 4)).equal(3);
      expect(util.binarySearch(items, 5)).equal(4);
    });
    it('with repeats', function() {
      const items = List([1, 1, 2, 2, 3, 4, 5]);
      expect(util.binarySearch(items, 1))
        .least(0)
        .below(2);
      expect(util.binarySearch(items, 2))
        .least(2)
        .below(4);
      expect(util.binarySearch(items, 3)).to.equal(4);
      expect(util.binarySearch(items, 4)).to.equal(5);
      expect(util.binarySearch(items, 5)).to.equal(6);
    });
    it('without existing elements', function() {
      const items = List([2, 4, 6, 8, 10]);
      expect(util.binarySearch(items, 0)).equal(0);
      expect(util.binarySearch(items, 1)).equal(0);
      expect(util.binarySearch(items, 3)).equal(1);
      expect(util.binarySearch(items, 5)).equal(2);
      expect(util.binarySearch(items, 7)).equal(3);
      expect(util.binarySearch(items, 9)).equal(4);
      expect(util.binarySearch(items, 11)).equal(5);
    });
  });
});
