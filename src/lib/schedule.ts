import {
  DATA,
  DOSE_LABELS,
  addInterval,
  fmtDate,
  norm,
  parseDate,
  parseSchedule,
  sequentialInterval,
  type VaccineProtocol,
} from '@/lib/vaccineData';
import type { PatientRecord, ReminderFilter, ReminderRow, SortDirection } from '@/lib/types';

/**
 * Compute the effective date for each of the 6 doses of a protocol.
 * Preference order per dose: actual injected date → explicit due override →
 * auto-computed from the protocol schedule.
 *
 * Shared by the planner (client) and the reminders API (server) so both agree.
 */
export function computeDoseDates(
  protocolId: string,
  dates: string[],
  dueOverrides: string[],
  protocols: VaccineProtocol[] = DATA.protocols
): (Date | null)[] {
  const protocol = protocols.find((p) => p.id === protocolId);
  if (!protocol) return Array(6).fill(null);

  const plan = parseSchedule(protocol.schedule);
  const computed: (Date | null)[] = Array(6).fill(null);

  for (let i = 0; i < 6; i++) {
    const actual = parseDate(dates[i]);
    const override = parseDate(dueOverrides[i]);

    if (actual) {
      computed[i] = actual;
    } else if (i >= 1 && override) {
      computed[i] = override;
    } else {
      const it = plan.intervals[i];
      if (i === 0) {
        computed[i] = null;
      } else {
        const prevActual = parseDate(dates[i - 1]) || parseDate(dueOverrides[i - 1]) || computed[i - 1];
        const seq = prevActual ? sequentialInterval(plan, i) : null;
        if (seq && computed[i - 1]) {
          computed[i] = addInterval(computed[i - 1] as Date, seq);
        } else if (it && computed[it.from]) {
          computed[i] = addInterval(computed[it.from] as Date, it);
        }
      }
    }
  }
  return computed;
}

function daysUntil(date: Date, today: Date): number {
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

function matchesFilter(diff: number, filter: ReminderFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'overdue':
      return diff < 0;
    case 'today':
      return diff === 0;
    case '7':
      return diff <= 7;
    case '30':
      return diff <= 30;
    default:
      return true;
  }
}

/**
 * Build the list of upcoming (not yet injected) dose reminders for the given patients.
 * Mirrors the previous client-side computation, now runnable on the server.
 */
export function buildReminderRows(
  patients: PatientRecord[],
  filter: ReminderFilter,
  now: Date = new Date()
): ReminderRow[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const rows: ReminderRow[] = [];

  for (const patient of patients) {
    if (!DATA.protocols.find((p) => p.id === patient.protocolId)) continue;

    const dates = patient.dates || Array(6).fill('');
    const dueOverrides = patient.dueOverrides || Array(6).fill('');
    const computed = computeDoseDates(patient.protocolId, dates, dueOverrides);

    for (let i = 0; i < 6; i++) {
      const actual = parseDate(dates[i]);
      if (actual) continue;

      const override = parseDate(dueOverrides[i]);
      const activeDue = override || computed[i];
      if (!activeDue) continue;

      const diff = daysUntil(activeDue, today);
      if (!matchesFilter(diff, filter)) continue;

      rows.push({
        _id: `${patient._id}_${i}`,
        patientId: patient._id,
        patientCode: patient.patientCode || '',
        patientName: patient.patientName || '',
        phone: patient.phone || '',
        dob: patient.dob || '',
        gender: patient.gender || '',
        address: patient.address || '',
        vaccineAndDose: `${patient.vaccine} ${DOSE_LABELS[i].replace('Mũi ', '')}`,
        doseLabel: DOSE_LABELS[i],
        actualDateStr: dates[i] || '',
        plannedDateStr: fmtDate(activeDue),
        diff,
        doseIndex: i,
        patient,
      });
    }
  }

  return rows;
}

function compareText(a: string, b: string): number {
  return (a || '').localeCompare(b || '', 'vi', { sensitivity: 'accent' });
}

export function sortReminderRows(
  rows: ReminderRow[],
  sortKey: string,
  direction: SortDirection
): ReminderRow[] {
  const dir = direction === 'asc' ? 1 : -1;
  const sorted = [...rows];

  switch (sortKey) {
    case 'due':
      sorted.sort((a, b) => (a.diff - b.diff) * dir);
      break;
    case 'diff':
      sorted.sort((a, b) => (a.diff - b.diff) * dir);
      break;
    case 'patientCode':
      sorted.sort((a, b) => compareText(a.patientCode, b.patientCode) * dir);
      break;
    case 'name':
      sorted.sort((a, b) => compareText(a.patientName, b.patientName) * dir);
      break;
    case 'phone':
      sorted.sort((a, b) => compareText(a.phone, b.phone) * dir);
      break;
    case 'dob':
      sorted.sort((a, b) => compareText(a.dob, b.dob) * dir);
      break;
    case 'gender':
      sorted.sort((a, b) => compareText(a.gender, b.gender) * dir);
      break;
    case 'address':
      sorted.sort((a, b) => compareText(a.address, b.address) * dir);
      break;
    case 'vaccineAndDose':
      sorted.sort((a, b) => compareText(a.vaccineAndDose, b.vaccineAndDose) * dir);
      break;
    default:
      break;
  }
  return sorted;
}

export function filterReminderRows(rows: ReminderRow[], q: string): ReminderRow[] {
  const query = norm(q);
  if (!query) return rows;
  return rows.filter((item) => {
    const blob = norm(`${item.patientName} ${item.patientCode} ${item.vaccineAndDose} ${item.phone}`);
    return blob.includes(query);
  });
}
