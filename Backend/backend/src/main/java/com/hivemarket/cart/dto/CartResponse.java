package com.hivemarket.cart.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record CartResponse(
		@NotNull(message="user_email required")
		UUID user_id,
		
		@NotNull(message="product_id required")
		UUID product_id,
		
		@NotNull(message="seller_email required")
		String seller_id
		
		
		) {	
}
