package com.emmacobos.dashboard.config;

import com.emmacobos.dashboard.entity.ERole;
import com.emmacobos.dashboard.entity.Role;
import com.emmacobos.dashboard.entity.User;
import com.emmacobos.dashboard.repository.RoleRepository;
import com.emmacobos.dashboard.repository.UserRepository;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_USER)));
        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_ADMIN)));

        if (!userRepository.existsByUsername(adminUsername)) {
            User admin = new User(adminUsername, adminEmail, passwordEncoder.encode(adminPassword));
            admin.setRoles(Set.of(userRole, adminRole));
            userRepository.save(admin);
        }
    }
}
