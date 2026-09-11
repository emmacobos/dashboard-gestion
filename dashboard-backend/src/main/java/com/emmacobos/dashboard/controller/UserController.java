package com.emmacobos.dashboard.controller;

import com.emmacobos.dashboard.dto.UserSummaryResponse;
import com.emmacobos.dashboard.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Cualquier usuario autenticado (no solo ADMIN) puede listar usuarios, a
// proposito: no expone datos sensibles (solo id+username, ver
// UserSummaryResponse) y el frontend lo necesita para el select de "asignada
// a" al crear/editar una tarea. Restringirlo a ADMIN rompería esa funcion para
// un USER comun, ya que no existe un concepto de "miembros del proyecto" para
// acotar la lista a otro conjunto mas chico.
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserSummaryResponse>> getUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
