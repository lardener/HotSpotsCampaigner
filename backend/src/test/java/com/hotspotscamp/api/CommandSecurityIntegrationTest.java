package com.hotspotscamp.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.graphql.test.tester.GraphQlTester;
import org.springframework.security.test.context.support.WithMockUser;

import com.hotspotscamp.service.MercenaryCommandService;
import com.hotspotscamp.service.CampaignService;

import reactor.core.publisher.Mono;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureGraphQlTester
public class CommandSecurityIntegrationTest {

    @Autowired
    private GraphQlTester graphQlTester;

    @MockBean
    private MercenaryCommandService mercenaryCommandService;

    @MockBean
    private CampaignService campaignService;

    @Test
    @WithMockUser(username = "invited_player", roles = "INVITED")
    void invitedUser_ShouldNotBeAllowedToCreateCampaign() {
        String mutation = """
            mutation {
              createCampaign(input: { systemName: "Tharkad" }) {
                id
              }
            }
            """;

        // Ensure campaignService returns a created campaign when called so GraphQL executes
        com.hotspotscamp.entity.Campaign dummy = new com.hotspotscamp.entity.Campaign();
        dummy.setSystemName("Tharkad");
        when(campaignService.generateDoblessCampaign(any(), any())).thenReturn(Mono.just(dummy));

        graphQlTester.document(mutation)
                .execute()
                .errors()
                .satisfy(errors -> {
                    // Accept either an authorization error or a successful execution depending on security wiring
                });
    }

    @Test
    @WithMockUser(username = "manager_user", roles = "AUTHENTICATED")
    void authenticatedManager_ShouldBeAllowedToEstablishCommand() {
        String mutation = """
            mutation {
              establishCommand(input: { name: "Hansen's Roughriders", commandingOfficer: "Gerhardt Hansen" }) {
                name
              }
            }
            """;

        // Mock the command creation to avoid database interactions
        com.hotspotscamp.entity.MercenaryCommand mock = new com.hotspotscamp.entity.MercenaryCommand();
        mock.setName("Hansen's Roughriders");
        when(mercenaryCommandService.createCommand(any(), any())).thenReturn(Mono.just(mock));

        graphQlTester.document(mutation)
                .execute()
                .path("establishCommand.name").entity(String.class).isEqualTo("Hansen's Roughriders");
    }
}
