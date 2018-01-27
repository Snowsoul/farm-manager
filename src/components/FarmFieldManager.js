import React, { Component } from 'react';
import Control from 'react-leaflet-control';

class FarmFieldManager extends Component {
    render() {
        const { selectedField, onCropRemove, onCropReplace } = this.props;
        
        return (
            <Control position="topright">
                <div className="field-info">
                <h4> Farm Field Manager </h4>
                <p> <b>{ selectedField.name }</b> </p>
                {
                    selectedField.hectares> 0 && 
                    <p> Size: <b>{ selectedField.hectares } hectares</b> </p>
                }
                {
                    selectedField.disease_susceptibility > 0 && 
                    <p> Disease Susceptibility Level: <b>{ selectedField.disease_susceptibility }</b> </p>
                }
                {
                    selectedField.crops && selectedField.yieldValue  &&
                    <p> Yield Value: <b>{ selectedField.yieldValue.toFixed(2) }</b> </p>
                }
                {
                    selectedField.crops &&
                    <ul className="crops">
                        { 
                        selectedField.crops.map( (crop, index) => 
                            <li className="crop" key={ index }> 
                            <span className="crop-name">{ crop.name }</span>
                            <div className="crop-replace-delete">
                                <button onClick={ () => onCropReplace(index, selectedField.id) } className="replace">Replace</button>
                                <button onClick={ () => onCropRemove(index, selectedField.id) } className="delete">Remove</button>
                            </div>
                            </li>
                        ) 
                        }
                    </ul>
                }
                </div>
            </Control>
        );
    }
}

export default FarmFieldManager;