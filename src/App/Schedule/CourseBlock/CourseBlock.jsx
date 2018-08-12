import React from 'react';
import {connect} from 'react-redux';

import './CourseBlock.css';

import * as util from '@/util/misc';

function CourseBlock({
  code,
  name,
  focus,
  gridStyle,
  color,
  starred,
}) {
  
  
  return (
    <div className={util.classMap({
           course: true,
           block: true,
           starred: starred,
         })} style={{
           ...gridStyle,
           backgroundColor: color,
         }}
         onClick={focus}>
      <div className='star'>
      </div>
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
