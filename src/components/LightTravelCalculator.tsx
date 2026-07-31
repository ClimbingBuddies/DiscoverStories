"use client";

import { useId, useMemo, useState } from "react";
import {
  ASTRONOMICAL_UNIT_KILOMETRES,
  finiteNonNegative,
  formatDistance,
  formatDuration,
  formatNumber,
  LIGHT_YEAR_KILOMETRES,
  SPEED_OF_LIGHT_METRES_PER_SECOND,
} from "@/lib/education-content";

type CalculatorType =
  | "light-distance"
  | "light-time"
  | "round-trip"
  | "refractive-speed"
  | "gamma"
  | "light-year";

type Props = {
  calculatorType?: string;
  defaultValue?: number;
  defaultUnit?: string;
};

const timeUnits: Record<string, number> = {
  nanosecond: 1e-9,
  nanoseconds: 1e-9,
  microsecond: 1e-6,
  microseconds: 1e-6,
  millisecond: 1e-3,
  milliseconds: 1e-3,
  second: 1,
  seconds: 1,
  minute: 60,
  minutes: 60,
  hour: 3600,
  hours: 3600,
};

const distanceUnits: Record<string, number> = {
  m: 0.001,
  km: 1,
  au: ASTRONOMICAL_UNIT_KILOMETRES,
  ly: LIGHT_YEAR_KILOMETRES,
};

function calculate(type: CalculatorType, value: number, unit: string) {
  const safeValue = finiteNonNegative(value);

  if (type === "light-time") {
    const distance = safeValue * (distanceUnits[unit] ?? 1);
    const seconds = (distance * 1000) / SPEED_OF_LIGHT_METRES_PER_SECOND;
    return {
      label: "One-way light travel time",
      result: formatDuration(seconds),
      formula: "t = d ÷ c",
    };
  }

  if (type === "round-trip") {
    const seconds = safeValue * (timeUnits[unit] ?? 1);
    const distance = (SPEED_OF_LIGHT_METRES_PER_SECOND * seconds) / 2000;
    return {
      label: "One-way distance",
      result: formatDistance(distance),
      formula: "d = c × t(round trip) ÷ 2",
    };
  }

  if (type === "refractive-speed") {
    const index = Math.max(safeValue, 1);
    const speed = SPEED_OF_LIGHT_METRES_PER_SECOND / index;
    return {
      label: "Propagation speed in the material",
      result: `${formatNumber(speed, 0)} m/s`,
      formula: "v = c ÷ n",
    };
  }

  if (type === "gamma") {
    const beta = Math.min(safeValue, 0.999999);
    const gamma = 1 / Math.sqrt(1 - beta * beta);
    return {
      label: "Lorentz factor γ",
      result: formatNumber(gamma, 6),
      formula: "γ = 1 ÷ √(1 − v²/c²)",
    };
  }

  if (type === "light-year") {
    return {
      label: "Distance",
      result: formatDistance(safeValue * LIGHT_YEAR_KILOMETRES),
      formula: "distance = light-years × 9.4607 trillion km",
    };
  }

  const seconds = safeValue * (timeUnits[unit] ?? 1);
  const distance = (SPEED_OF_LIGHT_METRES_PER_SECOND * seconds) / 1000;
  return {
    label: "Light travels approximately",
    result: formatDistance(distance),
    formula: "d = c × t",
  };
}

function optionsFor(type: CalculatorType) {
  if (type === "light-time") {
    return [
      ["km", "kilometres"],
      ["m", "metres"],
      ["au", "astronomical units"],
      ["ly", "light-years"],
    ];
  }
  if (type === "round-trip" || type === "light-distance") {
    return [
      ["nanosecond", "nanoseconds"],
      ["microsecond", "microseconds"],
      ["millisecond", "milliseconds"],
      ["second", "seconds"],
      ["minute", "minutes"],
      ["hour", "hours"],
    ];
  }
  return [];
}

function titleFor(type: CalculatorType) {
  const titles: Record<CalculatorType, string> = {
    "light-distance": "How far does light travel?",
    "light-time": "How long does light take?",
    "round-trip": "Estimate distance from a round trip",
    "refractive-speed": "Light speed in a material",
    gamma: "Relativistic time factor",
    "light-year": "Convert light-years to distance",
  };
  return titles[type];
}

export default function LightTravelCalculator({
  calculatorType = "light-distance",
  defaultValue = 1,
  defaultUnit = "second",
}: Props) {
  const type = calculatorType as CalculatorType;
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [unit, setUnit] = useState(defaultUnit);
  const result = useMemo(() => calculate(type, value, unit), [type, value, unit]);
  const options = optionsFor(type);
  const inputLabel =
    type === "refractive-speed" ? "Refractive index n" :
    type === "gamma" ? "Speed as a fraction of c" :
    type === "light-year" ? "Light-years" :
    type === "light-time" ? "Distance" :
    "Time";

  return (
    <section className="light-calculator" aria-labelledby={`${id}-title`}>
      <p className="light-calculator__eyebrow">Try the calculation</p>
      <h3 id={`${id}-title`}>{titleFor(type)}</h3>
      <div className="light-calculator__controls">
        <label htmlFor={`${id}-value`}>
          <span>{inputLabel}</span>
          <input
            id={`${id}-value`}
            min="0"
            max={type === "gamma" ? "0.999999" : undefined}
            step="any"
            type="number"
            value={value}
            onChange={(event) => setValue(Number(event.target.value))}
          />
        </label>
        {options.length > 0 ? (
          <label htmlFor={`${id}-unit`}>
            <span>Unit</span>
            <select id={`${id}-unit`} value={unit} onChange={(event) => setUnit(event.target.value)}>
              {options.map(([optionValue, label]) => (
                <option key={optionValue} value={optionValue}>{label}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className="light-calculator__result" aria-live="polite">
        <span>{result.label}</span>
        <strong>{result.result}</strong>
      </div>
      <p className="light-calculator__formula">{result.formula}; c = 299,792,458 m/s</p>
    </section>
  );
}
