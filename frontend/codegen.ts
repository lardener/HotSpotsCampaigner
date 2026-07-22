import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: '../schema.graphqls',
  documents: ['src/**/*.{ts,tsx}', '!src/types/generated.ts', 'src/gql/**/*.ts'],
  generates: {
    'src/types/generated.ts': {
      plugins: ['typescript'],
      config: {
        avoidOptionals: true,
        strictScalars: true,
        scalars: {
          DateTime: 'string',
          ID: 'string',
        },
      },
    },
    'src/types/operations.ts': {
      plugins: ['typescript-operations', 'typed-document-node'],
      config: {
        avoidOptionals: true,
        scalars: {
          DateTime: 'string',
          ID: 'string',
        },
      },
    },
  },
  ignoreNoDocuments: true,
}

export default config
