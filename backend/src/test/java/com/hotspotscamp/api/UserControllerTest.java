package com.hotspotscamp.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;

@SpringBootTest
@AutoConfigureWebTestClient
class UserControllerTest {

    @Autowired
    private WebTestClient webTestClient;

    @Test
    @WithMockUser(username = "testuser@gmail.com")
    void testGetUserProfile() {
        webTestClient.get()
                .uri("/api/user/profile")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.email").isEqualTo("testuser@gmail.com")
                .jsonPath("$.name").exists();
    }

    @Test
    void testGetUserProfileUnauthorized() {
        webTestClient.get()
                .uri("/api/user/profile")
                .exchange()
                .expectStatus().isUnauthorized();
    }

}
