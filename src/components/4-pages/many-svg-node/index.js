import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ManySvgNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tick: 0,
      value: '',
    };
    this._count = this._count.bind(this);
    this._onChange = this._onChange.bind(this);
  }

  render() {
    const {
      _onChange,
      props: { rowCount, colCount },
      state: { tick, value },
    } = this;
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ height: '60px' }}>
          <div style={{ height: '20px' }}>
            Count: <span>{tick}</span>
          </div>
          <div style={{ height: '20px' }}>
            Input: <input value={value} onChange={_onChange} />
          </div>
        </div>
        <div style={{ height: 0, flexGrow: 1, overflow: 'auto' }}>
          <svg
            style={{
              width: `${colCount * 110 + 20}px`,
              height: `${rowCount * 50 + 20}px`,
            }}
          >
            <g transform="translate(20, 20)">
              {[...Array(rowCount)].map((_, i) => (
                <g key={i} transform={`translate(0, ${i * 50})`}>
                  {[...Array(colCount)].map((_, j) => (
                    <rect key={j} width="100" height="40" x={j * 110} y="0" />
                  ))}
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.timer = setInterval(this._count, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  _count() {
    this.setState(({ tick }) => ({ tick: tick + 1 }));
  }

  _onChange({ target: { value } }) {
    this.setState({ value });
  }
}

ManySvgNode.defaultProps = {
  rowCount: 100,
  colCount: 100,
};

ManySvgNode.propTypes = {
  rowCount: PropTypes.number,
  colCount: PropTypes.number,
};

export default ManySvgNode;
