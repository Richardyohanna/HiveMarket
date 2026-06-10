package com.hivemarket.product.rating.dto;

public record RatingResponse(
		
		Double AverageRating,
		Integer userRating,
		Integer totalFiveRating,
		Integer totalFourRating,
		Integer totalThreeRating,
		Integer totalTwoRating,
		Integer totalOneRating,
		Integer totalRating
		
		) {

}
