package com.hotspotscamp.api;

import java.util.UUID;

import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

import com.hotspotscamp.entity.CampaignInvite;
import com.hotspotscamp.entity.User;
import com.hotspotscamp.service.InviteService;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Controller
@RequiredArgsConstructor
public class InviteGraphQLController {

    private final InviteService inviteService;

    @MutationMapping
    public Mono<CampaignInvite> createInvite(@Argument UUID campaignId) {
        return inviteService.generateInvite(campaignId);
    }

    @MutationMapping
    public Mono<User> loginWithInvite(@Argument String token, @Argument String callsign) {
        return inviteService.loginWithToken(token, callsign);
    }
}
