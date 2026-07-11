// Estimated tax savings + contingency fee. NM applies a mill levy to NET
// taxable value, which is 1/3 of full value. These are ESTIMATES for internal
// use and client communication; the binding number is the assessor's final
// certified value and the property's actual tax-district rate.

import { netTaxableValue } from "./nm/law";

export function annualTax(fullValue: number, millRate: number): number {
  return (netTaxableValue(fullValue) / 1000) * millRate;
}

export type SavingsBreakdown = {
  initialValue: number;
  finalValue: number;
  valueReduction: number;
  initialTax: number;
  finalTax: number;
  taxSavings: number;
  feePercent: number;
  fee: number;
  clientNet: number;
};

export function computeSavings(params: {
  initialValue: number;
  finalValue: number;
  millRate: number;
  feePercent: number;
}): SavingsBreakdown {
  const { initialValue, finalValue, millRate, feePercent } = params;
  const initialTax = annualTax(initialValue, millRate);
  const finalTax = annualTax(finalValue, millRate);
  const taxSavings = Math.max(0, initialTax - finalTax);
  const fee = taxSavings * (feePercent / 100);
  return {
    initialValue,
    finalValue,
    valueReduction: Math.max(0, initialValue - finalValue),
    initialTax: round2(initialTax),
    finalTax: round2(finalTax),
    taxSavings: round2(taxSavings),
    feePercent,
    fee: round2(fee),
    clientNet: round2(taxSavings - fee),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatUsd(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  });
}
