package com.hivemarket.shop.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hivemarket.dto.Location;
import com.hivemarket.product.Entity.Product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
@Table(name = "shop")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class Shop {
	
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID Id;
	
	@Column(name = "name")
	private String name;
	
    @Column(name = "password", nullable = false)
    @JsonIgnore
    private String password;
	
    @Column(name = "location")
    private Location location;
	
	@Column(name = "is_open")
	private Boolean isOpen;
	
	@Column(name = "open_time")
	private LocalDateTime openTime;
	
	@Column(name = "closing_time")
	private LocalDateTime closingTime;
	
	@Column(name= "image")
	private String image;
	
	@OneToMany(
			mappedBy = "product"
			
			)
	@ToString.Exclude
	@JsonIgnore
	@Builder.Default
	private List<Product> products = new ArrayList<>();
	
	

}
