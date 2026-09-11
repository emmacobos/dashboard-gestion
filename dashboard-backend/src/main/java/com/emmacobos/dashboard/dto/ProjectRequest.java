package com.emmacobos.dashboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 2000)
    private String description;
}
