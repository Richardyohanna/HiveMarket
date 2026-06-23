package com.hivemarket.shop.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hivemarket.dto.Location;
import com.hivemarket.shop.dto.ShopResponse;
import com.hivemarket.shop.entity.Shop;
import com.hivemarket.shop.repository.ShopRepository;
import com.hivemarket.utils.GeoUtils;
import com.hivemarket.utils.GeoUtils.GeoResult;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShopService {
	
	private final ShopRepository shopRepository;
	

	@Transactional
	public List<ShopResponse> getAllShops(double userLat, double userLon) {

	    return shopRepository.findAll()
	            .stream()
	            .map(shop -> {

	                Location shopLocation = shop.getLocation();

	                GeoResult result = GeoUtils.calculateDistanceAndTime(
	                        userLat,
	                        userLon,
	                        shopLocation.getLatitude(),
	                        shopLocation.getLongitude()
	                );

	                return new ShopResponse(
	                        shop.getId(),
	                        shop.getName(),
	                        shop.getLocation(),
	                        shop.getIsOpen(),
	                        shop.getOpenTime(),
	                        shop.getClosingTime(),
	                        shop.getImage(),
	                        result.distanceKm(),
	                        result.walkTimeMinutes()
	                );
	            })
	            .toList();
	}

}
