package com.hivemarket.reaction.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hivemarket.reaction.dto.ReactionResponse;
import com.hivemarket.reaction.entity.Reaction;
import com.hivemarket.reaction.service.ReactionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/reaction-data")
@RequiredArgsConstructor
public class ReactionController {

	private final ReactionService reactionService;

	/*
	 * @GetMapping public ResponseEntity<ReactionResponse> getReactionData(
	 * 
	 * @RequestParam UUID productId,
	 * 
	 * @RequestParam UUID userId) {
	 * 
	 * System.out.
	 * println("Connected to the /api/reaction-data with the data as productId: " +
	 * productId + " userId: "+ userId );
	 * 
	 * ReactionResponse reaction = reactionService.findReactionData(productId,
	 * userId);
	 * 
	 * System.out.
	 * println("This is the reaction Response form getReactionData() at reactionController "
	 * + reaction); if (reaction == null) { return ResponseEntity.ok(new
	 * ReactionResponse(productId, userId, false, 0)); }
	 * 
	 * return ResponseEntity.ok(reaction); }
	 */
	
	
	@GetMapping("/all")
	public ResponseEntity<List<Reaction>> getAllReactons(){
		
		return ResponseEntity.ok(reactionService.getAllReaction());
	}
	
   @DeleteMapping("/all")
    public ResponseEntity<String> deleteAll(){
    	return ResponseEntity.ok(reactionService.deleteAll());
    }
}
