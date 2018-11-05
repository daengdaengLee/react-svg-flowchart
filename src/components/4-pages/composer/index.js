import React, { Component } from 'react';
import Editor from '../../3-organisms/editor';
import Navigation from '../../3-organisms/navigation';

class Composer extends Component {
  render() {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <Navigation />
        <Editor />
      </div>
    );
  }
}

export default Composer;
