import React, { useState, useMemo } from "react";
import { IonIcon, IonButton } from "@ionic/react";
import { chevronBackOutline, chevronForwardOutline } from "ionicons/icons";
import "../../styles/ui/Calendar.css";

export type CalendarMode = "single" | "range";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface CalendarProps {
  value?: Date | null;
  onChange?: (date: Date) => void;
  mode?: CalendarMode;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  onRangeChange?: (range: DateRange) => void;
  locale?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  highlightToday?: boolean;
  showWeekNumbers?: boolean;
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

function buildWeeks(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDow = (first.getDay() + 6) % 7; // Lundi = 0
  const days: (Date | null)[] = [];

  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7 !== 0) days.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

function getWeekNumber(d: Date) {
  const tmp = new Date(d.valueOf());
  const day = (tmp.getDay() + 6) % 7;
  tmp.setDate(tmp.getDate() - day + 3);
  const firstThursday = new Date(tmp.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((tmp.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7,
    )
  );
}

const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  mode = "single",
  rangeStart = null,
  rangeEnd = null,
  onRangeChange,
  locale = "fr-FR",
  minDate,
  maxDate,
  disabledDates = [],
  highlightToday = true,
  showWeekNumbers = false,
  accentColor = "var(--ion-color-primary)",
  className = "",
  style,
}) => {
  const today = new Date();
  const [cursor, setCursor] = useState<Date>(value ?? today);
  const [intRange, setIntRange] = useState<DateRange>({
    start: rangeStart,
    end: rangeEnd,
  });

  const effectiveRange: DateRange = onRangeChange
    ? { start: rangeStart, end: rangeEnd }
    : intRange;

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const weeks = useMemo(() => buildWeeks(year, month), [year, month]);

  const monthLabel = cursor.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const prevMonth = () => setCursor(new Date(year, month - 1, 1));
  const nextMonth = () => setCursor(new Date(year, month + 1, 1));

  const isDisabled = (d: Date) => {
    if (minDate && d < startOfMonth(minDate) && d < minDate) return true;
    if (maxDate && d > endOfMonth(maxDate) && d > maxDate) return true;
    return disabledDates.some((dd) => isSameDay(dd, d));
  };

  const isSelected = (d: Date) => {
    if (mode === "single") return !!value && isSameDay(d, value);
    return (
      (!!effectiveRange.start && isSameDay(d, effectiveRange.start)) ||
      (!!effectiveRange.end && isSameDay(d, effectiveRange.end))
    );
  };

  const isInRange = (d: Date) => {
    if (mode !== "range") return false;
    const { start, end } = effectiveRange;
    if (!start || !end) return false;
    return d > start && d < end;
  };

  const isRangeStart = (d: Date) =>
    mode === "range" &&
    !!effectiveRange.start &&
    isSameDay(d, effectiveRange.start);
  const isRangeEnd = (d: Date) =>
    mode === "range" &&
    !!effectiveRange.end &&
    isSameDay(d, effectiveRange.end);

  const handleDayClick = (d: Date) => {
    if (isDisabled(d)) return;
    if (mode === "single") {
      onChange?.(d);
    } else {
      const { start, end } = effectiveRange;
      let next: DateRange;
      if (!start || (start && end)) {
        next = { start: d, end: null };
      } else {
        next = d >= start ? { start, end: d } : { start: d, end: start };
      }
      if (onRangeChange) onRangeChange(next);
      else setIntRange(next);
    }
  };

  return (
    <div
      className={["cfi-calendar", className].filter(Boolean).join(" ")}
      style={{ "--cal-accent": accentColor, ...style } as React.CSSProperties}
      role="application"
      aria-label="Calendrier"
    >
      <div className="cfi-cal-nav">
        <IonButton
          fill="clear"
          size="small"
          className="cfi-cal-nav-btn"
          onClick={prevMonth}
          aria-label="Mois précédent"
        >
          <IonIcon slot="icon-only" icon={chevronBackOutline} />
        </IonButton>
        <span className="cfi-cal-month-label">{monthLabel}</span>
        <IonButton
          fill="clear"
          size="small"
          className="cfi-cal-nav-btn"
          onClick={nextMonth}
          aria-label="Mois suivant"
        >
          <IonIcon slot="icon-only" icon={chevronForwardOutline} />
        </IonButton>
      </div>

      <table className="cfi-cal-grid" role="grid">
        <thead>
          <tr>
            {showWeekNumbers && <th className="cfi-cal-wnum-head">#</th>}
            {dayNames.map((dn) => (
              <th key={dn} className="cfi-cal-head-cell" abbr={dn}>
                {dn}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {showWeekNumbers && (
                <td className="cfi-cal-wnum">
                  {week.find((d) => d !== null)
                    ? getWeekNumber(week.find((d) => d !== null)!)
                    : ""}
                </td>
              )}
              {week.map((day, di) => {
                if (!day)
                  return (
                    <td key={di} className="cfi-cal-cell cfi-cal-cell--empty" />
                  );
                const selected = isSelected(day);
                const inRange = isInRange(day);
                const isToday = highlightToday && isSameDay(day, today);
                const disabled = isDisabled(day);
                const rStart = isRangeStart(day);
                const rEnd = isRangeEnd(day);

                return (
                  <td
                    key={di}
                    className={[
                      "cfi-cal-cell",
                      selected ? "cfi-cal-cell--selected" : "",
                      inRange ? "cfi-cal-cell--in-range" : "",
                      isToday ? "cfi-cal-cell--today" : "",
                      disabled ? "cfi-cal-cell--disabled" : "",
                      rStart ? "cfi-cal-cell--range-start" : "",
                      rEnd ? "cfi-cal-cell--range-end" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleDayClick(day)}
                    role="gridcell"
                    aria-selected={selected}
                    aria-disabled={disabled}
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={(e) => e.key === "Enter" && handleDayClick(day)}
                  >
                    <span className="cfi-cal-day-num">{day.getDate()}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="cfi-cal-footer">
        <button
          className="cfi-cal-today-btn"
          onClick={() => {
            setCursor(today);
            if (mode === "single") onChange?.(today);
          }}
          type="button"
        >
          Aujourd'hui
        </button>
      </div>
    </div>
  );
};

export default Calendar;
