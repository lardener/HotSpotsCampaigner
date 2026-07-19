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

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.graphql.test.tester.GraphQlTester;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import io.r2dbc.spi.Batch;
import io.r2dbc.spi.Connection;
import io.r2dbc.spi.ConnectionFactories;
import io.r2dbc.spi.ConnectionFactory;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@SpringBootTest
@AutoConfigureGraphQlTester
@Testcontainers
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CampaignLifecycleIntegrationTest {

    @Container
    private static final MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.36")
            .withDatabaseName("BT_Campaigner")
            .withUsername("test")
            .withPassword("test");

    @Autowired
    private GraphQlTester graphQlTester;

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        if (!mysql.isRunning()) {
            mysql.start();
        }

        registry.add("spring.r2dbc.url", ()
                -> String.format("r2dbc:mysql://%s:%d/%s?allowMultiQueries=true",
                        mysql.getHost(), mysql.getFirstMappedPort(), mysql.getDatabaseName()));
        registry.add("spring.r2dbc.username", mysql::getUsername);
        registry.add("spring.r2dbc.password", mysql::getPassword);
    }

    @BeforeAll
    void initializeDatabase() throws Exception {
        Path schemaPath = Path.of("src/main/resources/db/migration/V1__init_schema.sql");
        if (!Files.exists(schemaPath)) {
            schemaPath = Path.of("../backend/src/main/resources/db/migration/V1__init_schema.sql");
        }
        if (!Files.exists(schemaPath)) {
            throw new IllegalStateException("Expected V1 migration at: " + schemaPath.toAbsolutePath());
        }

        String schemaSql = Files.readString(schemaPath);
        String url = String.format("r2dbc:mysql://%s:%s@%s:%d/%s?allowMultiQueries=true",
                mysql.getUsername(), mysql.getPassword(), mysql.getHost(), mysql.getFirstMappedPort(), mysql.getDatabaseName());

        ConnectionFactory connectionFactory = ConnectionFactories.get(url);
        Mono.from(connectionFactory.create())
                .flatMapMany(connection -> executeSchema(connection, schemaSql)
                .doFinally(signal -> Mono.from(connection.close())))
                .then()
                .block();
    }

    private static Flux<Long> executeSchema(Connection connection, String schemaSql) {
        Batch batch = connection.createBatch();
        batch.add(schemaSql);
        return Flux.from(batch.execute())
                .flatMap(result -> result.getRowsUpdated());
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
