import React, { Component } from 'react';
import AddCrop from './AddCrop';

class Modal extends Component {
    state = {
        selectedCrop: this.props.crops[0]
    }

    render() {
        const { visible, crops, cropToReplace, onReplace, onCancel } = this.props;

        return (
            <div className="overlay" style={{ display: visible ? 'block' : 'none' }}>
                <div className="modal-container">
                    <AddCrop
                        crops={crops}
                        cropToReplace={ cropToReplace }
                        onAddCrop={ () => { onReplace(this.state.selectedCrop) } }
                        onSelectedCropChange={ (e) => { 
                            this.setState({ selectedCrop: crops[e.target.value] }) 
                        }}
                        onCancel={ onCancel }
                        replace
                    />
                </div>
            </div>
        );
    }
}

export default Modal;