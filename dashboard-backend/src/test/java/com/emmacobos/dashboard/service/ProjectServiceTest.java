package com.emmacobos.dashboard.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.emmacobos.dashboard.dto.ProjectRequest;
import com.emmacobos.dashboard.dto.ProjectResponse;
import com.emmacobos.dashboard.entity.Project;
import com.emmacobos.dashboard.entity.User;
import com.emmacobos.dashboard.exception.ResourceNotFoundException;
import com.emmacobos.dashboard.repository.ProjectRepository;
import com.emmacobos.dashboard.repository.TaskRepository;
import com.emmacobos.dashboard.security.CurrentUserProvider;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

// Unit tests de la regla central de autorizacion de ProjectService: el dueno
// del proyecto o un ADMIN pueden acceder; cualquier otro usuario, no. Los
// repositorios y CurrentUserProvider se mockean - esto NO es un test de
// integracion contra una base real, es un test de la logica de negocio sola.
@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private ProjectService projectService;

    private User owner;
    private User otherUser;
    private User admin;
    private Project project;

    @BeforeEach
    void setUp() {
        owner = new User("owner", "owner@test.com", "hash");
        owner.setId(1L);
        otherUser = new User("otro", "otro@test.com", "hash");
        otherUser.setId(2L);
        admin = new User("admin", "admin@test.com", "hash");
        admin.setId(3L);

        project = new Project("Proyecto", "desc", owner);
        project.setId(10L);
    }

    @Test
    void createProject_asignaComoDuenoAlUsuarioAutenticado() {
        when(currentUserProvider.getCurrentUser()).thenReturn(owner);
        when(projectRepository.save(any(Project.class))).thenAnswer(inv -> inv.getArgument(0));

        ProjectRequest request = new ProjectRequest();
        request.setName("Nuevo");
        request.setDescription("desc");

        ProjectResponse response = projectService.createProject(request);

        assertThat(response.getName()).isEqualTo("Nuevo");
        assertThat(response.getCreatedByUsername()).isEqualTo("owner");
    }

    @Test
    void getProjects_usuarioComunSoloVeLosPropios() {
        when(currentUserProvider.getCurrentUser()).thenReturn(owner);
        when(currentUserProvider.isAdmin(owner)).thenReturn(false);
        when(projectRepository.findByCreatedBy(owner)).thenReturn(List.of(project));

        List<ProjectResponse> result = projectService.getProjects();

        assertThat(result).hasSize(1);
        verify(projectRepository, never()).findAll();
    }

    @Test
    void getProjects_adminVeTodos() {
        when(currentUserProvider.getCurrentUser()).thenReturn(admin);
        when(currentUserProvider.isAdmin(admin)).thenReturn(true);
        when(projectRepository.findAll()).thenReturn(List.of(project));

        List<ProjectResponse> result = projectService.getProjects();

        assertThat(result).hasSize(1);
        verify(projectRepository, never()).findByCreatedBy(any());
    }

    @Test
    void getProjectById_elDuenoPuedeVerlo() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(currentUserProvider.getCurrentUser()).thenReturn(owner);

        ProjectResponse response = projectService.getProjectById(10L);

        assertThat(response.getId()).isEqualTo(10L);
    }

    @Test
    void getProjectById_unAdminPuedeVerCualquierProyecto() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(currentUserProvider.getCurrentUser()).thenReturn(admin);
        when(currentUserProvider.isAdmin(admin)).thenReturn(true);

        ProjectResponse response = projectService.getProjectById(10L);

        assertThat(response.getId()).isEqualTo(10L);
    }

    @Test
    void getProjectById_unUsuarioSinRelacion_tira403() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(currentUserProvider.getCurrentUser()).thenReturn(otherUser);
        when(currentUserProvider.isAdmin(otherUser)).thenReturn(false);

        assertThatThrownBy(() -> projectService.getProjectById(10L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void getProjectById_idInexistente_tira404() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getProjectById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteProject_borraLasTareasAntesQueElProyecto() {
        when(projectRepository.findById(10L)).thenReturn(Optional.of(project));
        when(currentUserProvider.getCurrentUser()).thenReturn(owner);

        projectService.deleteProject(10L);

        verify(taskRepository).deleteByProject(project);
        verify(projectRepository).delete(project);
    }
}
