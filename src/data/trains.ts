/**
 * Mock trains — PLAN.md §10.2. Eight trains on genuinely congested
 * corridors, using real numbers and names for recognition. Each
 * carries a halt list and a rake composition built from the realistic
 * template in §10.2 (first Amrit Bharat 3.0 rake: 22 coaches).
 */
import type { Coach, RunningDay, Train } from '@/domain/types';

const ALL_DAYS: RunningDay[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Standard 22-coach rake per PLAN.md §10.2's Amrit Bharat 3.0
 * reference: 6x3A, 2x2A, 1x1A, 6xSL, 4xGeneral, pantry, power car,
 * Divyangjan-cum-guard brake van. General/pantry/power/brake coaches
 * are omitted from the inventory model (unreserved, not booked here)
 * but the reserved coach IDs follow the stated convention.
 */
function standardRake(): Coach[] {
  const coaches: Coach[] = [];
  coaches.push({ id: 'H1', classCode: '1A', capacity: 24 });
  for (let i = 1; i <= 2; i++) coaches.push({ id: `A${i}`, classCode: '2A', capacity: 46 });
  for (let i = 1; i <= 6; i++) coaches.push({ id: `B${i}`, classCode: '3A', capacity: 72 });
  for (let i = 1; i <= 6; i++) coaches.push({ id: `S${i}`, classCode: 'SL', capacity: 72 });
  return coaches;
}

function chairCarRake(): Coach[] {
  const coaches: Coach[] = [];
  for (let i = 1; i <= 2; i++) coaches.push({ id: `EC${i}`, classCode: 'EC', capacity: 52 });
  for (let i = 1; i <= 8; i++) coaches.push({ id: `C${i}`, classCode: 'CC', capacity: 78 });
  return coaches;
}

export const trains: Train[] = [
  {
    number: '12723',
    name: 'Telangana SF Express',
    type: 'SF Express',
    runsOn: ALL_DAYS,
    coaches: standardRake(),
    halts: [
      { stationCode: 'HYB', arrival: null, departure: '06:00', day: 1, distanceKm: 0 },
      { stationCode: 'SC', arrival: '06:25', departure: '06:30', day: 1, distanceKm: 11 },
      { stationCode: 'KZJ', arrival: '07:53', departure: '07:55', day: 1, distanceKm: 143 },
      { stationCode: 'RDM', arrival: '09:29', departure: '09:30', day: 1, distanceKm: 251 },
      { stationCode: 'MCI', arrival: '09:45', departure: '09:46', day: 1, distanceKm: 271 },
      { stationCode: 'BPA', arrival: '10:04', departure: '10:05', day: 1, distanceKm: 301 },
      { stationCode: 'NGP', arrival: '15:10', departure: '15:20', day: 1, distanceKm: 578 },
      { stationCode: 'BPL', arrival: '20:35', departure: '20:45', day: 1, distanceKm: 890 },
      { stationCode: 'AGC', arrival: '05:10', departure: '05:12', day: 2, distanceKm: 1420 },
      { stationCode: 'NDLS', arrival: '08:00', departure: null, day: 2, distanceKm: 1567 },
    ],
  },
  {
    number: '22691',
    name: 'Rajdhani Express',
    type: 'Rajdhani',
    runsOn: ['Mon', 'Wed', 'Fri', 'Sun'],
    coaches: [
      { id: 'H1', classCode: '1A', capacity: 24 },
      { id: 'A1', classCode: '2A', capacity: 46 },
      { id: 'A2', classCode: '2A', capacity: 46 },
      { id: 'B1', classCode: '3A', capacity: 72 },
      { id: 'B2', classCode: '3A', capacity: 72 },
      { id: 'B3', classCode: '3A', capacity: 72 },
      { id: 'B4', classCode: '3A', capacity: 72 },
    ],
    halts: [
      { stationCode: 'SC', arrival: null, departure: '07:10', day: 1, distanceKm: 0 },
      { stationCode: 'NGP', arrival: '13:40', departure: '13:50', day: 1, distanceKm: 578 },
      { stationCode: 'BPL', arrival: '18:20', departure: '18:30', day: 1, distanceKm: 890 },
      { stationCode: 'AGC', arrival: '03:55', departure: '03:57', day: 2, distanceKm: 1420 },
      { stationCode: 'NZM', arrival: '05:30', departure: null, day: 2, distanceKm: 1550 },
    ],
  },
  {
    number: '12649',
    name: 'Sampark Kranti Express',
    type: 'SF Express',
    runsOn: ['Mon', 'Tue', 'Thu', 'Fri', 'Sat'],
    coaches: standardRake(),
    halts: [
      { stationCode: 'KCG', arrival: null, departure: '08:15', day: 1, distanceKm: 0 },
      { stationCode: 'KZJ', arrival: '09:40', departure: '09:42', day: 1, distanceKm: 132 },
      { stationCode: 'NGP', arrival: '16:30', departure: '16:40', day: 1, distanceKm: 590 },
      { stationCode: 'JBP', arrival: '20:15', departure: '20:20', day: 1, distanceKm: 780 },
      { stationCode: 'GWL', arrival: '03:30', departure: '03:32', day: 2, distanceKm: 1280 },
      { stationCode: 'NZM', arrival: '23:55', departure: null, day: 1, distanceKm: 1590 },
    ],
  },
  {
    number: '12285',
    name: 'Secunderabad Nizamuddin Duronto',
    type: 'Duronto',
    runsOn: ['Tue', 'Thu', 'Sat'],
    coaches: [...standardRake(), { id: 'D1', classCode: '2S', capacity: 108 }],
    halts: [
      { stationCode: 'SC', arrival: null, departure: '12:50', day: 1, distanceKm: 0 },
      { stationCode: 'NGP', arrival: '19:35', departure: '19:45', day: 1, distanceKm: 578 },
      { stationCode: 'BPL', arrival: '00:25', departure: '00:35', day: 2, distanceKm: 890 },
      { stationCode: 'AGC', arrival: '08:40', departure: '08:42', day: 2, distanceKm: 1420 },
      { stationCode: 'NZM', arrival: '10:40', departure: null, day: 2, distanceKm: 1550 },
    ],
  },
  {
    number: '12721',
    name: 'Dakshin Express',
    type: 'SF Express',
    runsOn: ALL_DAYS,
    coaches: standardRake(),
    halts: [
      { stationCode: 'HYB', arrival: null, departure: '23:00', day: 1, distanceKm: 0 },
      { stationCode: 'SC', arrival: '23:25', departure: '23:30', day: 1, distanceKm: 11 },
      { stationCode: 'NGP', arrival: '08:15', departure: '08:25', day: 2, distanceKm: 578 },
      { stationCode: 'BPL', arrival: '13:35', departure: '13:45', day: 2, distanceKm: 890 },
      { stationCode: 'JBP', arrival: '16:20', departure: '16:25', day: 2, distanceKm: 1010 },
      { stationCode: 'NZM', arrival: '03:45', departure: null, day: 3, distanceKm: 1620 },
    ],
  },
  {
    // The hero case — PLAN.md §10.3: sold out from Kayankulam, confirmed
    // from Kollam Jn. Deliberately routes through the QLN/KYJ/MAS
    // corridor so the "board earlier" alternate generator (§7.4) has
    // real inventory to exploit.
    number: '12624',
    name: 'Chennai Mail',
    type: 'Mail',
    runsOn: ALL_DAYS,
    coaches: standardRake(),
    halts: [
      { stationCode: 'TVC', arrival: null, departure: '19:15', day: 1, distanceKm: 0 },
      { stationCode: 'QLN', arrival: '20:05', departure: '20:07', day: 1, distanceKm: 65 },
      { stationCode: 'KYJ', arrival: '20:35', departure: '20:37', day: 1, distanceKm: 100 },
      { stationCode: 'ALLP', arrival: '21:20', departure: '21:22', day: 1, distanceKm: 155 },
      { stationCode: 'KTYM', arrival: '21:50', departure: '21:52', day: 1, distanceKm: 190 },
      { stationCode: 'ERS', arrival: '22:40', departure: '22:45', day: 1, distanceKm: 225 },
      { stationCode: 'CBE', arrival: '02:30', departure: '02:35', day: 2, distanceKm: 460 },
      { stationCode: 'MAS', arrival: '08:20', departure: null, day: 2, distanceKm: 720 },
    ],
  },
  {
    number: '20635',
    name: 'Vande Bharat Express',
    type: 'Vande Bharat',
    runsOn: ALL_DAYS,
    coaches: chairCarRake(),
    halts: [
      { stationCode: 'SBC', arrival: null, departure: '06:00', day: 1, distanceKm: 0 },
      { stationCode: 'DVG', arrival: '08:35', departure: '08:37', day: 1, distanceKm: 265 },
      { stationCode: 'UBL', arrival: '10:15', departure: null, day: 1, distanceKm: 410 },
    ],
  },
  {
    number: '12951',
    name: 'Mumbai Rajdhani',
    type: 'Rajdhani',
    runsOn: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sun'],
    coaches: [
      { id: 'H1', classCode: '1A', capacity: 24 },
      { id: 'A1', classCode: '2A', capacity: 46 },
      { id: 'A2', classCode: '2A', capacity: 46 },
      { id: 'A3', classCode: '2A', capacity: 46 },
      { id: 'B1', classCode: '3A', capacity: 72 },
      { id: 'B2', classCode: '3A', capacity: 72 },
      { id: 'B3', classCode: '3A', capacity: 72 },
      { id: 'B4', classCode: '3A', capacity: 72 },
      { id: 'B5', classCode: '3A', capacity: 72 },
    ],
    halts: [
      { stationCode: 'BCT', arrival: null, departure: '17:00', day: 1, distanceKm: 0 },
      { stationCode: 'BPL', arrival: '01:45', departure: '01:55', day: 2, distanceKm: 837 },
      { stationCode: 'AGC', arrival: '07:05', departure: '07:07', day: 2, distanceKm: 1300 },
      { stationCode: 'NDLS', arrival: '09:35', departure: null, day: 2, distanceKm: 1384 },
    ],
  },
];

export function trainByNumber(number: string): Train | undefined {
  return trains.find((t) => t.number === number);
}
