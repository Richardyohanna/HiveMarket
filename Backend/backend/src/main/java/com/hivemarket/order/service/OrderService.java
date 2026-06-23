package com.hivemarket.order.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hivemarket.order.Enum.OrderStatusEnum;
import com.hivemarket.order.dto.OrderResponse;
import com.hivemarket.order.entity.Order;
import com.hivemarket.order.repository.OrderRepository;
import com.hivemarket.product.Entity.Product;
import com.hivemarket.user.entity.User;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {

	private final OrderRepository orderRepo;

	
	public OrderResponse mapResponse(Order order) {
		
		return new OrderResponse(
				order.getId(),
				order.getProduct().getId(),
				order.getProduct().getPName(),
				order.getProduct().getPAmount(),
				order.getOrderDate(),
				order.getDeliveredDate(),
				order.getStatus(),
				order.getProduct().getImages().get(0)
				);
	}
	
	@SuppressWarnings("null")
	@Transactional
	public void saveOrder(Product product, User user) {
		
		Order newOrder = Order.builder()
				.product(product)
				.user(user)
				.orderDate(LocalDateTime.now())
				.status(OrderStatusEnum.IN_PROGRESS)
				.build();
		
		orderRepo.save(newOrder);
	}
	
	

	@Transactional(readOnly = true)
	public List<OrderResponse> getAllOrder(UUID userId){
		
		if(orderRepo.existsByUserId(userId) == false) {
			System.out.println("This user doesn't have any order" + Collections.emptyList());
			return Collections.emptyList();
		}
		
		List<Order> allOrder = orderRepo.findByUserId(userId);
		
		return allOrder.stream()
				.map((order)-> mapResponse(order))
				.toList();
	}
	
	@Transactional(readOnly =true)
	public List<OrderResponse> getInProgressOrder(UUID userId){
		
		if(orderRepo.existsByUserId(userId) == false) {
			System.out.println("This user doesn't have any order" + Collections.emptyList());
			return Collections.emptyList();
		}
		
		List<Order> allInProgress = orderRepo.findByUserIdAndStatus(userId, OrderStatusEnum.IN_PROGRESS);
	
		return allInProgress.stream()
				.map((order) -> mapResponse(order))
				.toList();
	}
	
	@Transactional(readOnly =true)
	public List<OrderResponse> getDeliveredOrder(UUID userId){
		
		if(orderRepo.existsByUserId(userId) == false) {
			System.out.println("This user doesn't have any order" + Collections.emptyList());
			return Collections.emptyList();
		}
		
		List<Order> allInProgress = orderRepo.findByUserIdAndStatus(userId, OrderStatusEnum.DELIVERED);
	
		return allInProgress.stream()
				.map((order) -> mapResponse(order))
				.toList();
	}
	
	@Transactional(readOnly =true)
	public List<OrderResponse> getCancelledOrder(UUID userId){
		
		if(orderRepo.existsByUserId(userId) == false) {
			System.out.println("This user doesn't have any order" + Collections.emptyList());
			return Collections.emptyList();
		}
		
		List<Order> allInProgress = orderRepo.findByUserIdAndStatus(userId, OrderStatusEnum.CANCELLED);
	
		return allInProgress.stream()
				.map((order) -> mapResponse(order))
				.toList();
	}
	
	
}
