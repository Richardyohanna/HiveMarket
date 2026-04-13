package com.hivemarket.product.DTO;

import java.math.BigDecimal;



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
        @NotBlank String location
        
        

) {}