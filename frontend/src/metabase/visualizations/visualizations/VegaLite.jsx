import React from "react";
import { t } from "c-3po";
import VegaLiteComponent from 'react-vega-lite';

export default class VegaLite extends React.Component {

  static uiName = t`Vega Lite`;
  static identifier = "vegalite";
  static iconName = "number";

  static noHeader = true;

  static settings = {
    "rawhtml.vegajson": {
      title: t`JSON`,
      widget: "textarea",
    },
  };

  render() {
    const inputspec = this.props.settings["rawhtml.vegajson"] ? JSON.parse(this.props.settings["rawhtml.vegajson"]) : null;
    
    const barData = inputspec ? {
      "values": this.props.data.rows.map(row => ({
        [inputspec["encoding"]["y"]["field"]]: row[1],
        [inputspec["encoding"]["color"]["field"]]: row[5],
      })),
    } : null;
    
    return (
      barData ? <VegaLiteComponent spec={inputspec} data={barData} /> : null
    );
  }
}

// {
//   "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
//   "mark": "bar",
//   "encoding": {
//     "x": {
//         "aggregate": "count",
//         "type": "quantitative",
//         "axis": { "title": "Count of Products" }
//       } ,
//     "y": {
//         "field": "category",
//         "type": "nominal",
//         "axis": { "title": "Category" }
//     } ,
//     "tooltip": {
//       "aggregate": "count",
//       "type": "quantitative"
//     },
//     "color": {
//         "field": "rating", 
//         "bin": true,
//         "type": "quantitative",
//         "legend": { "title": "Rating"}
//     }
//   }
// }