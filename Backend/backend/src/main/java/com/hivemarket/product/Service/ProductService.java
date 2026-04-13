package com.hivemarket.product.Service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.hivemarket.product.DTO.CreateProduct;
import com.hivemarket.product.DTO.ProductResponse;
import com.hivemarket.product.Entity.Image;
import com.hivemarket.product.Entity.Product;
import com.hivemarket.product.Repository.ImageRepository;
import com.hivemarket.product.Repository.ProductRepository;
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
                product.getSeller() != null ? product.getSeller().getProfile_picture() : null,
                product.getStatus(),
                imageUrls,
                product.getCreatedAt()
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
                .seller(seller)
                .status("PENDING")
                .build();

        Product saved = productRepository.save(product);
        return mapResponse(saved);
    }

    @Transactional
    public ProductResponse uploadProductImages(Long productId, List<MultipartFile> images) {
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

            Product updated = productRepository.save(product);
            return mapResponse(updated);

        } catch (Exception e) {
            product.setStatus("FAILED");
            productRepository.save(product);
            throw new RuntimeException("Image upload failed: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return mapResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAvailableProducts() {
        return productRepository.findByStatus("READY").stream()
                .map(this::mapResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getMyProducts(String email) {
        return productRepository.findBySellerEmail(email).stream()
                .map(this::mapResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getMyProductsByStatus(String email, String status) {
        return productRepository.findBySellerEmailAndStatus(email, status).stream()
                .map(this::mapResponse)
                .toList();
    }

    public String deleteProductById(long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Cannot find product with id: " + id);
        }

        productRepository.deleteById(id);
        return "Product deleted successfully";
    }

    @Transactional
    public ProductResponse updateById(long id, CreateProduct update) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cannot find product"));

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
}