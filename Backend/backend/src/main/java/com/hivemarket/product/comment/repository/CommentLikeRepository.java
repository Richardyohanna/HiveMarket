package com.hivemarket.product.comment.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hivemarket.product.comment.entity.CommentLikes;

public interface CommentLikeRepository extends JpaRepository<CommentLikes, UUID>{

	Optional<CommentLikes> findByUserIdAndCommentId(UUID userId, UUID commentId);
	
	Boolean existsByUserIdAndCommentId(UUID userId, UUID commentId);
}
