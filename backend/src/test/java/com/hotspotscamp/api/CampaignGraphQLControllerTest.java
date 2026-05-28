package com.hotspotscamp.api;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.service.CampaignService;
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
        CampaignService.CampaignMetadata mockMeta = new CampaignService.CampaignMetadata(
                new CampaignService.MissionMetadata(List.of("Raid"), List.of("Defense")),
                List.of("Assault"),
                Collections.emptyList(),
                Collections.emptyList(),
                Collections.emptyList(),
                null,
                RulesConstants.UNIT_TYPES,
                RulesConstants.TECH_BASES,
                RulesConstants.UNIT_STATUS_OPTIONS
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

        when(campaignService.generateProposal(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any(), any(), any(),
                any(), any(), any(), any(), any()))
                .thenReturn(new CampaignService.CampaignProposal(previewCampaign, Collections.emptyList(), Collections.emptyList()));

        String query = """
            query($input: CampaignInput!) {
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
