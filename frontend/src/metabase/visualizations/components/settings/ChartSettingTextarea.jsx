import React from "react";

const ChartSettingTextarea = ({ value, onChange }) => (
  <textarea
    className="input block full"
    value={value}
    onChange={e => onChange(e.target.value)}
  />
);

export default ChartSettingTextarea;
