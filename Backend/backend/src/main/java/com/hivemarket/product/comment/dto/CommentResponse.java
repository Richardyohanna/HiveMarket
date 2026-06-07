package com.hivemarket.product.comment.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record CommentResponse(
		
		UUID id,
		String aurthor,
		String avatar,
		String text,
		Integer likes,
		Boolean likedByMe,
		Boolean reported,
		LocalDateTime createAt
		
		) {

}
