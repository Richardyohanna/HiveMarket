package com.hivemarket.cart.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hivemarket.cart.Entity.Cart;

public interface CartRepository extends JpaRepository<Cart, UUID> {

	List<Cart> findByUserEmail(String userEmail);
	Cart findByUserEmailAndProductIdAndSellerEmail(String userEmail, UUID productId, String sellerEmail );
	
	
}
