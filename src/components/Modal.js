import React, { Component } from 'react';

class Modal extends Component {
    render() {
        const { visible } = this.props;

        return (
            <div className="overlay" style={{ display: visible ? 'block' : 'none' }}>
                <div className="modal-container">

                </div>
            </div>
        );
    }
}

export default Modal;