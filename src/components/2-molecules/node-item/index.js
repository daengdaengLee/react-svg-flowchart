import React, { Component } from 'react';
import PropTypes from 'prop-types';

class NodeItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      editText: '',
      hover: null,
    };
    this._onHoverInOut = this._onHoverInOut.bind(this);
    this._onHoverOut = this._onHoverOut.bind(this);
    this._onDoubleClickText = this._onDoubleClickText.bind(this);
    this._onChangeEditText = this._onChangeEditText.bind(this);
    this._onKeyDownEditText = this._onKeyDownEditText.bind(this);
  }

  render() {
    const {
      _onHoverInOut,
      _onHoverOut,
      _onDoubleClickText,
      _onChangeEditText,
      _onKeyDownEditText,
      props: {
        x,
        y,
        id,
        name,
        inCount,
        outCount,
        onMouseDownNode,
        onMouseDownOut,
        onMouseUpIn,
      },
      state: { hover, isEditing, editText },
    } = this;
    return (
      <g
        transform={`translate(${x}, ${y})`}
        onMouseDown={() => onMouseDownNode(id)}
      >
        <rect
          width="140"
          height="60"
          fill="#ffffff"
          stroke="black"
          cursor="pointer"
        />
        <foreignObject x="10" y="20" width="140" height="20">
          {isEditing ? (
            <input
              style={{ width: '120px', border: '0 none', outline: '0 none' }}
              value={editText}
              onChange={_onChangeEditText}
              onKeyDown={_onKeyDownEditText}
            />
          ) : (
            <div
              style={{
                width: '120px',
                height: '20px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                textAlign: 'center',
                userSelect: 'none',
                cursor: 'pointer',
              }}
              onDoubleClick={_onDoubleClickText}
            >
              {name}
            </div>
          )}
        </foreignObject>
        {[...Array(inCount)].map((_, i) => (
          <circle
            key={i}
            r="4"
            cx={(140 / (inCount + 1)) * (i + 1)}
            fill={hover === `in_${i}` ? 'green' : 'black'}
            cursor="pointer"
            onMouseUp={() => onMouseUpIn(id, i)}
            onMouseOver={() => _onHoverInOut('in', i)}
            onMouseLeave={_onHoverOut}
          />
        ))}
        {[...Array(outCount)].map((_, i) => (
          <circle
            key={i}
            r="4"
            cx={(140 / (outCount + 1)) * (i + 1)}
            cy="60"
            fill={hover === `out_${i}` ? 'green' : 'black'}
            cursor="pointer"
            onMouseDown={evt => {
              evt.stopPropagation();
              onMouseDownOut(id, i);
            }}
            onMouseOver={() => _onHoverInOut('out', i)}
            onMouseLeave={_onHoverOut}
          />
        ))}
      </g>
    );
  }

  _onHoverInOut(inout, idx) {
    this.setState({ hover: `${inout}_${idx}` });
  }

  _onHoverOut() {
    this.setState({ hover: null });
  }

  _onDoubleClickText() {
    const {
      props: { name },
    } = this;
    this.setState({ isEditing: true, editText: name });
  }

  _onChangeEditText({ target: { value } }) {
    this.setState({ editText: value });
  }

  _onKeyDownEditText({ keyCode }) {
    if (keyCode !== 13) return;
    const {
      props: { id, onChangeNodeName },
      state: { editText },
    } = this;
    this.setState({ isEditing: false, editText: '' });
    onChangeNodeName(id, editText);
  }
}

NodeItem.defaultProps = {
  x: 0,
  y: 0,
  name: 'Node',
  inCount: 1,
  outCount: 1,
  onMouseDownNode: id => {},
  onMouseDownOut: (id, outIdx) => {},
  onMouseUpIn: (id, inIdx) => {},
  onChangeNodeName: (id, name) => {},
};

NodeItem.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  inCount: PropTypes.number,
  outCount: PropTypes.number,
  onMouseDownNode: PropTypes.func,
  onMouseDownOut: PropTypes.func,
  onMouseUpIn: PropTypes.func,
  onChangeNodeName: PropTypes.func,
};

export default NodeItem;
