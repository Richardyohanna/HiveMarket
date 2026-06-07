package com.hivemarket.user.dto;

import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
		
		@NotNull(message ="Please provide your FullName")
		String fullName,
		
		@NotNull(message = "Please provide an Email")
		String email,
		
		@NotNull(message = "password cannot be empty")
		String password,
		
		boolean enabled
		
		) {


}
