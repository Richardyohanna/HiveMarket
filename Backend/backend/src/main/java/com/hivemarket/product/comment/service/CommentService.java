package com.hivemarket.product.comment.service;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hivemarket.product.Entity.Product;
import com.hivemarket.product.Repository.ProductRepository;
import com.hivemarket.product.comment.dto.CommentRequest;
import com.hivemarket.product.comment.dto.CommentResponse;
import com.hivemarket.product.comment.entity.Comment;
import com.hivemarket.product.comment.entity.CommentLikes;
import com.hivemarket.product.comment.repository.CommentLikeRepository;
import com.hivemarket.product.comment.repository.CommentRepository;
import com.hivemarket.user.entity.User;
import com.hivemarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

	private final CommentRepository commentRepo;
	private final ProductRepository productRepo;
	private final UserRepository userRepo;
	private final CommentLikeRepository commentLikeRepo;
	
	public Comment save(Product product, User user, String text) {
		
		Comment comment = Comment.builder()
				.product(product)
				.aurthor(user)
				.text(text)
				.createdAt(LocalDateTime.now())
				.build();
		
		Comment SavedComment = commentRepo.save(comment);
		
		return SavedComment;
	}
	
	@Transactional(readOnly = true)
	public List<CommentResponse> getAllComment(UUID productId, UUID userId) {
		
		List<Comment>  comments = commentRepo.findByProductIdOrderByCreatedAtDesc(productId);
		
		List<CommentResponse> commentResponse = new ArrayList<>();
		
		System.out.println("This is the comments for bot the userID and productID " + comments.toString());
		
		
		for(Comment comment: comments) {
			
			System.out.println("This is the comment for commentsss in userId and ProductId " + comments.toString());
			
			Boolean likeByMe = commentLikeRepo.existsByUserIdAndCommentId(userId, comment.getId());
			
			
				System.out.println("This is the commentsLikes from the above comment " );
				
				//System.out.println("This is the likes " + likes + " and this is the likeByMe " + likeByMe);
				
				CommentResponse response = new CommentResponse (
						comment.getId(),
						comment.getAurthor().getFull_name(),
						comment.getAurthor().getProfile_picture(),
						comment.getText(),
						comment.getLikes(),
						likeByMe,
						comment.getReported(),
						comment.getCreatedAt()
						
						);
				
				commentResponse.add(response);
			
			
		}
		
		
		return commentResponse;
	}
	
	
	@Transactional(readOnly = true)
	public List<CommentResponse> getAllComment(UUID productId) {
		
		List<Comment>  comments = commentRepo.findByProductIdOrderByCreatedAtDesc(productId);
		
		List<CommentResponse> commentResponse = new ArrayList<>();
		
		System.out.println("This is the comments " + comments.toString());
		
		
		for(Comment comment: comments) {				
				
				CommentResponse response = new CommentResponse (
						comment.getId(),
						comment.getAurthor().getFull_name(),
						comment.getAurthor().getProfile_picture(),
						comment.getText(),
						comment.getLikes(),
						false,
						comment.getReported(),
						comment.getCreatedAt()
						
						);
				
				commentResponse.add(response);
						
		}
		
		
		return commentResponse;
	}
	
	
	//Continue here when you come next
	@Transactional
	public CommentResponse addComment(CommentRequest request) {
		
		
		Product product = productRepo.findById(request.productId()).orElseThrow( () -> new RuntimeException("Cannot find the product with the ID: " + request.productId() + " to add the comment "));
		
		User user = userRepo.findById(request.aurthorId()).orElseThrow(() -> new RuntimeException("Cannot find the user with the following ID: " + request.aurthorId() + " commented to this product " + product.getPName()));
		
		Comment comment = save(product, user, request.text());
		
		/*
		 * CommentLikes commentLike = CommentLikes.builder() .user(user)
		 * .comment(comment) .likeAt(comment.getCreatedAt()) .build();
		 */
		
		//CommentLikes savedCommentLike = commentLikeRepo.save(commentLike);
		
		
		
		return new CommentResponse(
				comment.getId(),
				comment.getAurthor().getFull_name(),
				comment.getAurthor().getProfile_picture(),
				comment.getText(),
				comment.getLikes(),
				false,//comment.getLikedByMe(),
				comment.getReported(),
				comment.getCreatedAt()
				);
	}
	
	

	public Integer addLike(UUID commentId, UUID userId) {
		
		Comment comment = commentRepo.findById(commentId).orElseThrow(() -> new RuntimeException("Cannot Find the comment with the this id " + commentId + "To like to it"));
		
		User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("Cannot find the user with this ID: " + userId + " To add the commemntLike"));
		//comment.get
		
		Optional<CommentLikes> findLike = commentLikeRepo.findByUserIdAndCommentId(userId, commentId);
		

		System.out.println("This is the number of likes before adding like " + comment.getLikes());
		
		if(findLike.isPresent()) {
					
			commentLikeRepo.delete(findLike.get());
			comment.setLikes(Math.max(0, comment.getLikes() - 1)
					);
		} else {
			
			
			//This saves  the commentLike data
			CommentLikes commentLike = CommentLikes.builder()
					.user(user)
					.comment(comment)
					.likeAt(LocalDateTime.now())
					.build();
			
			commentLikeRepo.save(commentLike);
			
			comment.setLikes(comment.getLikes() + 1);
			
		}

		
		


		System.out.println("This is the number of likes before adding like " + comment.getLikes());
		
		//comment.setLikes(comment.getLikes() + 1);
		
		Comment savedComment = commentRepo.save(comment);
				
		
		System.out.println("This is the number of likes after adding like " + savedComment.getLikes());
		
		
		return savedComment.getLikes();
	}
}
