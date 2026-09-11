package com.emmacobos.dashboard.repository;

import com.emmacobos.dashboard.entity.Project;
import com.emmacobos.dashboard.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByCreatedBy(User createdBy);
}
