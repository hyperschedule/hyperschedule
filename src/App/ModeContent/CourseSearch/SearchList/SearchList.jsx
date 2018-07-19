import React from 'react';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import 'react-virtualized/styles.css';

class CourseSearchList extends React.PureComponent {

    constructor(props) {
        super(props);

        this._cache =  new CellMeasurerCache({
            defaultHeight: 300,
            fixedWidth: true
        });

        this._rowRenderer = this._rowRenderer.bind(this);
    }


    componentDidMount() {
        if (this._list)
            this._list.recomputeRowHeights();
    }

    
    _rowRenderer({index, key, style, parent}) {
        const courseId = this.props.course_ids.get(index);
        return (
            <CellMeasurer
              cache={this._cache}
              columnIndex={0}
              key={key}
              parent={parent}
              rowIndex={index}>
              <div style={style}>
                {this.props.courses.get(courseId).get('courseName')}
                <button
                  onClick={() => {}}>+</button>
              </div>
            </CellMeasurer>
        );
    };

    _setListRef = ref => {
        this._list = ref;
    };

    render() {
        console.log(this.props.course_ids);
        return (
            <div style={{height:'500px'}}>
              <AutoSizer>
                {({ height, width }) => {
                    return ( <List ref={this._setListRef}
                                       height={height}
                                       width={width}
                                       deferredMeasurementCache={this._cache}
                                       rowCount={this.props.course_ids.size}
                                       rowHeight={this._cache.rowHeight}
                                       rowRenderer={this._rowRenderer} />
                           );
                }}
            </AutoSizer>
                </div>
        );
    }
}

export default CourseSearchList;
