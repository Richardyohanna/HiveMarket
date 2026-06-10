package com.hivemarket.cart.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.hivemarket.cart.Entity.Cart;
import com.hivemarket.cart.dto.CartResponse;
import com.hivemarket.cart.repository.CartRepository;
import com.hivemarket.product.DTO.ProductResponse;
import com.hivemarket.product.Entity.Image;
import com.hivemarket.product.Entity.Product;
import com.hivemarket.product.Repository.ProductRepository;
import com.hivemarket.product.rating.dto.RatingResponse;
import com.hivemarket.user.entity.User;
import com.hivemarket.user.repository.UserRepository;

import error.CartNotFoundException;
import error.ProductNotFoundException;
import error.UserNotFoundException;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

	private final CartRepository cartRepo;
	private final ProductRepository productRepo;
	private final UserRepository userRepo;
	
    private ProductResponse mapResponse(Product product) {
        List<String> imageUrls = product.getImages() == null
                ? new ArrayList<>()
                : product.getImages().stream().map(Image::getImageUrl).toList();

        return new ProductResponse(
                product.getId(),
                product.getPName(),
                product.getPDetail(),
                product.getPAmount(),
                product.getPDiscount(),
                product.getPCondition(),
                product.getPQuantity(),
                product.getCategory(),
                product.getLocation(),
                product.getSeller() != null ? product.getSeller().getEmail() : null,
                product.getSeller() != null ? product.getSeller().getFull_name() : null,
                product.getSeller() != null ? product.getSeller().getId(): null,
                product.getSeller() != null ? product.getSeller().getProfile_picture() : null,
                product.getPStatus() != null ? product.getSeller().getLocation() : null,
                product.getStatus(),
                
                imageUrls,
                product.getCreatedAt(),
                product.getReactions(),
                product.getViews(),
                product.getPurchases(),
                new RatingResponse(0.0,0,0,0,0,0,0,0),
                false
        );
    }
    
    
    @Transactional
    public String addCart(CartResponse request) {

        User user = userRepo.findById(request.user_id())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepo.findById(request.product_id())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<Cart> existingCart =
                cartRepo.findByUserIdAndProductId(
                        user.getId(),
                        product.getId());

        if (existingCart.isPresent()) {

            Cart cart = existingCart.get();

            cart.setQuantity(cart.getQuantity() + 1);

            cartRepo.save(cart);

            return "Cart quantity updated";
        }

        Cart cart = Cart.builder()
                .user(user)
                .product(product)
                .quantity(1)
                .createdAt(LocalDateTime.now())
                .build();

        cartRepo.save(cart);

        return "Product added to cart";
    }
	
	
	
	
	@Transactional(readOnly = true)
	public List<ProductResponse> findAllCart(UUID userId){
		
		List<ProductResponse> response = new ArrayList<>();
		
		List<Cart> user = cartRepo.findByUserId(userId);
		

		for(Cart cart: user) {
			
			Product product = cart.getProduct();
			
			
			response.add(mapResponse(product));
			
		}		
		
		
		return response;
	}
	
	
	@Transactional
	public String deleteCart(CartResponse request) {
		
		Product product = productRepo.findById(request.product_id()).orElseThrow(() -> new ProductNotFoundException("Product Not found with Id " + request.product_id()) );
		
		User user = userRepo.findById(request.user_id()).orElseThrow(() -> new UserNotFoundException("User not found wit Id " + request.user_id()));
		
		Cart findCart = cartRepo.findByUserIdAndProductId(user.getId(), product.getId()).orElseThrow(() -> new CartNotFoundException("Cannot find the cart " ));
		
		cartRepo.deleteById(findCart.getId());
		
		return "Product Deleted successfully";
	}
		
}
