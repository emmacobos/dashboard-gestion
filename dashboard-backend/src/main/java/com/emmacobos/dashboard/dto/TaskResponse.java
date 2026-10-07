package com.emmacobos.dashboard.dto;

import com.emmacobos.dashboard.entity.TaskPriority;
import com.emmacobos.dashboard.entity.TaskStatus;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private LocalDate dueDate;
    private Long projectId;
    private String projectName;
    private Long assignedToId;
    private String assignedToUsername;
}
