package com.hivemarket.product.rating.dto;

import java.util.UUID;

public record RatingRequest(
		
		UUID userId,
		UUID productId,
		Integer rating
		
		) {

}
