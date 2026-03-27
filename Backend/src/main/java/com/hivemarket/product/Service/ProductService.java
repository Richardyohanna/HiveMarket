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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;
    private final CloudinaryService cloudinaryService;

    public ProductResponse mapResponse(Product product) {
        List<String> imageUrls = product.getImages() == null
                ? new ArrayList<>()
                : product.getImages()
                        .stream()
                        .map(Image::getImageUrl)
                        .toList();

        return new ProductResponse(
                product.getId(),
                product.getpName(),
                product.getpDetail(),
                product.getpAmount(),
                product.getpDiscount(),
                product.getpCondition(),
                product.getpQuantity(),
                product.getCategory(),
                product.getLocation(),
                product.getS_id(),
                product.getStatus(),
                imageUrls,
                product.getCreatedAt()
        );
    }

    @Transactional
    public ProductResponse createProductOnly(CreateProduct request) {
        Product product = Product.builder()
                .pName(request.pName())
                .pDetail(request.pDetail())
                .pAmount(request.pAmount())
                .pDiscount(request.pDiscount())
                .pCondition(request.pCondition())
                .pQuantity(request.pQuantity())
                .location(request.location())
                .category(request.category())
                .s_id(request.s_id())
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

            if (product.getImages() == null) {
                product.setImages(new ArrayList<>());
            }

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
                .orElseThrow(() -> new RuntimeException("Product not Found"));

        return mapResponse(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        List<Product> products = productRepository.findAll();

        return products.stream()
                .map(this::mapResponse)
                .toList();
    }

    public String deleteProductById(long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Cannot Find the Product with id: " + id);
        }

        productRepository.deleteById(id);
        return "Product with id " + id + " Deleted Successfully";
    }

    public String deleteAll() {
        productRepository.deleteAll();
        return "Deleted all the Products Successfully";
    }

    @Transactional
    public ProductResponse updateById(long id, CreateProduct update) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cannot find the data"));

        if (update.pName() != null) {
            product.setpName(update.pName());
        }

        if (update.pDetail() != null) {
            product.setpDetail(update.pDetail());
        }

        if (update.pAmount() != null) {
            product.setpAmount(update.pAmount());
        }

        if (update.pDiscount() != null) {
            product.setpDiscount(update.pDiscount());
        }

        if (update.pCondition() != null) {
            product.setpCondition(update.pCondition());
        }

        if (update.pQuantity() != null) {
            product.setpQuantity(update.pQuantity());
        }

        if (update.category() != null) {
            product.setCategory(update.category());
        }

        if (update.location() != null) {
            product.setLocation(update.location());
        }

        Product updated = productRepository.save(product);
        return mapResponse(updated);
    }
}