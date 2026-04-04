package com.hivemarket.product.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hivemarket.product.Entity.Image;

public interface ImageRepository extends JpaRepository<Image, Long>{
	List<Image> findByProductId(long p_id);
}
