package com.hivemarket.reaction.dto;

import java.util.UUID;

public record ReactionRequest(
        UUID productId,
        UUID userId
) {}