package com.hotspotscamp.config;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;

/**
 * Central GraphQL exception handler that maps domain/database exceptions to
 * structured GraphQL error responses using Spring's native resolver adapter.
 */
@Component
public class GraphQLExceptionHandler extends DataFetcherExceptionResolverAdapter {

    @Override
    protected GraphQLError resolveToSingleError(Throwable exception, DataFetchingEnvironment env) {
        GraphqlErrorBuilder<?> builder = GraphqlErrorBuilder.newError(env);

        if (exception instanceof DuplicateKeyException) {
            return builder.message("A resource with this identifier already exists.")
                    .errorType(ErrorType.BAD_REQUEST)
                    .build();
        }

        if (exception instanceof ResponseStatusException rse) {
            // Extracts the HTTP status code category or custom message
            return builder.message(rse.getReason() != null ? rse.getReason() : "Request failed")
                    .errorType(ErrorType.BAD_REQUEST)
                    .build();
        }

        if (exception instanceof DataAccessException) {
            return builder.message("A database error occurred while processing the request.")
                    .errorType(ErrorType.INTERNAL_ERROR)
                    .build();
        }

        if (exception instanceof IllegalArgumentException) {
            return builder.message(exception.getMessage() != null ? exception.getMessage() : "Invalid argument provided.")
                    .errorType(ErrorType.BAD_REQUEST)
                    .build();
        }

        if (exception instanceof IllegalStateException) {
            return builder.message(exception.getMessage() != null ? exception.getMessage() : "Request cannot be processed in current state.")
                    .errorType(ErrorType.INTERNAL_ERROR)
                    .build();
        }

        if (exception instanceof RuntimeException) {
            return builder.message("An unexpected error occurred while processing the request.")
                    .errorType(ErrorType.INTERNAL_ERROR)
                    .build();
        }

        // Fallback for checked or other unknown exceptions
        return builder.message("An unexpected error occurred.")
                .errorType(ErrorType.INTERNAL_ERROR)
                .build();
    }
}
