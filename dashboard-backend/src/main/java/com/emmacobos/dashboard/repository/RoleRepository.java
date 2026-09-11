package com.emmacobos.dashboard.repository;

import com.emmacobos.dashboard.entity.ERole;
import com.emmacobos.dashboard.entity.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    Optional<Role> findByName(ERole name);
}
