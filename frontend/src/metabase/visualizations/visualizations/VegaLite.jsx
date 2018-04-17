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
    
    const barData = {
      "values": this.props.data.rows.map(row => ({
        [inputspec["encoding"]["x"]["field"]]: row[0],
        [inputspec["encoding"]["y"]["field"]]: row[1],
      })),
    };
    console.log(this.props);
    
    return (
      inputspec ? <VegaLiteComponent spec={inputspec} data={barData} /> : null
    );
  }
}