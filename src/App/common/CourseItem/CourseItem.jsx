import React from 'react';
import PropTypes from 'prop-types';

import * as util from '@/util/misc';
import './CourseItem.css';

function CourseItem({
  code,
  name,
  color,
  status,
  focus,
  add,
  remove,
  starred,
  checked,
  scheduled,
  toggleStarred,
  toggleChecked,
}) {
  const checkButton = toggleChecked === undefined ? null : (
    <span className='toggle check'
      onClick={toggleChecked}>
      <i className={'ion-md-' + (checked ? 'checkbox' : 'square-outline')}></i>
    </span>
  );

  const starButton = toggleStarred === undefined ? null : (
    <span className={'toggle star'}
      onClick={toggleStarred}>
      <i className={'ion-md-star' + (starred ? '' : '-outline')}>
      </i>
    </span>
  );

  const addButton = add === undefined ? null : (
    <button className="right add ion-md-add"
      onClick={add}>
    </button>
  );

  const removeButton = remove === undefined ? null : (
    <button
      className="right remove ion-md-close"
      onClick={remove}>
    </button>
  );

  return (
    <div
      className={['course', 'item'].concat(scheduled ? ['scheduled'] : []).join(' ')}
      style={{
        backgroundColor: color,
      }}
      onClick={focus}>
      {checkButton}
      {starButton}
      <span className='label'>
        <span className='code'>
          {code}
        </span>
        {' '}
        <span className='name'>
          {name}
        </span>
        {' '}
        <span className='status'>
          ({status})
        </span>
      </span>
      {addButton}
      {removeButton}
    </div>
  );
}

CourseItem.propTypes = {
  code: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  starred: PropTypes.bool,
  checked: PropTypes.bool,
  scheduled: PropTypes.bool,
  focus: PropTypes.func.isRequired,
  add: PropTypes.func,
  remove: PropTypes.func,
  toggleStarred: PropTypes.func,
  toggleChecked: PropTypes.func,
};

export default util.componentToJS(CourseItem);
