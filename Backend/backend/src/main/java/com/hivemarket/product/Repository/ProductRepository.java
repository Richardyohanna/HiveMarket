package com.hivemarket.product.Repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.hivemarket.product.Entity.Product;

public interface ProductRepository extends JpaRepository<Product, UUID> {

	@EntityGraph(attributePaths = {"images"})
    List<Product> findByStatus(String status);

	@EntityGraph(attributePaths = {"images"})
    List<Product> findBySellerEmail(String email);

	@EntityGraph(attributePaths = {"images"})
    List<Product> findBySellerEmailAndStatus(String email, String status);
}