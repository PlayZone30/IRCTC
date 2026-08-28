/**
 * Demo accounts — PLAN.md §10.4. Three accounts, one click to sign in
 * (S1's demo access bar). Each demonstrates a different rule path.
 */
import type { Account, Passenger } from '@/domain/types';

const priyaPassengers: Passenger[] = [
  { id: 'p-priya-self', name: 'Priya Menon', age: 34, gender: 'F', country: 'India', berthPreference: 'lower', isAadhaarLinked: true },
  { id: 'p-priya-mother', name: 'Lakshmi Menon', age: 67, gender: 'F', country: 'India', berthPreference: 'lower', isAadhaarLinked: true },
  { id: 'p-priya-brother', name: 'Arjun Menon', age: 29, gender: 'M', country: 'India', concession: 'divyangjan', isAadhaarLinked: true },
];

const rameshPassengers: Passenger[] = [
  { id: 'p-ramesh-self', name: 'Ramesh Iyer', age: 63, gender: 'M', country: 'India', berthPreference: 'lower', isAadhaarLinked: true },
];

export const accounts: Record<'priya' | 'ramesh' | 'guest', Account> = {
  priya: {
    id: 'priya',
    name: 'Priya Menon',
    age: 34,
    gender: 'F',
    aadhaarVerified: true,
    savedPassengers: priyaPassengers,
    mobileMasked: '+91 98••••••94',
    emailMasked: 'pr•••••@gmail.com',
  },
  ramesh: {
    id: 'ramesh',
    name: 'Ramesh Iyer',
    age: 63,
    gender: 'M',
    aadhaarVerified: true,
    savedPassengers: rameshPassengers,
    mobileMasked: '+91 90••••••12',
    emailMasked: 'ra•••••@yahoo.com',
  },
  guest: {
    id: 'guest',
    name: 'Guest',
    age: 30,
    gender: 'M',
    aadhaarVerified: false,
    savedPassengers: [],
    mobileMasked: '',
    emailMasked: '',
  },
};

export function accountById(id: string): Account | undefined {
  return Object.values(accounts).find((a) => a.id === id);
}
