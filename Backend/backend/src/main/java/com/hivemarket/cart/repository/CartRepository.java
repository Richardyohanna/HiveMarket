package com.hivemarket.cart.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hivemarket.cart.Entity.Cart;

public interface CartRepository extends JpaRepository<Cart, UUID> {

	List<Cart> findByUserId(UUID userId);	
	Optional<Cart> findByUserIdAndProductId(UUID userId, UUID productId);
	
}
