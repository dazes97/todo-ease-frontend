import { AbstractControl, ValidatorFn } from "@angular/forms";
export function dateRangeValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const startAt = control.get("startAt")?.value;
    const endAt = control.get("endAt")?.value;
    return startAt > endAt || endAt < startAt
      ? { dateRange: true }
      : null;
  };
}
