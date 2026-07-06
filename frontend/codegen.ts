import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    schema: '../schema.graphqls',
    documents: ['src/**/*.{ts,tsx}'],
    generates: {
        'src/types/generated.ts': {
            plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
            config: {
                avoidOptionals: false,
                strictScalars: true,
                scalars: {
                    DateTime: 'string',
                    ID: 'string',
                },
            },
        },
    },
    ignoreNoDocuments: true,
};

export default config;
