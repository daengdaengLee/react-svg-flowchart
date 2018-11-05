import React, { Component } from 'react';
import PropTypes from 'prop-types';

const _inoutHoverStart = (inout, idx) => prevState => ({
  ...prevState,
  hover: `${inout}_${idx}`,
});

const _inoutHoverEnd = prevState => ({ ...prevState, hover: null });

const _setEditText = text => prevState => ({ ...prevState, editText: text });

class NodeItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editText: '',
      hover: null,
    };
    this._onMouseOverInOut = this._onMouseOverInOut.bind(this);
    this._onMouseLeaveInOut = this._onMouseLeaveInOut.bind(this);
    this._onMouseDownInOut = this._onMouseDownInOut.bind(this);
    this._onMouseUpInOut = this._onMouseUpInOut.bind(this);
    this._onMouseDownNode = this._onMouseDownNode.bind(this);
    this._onDoubleClickNodeName = this._onDoubleClickNodeName.bind(this);
    this._onChangeEditText = this._onChangeEditText.bind(this);
    this._onKeyDownEditText = this._onKeyDownEditText.bind(this);
  }

  render() {
    const {
      _onMouseOverInOut,
      _onMouseLeaveInOut,
      _onMouseDownInOut,
      _onMouseUpInOut,
      _onMouseDownNode,
      _onDoubleClickNodeName,
      _onChangeEditText,
      _onKeyDownEditText,
      props: { x, y, name, active, editing, inCount, outCount },
      state: { hover, editText },
    } = this;
    return (
      <g transform={`translate(${x}, ${y})`} onMouseDown={_onMouseDownNode}>
        <rect
          width="140"
          height="60"
          fill="#ffffff"
          stroke={active ? 'green' : 'black'}
          cursor="pointer"
        />
        <foreignObject x="10" y="20" width="140" height="20">
          {editing ? (
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
              onDoubleClick={_onDoubleClickNodeName}
            >
              {name}
            </div>
          )}
        </foreignObject>
        {[...Array(inCount)].map((_, i) => (
          <circle
            key={i}
            r="6"
            cx={(140 / (inCount + 1)) * (i + 1)}
            fill={hover === `in_${i}` ? 'green' : 'black'}
            cursor="pointer"
            onMouseDown={evt => _onMouseDownInOut(evt, 'in', i)}
            onMouseUp={evt => _onMouseUpInOut(evt, 'in', i)}
            onMouseOver={() => _onMouseOverInOut('in', i)}
            onMouseLeave={_onMouseLeaveInOut}
          />
        ))}
        {[...Array(outCount)].map((_, i) => (
          <circle
            key={i}
            r="6"
            cx={(140 / (outCount + 1)) * (i + 1)}
            cy="60"
            fill={hover === `out_${i}` ? 'green' : 'black'}
            cursor="pointer"
            onMouseDown={evt => _onMouseDownInOut(evt, 'out', i)}
            onMouseUp={evt => _onMouseUpInOut(evt, 'out', i)}
            onMouseOver={() => _onMouseOverInOut('out', i)}
            onMouseLeave={_onMouseLeaveInOut}
          />
        ))}
      </g>
    );
  }

  componentDidUpdate({ editing: prevEditing }) {
    const { editing: currentEditing, name } = this.props;
    if (!prevEditing && currentEditing) {
      this.setState(_setEditText(name));
    }
  }

  _onMouseOverInOut(inout, idx) {
    this.setState(_inoutHoverStart(inout, idx));
  }

  _onMouseLeaveInOut() {
    this.setState(_inoutHoverEnd);
  }

  _onMouseDownInOut(evt, inout, i) {
    evt.stopPropagation();
    evt.nativeEvent.stopImmediatePropagation();
    const {
      props: { id, name, onMouseDownOut, onChangeNodeName },
    } = this;
    onChangeNodeName(id, name);
    inout === 'out' && onMouseDownOut(id, i);
  }

  _onMouseUpInOut(evt, inout, i) {
    evt.stopPropagation();
    evt.nativeEvent.stopImmediatePropagation();
    const {
      props: { id, onMouseUpIn },
    } = this;
    inout === 'in' && onMouseUpIn(id, i);
  }

  _onMouseDownNode(evt) {
    evt.stopPropagation();
    evt.nativeEvent.stopImmediatePropagation();
    const {
      props: { id, onMouseDownNode },
    } = this;
    onMouseDownNode(id, evt.ctrlKey);
  }

  _onDoubleClickNodeName(evt) {
    evt.stopPropagation();
    evt.nativeEvent.stopImmediatePropagation();
    const {
      props: { id, onDoubleClickNodeName },
    } = this;
    onDoubleClickNodeName(id);
  }

  _onChangeEditText({ target: { value } }) {
    this.setState(_setEditText(value));
  }

  _onKeyDownEditText({ keyCode }) {
    if (keyCode !== 13) return;
    const {
      props: { id, onChangeNodeName },
      state: { editText },
    } = this;
    onChangeNodeName(id, editText);
  }
}

NodeItem.defaultProps = {
  x: 0,
  y: 0,
  name: 'Node',
  active: false,
  editing: false,
  inCount: 1,
  outCount: 1,
  onMouseDownNode: (id, ctrlKey) => {},
  onMouseDownOut: (id, outIdx) => {},
  onMouseUpIn: (id, inIdx) => {},
  onDoubleClickNodeName: id => {},
  onChangeNodeName: (id, name) => {},
};

NodeItem.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  active: PropTypes.bool,
  editing: PropTypes.bool,
  inCount: PropTypes.number,
  outCount: PropTypes.number,
  onMouseDownNode: PropTypes.func,
  onMouseDownOut: PropTypes.func,
  onMouseUpIn: PropTypes.func,
  onDoubleClickNodeName: PropTypes.func,
  onChangeNodeName: PropTypes.func,
};

export default NodeItem;
