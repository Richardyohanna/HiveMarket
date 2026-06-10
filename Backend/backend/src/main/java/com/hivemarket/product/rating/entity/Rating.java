package com.hivemarket.product.rating.entity;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hivemarket.product.Entity.Product;
import com.hivemarket.user.entity.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(
		name = "rating",
		uniqueConstraints = {
			@UniqueConstraint(						
					columnNames = {"user_id", "product_id"}						
					)
		}
)
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Rating {

	@Id
	@GeneratedValue(strategy= GenerationType.UUID)
	private UUID id;
	
	@Column(name ="rating_count")
	@Builder.Default
	private Integer rating = 0;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "product_id")
	@ToString.Exclude
	@JsonIgnore
	private Product product;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	@ToString.Exclude
	@JsonIgnore
	private User user;
	
	@Version
	private Long version;
}
