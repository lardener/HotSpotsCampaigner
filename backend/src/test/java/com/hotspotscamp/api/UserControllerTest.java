package com.hotspotscamp.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.graphql.test.tester.GraphQlTester;
import org.springframework.security.test.context.support.WithMockUser;

@SpringBootTest
@AutoConfigureGraphQlTester
class UserControllerTest {

    @Autowired
    private GraphQlTester graphQlTester;

    @Test
    @WithMockUser(username = "00000000-0000-0000-0000-000000000000")
    void testGetUserProfile() {
        graphQlTester.document("""
                query {
                  userProfile {
                    id
                    name
                    email
                    displayName
                    role
                  }
                }
                """)
                .execute()
                .path("userProfile.email").entity(String.class).isEqualTo("unknown@merc.net")
                .path("userProfile.id").hasValue();
    }

    @Test
    void testGetUserProfileUnauthorized() {
        graphQlTester.document("""
                query {
                  userProfile {
                    id
                  }
                }
                """)
                .execute()
                .errors()
                .satisfy(errors -> assertEquals(1, errors.size()));
    }

}
