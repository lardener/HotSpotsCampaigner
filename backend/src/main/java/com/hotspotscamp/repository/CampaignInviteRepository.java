package com.hotspotscamp.repository;

import com.hotspotscamp.entity.CampaignInvite;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Repository
public interface CampaignInviteRepository extends ReactiveCrudRepository<CampaignInvite, UUID> {

    Mono<CampaignInvite> findByToken(String token);
}
