/**
 * Maharashtra stamp duty + registration math — pure, framework-free.
 *
 * Chargeable value = the HIGHER of the agreement value and the Ready
 * Reckoner (ASR) value. The caller passes that resolved value in.
 *
 * Components modelled:
 *   - Stamp duty   = value × stamp%  (stamp% depends on the local body type;
 *                    a female-buyer rebate may reduce it)
 *   - Metro cess   = value × cess%   (only in the notified metro cities)
 *   - Registration = min(value × reg%, cap)
 *
 * Exact percentages live in /public/data/rates/stamp-duty.json (dated, so
 * a budget change is a data edit, not a code change). This module only does
 * the arithmetic.
 */

export interface StampDutyInput {
  /** Higher of agreement value and Ready Reckoner value, in rupees. */
  value: number;
  /** Base stamp-duty percentage for the selected local-body type. */
  stampPct: number;
  /** Whether the female-buyer rebate applies. */
  female: boolean;
  /** Rebate (percentage points) subtracted from stampPct for female buyers. */
  femaleRebatePct: number;
  /** Whether the property is in a metro-cess city. */
  applyMetroCess: boolean;
  /** Metro cess percentage. */
  metroCessPct: number;
  /** Registration fee percentage. */
  registrationPct: number;
  /** Registration fee cap in rupees. */
  registrationCap: number;
}

export interface StampDutyResult {
  /** Stamp % actually applied (after any female rebate), never below 0. */
  effectiveStampPct: number;
  stampDuty: number;
  metroCess: number;
  registration: number;
  /** stampDuty + metroCess + registration. */
  total: number;
}

export function computeStampDuty(input: StampDutyInput): StampDutyResult {
  const value = Number.isFinite(input.value) && input.value > 0 ? input.value : 0;

  const effectiveStampPct = Math.max(
    0,
    input.stampPct - (input.female ? input.femaleRebatePct : 0),
  );
  const stampDuty = (value * effectiveStampPct) / 100;
  const metroCess = input.applyMetroCess ? (value * input.metroCessPct) / 100 : 0;
  const registration = Math.min(
    (value * input.registrationPct) / 100,
    input.registrationCap,
  );

  return {
    effectiveStampPct,
    stampDuty,
    metroCess,
    registration,
    total: stampDuty + metroCess + registration,
  };
}
