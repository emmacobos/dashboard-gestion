package com.emmacobos.dashboard.service;

import com.emmacobos.dashboard.dto.TaskRequest;
import com.emmacobos.dashboard.dto.TaskResponse;
import com.emmacobos.dashboard.entity.Project;
import com.emmacobos.dashboard.entity.Task;
import com.emmacobos.dashboard.entity.User;
import com.emmacobos.dashboard.exception.ResourceNotFoundException;
import com.emmacobos.dashboard.repository.ProjectRepository;
import com.emmacobos.dashboard.repository.TaskRepository;
import com.emmacobos.dashboard.repository.UserRepository;
import com.emmacobos.dashboard.security.CurrentUserProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public TaskResponse createTask(Long projectId, TaskRequest request) {
        Project project = loadOwnedProject(projectId);
        Task task = new Task();
        applyRequest(task, request);
        task.setProject(project);
        return toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByProject(Long projectId) {
        Project project = loadOwnedProject(projectId);
        return taskRepository.findByProject(project).stream().map(this::toResponse).toList();
    }

    // ADMIN ve todas las tareas; un usuario ve las de sus propios proyectos
    // mas las que le asignaron en proyectos de otros.
    @Transactional(readOnly = true)
    public List<TaskResponse> getVisibleTasks() {
        User currentUser = currentUserProvider.getCurrentUser();
        List<Task> tasks = currentUserProvider.isAdmin(currentUser)
                ? taskRepository.findAll()
                : taskRepository.findVisibleToUser(currentUser);
        return tasks.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        return toResponse(loadVisibleTask(id));
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = loadOwnedTask(id);
        applyRequest(task, request);
        return toResponse(task);
    }

    @Transactional
    public void deleteTask(Long id) {
        Task task = loadOwnedTask(id);
        taskRepository.delete(task);
    }

    private void applyRequest(Task task, TaskRequest request) {
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());

        if (request.getAssignedToId() == null) {
            task.setAssignedTo(null);
        } else {
            User assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Usuario asignado no encontrado: " + request.getAssignedToId()));
            task.setAssignedTo(assignee);
        }
    }

    // Solo el dueno del proyecto o un ADMIN pueden crear/editar/borrar tareas del proyecto.
    private Project loadOwnedProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Proyecto no encontrado: " + projectId));

        User currentUser = currentUserProvider.getCurrentUser();
        boolean isOwner = project.getCreatedBy().getId().equals(currentUser.getId());
        if (!isOwner && !currentUserProvider.isAdmin(currentUser)) {
            throw new AccessDeniedException("No tenes permisos sobre este proyecto");
        }
        return project;
    }

    private Task loadOwnedTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada: " + id));

        User currentUser = currentUserProvider.getCurrentUser();
        boolean isOwner = task.getProject().getCreatedBy().getId().equals(currentUser.getId());
        if (!isOwner && !currentUserProvider.isAdmin(currentUser)) {
            throw new AccessDeniedException("No tenes permisos sobre esta tarea");
        }
        return task;
    }

    // Ademas del dueno del proyecto y el ADMIN, el usuario asignado puede ver la tarea (solo lectura).
    private Task loadVisibleTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tarea no encontrada: " + id));

        User currentUser = currentUserProvider.getCurrentUser();
        boolean isOwner = task.getProject().getCreatedBy().getId().equals(currentUser.getId());
        boolean isAssignee = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(currentUser.getId());
        if (!isOwner && !isAssignee && !currentUserProvider.isAdmin(currentUser)) {
            throw new AccessDeniedException("No tenes permisos sobre esta tarea");
        }
        return task;
    }

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getProject().getId(),
                task.getProject().getName(),
                task.getAssignedTo() == null ? null : task.getAssignedTo().getUsername());
    }
}
