package com.hivemarket.product.Entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;




@Entity
@Table(name = "products")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String pName;
	
	@Column(length = 2000)
	private String pDetail;
	
	private BigDecimal pAmount;
	private BigDecimal pDiscount;
	private String pCondition;
	private Integer pQuantity;
	
	//This is the Seller Id for the product
	private Long s_id; 
	
	
	public Long getId() {
		return id;
	}
	
	public void setId(Long id) {
		this.id = id;
	}
	public String getpName() {
		return pName;
	}
	public void setpName(String pName) {
		this.pName = pName;
	}
	public String getpDetail() {
		return pDetail;
	}
	public void setpDetail(String pDetail) {
		this.pDetail = pDetail;
	}
	public BigDecimal getpAmount() {
		return pAmount;
	}
	public void setpAmount(BigDecimal pAmount) {
		this.pAmount = pAmount;
	}
	public BigDecimal getpDiscount() {
		return pDiscount;
	}
	public void setpDiscount(BigDecimal pDiscount) {
		this.pDiscount = pDiscount;
	}
	public String getpCondition() {
		return pCondition;
	}
	public void setpCondition(String pCondition) {
		this.pCondition = pCondition;
	}
	public Integer getpQuantity() {
		return pQuantity;
	}
	public void setpQuantity(Integer pQuantity) {
		this.pQuantity = pQuantity;
	}

	public Long getS_id() {
		return s_id;
	}

	public void setS_id(Long s_id) {
		this.s_id = s_id;
	}

}
