import { useState } from 'react';
import { ButtonReset } from './Buttons';

const daysToDisplay = 42;
const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
const monthLabels = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface CalendarProps {
  selected?: Date;
  onClick: (d: Date) => void;
  dateIsDisabled: (d: Date) => boolean;
}

export function Calendar(props: CalendarProps): JSX.Element {
  const today = new Date();
  const selected = props.selected || today;
  const [monthToShow, setMonthToShow] = useState(selected);
  const year = monthToShow.getUTCFullYear();
  const month = monthToShow.getUTCMonth();
  const firstMonthDay = new Date(year, month, 0);
  const firstMonthDayNumber = firstMonthDay.getDay();
  const firstDayToDisplay = new Date(year, month, -firstMonthDayNumber);

  function changeMonth(incr: number) {
    const changed = new Date(monthToShow);
    changed.setUTCMonth(changed.getUTCMonth() + incr);
    setMonthToShow(changed);
  }

  function sameDate(d1: Date, d2: Date) {
    return (
      d1.getUTCFullYear() === d2.getUTCFullYear() &&
      d1.getUTCMonth() === d2.getUTCMonth() &&
      d1.getUTCDate() === d2.getUTCDate()
    );
  }

  return (
    <div
      css={{
        border: '1px solid var(--black)',
        userSelect: 'none',
      }}
    >
      <div
        css={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--black)',
          padding: '0.5em 0',
          textAlign: 'center',
        }}
      >
        <ButtonReset
          css={{
            flexGrow: 1,
          }}
          onClick={() => changeMonth(-1)}
          text={'<'}
        />
        <div
          css={{
            flexGrow: 2,
          }}
        >
          {monthLabels[month]} <span>{year}</span>
        </div>
        <ButtonReset
          css={{
            flexGrow: 1,
          }}
          onClick={() => changeMonth(1)}
          text={'>'}
        />
      </div>
      <div
        css={{
          width: '100%',
          marginLeft: '1%',
        }}
      >
        {dayLabels.map((label) => (
          <div
            css={{
              display: 'inline-block',
              width: '14%',
              textAlign: 'center',
              margin: '0.5em 0',
              fontWeight: 'bold',
            }}
            key={label}
          >
            {label}
          </div>
        ))}
        {Array(daysToDisplay)
          .fill(0)
          .map((_, i) => {
            const d = new Date(firstDayToDisplay);
            d.setDate(d.getDate() + i);
            const isDisabled = props.dateIsDisabled(d);
            const isToday = sameDate(d, today);
            const isSelected = sameDate(d, selected);
            return (
              <ButtonReset
                css={{
                  display: 'inline-block',
                  width: '14%',
                  textAlign: 'center',
                  padding: '0.5em 0',
                  color: isDisabled ? 'var(--default-text)' : 'var(--text)',
                  backgroundColor: isSelected
                    ? 'var(--primary)'
                    : isToday
                      ? 'var(--lighter)'
                      : isDisabled
                        ? 'var(--secondary)'
                        : 'var(--bg)',
                  '&:hover': {
                    backgroundColor: isSelected
                      ? 'var(--primary)'
                      : isToday
                        ? 'var(--lighter)'
                        : 'var(--secondary)',
                  },
                }}
                {...(isToday && { 'data-testid': 'today-button' })}
                disabled={isDisabled}
                key={i}
                onClick={() => {
                  if (!isDisabled) {
                    props.onClick(d);
                  }
                }}
                text={d.getDate().toString()}
              />
            );
          })}
      </div>
    </div>
  );
}
