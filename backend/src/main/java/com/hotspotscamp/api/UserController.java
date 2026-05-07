package com.hotspotscamp.api;

import com.hotspotscamp.entity.UserProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/profile")
    public Mono<UserProfile> getUserProfile() {
        return ReactiveSecurityContextHolder.getContext()
                .map(securityContext -> securityContext.getAuthentication())
                .map(authentication -> {
                    Object principal = authentication.getPrincipal();
                    if (principal instanceof OAuth2User oAuth2User) {
                        String email = oAuth2User.getAttribute("email");
                        String name = oAuth2User.getAttribute("name");
                        return new UserProfile(email, name);
                    } else {
                        // For test context or simple auth
                        String email = authentication.getName();
                        return new UserProfile(email, email);
                    }
                });
    }
}
