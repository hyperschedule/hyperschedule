import React from 'react';
import {connect} from 'react-redux';

import * as util from 'hyperschedule-util';

function CourseBlock({
  code,
  name,
  focus,
  gridStyle,
}) {
  return (
    <div className='course' style={gridStyle}
         onClick={focus}>
      <div className='code'>
        {code}
      </div>
      <div className='name'>
        {name}
      </div>
    </div>
  );
}

export default util.componentToJS(CourseBlock);
