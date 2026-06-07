package com.hivemarket.product.Controller;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.hivemarket.product.DTO.CreateProduct;
import com.hivemarket.product.DTO.ProductResponse;
import com.hivemarket.product.Entity.Image;
import com.hivemarket.product.Service.ProductService;
import com.hivemarket.reaction.dto.ReactionRequest;
import com.hivemarket.reaction.dto.ReactionResponse;
import com.hivemarket.reaction.service.ReactionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ReactionService reactionService;
    private final SimpMessagingTemplate messagingTemplate;

    // Step 1: Create product only
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ProductResponse createProductOnly(@Valid @RequestBody CreateProduct request, Authentication authentication) {
    	
    	String email = authentication.getName();
    	
    	System.out.println("This is the email from authentication " + email);
    	
        return productService.createProductOnly(request, email);
    }

    // Step 2: Upload images later
    @PostMapping(value = "/{productId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public List<Image> uploadProductImages(
            @PathVariable UUID productId,
            @RequestParam("images") List<MultipartFile> images) {
    	
        return productService.uploadProductImages(productId, images);
    }

    @GetMapping
    public ProductResponse getProductByID(@Valid @RequestParam UUID id, @Valid @RequestParam(required = false) UUID userId) {
    	
    	System.out.println("Getting Product by Id " + id + " userId: " + userId);
        return userId == null ? productService.getProductById(id) : productService.getProductById(id, userId);
    }
    

    @GetMapping("/all")
    public List<ProductResponse> getAllProduct(@RequestParam(required = false) UUID userId) {
        
    	System.out.println("Connected /all Getting All  Product by  userId: " + userId);
    	
    	return userId == null ? productService.getAllProducts() : productService.getAllProducts(userId);
    }
    

    @DeleteMapping("/test")
    public ResponseEntity<String> testDeleteById(@Valid @RequestParam UUID id) {
        String response = productService.testDelete(id);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping
    public ResponseEntity<String> deleteById(@Valid @RequestParam UUID id) {
        String response = productService.deleteProductById(id);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAll(){
    	return ResponseEntity.ok(productService.deleteAll());
    }


    @PutMapping
    public ProductResponse update(@Valid @RequestParam UUID id, @Valid @RequestBody CreateProduct updateProduct) {
        return productService.updateById(id, updateProduct);
    }
    
    @PostMapping("/react")
    public ResponseEntity<?> addReaction(@Valid @RequestBody ReactionRequest request, Principal principal){
    	
    	if(principal.getName() == "") {
    		
    		return ResponseEntity.ok("PLease login so that your reaction can have effect");
    		
    	}
    	System.out.println("Connected to /react " + request.toString() + principal.getName());
    	
    	ReactionResponse response =
    	        reactionService.toggleReaction(
    	                request.productId(),
    	                request.userId()
    	        );
    	
    	if(response == null) {
    		
    		System.out.println("Encountered and error while trying to send the reaction form /react to saveReaction at reactionService");
    		
    		return ResponseEntity.ok("Encountered a server error while saving the reaction" );
    		
    	}
    	
  
    	
    	messagingTemplate.convertAndSend("/hivemarket-topic/product/" + request.productId(), response);
    	
    	System.out.println("WebSocket update sent successfully.");
    	
    	return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/view")
    public ResponseEntity<Void> increaseViews(@PathVariable UUID id) {
        productService.increaseViews(id);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/purchase")
    public ResponseEntity<Void> increasePurchases(@PathVariable UUID id) {
        productService.increasePurchases(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/sellerId/{sellerId}")
    public ResponseEntity<?> getProductBySellerId(@PathVariable UUID sellerId){
    	
    	System.out.println("Connected to the path /sellerId/{sellerId} with this sellerId " + sellerId);
    	
    	return ResponseEntity.ok(productService.getProductBySellerId(sellerId));
    }
}