package com.hivemarket.cart.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hivemarket.cart.dto.CartResponse;
import com.hivemarket.cart.service.CartService;
import com.hivemarket.product.DTO.ProductResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

	private final CartService service; 
	
	@PostMapping("/addCart")
	public ResponseEntity<String> addToCart(@RequestBody CartResponse request){
		
		System.out.println("Connected to /addCart " + request);
		String result = service.addCart(request);
		
		return ResponseEntity.ok(result);
		
	}
	
	@GetMapping("/all")
	public ResponseEntity<List<ProductResponse>> findAll(@RequestParam String user_email){
		
		System.out.println("Connected to /all " + user_email);
		List<ProductResponse> result = service.findAllCart(user_email);
		
		return ResponseEntity.ok(result);
	}
	
	@DeleteMapping("/")
	public ResponseEntity<String> deleteById(@RequestBody CartResponse request){
		
		System.out.println(request + "NEEDS to be deleted");
		
		UUID id = service.deleteCart(request);
		
		return ResponseEntity.ok(id + " Successfully deleted");
	}
}
