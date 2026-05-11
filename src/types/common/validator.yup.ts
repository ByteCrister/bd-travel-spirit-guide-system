import * as Yup from 'yup';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function combineSchemas<Schemas extends readonly Yup.ObjectSchema<any, any, any, any>[]>(
  schemas: Schemas
): Yup.ObjectSchema<Yup.InferType<Schemas[number]>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return schemas.reduce((acc, schema) => acc.concat(schema), Yup.object()) as any;
}