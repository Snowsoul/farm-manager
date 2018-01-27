import React, { Component } from 'react';
import Control from 'react-leaflet-control';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import FarmData from './data/farm.json';
import crops from './data/crops.json';

const api = {
  farm: "https://private-bf7f31-hummingbirdsimple.apiary-mock.com/farm",
  crops: "https://private-bf7f31-hummingbirdsimple.apiary-mock.com/crops"
}

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
      displayModal: false,
      errors: [],
      fetching: true,
      fetched: false,
      selectedCrop: crops[0],
      selectedField: {
        id: 0, 
        name: "Hover over a field for info or click to zoom",
        hectares: 0,
        disease_susceptibility: 0  
      },

      crops: {},
      farm: {}
    }
  }

  componentDidMount() {
    let crops, farm;

    fetch(api.crops)
    .then(cropsData => cropsData.json())
    .then(cropsData => crops = cropsData)
    .then(cropsData => fetch(api.farm))
    .then(farmData => farmData.json())
    .then(farmData => {
      farm = farmData;
      this.setState({
        fetching: false,
        fetched: true,
        crops,
        farm: {
          ...farm,
          centre: {
            ...farm.centre,
            coordinates: [farm.centre.coordinates[1], farm.centre.coordinates[0]], // Coordinates are inversed from the API
          },
          fields: this.getFarmFields(farm)
        }
      });

      console.log(this.state);
    })
    .catch(err => {
      console.error(err);

      this.setState({ fetched: true, errors: [
        ...this.state.errors,
        "Could not load data. Error during data fetch request..."
      ] })
    });
  }

  calculateYieldValue = (field, changedCrop) => {

    // Crop Yield Average * Hectares of Field / (Crop Risk Factor * Field Disease Susceptibility) * price per tone
    const yields = field.crops.map(crop => crop.expected_yield);
    const avg = yields.reduce( (a, b) => a + b, 0) / yields.length;
    const { hectares, disease_susceptibility } = field;

    const yieldValue = (avg * hectares) / (changedCrop.disease_risk_factor * disease_susceptibility) * changedCrop.price_per_tonne;
    
    return yieldValue;
  }

  replaceCrop = (cropIndex, fieldID) => {
    this.setState({ displayModal: true });
  }

  removeCrop = (cropIndex, fieldID) => {
    let farm = this.state.farm;

    const yieldValue = this.calculateYieldValue(this.state.selectedField, this.state.selectedCrop);
    farm.fields[fieldID].crops = farm.fields[fieldID].crops.filter((crop, index) => index !== cropIndex);
    farm.fields[fieldID].yieldValue = yieldValue;

    this.setState({ farm: farm });
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

  getFarmFields = (data) => {
    return data.fields.map(field => ({ ...field, crops:[] }));
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
    const { selectedField, farm, bounds, displayModal, fetched, errors } = this.state;

    if (!fetched) {
      return <div className="container"> Loading ... </div>;
    } 

    if (errors.length) {
      return <div className="container"> { errors.map( (error, index) => <p key={index}> ERROR: <b>{error}</b> </p> ) }  </div>
    }

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
                    { 
                      selectedField.crops.map( (crop, index) => 
                        <li className="crop" key={ index }> 
                          <span className="crop-name">{ crop.name }</span>
                          <div className="crop-replace-delete">
                            <button onClick={ () => this.replaceCrop(index, selectedField.id) } className="replace">Replace</button>
                            <button onClick={ () => this.removeCrop(index, selectedField.id) } className="delete">Remove</button>
                          </div>
                        </li>
                      ) 
                    }
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
              <button onClick={ () => this.addCrop() }> Add </button>
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

          <div className="overlay" style={{ display: displayModal ? 'block' : 'none' }}>
            <div className="modal-container">

            </div>
          </div>
          
          
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