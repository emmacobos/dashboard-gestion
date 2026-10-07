package com.emmacobos.dashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.emmacobos.dashboard.dto.TaskRequest;
import com.emmacobos.dashboard.dto.TaskResponse;
import com.emmacobos.dashboard.entity.Project;
import com.emmacobos.dashboard.entity.Task;
import com.emmacobos.dashboard.entity.TaskPriority;
import com.emmacobos.dashboard.entity.TaskStatus;
import com.emmacobos.dashboard.entity.User;
import com.emmacobos.dashboard.exception.ResourceNotFoundException;
import com.emmacobos.dashboard.repository.ProjectRepository;
import com.emmacobos.dashboard.repository.TaskRepository;
import com.emmacobos.dashboard.repository.UserRepository;
import com.emmacobos.dashboard.security.CurrentUserProvider;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

// Unit tests de TaskService: quien puede crear/editar/borrar una tarea (el
// dueno del proyecto o ADMIN), quien ademas puede solo verla (el usuario
// asignado), y que asignar/desasignar resuelve bien el id de usuario.
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private TaskService taskService;

    private User owner;
    private User otherUser;
    private User assignee;
    private Project project;
    private Task task;

    @BeforeEach
    void setUp() {
        owner = new User("owner", "owner@test.com", "hash");
        owner.setId(1L);
        otherUser = new User("otro", "otro@test.com", "hash");
        otherUser.setId(2L);
        assignee = new User("asignado", "asignado@test.com", "hash");
        assignee.setId(3L);

        project = new Project("Proyecto", "desc", owner);
        project.setId(10L);

        task = new Task();
        task.setId(100L);
        task.setTitle("Tarea");
        task.setStatus(TaskStatus.TODO);
        task.setPriority(TaskPriority.MEDIUM);
        task.setProject(project);
    }

    @Test
    void createTask_enProyectoPropio_seCrea() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(currentUserProvider.getCurrentUser()).thenReturn(owner);
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskRequest request = new TaskRequest();
        request.setTitle("Nueva tarea");
        request.setStatus(TaskStatus.TODO);
        request.setPriority(TaskPriority.LOW);

        TaskResponse response = taskService.createTask(10L, request);

        assertThat(response.getTitle()).isEqualTo("Nueva tarea");
        assertThat(response.getProjectId()).isEqualTo(10L);
    }

    @Test
    void createTask_enProyectoAjeno_tira403() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(currentUserProvider.getCurrentUser()).thenReturn(otherUser);
        when(currentUserProvider.isAdmin(otherUser)).thenReturn(false);

        TaskRequest request = new TaskRequest();
        request.setTitle("Nueva tarea");
        request.setStatus(TaskStatus.TODO);
        request.setPriority(TaskPriority.LOW);

        assertThatThrownBy(() -> taskService.createTask(10L, request))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void updateTask_conAssignedToId_resuelveElUsuario() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(currentUserProvider.getCurrentUser()).thenReturn(owner);
        when(userRepository.findById(3L)).thenReturn(Optional.of(assignee));

        TaskRequest request = new TaskRequest();
        request.setTitle("Tarea");
        request.setStatus(TaskStatus.IN_PROGRESS);
        request.setPriority(TaskPriority.HIGH);
        request.setAssignedToId(3L);

        TaskResponse response = taskService.updateTask(100L, request);

        assertThat(response.getAssignedToId()).isEqualTo(3L);
        assertThat(response.getAssignedToUsername()).isEqualTo("asignado");
        assertThat(response.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
    }

    @Test
    void updateTask_assignedToIdInexistente_tira404() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(currentUserProvider.getCurrentUser()).thenReturn(owner);
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        TaskRequest request = new TaskRequest();
        request.setTitle("Tarea");
        request.setStatus(TaskStatus.TODO);
        request.setPriority(TaskPriority.LOW);
        request.setAssignedToId(999L);

        assertThatThrownBy(() -> taskService.updateTask(100L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updateTask_assignedToIdNull_desasignaLaTarea() {
        task.setAssignedTo(assignee);
        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(currentUserProvider.getCurrentUser()).thenReturn(owner);

        TaskRequest request = new TaskRequest();
        request.setTitle("Tarea");
        request.setStatus(TaskStatus.TODO);
        request.setPriority(TaskPriority.LOW);
        request.setAssignedToId(null);

        TaskResponse response = taskService.updateTask(100L, request);

        assertThat(response.getAssignedToId()).isNull();
        assertThat(response.getAssignedToUsername()).isNull();
    }

    @Test
    void updateTask_usuarioSinRelacion_tira403() {
        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(currentUserProvider.getCurrentUser()).thenReturn(otherUser);
        when(currentUserProvider.isAdmin(otherUser)).thenReturn(false);

        TaskRequest request = new TaskRequest();
        request.setTitle("Tarea");
        request.setStatus(TaskStatus.TODO);
        request.setPriority(TaskPriority.LOW);

        assertThatThrownBy(() -> taskService.updateTask(100L, request))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void getTaskById_elUsuarioAsignado_puedeVerlaAunqueNoSeaElDueno() {
        task.setAssignedTo(assignee);
        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(currentUserProvider.getCurrentUser()).thenReturn(assignee);
        // isAdmin no se llega a evaluar: el || de loadVisibleTask corta en isAssignee=true.

        TaskResponse response = taskService.getTaskById(100L);

        assertThat(response.getId()).isEqualTo(100L);
    }

    @Test
    void deleteTask_elUsuarioAsignado_noPuedeBorrarla_soloElDuenoOAdmin() {
        task.setAssignedTo(assignee);
        when(taskRepository.findById(100L)).thenReturn(Optional.of(task));
        when(currentUserProvider.getCurrentUser()).thenReturn(assignee);
        when(currentUserProvider.isAdmin(assignee)).thenReturn(false);

        // Ver (loadVisibleTask) esta permitido, pero borrar (loadOwnedTask) no:
        // el usuario asignado solo tiene lectura.
        assertThatThrownBy(() -> taskService.deleteTask(100L))
                .isInstanceOf(AccessDeniedException.class);
    }
}
