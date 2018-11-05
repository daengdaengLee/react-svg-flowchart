import React, { Component } from 'react';
import { _pipe } from '../../../assets/js/utils';
import NodeItem from '../../2-molecules/node-item';

const _calcPath = (fromX, fromY, toX, toY) => {
  const middleX = (fromX + toX) / 2;
  const y1 = fromY * 1.5 - toY * 0.5;
  const y2 = toY * 1.5 - fromY * 0.5;
  return fromY < toY
    ? `M ${fromX} ${fromY} C ${fromX} ${toY}, ${toX} ${fromY}, ${toX} ${toY}`
    : `M ${fromX} ${fromY} C ${middleX} ${y1}, ${middleX} ${y2}, ${toX} ${toY}`;
};

const _makeNodes = (x, y, inCount, outCount) => prevState => {
  const { allNodeIds, nodesById } = prevState;
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
  return {
    ...prevState,
    allNodeIds: [...allNodeIds, id],
    nodesById: { ...nodesById, [id]: node },
  };
};

const _removeNodes = (...ids) => prevState => {
  const { allNodeIds, nodesById, activeNodes } = prevState;
  const filteredIds = allNodeIds.filter(nodeId => !ids.includes(nodeId));
  const disconnectNodes = filteredIds
    .filter(nodeId => {
      const node = nodesById[nodeId];
      return node.connects.find(
        connect =>
          ids.includes(connect.fromNodeId) || ids.includes(connect.toNodeId),
      );
    })
    .reduce((nodes, nodeId) => {
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
  const restNodesById = filteredIds.reduce(
    (nodes, nodeId) => ({ ...nodes, [nodeId]: nodesById[nodeId] }),
    {},
  );
  return {
    ...prevState,
    activeNodes: activeNodes.filter(nodeId => !ids.includes(nodeId)),
    allNodeIds: filteredIds,
    nodesById: { ...restNodesById, ...disconnectNodes },
  };
};

const _activateNodes = (isAcc, ...ids) => prevState => {
  const { activePaths, activeNodes } = prevState;
  return {
    ...prevState,
    activePaths: isAcc ? activePaths : [],
    activeNodes: isAcc ? [...new Set([...activeNodes, ...ids])] : ids,
  };
};

const _activatePaths = (
  isAcc,
  fromNodeId,
  fromOutIdx,
  toNodeId,
  toInIdx,
) => prevState => {
  const { activeNodes, activePaths } = prevState;
  const path = `${fromNodeId},${fromOutIdx},${toNodeId},${toInIdx}`;
  return {
    ...prevState,
    activePaths: isAcc ? [...new Set([...activePaths, path])] : [path],
    activeNodes: isAcc ? activeNodes : [],
  };
};

const _deactivateAllNodes = prevState => ({ activeNodes: [] });

const _deactivateAllPaths = prevState => ({ activePaths: [] });

const _movingStart = prevState => ({ ...prevState, moving: true });

const _moving = (movementX, movementY) => prevState => {
  const { activeNodes, nodesById, moving } = prevState;
  if (!moving || !activeNodes.length) return prevState;
  const movedNodes = activeNodes.reduce((nodes, nodeId) => {
    const node = nodesById[nodeId];
    return {
      ...nodes,
      [nodeId]: { ...node, x: node.x + movementX, y: node.y + movementY },
    };
  }, {});
  return {
    ...prevState,
    nodesById: {
      ...nodesById,
      ...movedNodes,
    },
  };
};

const _movingEnd = prevState => ({ ...prevState, moving: false });

const _connectStart = (fromNodeId, outIdx) => prevState => ({
  ...prevState,
  connectNodeId: fromNodeId,
  connectOutIdx: outIdx,
});

const _connect = (toNodeId, inIdx) => prevState => {
  const {
    connectNodeId: fromNodeId,
    connectOutIdx: outIdx,
    nodesById,
  } = prevState;
  if (fromNodeId == null || outIdx == null) return prevState;
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
  if (isDuplicateConnect) return prevState;
  return {
    ...prevState,
    nodesById: {
      ...nodesById,
      [toNodeId]: {
        ...node,
        connects: [...node.connects, connect],
      },
    },
  };
};

const _disconnect = (
  fromNodeId,
  fromOutIdx,
  toNodeId,
  toInIdx,
) => prevState => {
  const { nodesById } = prevState;
  const node = nodesById[toNodeId];
  if (!node) return prevState;
  return {
    ...prevState,
    nodesById: {
      ...nodesById,
      [toNodeId]: {
        ...node,
        connects: node.connects.filter(
          connect =>
            connect.fromNodeId !== fromNodeId ||
            connect.fromOutIdx !== fromOutIdx ||
            connect.toNodeId !== toNodeId ||
            connect.toInIdx !== toInIdx,
        ),
      },
    },
  };
};

const _connectEnd = prevState => ({
  ...prevState,
  connectNodeId: null,
  connectOutIdx: null,
});

const _changeNodeNameStart = id => prevState => ({
  ...prevState,
  editingId: id,
});

const _changeNodeName = (id, name) => prevState => {
  const { nodesById } = prevState;
  const node = nodesById[id];
  return node
    ? { ...prevState, nodesById: { ...nodesById, [id]: { ...node, name } } }
    : prevState;
};

const _changeNodeNameEnd = prevState => ({ ...prevState, editingId: null });

const _selectStart = (selectionX, selectionY) => prevState => ({
  ...prevState,
  selectionX,
  selectionY,
});

const _selectArea = (x2, y2) => prevState => {
  const { selectionX: x1, selectionY: y1, allNodeIds, nodesById } = prevState;
  if (x1 == null || y1 == null) return prevState;
  const minX = x1 < x2 ? x1 : x2;
  const maxX = x1 < x2 ? x2 : x1;
  const minY = y1 < y2 ? y1 : y2;
  const maxY = y1 < y2 ? y2 : y1;
  return {
    ...prevState,
    activeNodes: allNodeIds.filter(nodeId => {
      const node = nodesById[nodeId];
      if (!node) return false;
      return node.x > minX && node.x < maxX && node.y > minY && node.y < maxY;
    }),
  };
};

const _selectEnd = prevState => ({
  ...prevState,
  selectionX: null,
  selectionY: null,
});

const _movePosXY = (posX, posY) => prevState => ({ ...prevState, posX, posY });

class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allNodeIds: [],
      nodesById: {},
      moving: false,
      editingId: null,
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
    this._onMouseDownNode = this._onMouseDownNode.bind(this);
    this._onMouseDownOut = this._onMouseDownOut.bind(this);
    this._onMouseUpIn = this._onMouseUpIn.bind(this);
    this._onDoubleClickNodeName = this._onDoubleClickNodeName.bind(this);
    this._onChangeNodeName = this._onChangeNodeName.bind(this);
    this._onMouseDownSvg = this._onMouseDownSvg.bind(this);
    this._onMouseMoveSvg = this._onMouseMoveSvg.bind(this);
    this._onMouseUpSvg = this._onMouseUpSvg.bind(this);
    this._onMouseLeaveSvg = this._onMouseLeaveSvg.bind(this);
    this._onMouseDownPath = this._onMouseDownPath.bind(this);
    this._onKeyDownContainer = this._onKeyDownContainer.bind(this);
  }

  render() {
    const {
      _container,
      _calcConnectPath,
      _calcPreviewPath,
      _onDragOver,
      _onDrop,
      _onMouseDownNode,
      _onMouseDownOut,
      _onMouseUpIn,
      _onDoubleClickNodeName,
      _onChangeNodeName,
      _onMouseDownSvg,
      _onMouseMoveSvg,
      _onMouseUpSvg,
      _onMouseLeaveSvg,
      _onMouseDownPath,
      _onKeyDownContainer,
      state: {
        allNodeIds,
        nodesById,
        editingId,
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
              d={_calcConnectPath(connect)}
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
              onMouseDown={evt =>
                _onMouseDownPath(
                  evt,
                  connect.fromNodeId,
                  connect.fromOutIdx,
                  connect.toNodeId,
                  connect.toInIdx,
                )
              }
              onMouseUp={evt => evt.stopPropagation()}
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
                editing={editingId === node.id}
                x={node.x}
                y={node.y}
                inCount={node.inCount}
                outCount={node.outCount}
                onMouseDownNode={_onMouseDownNode}
                onMouseDownOut={_onMouseDownOut}
                onMouseUpIn={_onMouseUpIn}
                onDoubleClickNodeName={_onDoubleClickNodeName}
                onChangeNodeName={_onChangeNodeName}
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

  _calcConnectPath({
    fromNodeX,
    fromNodeY,
    fromOutCount,
    fromOutIdx,
    toNodeX,
    toNodeY,
    toInCount,
    toInIdx,
  }) {
    const fromX = fromNodeX + (140 / (fromOutCount + 1)) * (fromOutIdx + 1);
    const fromY = fromNodeY + 60;
    const toX = toNodeX + (140 / (toInCount + 1)) * (toInIdx + 1);
    const toY = toNodeY;
    return _calcPath(fromX, fromY, toX, toY);
  }

  _calcPreviewPath() {
    const {
      connectNodeId: fromNodeId,
      connectOutIdx: fromOutIdx,
      nodesById,
      posX: toX,
      posY: toY,
    } = this.state;
    const node = nodesById[fromNodeId];
    if (!node) return 'M 0, 0';
    const fromX = node.x + (140 / (node.outCount + 1)) * (fromOutIdx + 1);
    const fromY = node.y + 60;
    return _calcPath(fromX, fromY, toX, toY);
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
    this.setState(_makeNodes(x, y, inCount, outCount));
    console.log('[NODE] make');
  }

  _onMouseDownNode(id, ctrlKey) {
    this.setState(_pipe(_movingStart, _activateNodes(ctrlKey, id)));
  }

  _onMouseDownOut(id, outIdx) {
    this.setState(_connectStart(id, outIdx));
  }

  _onMouseUpIn(id, inIdx) {
    this.setState(_pipe(_connect(id, inIdx), _connectEnd));
    console.log('[NODE] connect');
  }

  _onDoubleClickNodeName(id) {
    this.setState(_changeNodeNameStart(id));
  }

  _onChangeNodeName(id, name) {
    this.setState(_pipe(_changeNodeName(id, name), _changeNodeNameEnd));
    console.log('[NODE] change name');
  }

  _onMouseDownSvg({ clientX, clientY }) {
    const {
      _container: {
        current: { offsetLeft, offsetTop },
      },
    } = this;
    const fromX = clientX - offsetLeft;
    const fromY = clientY - offsetTop;
    this.setState(
      _pipe(
        _deactivateAllNodes,
        _deactivateAllPaths,
        _selectStart(fromX, fromY),
        _changeNodeNameEnd,
      ),
    );
  }

  _onMouseMoveSvg({ movementX, movementY, clientX, clientY }) {
    const {
      _container: {
        current: { offsetLeft, offsetTop },
      },
    } = this;
    const posX = clientX - offsetLeft;
    const posY = clientY - offsetTop;
    this.setState(_pipe(_movePosXY(posX, posY), _moving(movementX, movementY)));
  }

  _onMouseUpSvg({ clientX, clientY }) {
    const {
      _container: {
        current: { offsetLeft, offsetTop },
      },
    } = this;
    const x = clientX - offsetLeft;
    const y = clientY - offsetTop;
    this.setState(
      _pipe(_movingEnd, _connectEnd, _selectArea(x, y), _selectEnd),
    );
  }

  _onMouseLeaveSvg() {
    this.setState(_pipe(_movingEnd, _connectEnd, _selectEnd));
  }

  _onMouseDownPath(evt, fromNodeId, fromOutIdx, toNodeId, toInIdx) {
    evt.stopPropagation();
    const isAcc = evt.ctrlKey;
    this.setState(
      _activatePaths(isAcc, fromNodeId, fromOutIdx, toNodeId, toInIdx),
    );
  }

  _onKeyDownContainer({ keyCode }) {
    const {
      state: { activeNodes, activePaths },
    } = this;
    if (keyCode === 46 && activeNodes.length) {
      this.setState(_removeNodes(...activeNodes));
      return console.log('[NODE] remove');
    }
    if (keyCode === 46 && activePaths.length) {
      this.setState(
        ...activePaths.map(path => {
          const [fromNodeId, fromOutIdx, toNodeId, toInIdx] = path
            .split(',')
            .map((v, i) => (i % 2 === 1 ? parseInt(v, 10) : v));
          return _disconnect(fromNodeId, fromOutIdx, toNodeId, toInIdx);
        }),
      );
      return console.log('[NODE] disconnect');
    }
    if (keyCode === 27) {
      return this.setState(
        _pipe(
          _movingEnd,
          _connectEnd,
          _deactivateAllNodes,
          _deactivateAllPaths,
          _movePosXY(0, 0),
          _selectEnd,
        ),
      );
    }
  }
}

export default Editor;
