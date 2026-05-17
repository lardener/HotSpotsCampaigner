package com.hotspotscamp.service;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hotspotscamp.entity.Detachment;
import com.hotspotscamp.entity.LedgerEntry;
import com.hotspotscamp.entity.MercenaryCommand;
import com.hotspotscamp.repository.DetachmentRepository;
import com.hotspotscamp.repository.LedgerEntryRepository;
import com.hotspotscamp.repository.MercenaryCommandRepository;

import reactor.core.publisher.Flux;
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

        when(detachmentRepository.findAllByMercenaryCommandId(cmdId)).thenReturn(Flux.just(det1, det2));
        when(ledgerEntryRepository.findAllByDetachmentId(det1Id)).thenReturn(Flux.just(entry1, entry2));
        when(ledgerEntryRepository.findAllByDetachmentId(det2Id)).thenReturn(Flux.just(entry3));
        when(commandRepository.findById(cmdId)).thenReturn(Mono.just(command));
        when(commandRepository.save(any())).thenAnswer(i -> Mono.just(i.getArgument(0)));

        StepVerifier.create(commandService.syncTotalSupportPoints(cmdId))
                .expectNextMatches(savedCmd -> savedCmd.getTotalSupportPoints() == 1300)
                .verifyComplete();
    }
}
