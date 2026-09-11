package com.emmacobos.dashboard.service;

import com.emmacobos.dashboard.dto.ProjectRequest;
import com.emmacobos.dashboard.dto.ProjectResponse;
import com.emmacobos.dashboard.entity.Project;
import com.emmacobos.dashboard.entity.User;
import com.emmacobos.dashboard.exception.ResourceNotFoundException;
import com.emmacobos.dashboard.repository.ProjectRepository;
import com.emmacobos.dashboard.repository.TaskRepository;
import com.emmacobos.dashboard.security.CurrentUserProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {
        User currentUser = currentUserProvider.getCurrentUser();
        Project project = new Project(request.getName(), request.getDescription(), currentUser);
        return toResponse(projectRepository.save(project));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects() {
        User currentUser = currentUserProvider.getCurrentUser();
        List<Project> projects = currentUserProvider.isAdmin(currentUser)
                ? projectRepository.findAll()
                : projectRepository.findByCreatedBy(currentUser);
        return projects.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        return toResponse(loadAccessibleProject(id));
    }

    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request) {
        Project project = loadAccessibleProject(id);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        return toResponse(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = loadAccessibleProject(id);
        taskRepository.deleteByProject(project);
        projectRepository.delete(project);
    }

    // Solo el dueno del proyecto o un ADMIN pueden verlo/editarlo/borrarlo.
    private Project loadAccessibleProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado: " + id));

        User currentUser = currentUserProvider.getCurrentUser();
        boolean isOwner = project.getCreatedBy().getId().equals(currentUser.getId());
        if (!isOwner && !currentUserProvider.isAdmin(currentUser)) {
            throw new AccessDeniedException("No tenes permisos sobre este proyecto");
        }
        return project;
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getCreatedBy().getUsername(),
                project.getCreatedAt());
    }
}
