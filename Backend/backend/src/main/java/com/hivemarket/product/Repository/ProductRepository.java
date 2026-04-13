package com.hivemarket.product.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hivemarket.product.Entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByStatus(String status);

    List<Product> findBySellerEmail(String email);

    List<Product> findBySellerEmailAndStatus(String email, String status);
}