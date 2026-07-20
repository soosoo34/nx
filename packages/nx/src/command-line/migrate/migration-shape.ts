// `factory` is the legacy Angular schematics field; it counts as a
// deterministic half exactly like `implementation`.
interface MigrationShape {
  prompt?: string;
  implementation?: string;
  factory?: string;
}

/** A migration entry as written into the plan (migrations.json). */
export interface PlannedMigration extends MigrationShape {
  package: string;
  name: string;
  version: string;
  description?: string;
  documentation?: string;
}

function hasDeterministicImplementation(m: MigrationShape): boolean {
  return !!(m.implementation || m.factory);
}

export function isPromptOnlyMigration(m: MigrationShape): boolean {
  return !!m.prompt && !hasDeterministicImplementation(m);
}

export function isHybridMigration(m: MigrationShape): boolean {
  return !!m.prompt && hasDeterministicImplementation(m);
}
