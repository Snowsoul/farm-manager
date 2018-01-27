import React, { Component } from 'react';

class AddCrop extends Component {
    render() {
        const { 
          crops, 
          cropToReplace, 
          onSelectedCropChange, 
          onAddCrop,
          onCancel,
          replace = false 
        } = this.props;

        return (
              <div className="add-crop-container">
                <h4>{ replace ? 'Replace a crop' : 'Add a crop' }</h4>
                {
                  replace && cropToReplace &&
                  <p> <b>{cropToReplace.name}</b> <br /> <br/> with <br /> </p>
                }
                <p>
                  <select onChange={ onSelectedCropChange }>
                    { 
                      crops.map( (crop, index) =>  
                        <option key={index} value={index}> { crop.name } </option>
                      ) 
                    }
                  </select>
                </p>
                {
                  replace &&
                  <button className="cancel-button" onClick={onCancel}> Cancel </button>
                }
                <button onClick={ onAddCrop }> { replace ? 'Replace' : 'Add' } </button>
              </div>
        );
    }
}

export default AddCrop;