package com.hotspotscamp.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.server.DefaultServerOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizedClientRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.HttpStatusServerEntryPoint;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.ServerAuthenticationFailureHandler;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.security.web.server.authentication.logout.WebSessionServerLogoutHandler;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            ServerOAuth2AuthorizedClientRepository authorizedClientRepository,
            ReactiveClientRegistrationRepository clientRegistrationRepository) {
        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable) // Disable CSRF for now, or configure properly for SPA
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Enable CORS
                .authorizeExchange(exchanges -> exchanges
                .pathMatchers("/graphql", "/graphql/**").permitAll() // Allow public access; resolvers handle authorization
                .pathMatchers("/api/user/profile").authenticated() // Protect profile endpoint
                .pathMatchers("/login/oauth2/**").permitAll() // Allow OAuth2 initiation and callback
                .anyExchange().permitAll() // Allow all other requests for now (e.g., static resources)
                )
                .exceptionHandling(exceptionHandling -> exceptionHandling
                // Return 401 instead of redirecting to login page for API requests
                .authenticationEntryPoint(new HttpStatusServerEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                .requestCache(cache -> cache.requestCache(NoOpServerRequestCache.getInstance())) // Disable saved requests
                .oauth2Login(oauth2 -> oauth2
                .authorizationRequestResolver(authorizationRequestResolver(clientRegistrationRepository))
                .authenticationSuccessHandler(oauth2AuthenticationSuccessHandler())
                .authenticationFailureHandler(oauth2AuthenticationFailureHandler())
                .authorizedClientRepository(authorizedClientRepository)
                )
                .logout(logout -> logout
                .logoutUrl("/api/logout")
                .logoutHandler(new WebSessionServerLogoutHandler()) // Explicitly invalidate the WebSession
                .logoutSuccessHandler(logoutSuccessHandler())
                );

        return http.build();
    }

    private ServerOAuth2AuthorizationRequestResolver authorizationRequestResolver(
            ReactiveClientRegistrationRepository clientRegistrationRepository) {
        return new DefaultServerOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository,
                ServerWebExchangeMatchers.pathMatchers("/login/oauth2/authorization/{registrationId}")
        );
    }

    @Bean
    public ServerAuthenticationSuccessHandler oauth2AuthenticationSuccessHandler() {
        return new RedirectServerAuthenticationSuccessHandler("http://localhost:3000/");
    }

    @Bean
    public ServerAuthenticationFailureHandler oauth2AuthenticationFailureHandler() {
        return new RedirectServerAuthenticationFailureHandler("http://localhost:3000/?error=auth_failed");
    }

    @Bean
    public ServerLogoutSuccessHandler logoutSuccessHandler() {
        // Return 200 OK instead of a redirect for better SPA integration
        return (exchange, authentication) -> {
            exchange.getExchange().getResponse().setStatusCode(HttpStatus.OK);
            return exchange.getExchange().getResponse().setComplete();
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
