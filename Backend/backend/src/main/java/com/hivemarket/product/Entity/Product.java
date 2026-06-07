package com.hivemarket.product.Entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.BatchSize;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hivemarket.product.comment.entity.Comment;
import com.hivemarket.reaction.entity.Reaction;
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
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnore
    private User seller;
    
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

    private String status;

    private LocalDateTime createdAt;
    
    private Integer views;
    private String pStatus;
    
    @Builder.Default
    private Integer purchases = 0;

    @Column(name = "reactions")
    @Builder.Default
    private Integer reactions = 0;
   
    
	@Column(name = "rating")
	@Builder.Default
	private Integer rating = 0;  //This will be a class or an Entity on it's own
	
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