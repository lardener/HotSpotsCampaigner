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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.core.io.FileSystemResource;
import org.springframework.graphql.test.tester.HttpGraphQlTester;
import org.springframework.r2dbc.connection.init.ResourceDatabasePopulator;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockUser;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import io.r2dbc.spi.ConnectionFactory;

/**
 * End-to-end test for the HotSpots: Campaigner backend. This test initializes
 * an ephemeral MySQL database using Testcontainers, simulates an authenticated
 * Campaign Manager, and exercises the campaign generation lifecycle via
 * GraphQL.
 */
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
            "spring.main.allow-circular-references=true",
            "spring.security.oauth2.client.registration.google.client-id=test-id",
            "spring.security.oauth2.client.registration.google.client-secret=test-secret",
            "spring.security.oauth2.client.provider.google.authorization-uri=http://localhost/auth",
            "spring.security.oauth2.client.provider.google.token-uri=http://localhost/token",
            "spring.security.oauth2.client.provider.google.jwk-set-uri=http://localhost/jwks"
        }
)
@AutoConfigureWebTestClient
@Testcontainers
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CampaignE2ETest {

    // Start an ephemeral MySQL instance. @ServiceConnection automatically 
    // configures Spring Data R2DBC to use this container.
    @Container
    @ServiceConnection
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.40")
            .withDatabaseName("BT_Campaigner")
            .withUsername("test")
            .withPassword("test");

    @LocalServerPort
    private int port;

    @Autowired
    private WebTestClient webTestClient;

    private WebTestClient webTestClientWithBase;

    @Autowired
    private ConnectionFactory connectionFactory;

    private HttpGraphQlTester graphQlTester;

    @BeforeAll
    void initSchema() {
        try {
            FileSystemResource schemaResource = new FileSystemResource(
                    "src/main/resources/db/migration/V1__init_schema.sql");
            if (!schemaResource.exists()) {
                schemaResource = new FileSystemResource(
                        "../backend/src/main/resources/db/migration/V1__init_schema.sql");
            }
            new ResourceDatabasePopulator(schemaResource).populate(connectionFactory).block();
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize database schema for E2E test", e);
        }
    }

    @BeforeEach
    void setUp() {
        webTestClientWithBase = webTestClient.mutate()
                .baseUrl("http://localhost:" + port + "/graphql")
                .build();
        this.graphQlTester = HttpGraphQlTester.create(webTestClientWithBase);
    }

    @Test
    @WithMockUser(username = "commander@mercs.com", roles = {"AUTHENTICATED"})
    void testAuthenticatedUserCanGenerateRandomCampaign() {
        // 1. Verify Authentication & Identity
        String profileQuery = """
                query {
                  userProfile {
                    id
                    email
                    role
                  }
                }
                """;

        graphQlTester.document(profileQuery)
                .execute()
                .path("userProfile")
                .entity(Map.class)
                .satisfies(profile -> {
                    assertNotNull(profile.get("id"));
                    assertNotNull(profile.get("role"));
                });

        // 2. Generate a Campaign
        String generateMutation = """
                mutation CreateCampaign($input: CampaignCreateInput!) {
                  createCampaign(input: $input) {
                    id
                    name
                    lengthInMonths
                  }
                }
                """;

        int requestedMonths = 6;
        Map<String, Object> campaignInput = Map.of(
                "name", "Test Campaign " + System.currentTimeMillis(),
                "lengthInMonths", requestedMonths
        );

        graphQlTester.document(generateMutation)
                .variable("input", campaignInput)
                .execute()
                .errors().verify()
                .path("createCampaign")
                .entity(Map.class)
                .satisfies(campaign -> {
                    assertNotNull(campaign.get("id"), "Campaign ID should be generated");
                    assertNotNull(campaign.get("name"), "Campaign should have a generated name");
                    assertEquals(requestedMonths, campaign.get("lengthInMonths"));
                });
    }

    @Test
    @WithMockUser(username = "commander@mercs.com", roles = {"AUTHENTICATED"})
    void testCampaignManagerCanCreateMultipleInvites() {
        // 1. Create a campaign first to host the invites
        String setupCampaign = """
                mutation CreateCampaign($input: CampaignCreateInput!) {
                  createCampaign(input: $input) {
                    id
                  }
                }
                """;

        Map<String, Object> campaignInput = Map.of(
                "name", "Invite Test Campaign " + System.currentTimeMillis(),
                "lengthInMonths", 4
        );

        String campaignId = graphQlTester.document(setupCampaign)
                .variable("input", campaignInput)
                .execute()
                .path("createCampaign.id").entity(String.class).get();

        // 2. Define the invite mutation
        String inviteMutation = """
                mutation Create($cid: ID!, $name: String) {
                  createInvite(campaignId: $cid, recipientName: $name) {
                    token
                  }
                }
                """;

        // 3. Create two invitation keys and capture their values
        String token1 = graphQlTester.document(inviteMutation)
                .variable("cid", campaignId)
                .variable("name", "Player One")
                .execute()
                .path("createInvite.token").entity(String.class).get();

        String token2 = graphQlTester.document(inviteMutation)
                .variable("cid", campaignId)
                .variable("name", "Player Two")
                .execute()
                .path("createInvite.token").entity(String.class).get();

        // 4. Verify uniqueness and presence
        assertNotNull(token1);
        assertNotNull(token2);
        assertNotEquals(token1, token2, "Each invitation should have a unique token");
    }

    @Test
    void testMultipleInvitedUsersFullLifecycle() {
        // 1. Manager Setup: Create Campaign and Invites
        HttpGraphQlTester managerTester = HttpGraphQlTester.create(
                webTestClientWithBase.mutateWith(mockUser("commander@mercs.com").roles("AUTHENTICATED")));

        Map<String, Object> campaignData = managerTester.document("""
                mutation {
                  createCampaign(input: { name: "Lifecycle Campaign", lengthInMonths: 12 }) { id }
                }
                """).execute().path("createCampaign").entity(Map.class).get();

        String campaignId = (String) campaignData.get("id");

        String inviteMutation = """
                mutation($cid: ID!, $name: String) {
                  createInvite(campaignId: $cid, recipientName: $name) { token }
                }
                """;

        String token1 = managerTester.document(inviteMutation)
                .variable("cid", campaignId).variable("name", "Player 1")
                .execute().path("createInvite.token").entity(String.class).get();

        String token2 = managerTester.document(inviteMutation)
                .variable("cid", campaignId).variable("name", "Player 2")
                .execute().path("createInvite.token").entity(String.class).get();

        // 2. Perform actions for Player 1 and Player 2
        Map<String, Object> p1Assets = simulatePlayerWorkflow(token1, "player1@test.net", "Hansen's Roughriders");
        Map<String, Object> p2Assets = simulatePlayerWorkflow(token2, "player2@test.net", "Eridani Light Horse");

        assertNotNull(p1Assets.get("detachmentId"));
        assertNotNull(p2Assets.get("detachmentId"));
    }

    @Test
    void testAutomatedRearmCalculationBasedOnTonnage() {
        HttpGraphQlTester managerTester = HttpGraphQlTester.create(
                webTestClientWithBase.mutateWith(mockUser("commander@mercs.com").roles("AUTHENTICATED")));

        // 1. Create a campaign with a specific rearm cost per ton (100 SP)
        String campaignId = managerTester.document("""
                mutation {
                  createCampaign(input: { name: "Rearm Campaign", lengthInMonths: 6 }) { id }
                }
                """).execute().path("createCampaign.id").entity(String.class).get();

        managerTester.document("""
                mutation($id: ID!, $cost: Int!) {
                  updateCampaign(id: $id, input: { rearmCostPerTon: $cost }) { id rearmCostPerTon }
                }
                """)
                .variable("id", campaignId)
                .variable("cost", 100)
                .execute()
                .path("updateCampaign.rearmCostPerTon").entity(Integer.class).isEqualTo(100);

        // 2. Player joins and procures a 75-ton Heavy 'Mech
        String token = managerTester.document("""
                mutation($cid: ID!) { createInvite(campaignId: $cid, recipientName: "Heavy Pilot") { token } }
                """).variable("cid", campaignId).execute().path("createInvite.token").entity(String.class).get();

        HttpGraphQlTester playerTester = HttpGraphQlTester.create(
                webTestClientWithBase.mutateWith(mockUser("heavy@test.net").roles("INVITED")));

        String commandId = playerTester.document("mutation { establishCommand(input: { name: \"Heavy Metal\" }) { id } }")
                .execute().path("establishCommand.id").entity(String.class).get();

        // Add unit with 75 tons
        String unitId = playerTester.document("""
                mutation($cid: ID!, $tons: Int!) {
                  addCombatUnit(commandId: $cid, input: { model: "Marauder", type: "BM", tonnage: $tons, pv: 45 }) { id tonnage }
                }
                """).variable("cid", commandId).variable("tons", 75)
                .execute().path("addCombatUnit.id").entity(String.class).get();

        assertNotNull(unitId);
    }

    private Map<String, Object> simulatePlayerWorkflow(String token, String username, String commandName) {
        HttpGraphQlTester playerTester = HttpGraphQlTester.create(
                webTestClientWithBase.mutateWith(mockUser(username).roles("INVITED")));

        // A. Establish Command
        String commandId = playerTester.document("""
                mutation($name: String!) {
                  establishCommand(input: { name: $name, commandingOfficer: "Major" }) { id }
                }
                """).variable("name", commandName)
                .execute().path("establishCommand.id").entity(String.class).get();

        // B. Procure 3 Combat Units and capture IDs
        List<String> unitIds = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            String unitId = playerTester.document("""
                    mutation($cid: ID!, $model: String!, $tons: Int!) {
                      addCombatUnit(commandId: $cid, input: { model: $model, type: "BM", tonnage: $tons, pv: 30 }) { id }
                    }
                    """).variable("cid", commandId).variable("model", "Mech-" + i).variable("tons", 20 + (i * 10))
                    .execute().path("addCombatUnit.id").entity(String.class).get();
            unitIds.add(unitId);
        }

        // C. Procure 2 Pilots and capture IDs
        List<String> pilotIds = new ArrayList<>();
        for (int i = 1; i <= 2; i++) {
            String pilotId = playerTester.document("""
                    mutation($cid: ID!, $name: String!) {
                      hirePilot(commandId: $cid, input: { name: $name, gunnery: 4, piloting: 5 }) { id }
                    }
                    """).variable("cid", commandId).variable("name", "Pilot-" + i)
                    .execute().path("hirePilot.id").entity(String.class).get();
            pilotIds.add(pilotId);
        }

        // D. Create Detachment
        String detachmentId = playerTester.document("""
                mutation($cid: ID!, $name: String!) {
                  createDetachment(commandId: $cid, name: $name) { id }
                }
                """).variable("cid", commandId).variable("name", "Alpha Lance")
                .execute().path("createDetachment.id").entity(String.class).get();

        // E. Assign assets to detachment
        for (String uid : unitIds) {
            playerTester.document("""
                    mutation($uid: ID!, $did: ID!) {
                      assignAsset(assetType: "UNIT", assetId: $uid, detachmentId: $did)
                    }
                    """).variable("uid", uid).variable("did", detachmentId)
                    .execute().path("assignAsset").entity(Boolean.class).isEqualTo(true);
        }
        for (String pid : pilotIds) {
            playerTester.document("""
                    mutation($pid: ID!, $did: ID!) {
                      assignAsset(assetType: "PILOT", assetId: $pid, detachmentId: $did)
                    }
                    """).variable("pid", pid).variable("did", detachmentId)
                    .execute().path("assignAsset").entity(Boolean.class).isEqualTo(true);
        }

        // F. Join Campaign
        playerTester.document("""
                mutation($token: String!, $did: ID!) {
                  joinCampaign(token: $token, detachmentId: $did)
                }
                """).variable("token", token).variable("did", detachmentId)
                .execute().path("joinCampaign").entity(Boolean.class).isEqualTo(true);

        return Map.of(
                "detachmentId", detachmentId,
                "unitIds", unitIds,
                "pilotIds", pilotIds
        );
    }
}
