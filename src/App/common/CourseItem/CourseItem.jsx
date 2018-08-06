import React from 'react';
import * as util from 'hyperschedule-util';

function CourseItem({
  code,
  name,
  status,
  focus,
  add,
  remove,
  starred,
  checked,
  toggleStar,
  toggleCheck,
}) {

  const checkButton = toggleCheck === undefined ? null : (
    <span className='handle check'>
      <i className={'ion-md-' + (checked ? 'checkbox' : 'square-outline')}
         onClick={toggleCheck}></i>
    </span>
  );

  const starButton = toggleStar === undefined ? null : (
    <span className={'handle star'}>
      <i className={'ion-md-star' + (starred ? '' : '-outline')}
         onClick={toggleStar}>
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
      className={['course', 'item'].join(' ')}
      onClick={focus}>
      <div className='fields'>
        {checkButton}
        {starButton}
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
      </div>
      {addButton}
      {removeButton}
    </div>
  );
}

export default util.componentToJS(CourseItem);
