package com.hivemarket.product.DTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductResponse(
        Long id,
        String pName,
        String pDetail,
        BigDecimal pAmount,
        BigDecimal pDiscount,
        String pCondition,
        Integer pQuantity,
        String category,
        String location,
        Long s_id,
        String status,
        List<String> imageUrls,
        LocalDateTime createdAt
) {}