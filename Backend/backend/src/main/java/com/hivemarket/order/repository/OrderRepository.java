package com.hivemarket.order.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hivemarket.order.Enum.OrderStatusEnum;
import com.hivemarket.order.entity.Order;

public interface OrderRepository extends JpaRepository<Order, UUID> {

	List<Order> findByUserId(UUID userId);
	Boolean existsByUserId(UUID userId);
	List<Order> findByUserIdAndStatus(UUID userId, OrderStatusEnum statue);
}
