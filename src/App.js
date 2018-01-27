import React, { Component } from 'react';
import Control from 'react-leaflet-control';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import FarmData from './data/farm.json';
import crops from './data/crops.json';

const fieldColors = {
  low: "#D0EF84",
  medium: "#FDA831",
  high: "#DE561C"
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bounds: undefined,
      selectedCrop: null,
      selectedField: {
        id: 0, 
        name: "Hover over a field for info or click to zoom",
        hectares: 0,
        disease_susceptibility: 0  
      },

      farm: {
        ...FarmData,
        fields: this.getFarmFields()
      }
    }
  }

  calculateYieldValue = (field, changedCrop) => {

    // Crop Yield Average * Hectares of Field / (Crop Risk Factor * Field Disease Susceptibility) * price per tone
    const yields = field.crops.map(crop => crop.expected_yield);
    const avg = yields.reduce( (a, b) => a + b, 0) / yields.length;
    const { hectares, disease_susceptibility } = field;

    const yieldValue = (avg * hectares) / (changedCrop.disease_risk_factor * disease_susceptibility) * changedCrop.price_per_tonne;
    
    return yieldValue;
  }

  replaceCrop = () => {

  }

  removeCrop = () => {
    
  }

  addCrop = () => {
    const { selectedField, farm } = this.state;
    
    
    const newField = {
      ...selectedField,
      crops: [
        ...selectedField.crops,
        this.state.selectedCrop
      ]
    };

    console.log(this.state.selectedCrop);

    const yieldValue = this.calculateYieldValue(newField, this.state.selectedCrop);
    
    const fieldWithYieldValue = {
      ...newField,
      yieldValue
    }

    farm.fields[selectedField.id] = fieldWithYieldValue;


    this.setState({
      farm: farm,
      selectedField: fieldWithYieldValue
    });

  }

  getFarmFields = () => {
    return FarmData.fields.map(field => ({ ...field, crops:[] }));
  }

  getFieldColor = (diseaseSusceptibility) => {
    return diseaseSusceptibility  >=  6 ? fieldColors.high   :
           diseaseSusceptibility  >   3 ? fieldColors.medium :
                                          fieldColors.low; 
  }

  onFieldSelect = (field, e, eventType) => {

    let bounds;

    switch(eventType) {
      case "click":
        bounds = e.target.getBounds();
      break;
      
      case "hover":
      
      break;

      default: break;
    }

    this.setState({ selectedField: field, bounds: bounds });
  }

  render() {
    const { selectedField, farm, bounds } = this.state;

    return (
      <div className="container">
        <Map
          style={{ width: '100%', height: '500px' }}
          bounds={ bounds }
          center={farm.centre.coordinates}
          zoom={13}
        >
          <Control position="topright">
            <div className="field-info">
              <h4> Farm Field </h4>
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
                    { selectedField.crops.map( (crop, index) => <li key={ index }> { crop.name } </li>) }
                  </ul>
              }


            </div>
          </Control>

          {
            this.state.selectedField.hectares &&
            <Control position="bottomright">
            <div className="add-crop-container">
              <h4> Add a crop </h4>
              <p>
                <select onChange={ (e) => this.setState({ selectedCrop: crops[e.target.value] }) }>
                  { 
                    crops.map( (crop, index) =>  
                      <option key={index} value={index}> { crop.name } </option>
                    ) 
                  }
                </select>
              </p>
              <button onClick={ () => this.addCrop() }> Add Winter Wheat </button>
            </div>
          </Control>
          }
          

          <Control position="bottomleft">
            <div className="legend">
              <h4> Disease Levels </h4>
              <p><span style={{ backgroundColor: fieldColors.low }} /> Low </p>
              <p><span style={{ backgroundColor: fieldColors.medium }} /> Medium </p>
              <p><span style={{ backgroundColor: fieldColors.high }} /> High </p>
            </div>
          </Control>
          
          
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {
            farm.fields.map( (field, index) => 
              <GeoJSON 
                onMouseOver={ (e) => this.onFieldSelect( { id: index, ...field }, e, "hover") } 
                onClick={ (e) => this.onFieldSelect({ id: index, ...field }, e, "click") } 
                color={ this.getFieldColor(field.disease_susceptibility) } 
                key={field.name} 
                data={field.boundary} 
              />
            )
          }
        </Map>
      </div>
    );
  }
}

export default App;