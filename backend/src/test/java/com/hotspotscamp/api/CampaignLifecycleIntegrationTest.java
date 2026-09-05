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

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient;
import org.springframework.graphql.test.tester.HttpGraphQlTester;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockUser;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Integration test for the HotSpots: Campaigner backend. This test spins up an
 * ephemeral MySQL database using Testcontainers (migrations are applied at
 * startup by FlywayConfig via @ServiceConnection), and exercises the full
 * campaign lifecycle — campaign creation, command establishment, detachment,
 * invite, join, and read-back — via GraphQL.
 */
@SpringBootTest(
        properties = {
            "spring.main.allow-circular-references=true",
            "spring.security.oauth2.client.registration.auth0.client-id=test-id",
            "spring.security.oauth2.client.registration.auth0.client-secret=test-secret",
            "spring.security.oauth2.client.provider.auth0.authorization-uri=https://test-tenant.us.auth0.com/authorize",
            "spring.security.oauth2.client.provider.auth0.token-uri=https://test-tenant.us.auth0.com/oauth/token",
            "spring.security.oauth2.client.provider.auth0.user-info-uri=https://test-tenant.us.auth0.com/userinfo"
        }
)
@AutoConfigureWebTestClient
@Testcontainers
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CampaignLifecycleIntegrationTest {

    // Start an ephemeral MySQL instance. @ServiceConnection automatically
    // configures both the R2DBC connection and the JDBC datasource, so that
    // FlywayConfig runs the migrations at startup.
    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.40")
            .withDatabaseName("BT_Campaigner")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private WebTestClient webTestClient;

    private HttpGraphQlTester graphQlTester;

    @BeforeEach
    void setUp() {
        WebTestClient webTestClientWithBase = webTestClient.mutate()
                .baseUrl("/graphql")
                .build();
        this.graphQlTester = HttpGraphQlTester.create(
                webTestClientWithBase.mutateWith(mockUser("manager_user").roles("AUTHENTICATED")));
    }

    @Test
    @WithMockUser(username = "manager_user", roles = "AUTHENTICATED")
    void fullCampaignLifecycle_canCreateCampaignInviteAndAttachDetachment() {
        String createCampaignMutation = """
                mutation($input: CampaignCreateInput!) {
                  createCampaign(input: $input) {
                    id
                    systemName
                  }
                }
                """;

        Map<String, Object> campaignInput = Map.of(
                "systemName", "Arcadia",
                "name", "Arcadia Skirmish"
        );

        String campaignId = graphQlTester.document(createCampaignMutation)
                .variable("input", campaignInput)
                .execute()
                .path("createCampaign.id").entity(String.class).get();

        String createCommandMutation = """
                mutation($input: CommandUpdateInput!) {
                  establishCommand(input: $input) {
                    id
                    name
                  }
                }
                """;

        Map<String, Object> commandInput = Map.of(
                "name", "Hansen's Roughriders",
                "commandingOfficer", "Gerhardt Hansen"
        );

        String commandId = graphQlTester.document(createCommandMutation)
                .variable("input", commandInput)
                .execute()
                .path("establishCommand.id").entity(String.class).get();

        String createDetachmentMutation = """
                mutation($commandId: ID!, $name: String!) {
                  createDetachment(commandId: $commandId, name: $name) {
                    id
                    name
                  }
                }
                """;

        String detachmentId = graphQlTester.document(createDetachmentMutation)
                .variable("commandId", commandId)
                .variable("name", "First Detachment")
                .execute()
                .path("createDetachment.id").entity(String.class).get();

        String inviteMutation = """
                mutation($campaignId: ID!, $recipientName: String) {
                  createInvite(campaignId: $campaignId, recipientName: $recipientName) {
                    id
                    token
                    recipientName
                  }
                }
                """;

        String inviteToken = graphQlTester.document(inviteMutation)
                .variable("campaignId", campaignId)
                .variable("recipientName", "Invitee A")
                .execute()
                .path("createInvite.token").entity(String.class).get();

        String joinCampaignMutation = """
                mutation($token: String!, $detachmentId: ID!) {
                  joinCampaign(token: $token, detachmentId: $detachmentId)
                }
                """;

        graphQlTester.document(joinCampaignMutation)
                .variable("token", inviteToken)
                .variable("detachmentId", detachmentId)
                .execute()
                .path("joinCampaign").entity(Boolean.class).isEqualTo(true);

        String campaignQuery = """
                query($id: ID!) {
                  getCampaign(id: $id) {
                    id
                    campaignInvites {
                      recipientName
                    }
                    participatingDetachments {
                      id
                      name
                    }
                  }
                }
                """;

        graphQlTester.document(campaignQuery)
                .variable("id", campaignId)
                .execute()
                .path("getCampaign.campaignInvites[0].recipientName").entity(String.class).isEqualTo("Invitee A")
                .path("getCampaign.participatingDetachments[0].id").entity(String.class).isEqualTo(detachmentId);
    }
}
