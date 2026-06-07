package com.hivemarket.cart.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.hivemarket.cart.Entity.Cart;
import com.hivemarket.cart.dto.CartResponse;
import com.hivemarket.cart.repository.CartRepository;
import com.hivemarket.product.DTO.ProductResponse;
import com.hivemarket.product.Entity.Image;
import com.hivemarket.product.Entity.Product;
import com.hivemarket.product.Repository.ProductRepository;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartService {

	private final CartRepository cartRepo;
	private final ProductRepository productRepo;
	
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
                product.getRating(),
                false
        );
    }
    
    @Transactional
    public String addCart(CartResponse request) {
    	
    	
		
		Cart user = cartRepo.findByUserEmailAndProductIdAndSellerEmail(request.user_email(), request.product_id(), request.seller_email());
		
		System.out.println("THis is the cart that i find " + user);
		
		if(user != null ) {
			
			return "This product is already in you cart";
			
		}
    	
    	Cart cart = Cart.builder()
    			.userEmail(request.user_email())
    			.productId(request.product_id())
    			.sellerEmail(request.seller_email())
    			.build();
    	

    	cartRepo.save(cart);
    	
    	return cart.toString();
    }
	
	@Transactional(readOnly = true)
	public ProductResponse findCart(CartResponse request) {
		
		if(request.user_email() == null || request.product_id() == null || request.seller_email() == null) {
			return null;
		}
		
		Cart user = cartRepo.findByUserEmailAndProductIdAndSellerEmail(request.user_email(), request.product_id(), request.seller_email());
		
		Product product = productRepo.findById(user.getProductId()).orElseThrow(() -> new RuntimeException("Cannot Find product"));
		
		
		
		return mapResponse(product);
	}
	
	
	@Transactional(readOnly = true)
	public List<ProductResponse> findAllCart(String user_email){
		
		List<ProductResponse> response = new ArrayList<>();
		
		List<Cart> user = cartRepo.findByUserEmail(user_email);
		

		for(Cart cart: user) {
			
			Product product = productRepo.findById(cart.getProductId()).orElseThrow(() -> new RuntimeException("Cannot Find product"));
			
			
			response.add(mapResponse(product));
			
		}		
		
		
		return response;
	}
	
	
	@Transactional
	public UUID deleteCart(CartResponse request) {
		
		Cart user = cartRepo.findByUserEmailAndProductIdAndSellerEmail(request.user_email(), request.product_id(), request.seller_email());
		
		cartRepo.deleteById(user.getId());
		
		return user.getId();
	}
	
	
}
