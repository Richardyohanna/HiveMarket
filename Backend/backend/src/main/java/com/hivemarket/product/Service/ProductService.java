package com.hivemarket.product.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.hivemarket.product.DTO.CreateProduct;
import com.hivemarket.product.DTO.ProductResponse;
import com.hivemarket.product.Entity.Image;
import com.hivemarket.product.Entity.Product;
import com.hivemarket.product.Repository.ImageRepository;
import com.hivemarket.product.Repository.ProductRepository;
import com.hivemarket.product.rating.service.RatingService;
import com.hivemarket.reaction.entity.Reaction;
import com.hivemarket.reaction.repository.ReactionRepository;
import com.hivemarket.reaction.service.ReactionService;
import com.hivemarket.service.CloudinaryService;
import com.hivemarket.user.entity.User;
import com.hivemarket.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;
    private final CloudinaryService cloudinaryService;
    private final UserRepository userRepository;
    private final ReactionService reactionService;
    private final ReactionRepository reactionRepo;
    private final RatingService ratingService;

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
                product.getSeller() != null ? product.getSeller().getLocation() : null,
                product.getStatus(),
                imageUrls,
                product.getCreatedAt(),
                product.getReactions(),
                product.getViews(),
                product.getPurchases(),
                ratingService.getProductRating(product.getId()),
               	false
        );
    }
    
    private ProductResponse mapResponse(Product product,UUID userId) {
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
                product.getSeller() != null ? product.getSeller().getLocation() : null,
                product.getStatus(),
                imageUrls,
                product.getCreatedAt(),
                product.getReactions(),
                product.getViews(),
                product.getPurchases(),
                ratingService.getProductRating(product.getId(), userId),
               	false
        );
    }
    
    private ProductResponse mapResponse(Product product, Reaction reaction) {
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
                product.getSeller() != null ? product.getSeller().getLocation() : null,
                product.getStatus(),
                imageUrls,
                product.getCreatedAt(),
                product.getReactions(),
                product.getViews(),
                product.getPurchases(),
                ratingService.getProductRating(product.getId()),
               	reaction.getIsReacted()
        );
    }

    
    private ProductResponse mapResponse(Product product, Reaction reaction , UUID userId) {
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
                product.getSeller() != null ? product.getSeller().getLocation() : null,
                product.getStatus(),
                imageUrls,
                product.getCreatedAt(),
                product.getReactions(),
                product.getViews(),
                product.getPurchases(),
                ratingService.getProductRating(product.getId(), userId),
               	reaction.getIsReacted()
        );
    }
    
    
    @Transactional
    public ProductResponse createProductOnly(CreateProduct request, String email) {
        User seller = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        Product product = Product.builder()
                .pName(request.pName())
                .pDetail(request.pDetail())
                .pAmount(request.pAmount())
                .pDiscount(request.pDiscount())
                .pCondition(request.pCondition())
                .pQuantity(request.pQuantity())
                .location(request.location())
                .category(request.category())
                .views(0)
                .pStatus("AVAILABLE")
                .seller(seller)
                .status("PENDING")
                .build();

        Product saved = productRepository.save(product);
        

        return mapResponse(saved);
    }
    
    

    @Transactional
    public List<Image> uploadProductImages(UUID productId, List<MultipartFile> images) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        try {
            List<Image> imageList = new ArrayList<>();

            for (MultipartFile file : images) {
                String imageUrl = cloudinaryService.uploadImage(file);

                Image image = Image.builder()
                        .imageUrl(imageUrl)
                        .product(product)
                        .build();

                imageList.add(image);
            }

            imageRepository.saveAll(imageList);
            product.getImages().addAll(imageList);
            product.setStatus("READY");

            productRepository.save(product);
            
            return imageList;

        } catch (Exception e) {
            product.setStatus("FAILED");
            productRepository.save(product);
            throw new RuntimeException("Image upload failed: " + e.getMessage(), e);
        }
    }
    
    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found at getProductById()"));
        
        return mapResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id, UUID userId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found at getProductById()"));

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Cannot find this user"));
        
        Optional<Reaction> reaction = reactionRepo.findByProduct_IdAndUser_Id(id, userId);
        
        System.out.println("This is the userId and ProductId while trying to get the product by ID" + id + "userId " + userId);
       
        
        if(reaction.isEmpty()) {
        	
        	Reaction newReaction = Reaction.builder()
        			.product(product)
        			.user(user)
        			.isReacted(false)
        			.build();
        	
        	
        	return mapResponse(product, newReaction, userId);
        	
        } 
        
        
        return mapResponse(product, reactionService.save(product, user),userId);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
    	
    	List<Product> products = productRepository.findAll();
    	
    	List<ProductResponse> productResult = new ArrayList<>();
    	
    	for(Product product: products) {
    		
    		 List<String> imageUrls =  product.getImages() == null
                    ? new ArrayList<>()
                            : product.getImages().stream().map(Image::getImageUrl).toList();

    		
    		ProductResponse response = new ProductResponse(
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
                    product.getSeller() != null ? product.getSeller().getLocation() : null,
                    product.getStatus(),
                    imageUrls,
                    product.getCreatedAt(),
                    product.getReactions(),
                    product.getViews(),
                    product.getPurchases(),
                    ratingService.getProductRating(product.getId()),
                   	false
            );
    		
    		productResult.add(response);
    	}
    	
        return productResult;
    }
    

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts(UUID userId) {
    	
    	List<Product> products = productRepository.findAll();
    	
    	List<ProductResponse> productResult = new ArrayList<>();
    	
    	for(Product product: products) { // 08065805281
    		
    		Optional<Reaction> reaction = reactionRepo.findByProduct_IdAndUser_Id(product.getId(), userId);  //reactionService.findReactionData(product.getId(), userId);
    		
    		System.out.println("This is the reaction of this product when getting all product with userId " + reaction.toString());
    	
    		ProductResponse logicResponse = reaction.isEmpty() ? mapResponse(product, userId) : mapResponse(product, reaction.get(), userId); 
    		 
    		
    		productResult.add(logicResponse);
    	}
    	
        return productResult;
    }

	/*
	 * @Transactional(readOnly = true) public List<ProductResponse>
	 * getAvailableProducts() { return
	 * productRepository.findByStatus("READY").stream() .map(this::mapResponse)
	 * .toList(); }
	 */
    
    

    @Transactional(readOnly = true)
    public List<ProductResponse> getMyProducts(String email) {
        return productRepository.findBySellerEmail(email).stream()
                .map(this::mapResponse)
                .toList();
    }
    
    public List<ProductResponse> getProductBySellerId(UUID sellerId) {
    	
    	User user = userRepository.findById(sellerId).orElseThrow(() -> new RuntimeException("Cannot find the seller with the this id " + sellerId));
    	
    	return user.getProducts().stream()
    			.map(this::mapResponse)
    			.toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getMyProductsByStatus(String email, String status) {
        return productRepository.findBySellerEmailAndStatus(email, status).stream()
                .map(this::mapResponse)
                .toList();
    }

    @Transactional
    public String deleteProductById(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Cannot find product with id: " + id);
        }

        productRepository.deleteById(id);
        return "Product deleted successfully";
    }

    @Transactional
    public ProductResponse updateById(UUID id, CreateProduct update) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cannot find product when running getMyProductStatus() at product Service"));

        product.setPName(update.pName());
        product.setPDetail(update.pDetail());
        product.setPAmount(update.pAmount());
        product.setPDiscount(update.pDiscount());
        product.setPCondition(update.pCondition());
        product.setPQuantity(update.pQuantity());
        product.setCategory(update.category());
        product.setLocation(update.location());

        Product updated = productRepository.save(product);
        return mapResponse(updated);
    }
    
    public void increaseViews(UUID id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Cannot find the product with this Id " + id));
        
   
        
        if(product.getViews() == null) {
        	
        	product.setViews(0);
        	
        }
        
        product.setViews(product.getViews() + 1);

        productRepository.save(product);
    }
    
    public void increasePurchases(UUID id) {
        Product product = productRepository.findById(id)
            .orElseThrow();

        product.setPurchases(product.getPurchases() + 1);

        productRepository.save(product);
    }
    
    @Transactional
    public String testDelete(UUID id) {

        Product p = productRepository.findById(id).orElseThrow();

        productRepository.delete(p);
        productRepository.flush();

        return "deleted";
    }
    
    @Transactional
    public String deleteAll() {
    	
        System.out.println("Before: " + productRepository.count());

        productRepository.deleteAll();

        System.out.println("After: " + productRepository.count());
    	
    	return "Succefully Deleted all the products";
    	
    }
    
    
    
}