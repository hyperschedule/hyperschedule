import React from "react";
import {Iterable} from "immutable";

/**
 * Higher-order component that wraps a "dumb" React component that
 * takes plain-JS objects to accept Immutable objects.
 *
 * @see {@link https://redux.js.org/recipes/usingimmutablejs#use-a-higher-order-component-to-convert-your-smart-components-immutable-js-props-to-your-dumb-components-javascript-props}.
 *
 * @param {React.Component} Component "Presentational" React component
 * to be wrapped.
 *
 * @returns {React.Component} "Container" React component that accepts
 * Immutable state object props, converts them to plain-JS objects,
 * and renders the wrapped "presentational" component with the
 * converted props.
 */
export const componentToJS = Component =>
  function ToJSComponent(props) {
    const jsProps = {};

    for (const key in props) {
      const value = props[key];

      if (Iterable.isIterable(value)) {
        jsProps[key] = value.toJS();
        continue;
      }

      jsProps[key] = value;
    }

    return <Component {...jsProps} />;
  };

/**
 * Generates a `className` string (comprising a space-joined list of
 * classes) from a JS map object.  Each map key corresponds to a class
 * name and is included in the class list if the corresponding map
 * value is truthy.
 *
 * @param {Object} map JS object that maps style class names to
 * boolean-like values indicating whether the class should be included
 * in the list (truthy) or excluded (falsy).
 *
 * @returns {String} Resulting `className` string generated from the
 * given map.
 */
export function classMap(map) {
  const classes = [];
  for (const className in map) {
    if (map[className]) {
      classes.push(className);
    }
  }
  return classes.join(" ");
}

/**
 * Joins a list of strings with commas and "and" for natural-sounding
 * English.
 *
 * @param {Array} items An array of strings to be comma-joined.
 *
 * @returns {String} The comma-joined items in a single string.
 *
 * @example commaJoin(["a", "b", "c"]); // => "a, b, and c"
 */
export function commaJoin(items) {
  switch (true) {
    case items.length === 1:
      return items[0];
    case items.length === 2:
      return items.join(" and ");
    case items.length >= 3:
      return items.slice(0, -1).join(", ") + ", and " + items[-1];
    default:
      return "";
  }
}

/**
 * Produces a comparator function from a sort-key function.  A
 * comparator takes two items and returns a negative value if the
 * first item is ordered before the second item, a positive value if
 * the first is ordered after the second, and zero if either ordering
 * is acceptable.  A sort-key function maps an item in a list to a
 * sort-key, which is used instead of the item itself for sorting
 * comparisons.
 *
 * @param {function} key Sort-key function that takes an item and
 * produces the item's corresponding sort-key.
 *
 * @returns {function} A comparator function that compares two items
 * based on their sort-keys derived from the sort-key function.
 */
export function sortKeyComparator(key = item => item) {
  return (a, b) => {
    const keyA = key(a),
      keyB = key(b);

    switch (true) {
      case keyA < keyB:
        return -1;
      case keyA > keyB:
        return 1;
      default:
        return 0;
    }
  };
}

/**
 * Binary searches a sorted Immutable list to find the index for
 * inserting an item.  This is used to incrementally insert or remove
 * items from the (sorted) course list.
 *
 * @param {Immutable.List.<Object>} list Sorted list of elements on
 * which binary search is to be performed.
 *
 * @param {Object} item Item to search for in list.
 *
 * @param {function=} compare Comparator function used to compare two
 * items; returns a negative value if the first item is ordered before
 * the second item, a positive value if the first item is ordered
 * after the second item, and zero if either ordering of the two items
 * is acceptable.
 *
 * @returns {Number} An index in the list such that `item` can be
 * inserted at that index while preserving the sorted ordering of the
 * list.
 */
export function binarySearch(
  list,
  item,
  compare = sortKeyComparator(),
) {
  let left = 0,
    right = list.size;

  while (right > left) {
    const mid = Math.floor((left + right) / 2);
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
