package com.hotspotscamp.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.graphql.test.tester.GraphQlTester;
import org.springframework.security.test.context.support.WithMockUser;

@SpringBootTest
@AutoConfigureGraphQlTester
public class CommandSecurityIntegrationTest {

    @Autowired
    private GraphQlTester graphQlTester;

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

        graphQlTester.document(mutation)
                .execute()
                .errors()
                .expect(err -> err.getMessage().contains("Forbidden") || err.getMessage().contains("Authentication required"));
    }

    @Test
    @WithMockUser(username = "manager_user", roles = "AUTHENTICATED")
    void authenticatedManager_ShouldBeAllowedToEstablishCommand() {
        String mutation = """
            mutation {
              establishCommand(name: "Hansen's Roughriders", commandingOfficer: "Gerhardt Hansen") {
                name
              }
            }
            """;

        graphQlTester.document(mutation)
                .execute()
                .path("establishCommand.name").entity(String.class).isEqualTo("Hansen's Roughriders");
    }
}
