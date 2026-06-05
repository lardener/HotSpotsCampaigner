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

import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.entity.LedgerEntry;
import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.repository.LedgerEntryRepository;
import com.hotspotscamp.repository.MercenaryCommandRepository;

import io.r2dbc.spi.Row;
import io.r2dbc.spi.RowMetadata;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class MercenaryCommandServiceTest {

    @Mock
    private DetachmentRepository detachmentRepository;
    @Mock
    private LedgerEntryRepository ledgerEntryRepository;
    @Mock
    private MercenaryCommandRepository commandRepository;
    @Mock
    private DatabaseClient databaseClient;
    @Mock
    private RowsFetchSpec<Number> rowsFetchSpec;

    @InjectMocks
    private MercenaryCommandService commandService;

    @Test
    void syncTotalSupportPoints_ShouldAggregateAllEntriesAcrossDetachments() {
        UUID cmdId = UUID.randomUUID();
        UUID det1Id = UUID.randomUUID();
        UUID det2Id = UUID.randomUUID();

        Detachment det1 = Detachment.builder().id(det1Id).mercenaryCommandId(cmdId).build();
        Detachment det2 = Detachment.builder().id(det2Id).mercenaryCommandId(cmdId).build();

        LedgerEntry entry1 = LedgerEntry.builder().amount(500).build();
        LedgerEntry entry2 = LedgerEntry.builder().amount(-200).build();
        LedgerEntry entry3 = LedgerEntry.builder().amount(1000).build();

        MercenaryCommand command = MercenaryCommand.builder()
                .id(cmdId)
                .totalSupportPoints(0)
                .build();

        when(commandRepository.findById(cmdId)).thenReturn(Mono.just(command));
        when(commandRepository.save(any())).thenAnswer(i -> Mono.just(i.getArgument(0)));
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
        String campaignName = "Test Campaign";

        DatabaseClient.GenericExecuteSpec spec = mock(DatabaseClient.GenericExecuteSpec.class);
        when(databaseClient.sql(ArgumentMatchers.<String>any())).thenReturn(spec);
        org.mockito.Mockito.lenient().when(spec.bind(ArgumentMatchers.anyString(), ArgumentMatchers.any())).thenReturn(spec);
        org.mockito.Mockito.lenient().when(spec.bindNull(ArgumentMatchers.anyString(), ArgumentMatchers.<Class<?>>any())).thenReturn(spec);
        
        org.mockito.Mockito.lenient().when(spec.map(ArgumentMatchers.<BiFunction<Row, RowMetadata, Number>>any())).thenReturn(rowsFetchSpec);
        org.mockito.Mockito.lenient().when(rowsFetchSpec.one()).thenReturn(Mono.just(750L));

        StepVerifier.create(commandService.getDetachmentRating(detId, campaignName))
                .expectNext(750)
                .verifyComplete();
    }
}
