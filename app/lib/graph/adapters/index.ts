import type { GraphInputData, GraphVisualConfig } from "../types";

export interface GraphDataAdapter<TRaw = unknown> {
  transform(raw: TRaw): GraphInputData;
  defaultConfig(): GraphVisualConfig;
}

const adapters: Record<string, () => GraphDataAdapter> = {};

export function registerAdapter(key: string, factory: () => GraphDataAdapter) {
  adapters[key] = factory;
}

export function getAdapter(key: string): GraphDataAdapter {
  const factory = adapters[key];
  if (!factory)
    throw new Error(
      `Adapter "${key}" not registered. Available: ${Object.keys(adapters).join(", ")}`
    );
  return factory();
}
