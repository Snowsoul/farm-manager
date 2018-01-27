import React, { Component } from 'react';
import Control from 'react-leaflet-control';

class AddCrop extends Component {
    render() {
        const { crops, onSelectedCropChange, onAddCrop } = this.props;

        return (
            <Control position="bottomright">
              <div className="add-crop-container">
                <h4> Add a crop </h4>
                <p>
                  <select onChange={ onSelectedCropChange }>
                    { 
                      crops.map( (crop, index) =>  
                        <option key={index} value={index}> { crop.name } </option>
                      ) 
                    }
                  </select>
                </p>
                <button onClick={ onAddCrop }> Add </button>
              </div>
            </Control>
        );
    }
}

export default AddCrop;