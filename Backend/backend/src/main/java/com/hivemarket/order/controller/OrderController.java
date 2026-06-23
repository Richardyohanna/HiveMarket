package com.hivemarket.order.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hivemarket.order.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {
	
	private final OrderService orderService;
	
	@GetMapping("/all")
	public ResponseEntity<?> getAll(@RequestParam UUID userId){
		
		System.out.println("Connected to the /api/order/all " + userId);
		
		return ResponseEntity.ok(orderService.getAllOrder(userId));
	}
	
	@GetMapping("/in_progress")
	public ResponseEntity<?> getAllInProgress(@RequestParam UUID userId){
		
		System.out.println("Connected to the /api/order/in_progress" + userId);
		
		return ResponseEntity.ok(orderService.getInProgressOrder(userId));
	}

	@GetMapping("/delivered")
	public ResponseEntity<?> getAllDelivered(@RequestParam UUID userId){
		
		System.out.println("Connected to the /api/order/delivered" + userId);
		
		return ResponseEntity.ok(orderService.getDeliveredOrder(userId));
	}
	
	@GetMapping("/cancelled")
	public ResponseEntity<?> getAllCancelled(@RequestParam UUID userId){
		
		System.out.println("Connected to the /api/order/cancelled" + userId);
		
		return ResponseEntity.ok(orderService.getCancelledOrder(userId));
	}
}
