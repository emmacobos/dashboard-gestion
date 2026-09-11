package com.emmacobos.dashboard.service;

import com.emmacobos.dashboard.dto.UserSummaryResponse;
import com.emmacobos.dashboard.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    // Lista minima (id + username) para poblar el select de "asignar a" al
    // crear/editar una tarea. Cualquier usuario autenticado puede verla.
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserSummaryResponse(user.getId(), user.getUsername()))
                .toList();
    }
}
