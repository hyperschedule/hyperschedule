import PropTypes from 'prop-types';
import React from 'react';

import './CourseBlock.css';

import * as util from '@/util/misc';

function CourseBlock({code, name, focus, gridStyle, color, starred}) {
  return (
    <div
      className={util.classMap({
        course: true,
        block: true,
        starred: starred,
      })}
      style={{
        ...gridStyle,
        backgroundColor: color,
      }}
      onClick={focus}
    >
      <div className="star" />
      <div className="label">
        <div className="code">{code}</div>
        <div className="name">{name}</div>
      </div>
    </div>
  );
}

CourseBlock.propTypes = {
  code: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  focus: PropTypes.func.isRequired,
  gridStyle: PropTypes.object,
  color: PropTypes.string.isRequired,
  starred: PropTypes.bool.isRequired,
};

export default util.componentToJS(CourseBlock);
