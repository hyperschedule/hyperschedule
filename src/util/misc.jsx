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

