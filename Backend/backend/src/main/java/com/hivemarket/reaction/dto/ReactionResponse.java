package com.hivemarket.reaction.dto;

import java.util.UUID;

public record ReactionResponse(
		
		UUID productId,
		UUID userId,
		Boolean isReacted,
		Integer reactions
		
		) {

}
