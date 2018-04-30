import React from "react";
import { t } from "c-3po";
import { Handler } from 'vega-tooltip';
import * as vl from 'vega-lite';
import * as vega from 'vega';

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function isDefined(x) {
  return x !== null && x !== undefined;
}

function isFunction(functionToCheck) {
  const getType = {};
  return !!functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

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

  static isSamePadding(a, b) {
    if (isDefined(a) && isDefined(b)) {
      return a.top === b.top
        && a.left === b.left
        && a.right === b.right
        && a.bottom === b.bottom;
    }
    return a === b;
  }

  static isSameData(a, b) {
    return a === b && !isFunction(a);
  }

  static isSameSpec(a, b) {
    return a === b
      || JSON.stringify(a) === JSON.stringify(b);
  }

  static listenerName(signalName) {
    return `onSignal${capitalize(signalName)}`;
  }

  componentDidMount() {
    this.createView(this.props.spec);
  }

  componentDidUpdate(prevProps) {
    const prevInputSpec = prevProps.settings["rawhtml.vegajson"] ? JSON.parse(prevProps.settings["rawhtml.vegajson"]) : null;
    const inputspec = this.props.settings["rawhtml.vegajson"] ? JSON.parse(this.props.settings["rawhtml.vegajson"]) : null;
    
    const prevBarData = 
    prevInputSpec ? {
      "values": prevProps.data.rows.map(row => ({
        ...row.reduce((acc, curr, i) => ({ ...acc, [prevProps.data.columns[i]]: curr }), {})
      })),
    } : null
    const barData = inputspec ? {
      "values": this.props.data.rows.map(row => ({
        ...row.reduce((acc, curr, i) => ({ ...acc, [this.props.data.columns[i]]: curr }), {})
      })),
    } : null;
    const prevSizedInputSpec = {
      ...prevInputSpec,
      data: prevBarData,
      width: prevBarData.width - 20,
      height: prevBarData.height - 20,
    }
    const sizedInputSpec = inputspec ? {
      ...inputspec,
      data: barData,
      width: this.props.width - 20,
      height: this.props.height - 20,
    } : null;
    const prevParsedSpec = vl.compile(prevSizedInputSpec);
    const parsedSpec = vl.compile(sizedInputSpec);
    const prevParsedSpecWithSignals = {
      ...prevParsedSpec.spec,
      signals: [{
        "name": "hover",
        "on": [
          {"events": "rect:mouseover", "update": "datum"},
          {"events": "rect:mouseout",  "update": "{}"}
        ]
      }]
    }
    const parsedSpecWithSignals = {
      ...parsedSpec.spec,
      signals: [{
        "name": "hover",
        "on": [
          {"events": "rect:mouseover", "update": "datum"},
          {"events": "rect:mouseout",  "update": "{}"}
        ]
      }]
    }
    if (parsedSpecWithSignals !== prevParsedSpecWithSignals) {
      this.clearView();
      this.createView(parsedSpecWithSignals);
    } else if (this.view) {
      const props = this.props;
      const spec = parsedSpecWithSignals;
      let changed = false;

      // update view properties
      [
        'renderer',
        'logLevel',
        'background',
      ]
        .filter(field => props[field] !== prevProps[field])
        .forEach((field) => {
          this.view[field](props[field]);
          changed = true;
        });

      if (!VegaLite.isSamePadding) {
        this.view.padding(props.padding || spec.padding);
        changed = true;
      }

      // update data
      if (spec.data && barData) {
        spec.data.forEach((d) => {
          const oldData = prevBarData[d.name];
          const newData = barData[d.name];
          if (!VegaLite.isSameData(oldData, newData)) {
            this.updateData(d.name, newData);
            changed = true;
          }
        });
      }

      if (props.enableHover !== prevProps.enableHover) {
        changed = true;
      }

      if (changed) {
        if (props.enableHover) {
          this.view.hover();
        }
        this.view.run();
      }
    }
  }

  componentWillUnmount() {
    this.clearView();
  }

  createView(spec) {
    const inputspec = this.props.settings["rawhtml.vegajson"] ? JSON.parse(this.props.settings["rawhtml.vegajson"]) : null;
    
    const barData = inputspec ? {
      "values": this.props.data.rows.map(row => ({
        ...row.reduce((acc, curr, i) => ({ ...acc, [this.props.data.columns[i]]: curr }), {})
      })),
    } : null;
    const sizedInputSpec = inputspec ? {
      ...inputspec,
      data: barData,
      width: this.props.width - 20,
      height: this.props.height - 20,
    } : null;
    const parsedSpec = vl.compile(sizedInputSpec);
    const parsedSpecWithSignals = {
      ...parsedSpec.spec,
      // signals: [{
      //   "name": "hover",
      //   "on": [
      //     {"events": "rect:mouseover", "update": "datum"},
      //     {"events": "rect:mouseout",  "update": "{}"}
      //   ]
      // }]
    }
    if (parsedSpecWithSignals) {
      const props = this.props;
      // Parse the vega spec and create the view
      try {
        const handler = new Handler();
        const runtime = vega.parse(parsedSpecWithSignals);
        const view = new vega.View(runtime)
          .tooltip(handler.call)
          .initialize(this.element);

        // Attach listeners onto the signals
        if (parsedSpecWithSignals.signals) {
          parsedSpecWithSignals.signals.forEach((signal) => {
            view.addSignalListener(signal.name, (...args) => {
              const listener = this.props[VegaLite.listenerName(signal.name)];
              if (listener) {
                listener.apply(this, args);
              }
            });
          });
        }

        // store the vega.View object to be used on later updates
        this.view = view;

        [
          'padding',
          'renderer',
          'logLevel',
          'background',
        ]
          .filter(field => isDefined(props[field]))
          .forEach((field) => { view[field](props[field]); });

        if (parsedSpecWithSignals.data && barData) {
          parsedSpecWithSignals.data
            .filter(d => barData[d.name])
            .forEach((d) => {
              this.updateData(d.name, barData[d.name]);
            });
        }
        if (props.enableHover) {
          view.hover();
        }
        view.run();
      } catch (ex) {
        this.clearView();
      }
    } else {
      this.clearView();
    }
    return this;
  }

  updateData(name, value) {
    if (value) {
      if (isFunction(value)) {
        value(this.view.data(name));
      } else {
        this.view.change(
          name,
          vega.changeset()
            .remove(() => true)
            .insert(value),
        );
      }
    }
  }

  clearView() {
    if (this.view) {
      this.view.finalize();
      this.view = null;
    }
    return this;
  }

  render() {
    return (
      // Create the container Vega draws inside
      <div
        ref={(c) => { this.element = c; }}
        style={{ padding: 10 }}
      />
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