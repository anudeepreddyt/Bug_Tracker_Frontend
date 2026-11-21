# Required Spring Boot CORS Configuration Fix

## Why CORS Fails Currently
In `com.anudeepreddy.Bug_Tracker.Configuration.SecurityConfiguration`, Spring Security does **not** have `.cors(...)` enabled and defines no `CorsConfigurationSource` bean. When the React frontend on `http://localhost:5173` sends requests with `Authorization: Bearer <token>` or JSON `Content-Type` to `http://localhost:8080`, browsers send an HTTP `OPTIONS` preflight request which Spring Security blocks with `403 Forbidden`.

## Exact Spring Boot Fix

Update `SecurityConfiguration.java` as shown below:

```java
package com.anudeepreddy.Bug_Tracker.Configuration;

import com.anudeepreddy.Bug_Tracker.Filter.JWTFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@EnableWebSecurity
@Configuration
public class SecurityConfiguration {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JWTFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .cors(Customizer.withDefaults())
                .csrf(customizer -> customizer.disable())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(request -> request
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/signup").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/signin").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/healthcheck").permitAll()
                        .anyRequest().authenticated())
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider(userDetailsService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
```

### Key Points
- `.cors(Customizer.withDefaults())` instructs Spring Security to apply the `corsConfigurationSource` bean **before** JWT authentication runs.
- `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` guarantees browser preflight checks succeed without requiring a JWT header.
- Explicit origin `http://localhost:5173` is paired safely with `allowCredentials(true)` (avoiding insecure `*` wildcards).
