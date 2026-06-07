package com.hivemarket.reaction.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hivemarket.product.Entity.Product;
import com.hivemarket.product.Repository.ProductRepository;
import com.hivemarket.reaction.dto.ReactionResponse;
import com.hivemarket.reaction.entity.Reaction;
import com.hivemarket.reaction.repository.ReactionRepository;
import com.hivemarket.user.entity.User;
import com.hivemarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReactionService {

	private final ReactionRepository reactionRepo;
	private final ProductRepository productRepo;
	private final UserRepository userRepo;
	
	@Transactional(readOnly = true)
	public ReactionResponse findReactionData(
	        UUID productId,
	        UUID userId
	) {

		System.out.println("This is the productId " + productId + " the UserId " + userId);
		
		
	    Product product =
	            productRepo.findById(productId)
	                    .orElseThrow(() ->new RuntimeException("Cannot find the product from findReactionData"));

	    User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("Cannot find User from findReactionData"));
	    
	    Optional<Reaction> reaction =
	            reactionRepo
	                    .findByProduct_IdAndUser_Id(
	                            productId,
	                            userId
	                    );
	                    //.orElse(save(product, user));
	   
	    if(reaction.isEmpty()) {
	    	save(product,user);
	    }
	   
	    System.out.println("This is the product " + product.toString() + " This is the reaction " + reaction.toString());

	    return new ReactionResponse(
	            productId,
	            userId,
	            reaction != null &&
	            reaction.get().getIsReacted(),
	            product.getReactions()
	    );
	}
	
	
	@Transactional(readOnly = true)
	public Reaction getAllReactionData(
	        UUID productId,
	        UUID userId
	) {

		System.out.println("This is the productId " + productId + " the UserId " + userId);
		
		
	    Product product =
	            productRepo.findById(productId)
	                    .orElseThrow(() ->new RuntimeException("Cannot find the product from findReactionData"));

	    User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("Cannot find User from findReactionData"));
	    
	    Optional<Reaction> reaction =
	            reactionRepo
	                    .findByProduct_IdAndUser_Id(
	                            productId,
	                            userId
	                    );
	                    //.orElse(save(product, user));
	   
	   
	    System.out.println("This is the product " + product.toString() + " This is the reaction " + reaction.toString());

	    return reaction.isEmpty() ? save(product,user) : reaction.get();
	}
	
	public Reaction save(Product product, User user) {
		
		Reaction reaction = Reaction.builder()
				.product(product)
				.user(user)
				.isReacted(true)
				.build();
		
		return reactionRepo.save(reaction);
		
	}
	
	@Transactional
	public ReactionResponse toggleReaction(
	        UUID productId,
	        UUID userId
	) {

	    Product product =
	            productRepo.findById(productId)
	            .orElseThrow(
	                () -> new RuntimeException(
	                    "Product not found"
	                )
	            );

	    User user =
	            userRepo.findById(userId)
	            .orElseThrow(
	                () -> new RuntimeException(
	                    "User not found"
	                )
	            );

	    Optional<Reaction> reaction =
	            reactionRepo
	                    .findByProduct_IdAndUser_Id(
	                            productId,
	                            userId
	                    );
	                    

	    System.out.println("THis is the reaction being  toggled" + reaction.toString());
	   
	    if (reaction.isEmpty()) {


	    	Reaction savedReaction = save(product, user);
	    	
	    	System.out.println("This is the reaction that is being saved " + savedReaction.toString());
	    	
	        product.setReactions(
	                product.getReactions() + 1
	        );
	        
	        
	        
		    productRepo.save(product);

		    return new ReactionResponse(
		            productId,
		            userId,
		            savedReaction.getIsReacted(),
		            product.getReactions()
		    );
	        
            

	    } else {

	    	System.out.println("THis is my reaction from toggleReaction() " + reaction.toString());

	        reactionRepo.deleteById(reaction.get().getId());
	        
            product.setReactions(
                    Math.max(
                        0,
                        product.getReactions() - 1
                    )
            );
	    	

	        

          }


	    productRepo.save(product);

	    return new ReactionResponse(
	            productId,
	            userId,
	            reaction.get().getIsReacted(),
	            product.getReactions()
	    );
	}
	
	@Transactional(readOnly= true)
	public List<Reaction> getAllReaction(){
		
		List<Reaction> allReaction = reactionRepo.findAll();
		
		return allReaction;
		
	}
	
	@Transactional
	public String deleteAll() {
		
		reactionRepo.deleteAll();
		
		return "deleted successfully";
	}
	
	
}
