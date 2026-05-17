package com.hotspotscamp.api;

import com.hotspotscamp.entity.Campaign;
import com.hotspotscamp.service.CampaignService;
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
        when(campaignService.getAvailableMissions()).thenReturn(Map.of("primary", List.of("Raid")));
        when(campaignService.getAvailableTrackTypes()).thenReturn(List.of("Assault"));
        when(campaignService.getResolvedStepsTable()).thenReturn(Collections.emptyMap());

        String query = """
            query {
              campaignMetadata {
                missions {
                  primary
                }
                trackTypes
              }
            }
            """;

        graphQlTester.document(query)
                .execute()
                .path("campaignMetadata.missions.primary[0]").entity(String.class).isEqualTo("Raid")
                .path("campaignMetadata.trackTypes[0]").entity(String.class).isEqualTo("Assault");
    }

    @Test
    void previewCampaign_ShouldWorkWithoutAuth() {
        Campaign previewCampaign = Campaign.builder()
                .name("TEST CAMPAIGN")
                .status("PREVIEW")
                .systemName("Terra")
                .trackCount(5)
                .build();

        when(campaignService.generateProposal(any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new CampaignService.CampaignProposal(previewCampaign, Collections.emptyList(), Collections.emptyList()));

        String query = """
            query($input: CampaignInput!) {
              previewCampaign(input: $input) {
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
                .path("previewCampaign.campaign.status").entity(String.class).isEqualTo("PREVIEW");
    }
}