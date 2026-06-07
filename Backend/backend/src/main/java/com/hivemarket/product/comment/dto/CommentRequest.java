package com.hivemarket.product.comment.dto;

import java.util.UUID;

public record CommentRequest(
		
		UUID aurthorId,
		UUID productId,
		String text
		
		) {

}
