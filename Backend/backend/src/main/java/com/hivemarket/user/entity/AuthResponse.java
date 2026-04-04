package com.hivemarket.user.entity;

public record AuthResponse(
		String token,
		String email,
		String role
		
		) {

}
