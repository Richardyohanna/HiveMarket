package com.hivemarket.product.comment.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hivemarket.product.Entity.Product;
import com.hivemarket.user.entity.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name= "comment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "aurthor_id")
	@JsonIgnore
	private User aurthor;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "product_id")
	@JsonIgnore
	private Product product;
	
	@Column(name = "text")
	private String text;
	

	
	@Column(name = "likes")
	@Builder.Default
	private Integer likes = 0;
	
	

	
	@Column(name= "reported")
	@Builder.Default
	private Boolean reported = false;
	
	@Column(name= "created_at")
	private LocalDateTime createdAt; 
	
	
	@OneToMany(
			mappedBy = "comment",
			cascade = CascadeType.ALL,
			orphanRemoval = true
			)
	@ToString.Exclude
	@JsonIgnore
	@Builder.Default
	private List<CommentLikes> commentlikes =  new ArrayList<>();;
	
	
	
}
