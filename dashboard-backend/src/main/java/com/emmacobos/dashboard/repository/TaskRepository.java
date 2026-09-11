package com.emmacobos.dashboard.repository;

import com.emmacobos.dashboard.entity.Project;
import com.emmacobos.dashboard.entity.Task;
import com.emmacobos.dashboard.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProject(Project project);

    // Tareas de proyectos propios + tareas asignadas a este usuario en cualquier proyecto.
    @Query("SELECT t FROM Task t WHERE t.project.createdBy = :user OR t.assignedTo = :user")
    List<Task> findVisibleToUser(@Param("user") User user);

    void deleteByProject(Project project);
}
