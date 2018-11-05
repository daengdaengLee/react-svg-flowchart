import React, { Component } from 'react';
import PropTypes from 'prop-types';

class NodeItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hover: null,
    };
    this._onHoverInOut = this._onHoverInOut.bind(this);
    this._onHoverOut = this._onHoverOut.bind(this);
  }

  render() {
    const {
      _onHoverInOut,
      _onHoverOut,
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
      state: { hover },
    } = this;
    return (
      <g transform={`translate(${x}, ${y})`}>
        <rect
          width="140"
          height="60"
          fill="#ffffff"
          stroke="black"
          cursor="pointer"
          onMouseDown={() => onMouseDownNode(id)}
        />
        <text
          textAnchor="middle"
          alignmentBaseline="middle"
          style={{ userSelect: 'none' }}
          x="70"
          y="30"
        >
          {name}
        </text>
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
            onMouseDown={() => onMouseDownOut(id, i)}
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
};

export default NodeItem;
