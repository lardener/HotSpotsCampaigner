/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
package com.hotspotscamp.service;

import java.util.UUID;
import java.util.function.BiFunction;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.r2dbc.core.RowsFetchSpec;
import org.springframework.transaction.reactive.TransactionalOperator;

import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.repository.MercenaryCommandRepository;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class MercenaryCommandServiceTest {

    @Mock
    private MercenaryCommandRepository commandRepository;
    @Mock
    private DatabaseClient databaseClient;
    @Mock
    private RowsFetchSpec<Number> rowsFetchSpec;
    @Mock
    private TransactionalOperator transactionalOperator;
    @Mock
    private Sinks.Many<MercenaryCommand> commandSink;

    @InjectMocks
    private MercenaryCommandService commandService;

    @Test
    void syncTotalSupportPoints_ShouldAggregateAllEntriesAcrossDetachments() {
        UUID cmdId = UUID.randomUUID();

        MercenaryCommand command = new MercenaryCommand();
        command.setId(cmdId);
        command.setTotalSupportPoints(0);

        when(commandRepository.findById(cmdId)).thenReturn(Mono.just(command));
        when(commandRepository.save(any())).thenAnswer(i -> Mono.just(i.getArgument(0)));
        // Pass-through for the reactive transaction operator wrapping
        org.mockito.Mockito.lenient().when(transactionalOperator.transactional(ArgumentMatchers.<Mono<MercenaryCommand>>any())).thenAnswer(i -> i.getArgument(0));
        // Mock the DatabaseClient SQL path used in syncTotalSupportPoints
        DatabaseClient.GenericExecuteSpec spec = mock(DatabaseClient.GenericExecuteSpec.class);
        when(databaseClient.sql(ArgumentMatchers.<String>any())).thenReturn(spec);
        // Ensure bind/bindNull return the spec so SqlUtils.bindUuid doesn't return null
        org.mockito.Mockito.lenient().when(spec.bind(ArgumentMatchers.anyString(), ArgumentMatchers.any())).thenReturn(spec);
        org.mockito.Mockito.lenient().when(spec.bindNull(ArgumentMatchers.anyString(), ArgumentMatchers.<Class<?>>any())).thenReturn(spec);
        // Provide a properly-typed matcher for the BiFunction used by GenericExecuteSpec.map
        org.mockito.Mockito.lenient().when(spec.map(ArgumentMatchers.<BiFunction<Row, RowMetadata, Number>>any())).thenReturn(rowsFetchSpec);
        org.mockito.Mockito.lenient().when(rowsFetchSpec.one()).thenReturn(Mono.just(1300L));

        StepVerifier.create(commandService.syncTotalSupportPoints(cmdId))
                .expectNextMatches(savedCmd -> savedCmd.getTotalSupportPoints() == 1300)
                .verifyComplete();
    }

    @Test
    void getDetachmentRating_ShouldReturnSumOfLedgerEntriesForCampaign() {
        UUID detId = UUID.randomUUID();
        UUID campaignId = UUID.randomUUID();

        DatabaseClient.GenericExecuteSpec spec = mock(DatabaseClient.GenericExecuteSpec.class);
        when(databaseClient.sql(ArgumentMatchers.<String>any())).thenReturn(spec);
        org.mockito.Mockito.lenient().when(spec.bind(ArgumentMatchers.anyString(), ArgumentMatchers.any())).thenReturn(spec);
        org.mockito.Mockito.lenient().when(spec.bindNull(ArgumentMatchers.anyString(), ArgumentMatchers.<Class<?>>any())).thenReturn(spec);

        org.mockito.Mockito.lenient().when(spec.map(ArgumentMatchers.<BiFunction<Row, RowMetadata, Number>>any())).thenReturn(rowsFetchSpec);
        org.mockito.Mockito.lenient().when(rowsFetchSpec.one()).thenReturn(Mono.just(750L));

        StepVerifier.create(commandService.getDetachmentRating(detId, campaignId))
                .expectNext(750)
                .verifyComplete();
    }
}
