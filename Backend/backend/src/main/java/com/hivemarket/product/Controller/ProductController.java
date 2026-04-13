package com.hivemarket.product.Controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
import com.hivemarket.product.Service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // Step 1: Create product only
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ProductResponse createProductOnly(@Valid @RequestBody CreateProduct request, Authentication authentication) {
    	
    	String email = authentication.getName();
    	
    	System.out.println("This is the email from authentication " + email);
    	
        return productService.createProductOnly(request, email);
    }

    // Step 2: Upload images later
    @PostMapping(value = "/{productId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductResponse uploadProductImages(
            @PathVariable Long productId,
            @RequestParam("images") List<MultipartFile> images) {
        return productService.uploadProductImages(productId, images);
    }

    @GetMapping
    public ProductResponse getProductByID(@Valid @RequestParam long id) {
        return productService.getProductById(id);
    }

    @GetMapping("/all")
    public List<ProductResponse> getAllProduct() {
        return productService.getAllProducts();
    }

    @DeleteMapping
    public ResponseEntity<String> deleteById(@Valid @RequestParam long id) {
        String response = productService.deleteProductById(id);
        return ResponseEntity.ok(response);
    }


    @PutMapping
    public ProductResponse update(@Valid @RequestParam long id, @Valid @RequestBody CreateProduct updateProduct) {
        return productService.updateById(id, updateProduct);
    }
}