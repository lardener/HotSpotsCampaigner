package com.hotspotscamp.api;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.service.CampaignService;
import com.hotspotscamp.service.RuleConfigurationService;
import com.hotspotscamp.dto.*;
import com.hotspotscamp.util.RulesConstants;
import com.hotspotscamp.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.graphql.test.tester.GraphQlTester;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

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
                new RuleConfigurationService.MissionMetadata(List.of("Raid"), List.of("Defense")),
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
