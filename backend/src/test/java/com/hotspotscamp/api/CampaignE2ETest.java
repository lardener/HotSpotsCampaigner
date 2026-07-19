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

    @Autowired
    private WebTestClient webTestClient;

    @Autowired
    private ConnectionFactory connectionFactory;

    private HttpGraphQlTester graphQlTester;

    @BeforeAll
    void initSchema() {
        // Initialize schema from the Flyway migration (single source of truth) once for the class
        try {
            // Try both potential paths for the migration depending on test execution context
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
        // Re-create the tester for each test to ensure a clean WebTestClient state
        this.graphQlTester = HttpGraphQlTester.create(webTestClient);
    }

    @Test
    @WithMockUser(username = "commander@mercs.com", roles = {"AUTHENTICATED"})
    void testAuthenticatedUserCanGenerateRandomCampaign() {
        // 1. Verify Authentication & Identity
        // This simulates a "login" check by querying the current user's profile
        String profileQuery = """
                query {
                  userProfile {
                    username
                    roles
                  }
                }
                """;

        graphQlTester.document(profileQuery)
                .execute()
                .path("userProfile")
                .entity(Map.class)
                .satisfies(profile -> {
                    assertEquals("commander@mercs.com", profile.get("username"));
                    assertTrue(((List<?>) profile.get("roles")).contains("ROLE_AUTHENTICATED"));
                });

        // 2. Generate a Random Campaign (Dobless Campaign flow)
        // This exercises the CampaignService.generateDoblessCampaign mutation
        String generateMutation = """
                mutation Generate($months: Int!) {
                  generateDoblessCampaign(lengthInMonths: $months) {
                    id
                    name
                    lengthInMonths
                    tracks {
                      id
                      monthIndex
                      sequenceOrder
                    }
                  }
                }
                """;

        int requestedMonths = 6;

        graphQlTester.document(generateMutation)
                .variable("months", requestedMonths)
                .execute()
                .errors().verify()
                .path("generateDoblessCampaign")
                .entity(Map.class)
                .satisfies(campaign -> {
                    assertNotNull(campaign.get("id"), "Campaign ID should be generated");
                    assertNotNull(campaign.get("name"), "Campaign should have a generated name");
                    assertEquals(requestedMonths, campaign.get("lengthInMonths"));

                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> tracks = (List<Map<String, Object>>) campaign.get("tracks");
                    assertFalse(tracks.isEmpty(), "Campaign should have generated tracks");
                    // Verify temporal alignment: first track should be in Month 1
                    assertEquals(1, tracks.get(0).get("monthIndex"));
                });
    }

    @Test
    @WithMockUser(username = "commander@mercs.com", roles = {"AUTHENTICATED"})
    void testCampaignManagerCanCreateMultipleInvites() {
        // 1. Create a campaign first to host the invites
        String setupCampaign = """
                mutation {
                  generateDoblessCampaign(lengthInMonths: 4) {
                    id
                  }
                }
                """;

        String campaignId = graphQlTester.document(setupCampaign)
                .execute()
                .path("generateDoblessCampaign.id").entity(String.class).get();

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
        // We manually mutate the WebTestClient to simulate different users in one test flow
        HttpGraphQlTester managerTester = HttpGraphQlTester.create(
                webTestClient.mutateWith(mockUser("commander@mercs.com").roles("AUTHENTICATED")));

        Map<String, Object> campaignData = managerTester.document("""
                mutation {
                  generateDoblessCampaign(lengthInMonths: 12) { id tracks { id } }
                }
                """).execute().path("generateDoblessCampaign").entity(Map.class).get();

        String campaignId = (String) campaignData.get("id");
        @SuppressWarnings("unchecked")
        String trackId = ((List<Map<String, String>>) campaignData.get("tracks")).get(0).get("id");

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

        String det1Id = (String) p1Assets.get("detachmentId");
        String det2Id = (String) p2Assets.get("detachmentId");

        @SuppressWarnings("unchecked")
        String p1UnitId = ((List<String>) p1Assets.get("unitIds")).get(0);
        @SuppressWarnings("unchecked")
        String p1PilotId = ((List<String>) p1Assets.get("pilotIds")).get(0);

        // 4. Manager: Create specific contracts (Primary vs Opposition)
        // Primary Contract: 1.5x Pay Rate
        String primaryContractId = managerTester.document("""
                mutation($cid: ID!) {
                  createContract(campaignId: $cid, input: {
                    missionType: "Garrison",
                    primaryContract: true,
                    payRate: 1.5,
                    salvageRate: 0.6
                  }) { id }
                }
                """).variable("cid", campaignId)
                .execute().path("createContract.id").entity(String.class).get();

        // Opposition Contract: 1.0x Pay Rate
        String oppositionContractId = managerTester.document("""
                mutation($cid: ID!) {
                  createContract(campaignId: $cid, input: {
                    missionType: "Raid",
                    primaryContract: false,
                    payRate: 1.0,
                    salvageRate: 0.2
                  }) { id }
                }
                """).variable("cid", campaignId)
                .execute().path("createContract.id").entity(String.class).get();

        // 5. Manager: Assign Detachments to Contracts for Month 1
        managerTester.document("""
                mutation($did: ID!, $conId: ID!, $m: Int!) {
                  assignDetachmentToContract(detachmentId: $did, contractId: $conId, monthIndex: $m) { id }
                }
                """)
                .variable("did", det1Id).variable("conId", primaryContractId).variable("m", 1)
                .execute().errors().verify();

        managerTester.document("""
                mutation($did: ID!, $conId: ID!, $m: Int!) {
                  assignDetachmentToContract(detachmentId: $did, contractId: $conId, monthIndex: $m) { id }
                }
                """)
                .variable("did", det2Id).variable("conId", oppositionContractId).variable("m", 1)
                .execute().errors().verify();

        // 6. Manager: Process Monthly Workflow (Triggers Pay & Maintenance Ledger Entries)
        managerTester.document("""
                mutation($cid: ID!, $m: Int!) {
                  processMonthlyWorkflow(campaignId: $cid, monthIndex: $m)
                }
                """).variable("cid", campaignId).variable("m", 1)
                .execute().path("processMonthlyWorkflow").entity(Boolean.class).isEqualTo(true);

        // 7. Verify Ledger for Player 1 (Primary: 500 base * 1.5 = 750)
        verifyLedgerAmount("player1@test.net", 750, "Monthly Pay");

        // 8. Verify Ledger for Player 2 (Opposition: 500 base * 1.0 = 500)
        verifyLedgerAmount("player2@test.net", 500, "Monthly Pay");

        // 9. Manager: Process After Action Report for Track 1 (Player 1)
        // Primary Award: 500 base * 1.5 payRate * 1.2 multiplier * 2 level = 1800
        managerTester.document("""
                mutation($tid: ID!, $did: ID!, $level: Int!, $mult: Float!, $salvage: Int!) {
                  processAfterActionWorkflow(trackId: $tid, detachmentId: $did, selectedLevel: $level, outcomeMultiplier: $mult, salvageValue: $salvage)
                }
                """)
                .variable("tid", trackId)
                .variable("did", det1Id)
                .variable("level", 2)
                .variable("mult", 1.2)
                .variable("salvage", 1000)
                .execute().path("processAfterActionWorkflow").entity(Boolean.class).isEqualTo(true);

        verifyLedgerAmount("player1@test.net", 1800, "Combat Pay");
        verifyLedgerAmount("player1@test.net", 600, "Salvage Share");

        // 11. Manager: Process After Action Report for Track 1 (Player 2)
        // Opposition Award: 500 base * 1.0 payRate * 1.0 multiplier * 1 level = 500
        // Salvage: 1000 total * 0.2 salvageRate = 200
        managerTester.document("""
                mutation($tid: ID!, $did: ID!, $level: Int!, $mult: Float!, $salvage: Int!) {
                  processAfterActionWorkflow(trackId: $tid, detachmentId: $did, selectedLevel: $level, outcomeMultiplier: $mult, salvageValue: $salvage)
                }
                """)
                .variable("tid", trackId)
                .variable("did", det2Id)
                .variable("level", 1)
                .variable("mult", 1.0)
                .variable("salvage", 1000)
                .execute().path("processAfterActionWorkflow").entity(Boolean.class).isEqualTo(true);

        verifyLedgerAmount("player2@test.net", 500, "Combat Pay");
        verifyLedgerAmount("player2@test.net", 200, "Salvage Share");

        // 12. Player 1: Maintenance Phase (Repairs, Medical, Rearm)
        HttpGraphQlTester p1Tester = HttpGraphQlTester.create(
                webTestClient.mutateWith(mockUser("player1@test.net").roles("INVITED")));

        p1Tester.document("mutation($uid: ID!, $cost: Int!) { repairUnit(unitId: $uid, repairCost: $cost) }")
                .variable("uid", p1UnitId).variable("cost", 125).execute().errors().verify();

        p1Tester.document("mutation($pid: ID!, $cost: Int!) { healPilot(pilotId: $pid, healCost: $cost) }")
                .variable("pid", p1PilotId).variable("cost", 50).execute().errors().verify();

        p1Tester.document("mutation($uid: ID!, $cost: Int!) { rearmUnit(unitId: $uid, rearmCost: $cost) }")
                .variable("uid", p1UnitId).variable("cost", 25).execute().errors().verify();

        verifyLedgerAmount("player1@test.net", -125, "Repair");
        verifyLedgerAmount("player1@test.net", -50, "Medical");
        verifyLedgerAmount("player1@test.net", -25, "Rearm");
    }

    @Test
    void testAutomatedRearmCalculationBasedOnTonnage() {
        HttpGraphQlTester managerTester = HttpGraphQlTester.create(
                webTestClient.mutateWith(mockUser("commander@mercs.com").roles("AUTHENTICATED")));

        // 1. Create a campaign with a specific rearm cost per ton (100 SP)
        String campaignId = managerTester.document("""
                mutation {
                  generateDoblessCampaign(lengthInMonths: 6) { id }
                }
                """).execute().path("generateDoblessCampaign.id").entity(String.class).get();

        managerTester.document("""
                mutation($id: ID!, $cost: Int!) {
                  updateCampaignDetails(id: $id, input: { rearmCostPerTon: $cost }) { id }
                }
                """)
                .variable("id", campaignId)
                .variable("cost", 100)
                .execute().errors().verify();

        // 2. Player joins and procures a 75-ton Heavy 'Mech
        String token = managerTester.document("""
                mutation($cid: ID!) { createInvite(campaignId: $cid, recipientName: "Heavy Pilot") { token } }
                """).variable("cid", campaignId).execute().path("createInvite.token").entity(String.class).get();

        HttpGraphQlTester playerTester = HttpGraphQlTester.create(
                webTestClient.mutateWith(mockUser("heavy@test.net").roles("INVITED")));

        String commandId = playerTester.document("mutation { establishCommand(input: { name: \"Heavy Metal\" }) { id } }")
                .execute().path("establishCommand.id").entity(String.class).get();

        // Add unit with 75 tons
        String unitId = playerTester.document("""
                mutation($cid: ID!, $tons: Int!) {
                  addCombatUnit(commandId: $cid, input: { model: "Marauder", type: "BM", tonnage: $tons, pv: 45 }) { id }
                }
                """).variable("cid", commandId).variable("tons", 75)
                .execute().path("addCombatUnit.id").entity(String.class).get();

        // 3. Execute Automated Rearm (backend should look up 75 tons * 100 SP/ton)
        playerTester.document("""
                mutation($uid: ID!) {
                  automatedRearmUnit(unitId: $uid)
                }
                """).variable("uid", unitId)
                .execute().errors().verify();

        // 4. Verify calculation (75 * 100 = 7500)
        verifyLedgerAmount("heavy@test.net", -7500, "Rearm");
    }

    private void verifyLedgerAmount(String email, int expectedAmount, String descriptionPart) {
        HttpGraphQlTester playerTester = HttpGraphQlTester.create(
                webTestClient.mutateWith(mockUser(email).roles("INVITED")));

        playerTester.document("query { userProfile { mercenaryCommand { ledger { amount shortDescription } } } }")
                .execute()
                .path("userProfile.mercenaryCommand.ledger")
                .entityList(Map.class)
                .satisfies(ledger -> {
                    boolean found = ledger.stream().anyMatch(e
                            -> e.get("shortDescription").toString().contains(descriptionPart)
                            && ((Number) e.get("amount")).intValue() == expectedAmount);
                    assertTrue(found, "Expected ledger entry of " + expectedAmount + " for " + email);
                });
    }

    private Map<String, Object> simulatePlayerWorkflow(String token, String username, String commandName) {
        HttpGraphQlTester playerTester = HttpGraphQlTester.create(
                webTestClient.mutateWith(mockUser(username).roles("INVITED")));

        // A. Establish Command (Initial setup)
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

        // E. Assign all assets to the detachment
        for (String uid : unitIds) {
            playerTester.document("""
                    mutation($uid: ID!, $did: ID!) {
                      assignUnitToDetachment(unitId: $uid, detachmentId: $did) { id }
                    }
                    """).variable("uid", uid).variable("did", detachmentId)
                    .execute().errors().verify();
        }
        for (String pid : pilotIds) {
            playerTester.document("""
                    mutation($pid: ID!, $did: ID!) {
                      assignPilotToDetachment(pilotId: $pid, detachmentId: $did) { id }
                    }
                    """).variable("pid", pid).variable("did", detachmentId)
                    .execute().errors().verify();
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
