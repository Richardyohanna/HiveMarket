package com.hivemarket.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.hivemarket.order.Enum.OrderStatusEnum;
import com.hivemarket.product.Entity.Image;

public record OrderResponse(
		  
		  UUID OrderId,
		  UUID productId,
		  String productName,
		  BigDecimal amountPaid,
		  LocalDateTime orderDate,
		  LocalDateTime deliveredDate,
		  OrderStatusEnum status,
		  Image productImage
		
		) {
}
