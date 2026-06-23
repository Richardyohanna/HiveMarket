package com.hivemarket.shop.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hivemarket.shop.entity.Shop;

public interface ShopRepository extends JpaRepository<Shop, UUID>{

	
}
