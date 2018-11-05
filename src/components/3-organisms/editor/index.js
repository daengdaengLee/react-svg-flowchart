import React, { Component } from 'react';
import NodeItem from '../../2-molecules/node-item';

const _calcPath = ({
  fromNodeX,
  fromNodeY,
  fromOutCount,
  fromOutIdx,
  toNodeX,
  toNodeY,
  toInCount,
  toInIdx,
}) => {
  const fromX = fromNodeX + (140 / (fromOutCount + 1)) * (fromOutIdx + 1);
  const fromY = fromNodeY + 60;
  const toX = toNodeX + (140 / (toInCount + 1)) * (toInIdx + 1);
  const toY = toNodeY;
  return fromY < toY
    ? `M ${fromX} ${fromY} C ${fromX} ${toY}, ${toX} ${fromY}, ${toX} ${toY}`
    : `M ${fromX} ${fromY} C ${(fromX + toX) / 2} ${fromY * 1.5 -
        toY * 0.5}, ${(fromX + toX) / 2} ${toY * 1.5 -
        fromY * 0.5}, ${toX} ${toY}`;
};

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allNodeIds: [],
      nodesById: {},
      movingId: null,
      connectNodeId: null,
      connectOutIdx: null,
      activePath: null,
    };
    this._container = React.createRef();
    this._onDrop = this._onDrop.bind(this);
    this._movingStart = this._movingStart.bind(this);
    this._moving = this._moving.bind(this);
    this._movingEnd = this._movingEnd.bind(this);
    this._connectStart = this._connectStart.bind(this);
    this._connect = this._connect.bind(this);
    this._connectEnd = this._connectEnd.bind(this);
    this._changeNodeName = this._changeNodeName.bind(this);
    this._onMouseMoveSvg = this._onMouseMoveSvg.bind(this);
    this._onMouseUpSvg = this._onMouseUpSvg.bind(this);
    this._onMouseLeaveSvg = this._onMouseLeaveSvg.bind(this);
    this._onClickSvg = this._onClickSvg.bind(this);
    this._onClickPath = this._onClickPath.bind(this);
  }

  render() {
    const {
      _container,
      _onDragOver,
      _onDrop,
      _movingStart,
      _connectStart,
      _connect,
      _changeNodeName,
      _onMouseMoveSvg,
      _onMouseUpSvg,
      _onMouseLeaveSvg,
      _onClickSvg,
      _onClickPath,
      state: { allNodeIds, nodesById, activePath },
    } = this;
    const connects = allNodeIds
      .map(id => {
        const node = nodesById[id];
        return node.connects.map(connect => {
          const toNode = node;
          const fromNode = nodesById[connect.fromNodeId];
          const fromNodeX = fromNode.x;
          const fromNodeY = fromNode.y;
          const fromOutCount = fromNode.outCount;
          const toNodeX = toNode.x;
          const toNodeY = toNode.y;
          const toInCount = toNode.inCount;
          return {
            ...connect,
            fromNodeX,
            fromNodeY,
            fromOutCount,
            toNodeX,
            toNodeY,
            toInCount,
          };
        });
      })
      .reduce(
        (allConnects, nodeConnects) => [...allConnects, ...nodeConnects],
        [],
      );
    return (
      <div
        ref={_container}
        style={{ width: 0, flexGrow: 1, display: 'flex' }}
        onDragOver={_onDragOver}
        onDrop={_onDrop}
      >
        <svg
          style={{ width: 0, flexGrow: 1 }}
          onMouseLeave={_onMouseLeaveSvg}
          onMouseUp={_onMouseUpSvg}
          onMouseMove={_onMouseMoveSvg}
          onClick={_onClickSvg}
        >
          {connects.map(connect => (
            <path
              key={`${connect.fromNodeId},${connect.fromOutIdx},${
                connect.toNodeId
              },${connect.toInIdx}`}
              d={_calcPath(connect)}
              stroke={
                activePath ===
                `${connect.fromNodeId},${connect.fromOutIdx},${
                  connect.toNodeId
                },${connect.toInIdx}`
                  ? 'green'
                  : 'black'
              }
              fill="none"
              cursor="pointer"
              onClick={evt =>
                _onClickPath(
                  evt,
                  connect.fromNodeId,
                  connect.fromOutIdx,
                  connect.toNodeId,
                  connect.toInIdx,
                )
              }
            />
          ))}
          {allNodeIds.map(id => {
            const node = nodesById[id];
            return (
              <NodeItem
                key={id}
                id={id}
                name={node.name}
                x={node.x}
                y={node.y}
                inCount={node.inCount}
                outCount={node.outCount}
                onMouseDownNode={_movingStart}
                onMouseDownOut={_connectStart}
                onMouseUpIn={_connect}
                onChangeNodeName={_changeNodeName}
              />
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
    if (!containerEl || inoutCount.length !== 2) return;
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
      name: 'node',
      x,
      y,
      inCount,
      outCount,
      connects: [],
    };
    this.setState(({ allNodeIds, nodesById }) => ({
      allNodeIds: [...allNodeIds, id],
      nodesById: { ...nodesById, [id]: node },
    }));
    console.log('[NODE] make');
  }

  _movingStart(id) {
    this.setState({ movingId: id });
  }

  _moving(movementX, movementY) {
    const {
      state: { movingId, nodesById },
    } = this;
    if (!movingId) return;
    const node = nodesById[movingId];
    this.setState(({ nodesById }) => ({
      nodesById: {
        ...nodesById,
        [movingId]: { ...node, x: node.x + movementX, y: node.y + movementY },
      },
    }));
  }

  _movingEnd() {
    this.setState({ movingId: null });
  }

  _connectStart(nodeId, outIdx) {
    this.setState({ connectNodeId: nodeId, connectOutIdx: outIdx });
  }

  _connect(toNodeId, inIdx) {
    const {
      state: { connectNodeId: fromNodeId, connectOutIdx: outIdx, nodesById },
    } = this;
    if (!fromNodeId || outIdx == null) return;
    const connect = {
      fromNodeId,
      fromOutIdx: outIdx,
      toNodeId,
      toInIdx: inIdx,
    };
    const node = nodesById[toNodeId];
    const isDuplicateConnect = node.connects.find(
      obj =>
        obj.fromNodeId === connect.fromNodeId &&
        obj.fromOutIdx === connect.fromOutIdx &&
        obj.toNodeId === connect.toNodeId &&
        obj.toInIdx === connect.toInIdx,
    );
    if (isDuplicateConnect) return;
    this.setState(({ nodesById }) => ({
      nodesById: {
        ...nodesById,
        [toNodeId]: {
          ...node,
          connects: [...node.connects, connect],
        },
      },
    }));
    console.log('[NODE] connect');
  }

  _connectEnd() {
    this.setState({ connectNodeId: null, connectOutIdx: null });
  }

  _changeNodeName(id, name) {
    this.setState(({ nodesById }) => {
      const node = nodesById[id];
      return {
        nodesById: {
          ...nodesById,
          [id]: { ...node, name },
        },
      };
    });
  }

  _onMouseMoveSvg({ movementX, movementY }) {
    const { _moving } = this;
    _moving(movementX, movementY);
  }

  _onMouseUpSvg() {
    const { _movingEnd, _connectEnd } = this;
    _movingEnd();
    _connectEnd();
  }

  _onMouseLeaveSvg() {
    const { _movingEnd, _connectEnd } = this;
    _movingEnd();
    _connectEnd();
  }

  _onClickSvg() {
    this.setState({
      activePath: null,
    });
  }

  _onClickPath(evt, fromNodeId, fromOutIdx, toNodeId, toInIdx) {
    evt.stopPropagation();
    this.setState({
      activePath: `${fromNodeId},${fromOutIdx},${toNodeId},${toInIdx}`,
    });
  }
}

export default Editor;
