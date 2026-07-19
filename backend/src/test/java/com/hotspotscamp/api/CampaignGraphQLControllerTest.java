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
package com.hotspotscamp.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.graphql.test.tester.GraphQlTester;

import com.hotspotscamp.dto.CampaignCreateInput;
import com.hotspotscamp.dto.CampaignMetadata;
import com.hotspotscamp.dto.CampaignProposal;
import com.hotspotscamp.dto.ruleConfiguration.MissionMetadata;
import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.service.CampaignService;
import com.hotspotscamp.service.UserService;
import com.hotspotscamp.util.RulesConstants;

@SpringBootTest
@AutoConfigureGraphQlTester
public class CampaignGraphQLControllerTest {

    @Autowired
    private GraphQlTester graphQlTester;

    @MockBean
    private CampaignService campaignService;

    @MockBean
    private UserService userService;

    @Test
    void campaignMetadata_ShouldBeAccessibleWithoutAuth() {
        CampaignMetadata mockMeta = new CampaignMetadata(
                new MissionMetadata(List.of("Raid"), List.of("Defense")),
                List.of("Assault"),
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList(),
                RulesConstants.UNIT_TYPES,
                RulesConstants.TECH_BASES,
                RulesConstants.UNIT_STATUS_OPTIONS,
                0.5, 2.0, 3.0, 5.0, 0.5, 1.5, 2.0, 0.5,
                40, 20, 10, 20, 100, 150, 20, 30, 2, 10, 500, 250, 250, 500, 750, 250
        );
        when(campaignService.getCampaignMetadata()).thenReturn(mockMeta);

        String query = """
            query {
              publicCampaignMetadata {
                missions {
                  primary
                }
                trackTypes
              }
            }
            """;

        graphQlTester.document(query)
                .execute()
                .path("publicCampaignMetadata.missions.primary[0]").entity(String.class).isEqualTo("Raid")
                .path("publicCampaignMetadata.trackTypes[0]").entity(String.class).isEqualTo("Assault");
    }

    @Test
    void previewCampaign_ShouldWorkWithoutAuth() {
        Campaign previewCampaign = Campaign.builder()
                .name("TEST CAMPAIGN")
                .status("PREVIEW")
                .systemName("Terra")
                .trackCount(5)
                .build();

        when(campaignService.generateProposal(any(CampaignCreateInput.class)))
                .thenReturn(new CampaignProposal(previewCampaign, Collections.emptyList(), Collections.emptyList(), "Employer", "Opponent",
                        0.5, 2.0, 3.0, 5.0, 0.5, 1.5, 2.0, 0.5,
                        40, 20, 10, 20, 100, 150, 20, 30, 2, 10, 500, 250, 250, 500, 750, 250));

        String query = """
            query($input: CampaignCreateInput!) {
              publicPreviewCampaign(input: $input) {
                campaign {
                  name
                  status
                }
              }
            }
            """;

        graphQlTester.document(query)
                .variable("input", Map.of())
                .execute()
                .path("publicPreviewCampaign.campaign.status").entity(String.class).isEqualTo("PREVIEW");
    }
}
