/**
 * Mock stations — PLAN.md §10.1. ~40 stations with a `cluster` field
 * for nearby-station alternate logic (§7.4), and `aliases` for the
 * agent's entity extractor (§7.11.1).
 *
 * QLN/QLM are deliberately seeded as an ambiguous pair — "kollam"
 * matches both — so the agent's disambiguation flow (§7.11.3) has a
 * real case to exercise. Do not disambiguate this away.
 */
import type { Station } from '@/domain/types';

export const stations: Station[] = [
  // Hyderabad cluster
  { code: 'HYB', name: 'Hyderabad Decan', city: 'Hyderabad', state: 'Telangana', cluster: 'HYD', aliases: ['hyderabad', 'hyd', 'hyderabad deccan', 'nampally'] },
  { code: 'SC', name: 'Secunderabad Jn', city: 'Secunderabad', state: 'Telangana', cluster: 'HYD', aliases: ['secunderabad', 'sec', 'secbad'] },
  { code: 'KCG', name: 'Kacheguda', city: 'Hyderabad', state: 'Telangana', cluster: 'HYD', aliases: ['kacheguda'] },

  // Delhi cluster
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi', cluster: 'DEL', aliases: ['delhi', 'new delhi', 'ndls'] },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi', state: 'Delhi', cluster: 'DEL', aliases: ['nizamuddin', 'hazrat nizamuddin', 'nzm'] },
  { code: 'DLI', name: 'Old Delhi', city: 'Delhi', state: 'Delhi', cluster: 'DEL', aliases: ['old delhi', 'delhi junction'] },

  // Chennai cluster
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu', cluster: 'MAA', aliases: ['chennai', 'madras', 'chennai central', 'mas'] },
  { code: 'MS', name: 'Chennai Egmore', city: 'Chennai', state: 'Tamil Nadu', cluster: 'MAA', aliases: ['egmore', 'chennai egmore'] },

  // Kollam cluster — deliberate ambiguity for the agent (§10.1)
  { code: 'QLN', name: 'Kollam Jn', city: 'Kollam', state: 'Kerala', cluster: 'KLM', aliases: ['kollam', 'kollam junction', 'quilon'] },
  { code: 'QLM', name: 'Kollam Town', city: 'Kollam', state: 'Kerala', cluster: 'KLM', aliases: ['kollam town'] },
  { code: 'KYJ', name: 'Kayankulam', city: 'Kayankulam', state: 'Kerala', cluster: 'KLM', aliases: ['kayankulam'] },
  { code: 'TVC', name: 'Trivandrum Central', city: 'Thiruvananthapuram', state: 'Kerala', cluster: 'TVM', aliases: ['trivandrum', 'thiruvananthapuram', 'tvc'] },

  // Other corridor stations used by the seeded trains
  { code: 'PNBE', name: 'Patna Jn', city: 'Patna', state: 'Bihar', cluster: 'PAT', aliases: ['patna', 'pnbe'] },
  { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra', cluster: 'MUM', aliases: ['mumbai', 'mumbai central', 'bombay'] },
  { code: 'CSMT', name: 'Mumbai CSMT', city: 'Mumbai', state: 'Maharashtra', cluster: 'MUM', aliases: ['csmt', 'victoria terminus'] },
  { code: 'ADI', name: 'Ahmedabad Jn', city: 'Ahmedabad', state: 'Gujarat', cluster: 'AMD', aliases: ['ahmedabad', 'adi'] },
  { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru', state: 'Karnataka', cluster: 'BLR', aliases: ['bengaluru', 'bangalore', 'ksr bengaluru', 'sbc'] },
  { code: 'UBL', name: 'Hubballi Jn', city: 'Hubballi', state: 'Karnataka', cluster: 'HBL', aliases: ['hubballi', 'hubli', 'ubl'] },
  { code: 'GDG', name: 'Gadag Jn', city: 'Gadag', state: 'Karnataka', cluster: 'HBL', aliases: ['gadag'] },
  { code: 'BPL', name: 'Bhopal', city: 'Bhopal', state: 'Madhya Pradesh', cluster: 'BPL', aliases: ['bhopal'] },
  { code: 'KZJ', name: 'Kazipet Jn', city: 'Kazipet', state: 'Telangana', cluster: 'KZJ', aliases: ['kazipet'] },
  { code: 'RDM', name: 'Ramagundam', city: 'Ramagundam', state: 'Telangana', cluster: 'RDM', aliases: ['ramagundam'] },
  { code: 'MCI', name: 'Manchiryal', city: 'Manchiryal', state: 'Telangana', cluster: 'MCI', aliases: ['manchiryal', 'manchirial'] },
  { code: 'BPA', name: 'Bellampalli', city: 'Bellampalli', state: 'Telangana', cluster: 'BPA', aliases: ['bellampalli'] },
  { code: 'NGP', name: 'Nagpur', city: 'Nagpur', state: 'Maharashtra', cluster: 'NGP', aliases: ['nagpur'] },
  { code: 'BPQ', name: 'Balharshah', city: 'Balharshah', state: 'Maharashtra', cluster: 'BPQ', aliases: ['balharshah'] },
  { code: 'JBP', name: 'Jabalpur', city: 'Jabalpur', state: 'Madhya Pradesh', cluster: 'JBP', aliases: ['jabalpur'] },
  { code: 'ET', name: 'Itarsi Jn', city: 'Itarsi', state: 'Madhya Pradesh', cluster: 'ET', aliases: ['itarsi'] },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh', cluster: 'AGC', aliases: ['agra', 'agra cantt'] },
  { code: 'GWL', name: 'Gwalior', city: 'Gwalior', state: 'Madhya Pradesh', cluster: 'GWL', aliases: ['gwalior'] },
  { code: 'BZA', name: 'Vijayawada Jn', city: 'Vijayawada', state: 'Andhra Pradesh', cluster: 'BZA', aliases: ['vijayawada'] },
  { code: 'RJY', name: 'Rajahmundry', city: 'Rajahmundry', state: 'Andhra Pradesh', cluster: 'RJY', aliases: ['rajahmundry'] },
  { code: 'VSKP', name: 'Visakhapatnam', city: 'Visakhapatnam', state: 'Andhra Pradesh', cluster: 'VSKP', aliases: ['visakhapatnam', 'vizag'] },
  { code: 'ERS', name: 'Ernakulam Jn', city: 'Kochi', state: 'Kerala', cluster: 'COK', aliases: ['ernakulam', 'kochi', 'cochin'] },
  { code: 'ALLP', name: 'Alappuzha', city: 'Alappuzha', state: 'Kerala', cluster: 'ALLP', aliases: ['alappuzha', 'alleppey'] },
  { code: 'KTYM', name: 'Kottayam', city: 'Kottayam', state: 'Kerala', cluster: 'KTYM', aliases: ['kottayam'] },
  { code: 'CAN', name: 'Kannur', city: 'Kannur', state: 'Kerala', cluster: 'CAN', aliases: ['kannur', 'cannanore'] },
  { code: 'CLT', name: 'Kozhikode', city: 'Kozhikode', state: 'Kerala', cluster: 'CLT', aliases: ['kozhikode', 'calicut'] },
  { code: 'CBE', name: 'Coimbatore Jn', city: 'Coimbatore', state: 'Tamil Nadu', cluster: 'CBE', aliases: ['coimbatore'] },
  { code: 'DVG', name: 'Davangere', city: 'Davangere', state: 'Karnataka', cluster: 'DVG', aliases: ['davangere'] },
];

export function stationByCode(code: string): Station | undefined {
  return stations.find((s) => s.code === code);
}

export function stationsInCluster(cluster: string): Station[] {
  return stations.filter((s) => s.cluster === cluster);
}
