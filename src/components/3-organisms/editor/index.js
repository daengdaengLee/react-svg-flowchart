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
      activePaths: [],
      activeNodes: [],
      posX: 0,
      posY: 0,
      selectionX: null,
      selectionY: null,
    };
    this._container = React.createRef();
    this._calcPreviewPath = this._calcPreviewPath.bind(this);
    this._onDrop = this._onDrop.bind(this);
    this._makeNode = this._makeNode.bind(this);
    this._removeNode = this._removeNode.bind(this);
    this._movingStart = this._movingStart.bind(this);
    this._moving = this._moving.bind(this);
    this._movingEnd = this._movingEnd.bind(this);
    this._connectStart = this._connectStart.bind(this);
    this._connect = this._connect.bind(this);
    this._disconnect = this._disconnect.bind(this);
    this._connectEnd = this._connectEnd.bind(this);
    this._changeNodeName = this._changeNodeName.bind(this);
    this._selectStart = this._selectStart.bind(this);
    this._select = this._select.bind(this);
    this._selectEnd = this._selectEnd.bind(this);
    this._onMouseDownSvg = this._onMouseDownSvg.bind(this);
    this._onMouseMoveSvg = this._onMouseMoveSvg.bind(this);
    this._onMouseUpSvg = this._onMouseUpSvg.bind(this);
    this._onMouseLeaveSvg = this._onMouseLeaveSvg.bind(this);
    this._onClickPath = this._onClickPath.bind(this);
    this._onClickNodeItem = this._onClickNodeItem.bind(this);
    this._onKeyDownContainer = this._onKeyDownContainer.bind(this);
  }

  render() {
    const {
      _container,
      _calcPreviewPath,
      _onDragOver,
      _onDrop,
      _movingStart,
      _connectStart,
      _connect,
      _changeNodeName,
      _onMouseDownSvg,
      _onMouseMoveSvg,
      _onMouseUpSvg,
      _onMouseLeaveSvg,
      _onClickPath,
      _onClickNodeItem,
      _onKeyDownContainer,
      state: {
        allNodeIds,
        nodesById,
        activePaths,
        activeNodes,
        connectNodeId,
        connectOutIdx,
        selectionX,
        selectionY,
        posX,
        posY,
      },
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
        style={{ width: 0, flexGrow: 1, display: 'flex', outline: '0 none' }}
        tabIndex="0"
        onDragOver={_onDragOver}
        onDrop={_onDrop}
        onKeyDown={_onKeyDownContainer}
      >
        <svg
          style={{ width: 0, flexGrow: 1 }}
          onMouseLeave={_onMouseLeaveSvg}
          onMouseUp={_onMouseUpSvg}
          onMouseMove={_onMouseMoveSvg}
          onMouseDown={_onMouseDownSvg}
        >
          {connects.map(connect => (
            <path
              key={`${connect.fromNodeId},${connect.fromOutIdx},${
                connect.toNodeId
              },${connect.toInIdx}`}
              d={_calcPath(connect)}
              stroke={
                activePaths.includes(
                  `${connect.fromNodeId},${connect.fromOutIdx},${
                    connect.toNodeId
                  },${connect.toInIdx}`,
                )
                  ? 'green'
                  : 'black'
              }
              strokeWidth="2"
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
              onMouseUp={evt => evt.stopPropagation()}
              onMouseDown={evt => evt.stopPropagation()}
            />
          ))}
          {allNodeIds.map(id => {
            const node = nodesById[id];
            return (
              <NodeItem
                key={id}
                id={id}
                name={node.name}
                active={activeNodes.includes(node.id)}
                x={node.x}
                y={node.y}
                inCount={node.inCount}
                outCount={node.outCount}
                onClickNode={_onClickNodeItem}
                onMouseDownNode={_movingStart}
                onMouseDownOut={_connectStart}
                onMouseUpIn={_connect}
                onChangeNodeName={_changeNodeName}
              />
            );
          })}
          {connectNodeId != null &&
            connectOutIdx != null && (
            <path
              d={_calcPreviewPath()}
              fill="none"
              stroke="black"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}
          {selectionX != null &&
            selectionY != null && (
            <rect
              fill="none"
              stroke="black"
              strokeWidth="2"
              strokeDasharray="4 4"
              x={selectionX < posX ? selectionX : posX}
              y={selectionY < posY ? selectionY : posY}
              width={Math.abs(selectionX - posX)}
              height={Math.abs(selectionY - posY)}
            />
          )}
        </svg>
      </div>
    );
  }

  _calcPreviewPath() {
    const {
      connectNodeId: fromNodeId,
      connectOutIdx: fromOutIdx,
      nodesById,
      posX,
      posY,
    } = this.state;
    const node = nodesById[fromNodeId];
    if (!node) return 'M 0, 0';
    const fromX = node.x + (140 / (node.outCount + 1)) * (fromOutIdx + 1);
    const fromY = node.y + 60;
    return fromY < posY
      ? `M ${fromX} ${fromY} C ${fromX} ${posY}, ${posX} ${fromY}, ${posX} ${posY}`
      : `M ${fromX} ${fromY} C ${(fromX + posX) / 2} ${fromY * 1.5 -
          posY * 0.5}, ${(fromX + posX) / 2} ${posY * 1.5 -
          fromY * 0.5}, ${posX} ${posY}`;
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

  _removeNode(...ids) {
    this.setState(({ allNodeIds, nodesById, activeNodes }) => {
      const filteredIds = allNodeIds.filter(nodeId => !ids.includes(nodeId));
      const restNodesById = filteredIds.reduce(
        (nodes, nodeId) => ({ ...nodes, [nodeId]: nodesById[nodeId] }),
        {},
      );
      const connectedNodeIds = filteredIds.filter(nodeId => {
        const node = nodesById[nodeId];
        return node.connects.find(
          connect =>
            ids.includes(connect.fromNodeId) || ids.includes(connect.toNodeId),
        );
      });
      const disconnectNodes = connectedNodeIds.reduce((nodes, nodeId) => {
        const node = nodesById[nodeId];
        return {
          ...nodes,
          [nodeId]: {
            ...node,
            connects: node.connects.filter(
              connect =>
                !ids.includes(connect.fromNodeId) &&
                !ids.includes(connect.toNodeId),
            ),
          },
        };
      }, {});
      return {
        activeNodes: activeNodes.filter(nodeId => !ids.includes(nodeId)),
        allNodeIds: filteredIds,
        nodesById: { ...restNodesById, ...disconnectNodes },
      };
    });
    console.log('[NODE] remove');
  }

  _movingStart(evt, id) {
    evt.stopPropagation();
    evt.nativeEvent.stopImmediatePropagation();
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

  _connectStart(evt, nodeId, outIdx) {
    evt.nativeEvent.stopImmediatePropagation();
    evt.stopPropagation();
    this.setState({ connectNodeId: nodeId, connectOutIdx: outIdx });
  }

  _connect(evt, toNodeId, inIdx) {
    evt.stopPropagation();
    evt.nativeEvent.stopImmediatePropagation();
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
      connectNodeId: null,
      connectOutIdx: null,
    }));
    console.log('[NODE] connect');
  }

  _disconnect(fromNodeId, fromOutIdx, toNodeId, toInIdx) {
    const {
      state: { nodesById },
    } = this;
    const node = nodesById[toNodeId];
    if (!node) return;
    const deleteConnectNode = {
      ...node,
      connects: node.connects.filter(
        connect =>
          connect.fromNodeId !== fromNodeId ||
          connect.fromOutIdx !== fromOutIdx ||
          connect.toNodeId !== toNodeId ||
          connect.toInIdx !== toInIdx,
      ),
    };
    this.setState(({ nodesById }) => ({
      nodesById: { ...nodesById, [toNodeId]: deleteConnectNode },
    }));
    console.log('[NODE] disconnect');
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

  _selectStart(selectionX, selectionY) {
    this.setState({ selectionX, selectionY });
  }

  _select(fromX, fromY, toX, toY) {
    const { allNodeIds, nodesById } = this.state;
    const selectedIds = allNodeIds.filter(nodeId => {
      const node = nodesById[nodeId];
      if (!node) return false;
      return node.x > fromX && node.x < toX && node.y > fromY && node.y < toY;
    });
    this.setState({ activeNodes: selectedIds });
    console.log('[NODE] select');
  }

  _selectEnd(x, y) {
    if (x != null || y != null) {
      const {
        _select,
        state: { selectionX: fromX, selectionY: fromY },
      } = this;
      fromX == null || fromY == null || _select(fromX, fromY, x, y);
    }
    this.setState({ selectionX: null, selectionY: null });
  }

  _onMouseDownSvg({ clientX, clientY }) {
    const {
      _container: { current: containerEl },
      _selectStart,
    } = this;
    this.setState({ activePaths: [], activeNodes: [] });
    if (!containerEl) return;
    const { offsetLeft, offsetTop } = containerEl;
    const x = clientX - offsetLeft;
    const y = clientY - offsetTop;
    isNaN(x) || isNaN(y) || _selectStart(x, y);
  }

  _onMouseMoveSvg({ movementX, movementY, clientX, clientY }) {
    const {
      _moving,
      _container: { current: containerEl },
    } = this;
    if (containerEl) {
      const { offsetLeft, offsetTop } = containerEl;
      const posX = clientX - offsetLeft;
      const posY = clientY - offsetTop;
      isNaN(posX) || isNaN(posY) || this.setState({ posX, posY });
    }
    _moving(movementX, movementY);
  }

  _onMouseUpSvg({ clientX, clientY }) {
    const {
      _container: { current: containerEl },
      _movingEnd,
      _connectEnd,
      _selectEnd,
    } = this;
    _movingEnd();
    _connectEnd();
    if (!containerEl) return;
    const { offsetLeft, offsetTop } = containerEl;
    const x = clientX - offsetLeft;
    const y = clientY - offsetTop;
    isNaN(x) || isNaN(y) || _selectEnd(x, y);
  }

  _onMouseLeaveSvg() {
    const { _movingEnd, _connectEnd, _selectEnd } = this;
    _movingEnd();
    _connectEnd();
    _selectEnd(null, null);
  }

  _onClickNodeItem(evt, id) {
    evt.nativeEvent.stopImmediatePropagation();
    evt.stopPropagation();
    this.setState({ activePaths: [], activeNodes: [id] });
  }

  _onClickPath(evt, fromNodeId, fromOutIdx, toNodeId, toInIdx) {
    evt.stopPropagation();
    const isMultiple = evt.ctrlKey;
    this.setState(({ activePaths }) => ({
      activePaths: isMultiple
        ? [...activePaths, `${fromNodeId},${fromOutIdx},${toNodeId},${toInIdx}`]
        : [`${fromNodeId},${fromOutIdx},${toNodeId},${toInIdx}`],
      activeNodes: [],
    }));
  }

  _onKeyDownContainer({ keyCode }) {
    const {
      _removeNode,
      _disconnect,
      state: { activeNodes, activePaths },
    } = this;
    if (keyCode === 46 && activeNodes.length) {
      return _removeNode(...activeNodes);
    }
    if (keyCode === 46 && activePaths.length) {
      activePaths
        .map(path =>
          path.split(',').map((v, i) => (i % 2 === 1 ? parseInt(v, 10) : v)),
        )
        .forEach(([fromNodeId, fromOutIdx, toNodeId, toInIdx]) =>
          _disconnect(fromNodeId, fromOutIdx, toNodeId, toInIdx),
        );
    }
  }
}

export default Editor;
