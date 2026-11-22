import { DesignElement, ElementType } from '../../types';

export const createBaseElement = (
  type: ElementType,
  name: string,
  width: number,
  height: number,
  overrides: Partial<DesignElement> = {}
): DesignElement => ({
  id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
  type,
  name,
  x: 120,
  y: 120,
  width,
  height,
  zIndex: 10,
  ...overrides,
});
