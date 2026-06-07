package com.hivemarket.product.comment.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hivemarket.product.comment.dto.CommentRequest;
import com.hivemarket.product.comment.service.CommentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comment")
@RequiredArgsConstructor
public class CommentController {

	private final CommentService commentService;
	
	
	@PostMapping("/add-comment")
	public ResponseEntity<?> addComment(@RequestBody CommentRequest request){
		
		System.out.println("Connected to the /add-comment in comment controller" + request.toString());
		
		return ResponseEntity.ok(commentService.addComment(request));
	}
	
	@PutMapping("/add-like")
	public Integer addLike(@RequestParam UUID commentId, @RequestParam UUID userId) {
		
		System.out.println("Connected to the /add-like in comment controller");
		
		return commentService.addLike(commentId, userId);
	}
	
	@GetMapping("/all")
	public ResponseEntity<?> getAllComment(@RequestParam UUID productId, UUID userId ){
		
		System.out.println("Connected to /all getting all the comment attache to this product " + productId + " ancd check the user " + userId);
		
		return userId == null ?  ResponseEntity.ok(commentService.getAllComment(productId)) :  ResponseEntity.ok(commentService.getAllComment(productId, userId));
	}
}
