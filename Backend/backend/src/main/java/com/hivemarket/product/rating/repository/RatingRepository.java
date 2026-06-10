package com.hivemarket.product.rating.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hivemarket.product.rating.entity.Rating;

public interface RatingRepository extends JpaRepository<Rating, UUID> {

	Optional<Rating> findByUserIdAndProductId(UUID userId, UUID productId);
	
	List<Rating> findByProductId(UUID productId);
}
