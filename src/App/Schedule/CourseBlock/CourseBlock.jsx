import React from 'react';
import {connect} from 'react-redux';

import './CourseBlock.css';

import * as util from 'hyperschedule-util';

function CourseBlock({
  code,
  name,
  focus,
  gridStyle,
  color,
}) {
  return (
    <div className='course block' style={{
           ...gridStyle,
           backgroundColor: color,
         }}
         onClick={focus}>
      <div className='label'>
        <div className='code'>
          {code}
        </div>
        <div className='name'>
          {name}
        </div>
      </div>
    </div>
  );
}

export default util.componentToJS(CourseBlock);
