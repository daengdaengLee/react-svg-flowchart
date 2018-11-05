import React, { Component } from 'react';
import NavigationItem from '../../1-atoms/navigation-item';

class Navigation extends Component {
  render() {
    const { _onDragStart } = this;
    return (
      <div style={{ width: '260px', display: 'flex', flexDirection: 'column' }}>
        <NavigationItem
          data-inout-count="11"
          draggable
          onDragStart={_onDragStart}
        >
          Node(1, 1)
        </NavigationItem>
      </div>
    );
  }

  _onDragStart({
    dataTransfer,
    target: {
      dataset: { inoutCount },
    },
  }) {
    console.log('[DRAG_AND_DROP] drag start');
    dataTransfer.setData('inoutCount', inoutCount);
  }
}

export default Navigation;
