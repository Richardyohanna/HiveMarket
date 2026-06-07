package com.hivemarket.product.comment.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.hivemarket.product.comment.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, UUID> {

	@EntityGraph(attributePaths = {"aurthor"})
	List<Comment> findByProductIdOrderByCreatedAtDesc(UUID productId);
	
}
