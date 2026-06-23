package com.hivemarket.product.Entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.BatchSize;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hivemarket.cart.Entity.Cart;
import com.hivemarket.dto.Location;
import com.hivemarket.order.entity.Order;
import com.hivemarket.product.comment.entity.Comment;
import com.hivemarket.product.rating.entity.Rating;
import com.hivemarket.reaction.entity.Reaction;
import com.hivemarket.shop.entity.Shop;
import com.hivemarket.user.entity.User;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String pName;

    @Column(length = 2000)
    private String pDetail;

    private BigDecimal pAmount;
    private BigDecimal pDiscount;
    private String pCondition;
    private Integer pQuantity;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @BatchSize(size = 30) 
    @JsonIgnore
    private List<Image> images = new ArrayList<>();

    private String category;
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnore
    private User seller;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    @JsonIgnore
    private Shop shop;
    
    @OneToMany(
	    mappedBy = "product",
	    cascade = CascadeType.ALL,
	    orphanRemoval = true
	)
	@Builder.Default
	@BatchSize(size = 30)
	@ToString.Exclude
	@JsonIgnore
    private List<Reaction> reactionList = new ArrayList<>();
    
    
    
    @OneToMany(
    		mappedBy = "product",
    		cascade = CascadeType.ALL,
    		orphanRemoval = true    		
    		)
    @Builder.Default
    @BatchSize(size = 30)
    @ToString.Exclude
    @JsonIgnore
    private List<Comment> comments = new ArrayList<>();
    
    
    @OneToMany(mappedBy = "product")
    @ToString.Exclude
    @JsonIgnore
    @Builder.Default
    private List<Order> order = new ArrayList<>();

    @OneToMany(
    		mappedBy = "product",
    		cascade = CascadeType.ALL,
    		orphanRemoval = true    		
    		)
    @Builder.Default
    @BatchSize(size = 30)
    @ToString.Exclude
    @JsonIgnore
    private List<Cart> cart = new ArrayList<>();

    
    private String status;

    private LocalDateTime createdAt;
    
    private Integer views;
    private String pStatus;
    
    @Builder.Default
    private Integer purchases = 0;

    @Column(name = "reactions")
    @Builder.Default
    private Integer reactions = 0;
    
    @OneToMany(
    		mappedBy = "product",
    		cascade = CascadeType.ALL,
    		orphanRemoval = true
    		)
    @Builder.Default
    @BatchSize(size = 30)
    @ToString.Exclude
    @JsonIgnore 
    private List<Rating> rating = new ArrayList<>();
   
    
	/*
	 * @Column(name = "rating")
	 * 
	 * @Builder.Default private Integer rating = 0;
	 */ //This will be a class or an Entity on it's own
	
    @Version
    private Long version;

    
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PENDING";
        }
    }
}