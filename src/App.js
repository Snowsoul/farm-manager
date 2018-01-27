import React, { Component } from 'react';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';
import DiseaseLevelsLegend from './components/DiseaseLevelsLegend';
import Modal from './components/Modal';
import FarmFieldManager from './components/FarmFieldManager';
import AddCrop from './components/AddCrop';

import 'leaflet/dist/leaflet.css';

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
  state = {
    bounds: undefined,
    displayModal: false,
    errors: [],
    fetching: true,
    fetched: false,
    selectedCrop: {},
    selectedField: {
      id: 0, 
      name: "Click the fields for info and crops management",
      hectares: 0,
      disease_susceptibility: 0  
    },
    crops: {},
    farm: {}
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
        selectedCrop: crops[0],
        crops,
        farm: {
          ...farm,
          centre: {
            ...farm.centre,
            // Coordinates are inversed from the API
            coordinates: [
              farm.centre.coordinates[1], 
              farm.centre.coordinates[0]
            ]
          },
          fields: this.getFarmFields(farm)
        }
      });
    })
    .catch(err => {
      console.error(err);

      this.setState({ 
        fetched: true, 
        errors: [
        ...this.state.errors,
        "Could not load data. Error during data fetch request..."
        ] 
      });
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
    const { 
      selectedField, 
      farm, 
      crops, 
      bounds, 
      displayModal,
      fetching,
      fetched, 
      errors 
    } = this.state;


    // If the data is still fetching show the loading screen
    if (!fetched && fetching) {
      return <div className="container"> Loading ... </div>;
    } 

    // If there are any errors show the error screen
    if (errors.length) {
      return (
        <div className="container"> { 
          errors.map( (error, index) => <p key={index}> ERROR: <b>{error}</b> </p> ) }  
        </div>
      );
    }

    return (
      <div className="container">
        <Map
          style={{ width: '100%', height: '500px' }}
          bounds={ bounds }
          center={farm.centre.coordinates}
          zoom={13}
        >

          <FarmFieldManager 
            selectedField={ selectedField }
            onCropRemove={ this.removeCrop }
            onCropReplace={ this.replaceCrop } 
          />

          {
            this.state.selectedField.hectares &&
              <AddCrop 
                crops={ crops }
                onSelectedCropChange={ (e) => this.setState({ selectedCrop: crops[e.target.value] }) }
                onAddCrop={ this.addCrop }
              />
          }
          
          <DiseaseLevelsLegend fieldColors={fieldColors} />
          <Modal visible={ displayModal } />
          
          
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {
            farm.fields.map( (field, index) => 
              <GeoJSON 
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