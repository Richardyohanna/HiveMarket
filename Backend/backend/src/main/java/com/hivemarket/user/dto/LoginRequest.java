package com.hivemarket.user.dto;

import jakarta.validation.constraints.NotNull;

public record LoginRequest(
		
		@NotNull(message = "Please provide an Email")
		String email,
		
		@NotNull(message = "password cannot be empty")
		String password
		
		) {

}
