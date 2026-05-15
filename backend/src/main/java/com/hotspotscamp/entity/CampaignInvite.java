package com.hotspotscamp.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("campaign_invites")
public class CampaignInvite {

    @Id
    private UUID id;
    private UUID campaignId;
    private String token; // The secure code shared with the user
    private LocalDateTime expiresAt;
    private boolean used;
}
