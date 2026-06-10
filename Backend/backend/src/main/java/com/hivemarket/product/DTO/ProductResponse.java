package com.hivemarket.product.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.hivemarket.product.rating.dto.RatingResponse;

public record ProductResponse(
    UUID id,
    String pName,
    String pDetail,
    BigDecimal pAmount,
    BigDecimal pDiscount,
    String pCondition,
    Integer pQuantity,
    String category,
    String location,
    String sellerEmail,
    String sellerName,
    UUID sellerId,
    String sellerProfilePicture,
    String sellerLocation,
    String status,
    List<String> imageUrls,
    LocalDateTime createdAt,
    Integer reactions,
    Integer views,
    Integer purchases,
    RatingResponse ratingData,
    Boolean isReacted
) {}