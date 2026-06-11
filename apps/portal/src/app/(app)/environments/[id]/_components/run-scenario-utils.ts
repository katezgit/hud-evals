import type {
  Environment,
  EnvVarSpec,
  Scenario,
  ScenarioSchemaEntry,
} from "../_data/types";

export type FieldValue = string | boolean;
export type FieldValues = Record<string, FieldValue>;
export type FieldErrors = Record<string, string | undefined>;

export function computeMissingRequired(
  env: Environment,
  scenario: Scenario,
  storeValues: Record<string, string>,
): ReadonlyArray<EnvVarSpec> {
  const required = env.vars.filter((v) => v.required);
  const scenarioRequires = scenario.requiresVars;
  const relevant =
    scenarioRequires.length > 0
      ? required.filter((spec) => scenarioRequires.includes(spec.key))
      : required;
  return relevant.filter(
    (spec) => (storeValues[spec.key] ?? "").trim() === "",
  );
}

export function seedVarEdits(
  specs: ReadonlyArray<EnvVarSpec>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const spec of specs) out[spec.key] = "";
  return out;
}

export function coerceToString(value: FieldValue | undefined): string {
  if (typeof value === "string") return value;
  if (value === undefined) return "";
  return String(value);
}

export function seedValues(
  schema: ReadonlyArray<ScenarioSchemaEntry>,
): FieldValues {
  const out: FieldValues = {};
  for (const field of schema) {
    if (field.type === "boolean") {
      out[field.key] =
        typeof field.default === "boolean" ? field.default : false;
    } else {
      out[field.key] =
        field.default === undefined ? "" : String(field.default);
    }
  }
  return out;
}

export function validate(
  schema: ReadonlyArray<ScenarioSchemaEntry>,
  values: FieldValues,
): { errors: FieldErrors; firstError: boolean } {
  const errors: FieldErrors = {};
  let firstError = false;
  for (const field of schema) {
    const raw = values[field.key];
    if (field.type === "boolean") continue;
    const str = typeof raw === "string" ? raw.trim() : "";
    if (field.required && str === "") {
      errors[field.key] = "Required";
      firstError = true;
      continue;
    }
    if (field.type === "integer" && str !== "") {
      if (!/^-?\d+$/.test(str)) {
        errors[field.key] = "Must be an integer";
        firstError = true;
      }
    }
  }
  return { errors, firstError };
}
