package com.hotspotscamp.api;

import com.hotspotscamp.entity.CampaignInvite;
import com.hotspotscamp.entity.User;
import com.hotspotscamp.service.InviteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/invites")
@RequiredArgsConstructor
public class InviteController {

    private final InviteService inviteService;

    @PostMapping("/campaigns/{campaignId}")
    public Mono<CampaignInvite> createInvite(@PathVariable UUID campaignId) {
        return inviteService.generateInvite(campaignId);
    }

    @PostMapping("/login")
    public Mono<User> login(@RequestParam String token, @RequestParam String callsign) {
        return inviteService.loginWithToken(token, callsign);
    }
}
