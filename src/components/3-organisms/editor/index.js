import React, { Component } from 'react';

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allNodeIds: [],
      nodesById: {},
    };
    this._container = React.createRef();
    this._onDrop = this._onDrop.bind(this);
  }

  render() {
    const {
      _container,
      _onDragOver,
      _onDrop,
      state: { allNodeIds, nodesById },
    } = this;
    return (
      <div
        ref={_container}
        style={{ width: 0, flexGrow: 1, display: 'flex' }}
        onDragOver={_onDragOver}
        onDrop={_onDrop}
      >
        <svg style={{ width: 0, flexGrow: 1 }}>
          {allNodeIds.map(id => {
            const node = nodesById[id];
            return (
              <rect key={id} x={node.x} y={node.y} width="140" height="60" />
            );
          })}
        </svg>
      </div>
    );
  }

  _onDragOver(evt) {
    evt.preventDefault();
  }

  _onDrop(evt) {
    evt.preventDefault();
    console.log('[DRAG_AND_DROP] drop');
    const { clientX, clientY } = evt;
    const inoutCount = evt.dataTransfer.getData('inoutCount');
    const {
      _container: { current: containerEl },
    } = this;
    if (!containerEl || inoutCount.length != 2) return;
    const { offsetLeft, offsetTop } = containerEl;
    const x = clientX - offsetLeft;
    const y = clientY - offsetTop;
    const [inCount, outCount] = inoutCount.split('').map(v => parseInt(v, 10));
    this._makeNode(x, y, inCount, outCount);
  }

  _makeNode(x, y, inCount, outCount) {
    const id = `${Date.now()}`;
    const node = {
      id,
      x,
      y,
      inCount,
      outCount,
    };
    this.setState(({ allNodeIds, nodesById }) => ({
      allNodeIds: [...allNodeIds, id],
      nodesById: { ...nodesById, [id]: node },
    }));
  }
}

export default Editor;
