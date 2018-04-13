/* @flow */

import React, { Component } from "react";
import styles from "./Scalar.css";
import { t } from "c-3po";
import Icon from "metabase/components/Icon.jsx";
import Tooltip from "metabase/components/Tooltip.jsx";
import Ellipsified from "metabase/components/Ellipsified.jsx";

import { TYPE } from "metabase/lib/types";

import cx from "classnames";
import d3 from "d3";

import type { VisualizationProps } from "metabase/meta/types/Visualization";

export default class RawHtml extends Component {
  props: VisualizationProps;

  static uiName = t`Raw HTML`;
  static identifier = "rawhtml";
  static iconName = "embed";

  static noHeader = true;
  static supportsSeries = true;

  static minSize = { width: 3, height: 3 };

  _el: ?HTMLElement;

  static isSensible(cols, rows) {
    return rows.length === 1 && cols.length === 1;
  }

  static checkRenderable([{ data: { cols, rows } }]) {
    // scalar can always be rendered, nothing needed here
  }

  static seriesAreCompatible(initialSeries, newSeries) {
    if (newSeries.data.cols && newSeries.data.cols.length === 1) {
      return true;
    }
    return false;
  }

  static transformSeries(series) {
    if (series.length > 1) {
      return series.map((s, seriesIndex) => ({
        card: {
          ...s.card,
          display: "funnel",
          visualization_settings: {
            ...s.card.visualization_settings,
            "graph.x_axis.labels_enabled": false,
          },
          _seriesIndex: seriesIndex,
        },
        data: {
          cols: [
            { base_type: TYPE.Text, display_name: t`Name`, name: "name" },
            { ...s.data.cols[0] },
          ],
          rows: [[s.card.name, s.data.rows[0][0]]],
        },
      }));
    } else {
      return series;
    }
  }

  static settings = {
    "rawhtml.template": {
      title: t`HTML Template`,
      widget: "textarea",
    },
  };

  render() {
    let {
      series: [{ card, data }],
      className,
      actionButtons,
      gridSize,
      settings,
      onChangeCardAndRun,
      visualizationIsClickable,
      onVisualizationClick,
    } = this.props;

    let isSmall = gridSize && gridSize.width < 4;

    const dataHtml = (new Function('data', 'try { return `' + (settings["rawhtml.template"] || 'Data: ${JSON.stringify(data, null, " ")}') + '` } catch (ex) { return `Error: ${ex}`; }'))(data);

    return (
      <div
        className={cx(
          className,
          styles.Scalar,
          styles[isSmall ? "small" : "large"],
        )}
      >
        <div className="Card-title absolute top right p1 px2">
          {actionButtons}
        </div>
        <div
          ref={scalar => (this._scalar = scalar)}
          dangerouslySetInnerHTML={{__html: dataHtml}}
        />
        {this.props.isDashboard && (
          <div className={styles.Title + " flex align-center relative"}>
            <Ellipsified tooltip={card.name}>
              <span
                onClick={
                  onChangeCardAndRun &&
                  (() => onChangeCardAndRun({ nextCard: card }))
                }
                className={cx("fullscreen-normal-text fullscreen-night-text", {
                  "cursor-pointer": !!onChangeCardAndRun,
                })}
              >
                <span className="Scalar-title">{settings["card.title"]}blah</span>
              </span>
            </Ellipsified>
          </div>
        )}
      </div>
    );
  }
}
