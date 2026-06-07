package com.hivemarket.reaction.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;


import com.hivemarket.reaction.entity.Reaction;

public interface ReactionRepository extends JpaRepository<Reaction, UUID> {
	
	 Optional<Reaction> findByProduct_IdAndUser_Id(
	            UUID productId,
	            UUID userId
	    );
	 
	 Boolean existsByProduct_IdAndUser_Id(UUID productId, UUID userId);

}
