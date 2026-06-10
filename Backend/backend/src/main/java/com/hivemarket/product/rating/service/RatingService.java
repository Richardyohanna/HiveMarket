package com.hivemarket.product.rating.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hivemarket.product.Entity.Product;
import com.hivemarket.product.Repository.ProductRepository;
import com.hivemarket.product.rating.dto.RatingRequest;
import com.hivemarket.product.rating.dto.RatingResponse;
import com.hivemarket.product.rating.entity.Rating;
import com.hivemarket.product.rating.repository.RatingRepository;
import com.hivemarket.user.entity.User;
import com.hivemarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RatingService {
	
	private final RatingRepository ratingRepo;
	private final UserRepository userRepo;
	private final ProductRepository productRepo;
	
	@Transactional(readOnly = true)
	public RatingResponse getProductRating(UUID productId) {

	    List<Rating> ratings = ratingRepo.findByProductId(productId);

	    if (ratings.isEmpty()) {
	        return new RatingResponse(0.0, 0, 0, 0, 0, 0, 0, 0);
	    }

	    int sum = 0;

	    int five = 0;
	    int four = 0;
	    int three = 0;
	    int two = 0;
	    int one = 0;

	    for (Rating r : ratings) {

	        int ratingValue = r.getRating(); // ideally rename to getRating()

	        sum += ratingValue;

	        switch (ratingValue) {
	            case 5 -> five++;
	            case 4 -> four++;
	            case 3 -> three++;
	            case 2 -> two++;
	            case 1 -> one++;
	        }
	    }

	    double averageRating = (double) sum / ratings.size();

	    
	    System.out.println("This is the total rating " + ratings.toString()); 
	    System.out.println("This is the total rating lenght " + ratings.size()); 
	    System.out.println("This is the total number of five " + five ); 
	    System.out.println("This is the total number of four " + four );
	    System.out.println("This is the total number of three " + three); 

	    System.out.println("This is the Average Rating " + averageRating);
	    
	    
	    return new RatingResponse(
	            averageRating,
	            0,
	            five,
	            four,
	            three,
	            two,
	            one,
	            ratings.size()
	    );
	    
	    
	}
	
	
	@Transactional(readOnly = true)
	public RatingResponse getProductRating(UUID productId, UUID userId) {

		
	    List<Rating> ratings = ratingRepo.findByProductId(productId);
	    
	    Optional<Rating> userRating = ratingRepo.findByUserIdAndProductId(userId, productId);

	    if (ratings.isEmpty()) {
	        return new RatingResponse(0.0, 0, 0, 0, 0, 0, 0, 0);
	    }

	    int userProductRating = userRating.isEmpty() ? 0 : userRating.get().getRating();
	    
	    int sum = 0;

	    int five = 0;
	    int four = 0;
	    int three = 0;
	    int two = 0;
	    int one = 0;

	    for (Rating r : ratings) {

	        int ratingValue = r.getRating(); // ideally rename to getRating()

	        sum += ratingValue;

	        switch (ratingValue) {
	            case 5 -> five++;
	            case 4 -> four++;
	            case 3 -> three++;
	            case 2 -> two++;
	            case 1 -> one++;
	        }
	    }

	    double averageRating = (double) sum / ratings.size();

	    
	    System.out.println("This is the total rating " + ratings.toString()); 
	    System.out.println("This is the total rating lenght " + ratings.size()); 
	    System.out.println("This is the total number of five " + five ); 
	    System.out.println("This is the total number of four " + four );
	    System.out.println("This is the total number of three " + three); 
	    System.out.println("This is the total number of two " + two); 
	    System.out.println("This is the total number of one " + one); 
	    System.out.println("This is the User Product Rating " + userProductRating); 
	    System.out.println("This is the Average Rating " + averageRating);
	    
	    
	    return new RatingResponse(
	            averageRating,
	            userProductRating,
	            five,
	            four,
	            three,
	            two,
	            one,
	            ratings.size()
	    );
	    
	    
	}
	
	//public RaingResponse mapRatingResponse(<List<Rating> rating)
	
	@Transactional
	public RatingResponse rate(RatingRequest request) {
		
		Optional<Product> product = productRepo.findById(request.productId());
		Optional<User> user = userRepo.findById(request.userId());
		
		Optional<Rating> rating = ratingRepo.findByUserIdAndProductId(request.userId(), request.productId());
		
		if(rating.isEmpty()) {
			
			Rating newRating = Rating.builder()
					.product(product.get())
					.user(user.get())
					.rating(request.rating())
					.build();
			
			Rating savedRating = ratingRepo.save(newRating);
			
			System.out.println("This is the saved Rating from rate() in newRating " + savedRating.toString());
			
			return getProductRating(savedRating.getProduct().getId(), savedRating.getUser().getId());
			
		} 
		
		rating.get().setRating(request.rating());
		
		Rating savedRating = ratingRepo.save(rating.get());
		
		System.out.println("This is the saved Rating from rate() in rating " + savedRating.toString());
		
		return getProductRating(savedRating.getProduct().getId(), savedRating.getUser().getId());
	}
}
