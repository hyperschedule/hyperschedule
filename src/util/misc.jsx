import React from 'react';
import {Iterable} from 'immutable';

export const componentToJS = Component => props => {
  const jsProps = {};
  
  for (const key in props) {
    const value = props[key];
    
    if (Iterable.isIterable(value)) {
      jsProps[key] = value.toJS();
      continue;
    }

    jsProps[key] = value;
  }

  return <Component {...jsProps}/>;
};

export function classMap(map) {
  const classes = [];
  for (const className in map) {
    if (map[className]) {
      classes.push(className);
    }
  }
  return classes.join(' ');
}

export function commaJoin(items, comma = ',') {
  switch (true) {
  case items.length === 1:
    return items[0];
  case items.length === 2:
    return items.join(' and ');
  case items.length >= 3:
    return items.slice(0, -1).join(comma + ' ') + comma +' and ' + items[-1];
  default:
    return '';
  }
};

// Produces a comparator function from a sort-key function.
export function sortKeyComparator(key = item => item) {
  return (a, b) => {
    const keyA = key(a),
          keyB = key(b);

    switch (true) {
    case keyA < keyB: return -1;
    case keyA > keyB: return 1;
    default:          return 0;
    }
  };
}

// Searches a sorted Immutable.List to find the index for inserting an item.
// This is used to incrementally insert or remove items from the
// (sorted) course list.
export function binarySearch(list, item, compare = sortKeyComparator()) {
  let left = 0,
      right = list.size;

  while (right > left) {
    const mid = Math.floor((left+right) / 2);
    const cmp = compare(item, list.get(mid));

    if (cmp < 0) {
      // item < items[mid]
      right = mid;
    } else if (cmp > 0) {
      // items > items[mid]
      left = mid + 1;
    } else {
      // items == items[mid]; should not occur for course
      // incremental updating, but included for algorithmic
      // correctness anyway
      return mid;
    }
  }

  return left;
}
