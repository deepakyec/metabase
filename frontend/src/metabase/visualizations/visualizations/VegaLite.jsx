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
        ...row.reduce((acc, curr, i) => ({ ...acc, [this.props.data.columns[i]]: curr }), {})
      })),
    } : null;
    const sizedInputSpec = inputspec ? {
      ...inputspec,
      width: this.props.width - 20,
      height: this.props.height - 20,
    } : null;
    return (
      barData ? <div style={{ padding: 10 }}><VegaLiteComponent spec={sizedInputSpec} data={barData} /></div> : null
    );
  }
}

// {
//   "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
//   "autosize": {
//     "type": "fit",
//     "contains": "padding"
//   },
//   "mark": "bar",
//   "transform": [
//     {"calculate": "datum.client + ' / ' + datum.site", "as": "clientSite"}
//   ],
//   "encoding": {
//     "x": {
//         "aggregate": "count",
//         "type": "quantitative",
//         "axis": { "title": "Count of Agreements" }
//       } ,
//     "y": {
//         "field": "clientSite",
//         "type": "nominal",
//         "sort": {"op": "count", "order": "descending"},
//         "axis": { "title": "Client" }
//     } ,
//     "tooltip": {
//       "aggregate": "count",
//       "type": "quantitative"
//     },
//     "color": {
//         "field": "category",
//         "type": "",
//         "legend": { "title": "Site"}
//     }
//   }
// }

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