package com.emmacobos.dashboard.security;

import com.emmacobos.dashboard.entity.ERole;
import com.emmacobos.dashboard.entity.User;
import com.emmacobos.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        UserDetailsImpl principal = (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new IllegalStateException("Usuario autenticado no existe en la base"));
    }

    public boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> role.getName() == ERole.ROLE_ADMIN);
    }
}
