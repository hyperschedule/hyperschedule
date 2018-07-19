import React from 'react';


export const fields = (object, fields, props = {}) => {
    const elements = [];
    for (const i in fields) {
        const {field = null, format = s => s, suffix = null} = fields[i];

        switch (true) {
        case field !== null:
            if (!object.has(field)) {
                return null;
            }
            const value = object.get(field);
            const formatted = format(value);
            if (formatted === null) {
                return null;
            }
            elements.push(
                <span key={i} className={'field ' + field}>
                  {formatted}
                </span>
            );
            
        case suffix !== null:
            elements.push(suffix);
        }

    }
    
    return (
        <div className={'fields'} {...props}>
          {elements}
        </div>
    );
};
