import React from 'react';
import Control from 'react-leaflet-control';

const DiseaseLevelsLegend = ({ fieldColors = {} }) => (
    <Control position="bottomleft">
        <div className="legend">
            <h4> Disease Levels </h4>
            <p><span style={{ backgroundColor: fieldColors.low }} /> Low </p>
            <p><span style={{ backgroundColor: fieldColors.medium }} /> Medium </p>
            <p><span style={{ backgroundColor: fieldColors.high }} /> High </p>
        </div>
    </Control>
);

export default DiseaseLevelsLegend;