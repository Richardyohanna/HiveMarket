package com.hivemarket.product.DTO;

import java.math.BigDecimal;

import com.hivemarket.dto.Location;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateProduct(
        @NotBlank String pName,
        @NotBlank String pDetail,
        @NotNull @Positive BigDecimal pAmount,
        BigDecimal pDiscount,
        @NotBlank String pCondition,
        @NotNull Integer pQuantity,
        @NotBlank String category,
        @NotBlank Location location,
        String sellerName,
        String sellerImage,
        String sellerEmail
        
        

) {}