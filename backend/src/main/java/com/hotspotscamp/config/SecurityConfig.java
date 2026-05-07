package com.hotspotscamp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationFailureHandler;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.ServerAuthenticationFailureHandler;
import org.springframework.security.web.server.authentication.logout.RedirectServerLogoutSuccessHandler;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.security.web.server.savedrequest.NoOpServerRequestCache;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable) // Disable CSRF for now, or configure properly for SPA
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Enable CORS
                .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/api/user/profile").authenticated() // Protect profile endpoint
                .pathMatchers("/login/oauth2/**").permitAll() // Allow OAuth2 initiation and callback
                .anyExchange().permitAll() // Allow all other requests for now (e.g., static resources)
                )
                .exceptionHandling(exceptionHandling -> exceptionHandling
                // Return 401 instead of redirecting to login page for API requests
                .authenticationEntryPoint((exchange, e) -> Mono.fromRunnable(()
                -> exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED)
        ))
                )
                .requestCache(cache -> cache.requestCache(NoOpServerRequestCache.getInstance())) // Disable saved requests
                .oauth2Login(oauth2 -> oauth2
                .authenticationSuccessHandler(oauth2AuthenticationSuccessHandler())
                .authenticationFailureHandler(oauth2AuthenticationFailureHandler())
                )
                .logout(logout -> logout
                .logoutUrl("/api/logout")
                .logoutSuccessHandler(logoutSuccessHandler())
                );

        return http.build();
    }

    @Bean
    public ServerAuthenticationSuccessHandler oauth2AuthenticationSuccessHandler() {
        return new RedirectServerAuthenticationSuccessHandler("http://localhost:3000/welcome");
    }

    @Bean
    public ServerAuthenticationFailureHandler oauth2AuthenticationFailureHandler() {
        return new RedirectServerAuthenticationFailureHandler("http://localhost:3000/?error=auth_failed");
    }

    @Bean
    public ServerLogoutSuccessHandler logoutSuccessHandler() {
        RedirectServerLogoutSuccessHandler handler = new RedirectServerLogoutSuccessHandler();
        handler.setLogoutSuccessUrl(URI.create("http://localhost:3000"));
        return handler;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Collections.singletonList("http://localhost:3000")); // Allow frontend origin
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setAllowCredentials(true); // Allow sending cookies/auth headers
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
