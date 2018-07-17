import React from 'react';

import {Mode} from '../ModeSelector/actions';

import CourseSearch from './CourseSearch/wrapper';
import Schedule from './Schedule/wrapper';

const content = {
    [Mode.COURSE_SEARCH]: <CourseSearch/>,
    [Mode.SCHEDULE]: <Schedule/>,
};

const ModeContent = ({mode}) => content[mode];

export default ModeContent;
