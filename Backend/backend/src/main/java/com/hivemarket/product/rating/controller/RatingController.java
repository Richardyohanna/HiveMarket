package com.hivemarket.product.rating.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hivemarket.product.rating.dto.RatingRequest;
import com.hivemarket.product.rating.service.RatingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/rating")
@RequiredArgsConstructor
public class RatingController {
	
	private final RatingService ratingService;
	
	@PostMapping("/rate")
	public ResponseEntity<?> rate(@Valid @RequestBody RatingRequest request){
		
		System.out.println("Connected to the /rate with the request " + request.toString());
		
		return ResponseEntity.ok(ratingService.rate(request));
	}

}
