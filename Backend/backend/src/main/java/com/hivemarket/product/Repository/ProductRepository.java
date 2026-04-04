package com.hivemarket.product.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hivemarket.product.Entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long>{

}
